import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BRAND_NAME } from "@/lib/brand"

export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
          Join {BRAND_NAME} today and unlock access to 500+ courses taught by industry experts. Your future starts now.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register/student"
            className="flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
          >
            Sign Up Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/register/teacher"
            className="flex items-center gap-2 px-8 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold rounded-2xl transition-all"
          >
            Teach on {BRAND_NAME}
          </Link>
        </div>
      </div>
    </section>
  )
}
