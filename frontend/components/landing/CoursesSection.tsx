"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Star, ArrowRight, Loader2 } from "lucide-react"
import api from "@/lib/axios"

const gradients: Record<string, string> = {
  "Web Development":      "from-blue-400 to-indigo-600",
  "Frontend Development": "from-blue-400 to-indigo-600",
  "Backend Development":  "from-indigo-400 to-violet-600",
  Programming:            "from-blue-400 to-indigo-600",
  Design:                 "from-pink-400 to-rose-600",
  "Data Science":         "from-cyan-400 to-blue-600",
  "Machine Learning":     "from-emerald-400 to-teal-600",
  "Data Analysis":        "from-teal-400 to-cyan-600",
  CS:                     "from-purple-400 to-violet-600",
  Business:               "from-amber-400 to-orange-600",
  Marketing:              "from-green-400 to-teal-600",
}
const emojis: Record<string, string> = {
  "Web Development": "💻", "Frontend Development": "🖥️", "Backend Development": "⚙️",
  Programming: "💻", Design: "🎨", "Data Science": "📈",
  "Machine Learning": "🤖", "Data Analysis": "📊", CS: "🔬",
  Business: "📊", Marketing: "📣",
}

export default function CoursesSection() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/courses?is_popular=true")
      .then(({ data }) => {
        const result = data.data
        setCourses(Array.isArray(result) ? result : (result.data ?? []))
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Popular Courses</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Explore our most loved courses, crafted by industry experts and designed to get you job-ready.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No courses available yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {courses.map((course: any) => {
              const categoryName = course.category?.name ?? "General"
              const gradient     = gradients[categoryName] ?? "from-slate-400 to-slate-600"
              const emoji        = emojis[categoryName]    ?? "📚"
              const teacherName  = course.teacher?.name    ?? "Instructor"
              const students     = course.totalStudents    ?? 0
              const rating       = Number(course.avgRating ?? 0).toFixed(1)
              const price         = Number(course.price ?? 0)
              const discountPrice = Number(course.discount_price ?? 0)
              const hasDiscount   = discountPrice > 0 && discountPrice < price
              const finalPrice    = hasDiscount ? discountPrice : price

              return (
                <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className={`bg-gradient-to-br ${gradient} h-32 flex items-center justify-center`}>
                      <span className="text-5xl">{emoji}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
                      {categoryName}
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">by {teacherName}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {students.toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" /> {rating}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-600">
                          {finalPrice === 0 ? "Free" : `৳${finalPrice.toLocaleString()}`}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            ৳{price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Link href={`/courses/${course.slug}`} className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-2xl transition-all"
          >
            View All Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
