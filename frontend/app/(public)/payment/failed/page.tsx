"use client"
import Link from "next/link"
import { XCircle } from "lucide-react"

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-lg font-extrabold text-slate-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Your payment was not completed. Please try again.
        </p>
        <Link href="/courses"
          className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm">
          Back to Courses
        </Link>
      </div>
    </main>
  )
}
