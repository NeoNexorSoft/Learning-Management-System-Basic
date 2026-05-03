"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react"
import api from "@/lib/axios"
import Link from "next/link"

export default function PaymentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get(`/api/courses/by-id/${courseId}`)
      .then(({ data }) => setCourse(data.data.course))
      .catch(() => router.push("/courses"))
      .finally(() => setLoading(false))
  }, [courseId])

  async function handlePayment() {
    setPaying(true)
    setError("")
    try {
      const { data } = await api.post("/api/payment/initiate", {
        course_id: courseId
      })
      window.location.href = data.data.payment_url
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Payment failed. Try again.")
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )

  const price         = Number(course?.price ?? 0)
  const discountPrice = Number(course?.discount_price ?? 0)
  const hasDiscount   = discountPrice > 0 && discountPrice < price
  const finalPrice    = hasDiscount ? discountPrice : price

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-lg mx-auto px-4">
        <Link
          href={`/courses/${course?.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {course?.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-indigo-100" />
          )}

          <div className="p-6">
            <h1 className="text-xl font-bold text-slate-800 mb-1">{course?.title}</h1>
            {course?.subtitle && (
              <p className="text-sm text-slate-500 mb-4">{course.subtitle}</p>
            )}

            <div className="py-4 border-t border-b border-slate-100 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Course Price</span>
                  <span className={`font-semibold ${hasDiscount ? "line-through text-slate-400" : "text-slate-800"}`}>
                    ৳{price.toLocaleString()} BDT
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-semibold text-emerald-600">
                      - ৳{(price - finalPrice).toLocaleString()} BDT
                    </span>
                  </div>
                )}
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-extrabold text-indigo-600 text-lg">
                    ৳{finalPrice.toLocaleString()} BDT
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
            >
              {paying
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                : `Pay ৳${finalPrice.toLocaleString()} BDT`
              }
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Secured by PayStation
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
