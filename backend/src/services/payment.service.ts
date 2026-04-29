import axios from "axios"
import { prisma } from "../config/db"
import { v4 as uuidv4 } from "uuid"

export const paymentService = {

  async initiatePayment(courseId: string, studentId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) throw Object.assign(new Error("Course not found"), { statusCode: 404 })

    const enrolled = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } }
    })
    if (enrolled) throw Object.assign(new Error("Already enrolled"), { statusCode: 400 })

    const student = await prisma.user.findUnique({ where: { id: studentId } })
    if (!student) throw Object.assign(new Error("Student not found"), { statusCode: 404 })

    const price         = Number(course.price ?? 0)
    const discountPrice = Number(course.discount_price ?? 0)
    const hasDiscount   = discountPrice > 0 && discountPrice < price
    const finalPrice    = hasDiscount ? discountPrice : price

    const invoice_number = `INV-${Date.now()}-${uuidv4().slice(0,6).toUpperCase()}`

    await prisma.transaction.create({
      data: {
        id:               uuidv4(),
        user_id:          studentId,
        course_id:        courseId,
        invoice_number,
        amount:           finalPrice,
        converted_amount: finalPrice,
        status:           "INITIATED",
        type:             "PURCHASE",
        gateway:          "PAYSTATION",
      }
    })

    const response = await axios.post(
        "https://api.paystation.com.bd/initiate-payment",
        new URLSearchParams({
          merchantId:      process.env.PAYSTATION_MERCHANT_ID!,
          password:        process.env.PAYSTATION_PASSWORD!,
          invoice_number,
          currency:        "BDT",
          payment_amount:  Math.round(finalPrice).toString(),
          pay_with_charge: "1",
          cust_name:       student.name,
          cust_phone:      student.mobile ?? "01700000000",
          cust_email:      student.email,
          // ✅ callback_url  → Paystation POSTs here (server-to-server)
          callback_url:    `${process.env.BACKEND_URL}/api/payment/callback`,
          // ✅ redirect_url  → Paystation redirects browser here after payment
          redirect_url:    `${process.env.BACKEND_URL}/api/payment/return`,
          checkout_items:  JSON.stringify({ courseId, courseTitle: course.title }),
          opt_a:           courseId,
          opt_b:           studentId,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )

    const data = response.data
    console.log("Initiate response:", JSON.stringify(data))

    if (data.status_code !== "200") {
      throw Object.assign(
          new Error(data.message ?? "Payment initiation failed"),
          { statusCode: 400 }
      )
    }

    return { payment_url: data.payment_url, invoice_number }
  },

  // ─────────────────────────────────────────────────────────────
  // Called by Paystation server-to-server (GET with query params)
  // Just process the payment — no redirect here
  // ─────────────────────────────────────────────────────────────
  async handleCallback(query: any) {
    console.log("CALLBACK RECEIVED:", JSON.stringify(query))

    const status         = (query.status ?? "").toString()
    const invoice_number = query.invoice_number ?? query.invoiceNumber ?? ""
    const trx_id         = query.trx_id ?? query.trxId ?? query.trxID ?? ""

    console.log("Status:", status, "| Invoice:", invoice_number, "| TrxId:", trx_id)

    if (!invoice_number) {
      console.log("No invoice_number in callback")
      return { success: false }
    }

    const transaction = await prisma.transaction.findUnique({
      where: { invoice_number }
    })

    if (!transaction) {
      console.log("Transaction NOT FOUND:", invoice_number)
      return { success: false }
    }

    // Idempotency — already processed
    if (transaction.status === "COMPLETED") {
      console.log("Already COMPLETED — skipping")
      return { success: true, courseId: transaction.course_id }
    }

    const isSuccess = status.toLowerCase() === "successful"
    console.log("Callback isSuccess:", isSuccess)

    if (isSuccess) {
      try {
        // ✅ Per docs: merchantId in HEADER, invoice_number in BODY
        const verify = await axios.post(
            "https://api.paystation.com.bd/transaction-status",
            new URLSearchParams({ invoice_number }),
            {
              headers: {
                "merchantId":    process.env.PAYSTATION_MERCHANT_ID!,
                "Content-Type":  "application/x-www-form-urlencoded",
              }
            }
        )

        console.log("RAW verify response:", JSON.stringify(verify.data, null, 2))

        const vData      = verify.data
        const statusCode = String(vData.status_code)
        // ✅ Per docs: trx_status can be "Success", "success", "success"
        const trxStatus  = (vData?.data?.trx_status ?? "").toLowerCase()

        console.log("Verify statusCode:", statusCode, "| trxStatus:", trxStatus)

        if (statusCode === "200" && (trxStatus === "success" || trxStatus === "successful")) {
          await prisma.transaction.update({
            where: { invoice_number },
            data: {
              status:         "COMPLETED",
              trx_id:         trx_id || vData.data.trx_id,
              payment_method: vData.data?.payment_method ?? "",
              completed_at:   new Date(),
            }
          })

          const alreadyEnrolled = await prisma.enrollment.findUnique({
            where: {
              student_id_course_id: {
                student_id: transaction.user_id,
                course_id:  transaction.course_id!
              }
            }
          })

          if (!alreadyEnrolled) {
            await prisma.enrollment.create({
              data: {
                id:         uuidv4(),
                student_id: transaction.user_id,
                course_id:  transaction.course_id!,
                status:     "ACTIVE",
              }
            })
            console.log("✅ Enrollment CREATED:", transaction.user_id)
          }

          return { success: true, courseId: transaction.course_id }
        }

        console.warn("Verify did not pass — statusCode:", statusCode, "trxStatus:", trxStatus)

      } catch (err: any) {
        console.error("Verify API error:", err?.response?.data ?? err.message)
      }
    }

    // Mark failed only if not already completed
    await prisma.transaction.update({
      where: { invoice_number },
      data:  { status: "FAILED" }
    })
    console.log("❌ Marked as FAILED")
    return { success: false }
  },

  // ─────────────────────────────────────────────────────────────
  // Called when Paystation redirects the USER'S BROWSER back
  // Poll DB briefly to wait for callback to finish, then redirect
  // ─────────────────────────────────────────────────────────────
  async handleReturn(query: any) {
    console.log("RETURN (browser) RECEIVED:", JSON.stringify(query))

    const invoice_number = query.invoice_number ?? query.invoiceNumber ?? ""

    if (!invoice_number) return { success: false, courseId: null }

    // Poll up to 5 seconds for callback to complete
    for (let i = 0; i < 5; i++) {
      const transaction = await prisma.transaction.findUnique({
        where: { invoice_number }
      })

      console.log(`Poll ${i + 1}: status =`, transaction?.status)

      if (transaction?.status === "COMPLETED") {
        return { success: true, courseId: transaction.course_id }
      }

      if (transaction?.status === "FAILED") {
        return { success: false, courseId: null }
      }

      // Wait 1 second before next poll
      await new Promise(r => setTimeout(r, 1000))
    }

    return { success: false, courseId: null }
  }
}