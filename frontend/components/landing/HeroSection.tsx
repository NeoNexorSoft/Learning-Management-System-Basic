import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { BRAND_NAME } from "@/lib/brand"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          10,000+ learners already enrolled
        </span>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Learn Without Limits<br />
          <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Grow Without Boundaries
          </span>
        </h1>

        <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
          {BRAND_NAME} offers expert-led courses designed to help you master new skills, advance your career, and achieve your goals — at your own pace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register/student"
            className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/50 transition-all hover:scale-105"
          >
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl transition-all"
          >
            <Play className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      </div>
    </section>
  )
}
