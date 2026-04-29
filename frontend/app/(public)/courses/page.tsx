"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Users, Star, Loader2 } from "lucide-react"
import api from "@/lib/axios"

const gradients: Record<string, string> = {
  "Web Development": "from-blue-400 to-indigo-600",
  Programming:       "from-blue-400 to-indigo-600",
  Design:            "from-pink-400 to-rose-600",
  "Data Science":    "from-cyan-400 to-blue-600",
  "Machine Learning":"from-emerald-400 to-teal-600",
  CS:                "from-purple-400 to-violet-600",
  Business:          "from-amber-400 to-orange-600",
  Marketing:         "from-green-400 to-teal-600",
}
const emojis: Record<string, string> = {
  "Web Development": "💻", Programming: "💻", Design: "🎨",
  "Data Science": "📈", "Machine Learning": "🤖", CS: "🔬",
  Business: "📊", Marketing: "📣",
}

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState(searchParams.get("q") ?? "")

  const fetchCourses = useCallback((q: string) => {
    setLoading(true)
    const params = new URLSearchParams({ limit: "24" })
    if (q) params.set("search", q)
    api.get(`/api/courses?${params}`)
      .then(({ data }) => {
        const result = data.data
        setCourses(Array.isArray(result) ? result : (result.data ?? []))
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCourses(search)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchCourses(search)
    const p = new URLSearchParams()
    if (search) p.set("q", search)
    router.replace(search ? `/courses?${p}` : "/courses", { scroll: false })
  }

  return (
    <main className="pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-full mb-4">
            Explore All Courses
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Find Your Next Course</h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl text-sm outline-none focus:bg-white/20 focus:border-indigo-400 transition-all"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg font-medium mb-2">No courses found</p>
            <p className="text-slate-400 text-sm">Try a different search term.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5">{courses.length} course{courses.length !== 1 ? "s" : ""} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => {
                const subcategoryName = course.category?.name ?? ""
                const categoryName    = course.category?.parent?.name ?? subcategoryName
                const displayGradient = gradients[categoryName] ?? gradients[subcategoryName] ?? "from-slate-400 to-slate-600"
                const displayEmoji    = emojis[categoryName]    ?? emojis[subcategoryName]    ?? "📚"
                const students        = Number(course.totalStudents ?? course._count?.enrollments ?? 0)
                const rating          = Number(course.avgRating ?? 0)
                const price         = Number(course.price ?? 0)
                const discountPrice = Number(course.discount_price ?? 0)
                const hasDiscount   = discountPrice > 0 && discountPrice < price
                const finalPrice    = hasDiscount ? discountPrice : price
                const teacherName   = course.teacher?.name ?? "Instructor"

                return (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="h-36 w-full object-cover" />
                    ) : (
                      <div className={`bg-gradient-to-br ${displayGradient} h-36 flex items-center justify-center`}>
                        <span className="text-5xl">{displayEmoji}</span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {categoryName && (
                          <span className="inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            {categoryName}
                          </span>
                        )}
                        {subcategoryName && subcategoryName !== categoryName && (
                          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                            {subcategoryName}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">by {teacherName}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {students.toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" /> {rating > 0 ? rating.toFixed(1) : "New"}</span>
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
          </>
        )}
      </div>
    </main>
  )
}
