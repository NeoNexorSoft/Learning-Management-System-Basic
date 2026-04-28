import { Request, Response } from "express"
import { paymentService } from "../services/payment.service"

export const paymentController = {

  async initiatePayment(req: Request, res: Response) {
    try {
      const studentId = req.user!.userId
      const { course_id } = req.body
      const result = await paymentService.initiatePayment(course_id, studentId)
      res.json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  // Paystation server-to-server — just return 200 OK
  async handleCallback(req: Request, res: Response) {
    try {
      const payload = Object.keys(req.query).length > 0 ? req.query : req.body
      const result  = await paymentService.handleCallback(payload)

      // ✅ Paystation sends the BROWSER here — redirect it
      if (result.success && result.courseId) {
        return res.redirect(
            `${process.env.FRONTEND_URL}/student/courses/${result.courseId}/learn?payment=success`
        )
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
      }

    } catch (err: any) {
      console.error("Callback error:", err.message)
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
    }
  },

  // User's browser lands here after Paystation redirects them
  async handleReturn(req: Request, res: Response) {
    try {
      const result = await paymentService.handleReturn(req.query as any)

      if (result.success && result.courseId) {
        // ✅ Redirect browser to course page
        return res.redirect(
            `${process.env.FRONTEND_URL}/student/courses/${result.courseId}/learn?payment=success`
        )
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
      }
    } catch (err: any) {
      console.error("Return error:", err.message)
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
    }
  }
}