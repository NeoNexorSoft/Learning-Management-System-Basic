"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Filter, Users, Star, Loader2, X } from "lucide-react"
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

interface Category { id: string; name: string; slug: string }

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [courses, setCourses]       = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState(searchParams.get("q") ?? "")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "")
  const [activeLevel, setActiveLevel]       = useState(searchParams.get("level") ?? "")

  const fetchCourses = useCallback((q: string, category: string, level: string) => {
    setLoading(true)
    const params = new URLSearchParams({ limit: "24" })
    if (q)        params.set("search",   q)
    if (category) params.set("category", category)
    if (level)    params.set("level",    level.toUpperCase())
    api.get(`/api/courses?${params}`)
      .then(({ data }) => {
        const result = data.data
        setCourses(Array.isArray(result) ? result : (result.data ?? []))
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.get("/api/categories")
      .then(({ data }) => {
        const cats: any[] = data.data?.categories ?? data.data ?? []
        setCategories(cats.filter((c: any) => !c.parent_id))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchCourses(search, activeCategory, activeLevel)
  }, [activeCategory, activeLevel, fetchCourses]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchCourses(search, activeCategory, activeLevel)
    const p = new URLSearchParams()
    if (search)         p.set("q",        search)
    if (activeCategory) p.set("category", activeCategory)
    if (activeLevel)    p.set("level",    activeLevel)
    router.replace(`/courses?${p}`, { scroll: false })
  }

  function selectCategory(slug: string) {
    const next = activeCategory === slug ? "" : slug
    setActiveCategory(next)
    const p = new URLSearchParams()
    if (search) p.set("q", search)
    if (next)   p.set("category", next)
    if (activeLevel) p.set("level", activeLevel)
    router.replace(`/courses?${p}`, { scroll: false })
  }

  function selectLevel(level: string) {
    const next = activeLevel === level ? "" : level
    setActiveLevel(next)
    const p = new URLSearchParams()
    if (search)         p.set("q", search)
    if (activeCategory) p.set("category", activeCategory)
    if (next)           p.set("level", next)
    router.replace(`/courses?${p}`, { scroll: false })
  }

  function clearAll() {
    setSearch(""); setActiveCategory(""); setActiveLevel("")
    fetchCourses("", "", "")
    router.replace("/courses", { scroll: false })
  }

  const hasFilters = !!search || !!activeCategory || !!activeLevel

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
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Filter className="w-4 h-4" /> Filter:
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  activeCategory === cat.slug
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Levels */}
          <div className="flex gap-2 ml-auto">
            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map(level => (
              <button
                key={level}
                onClick={() => selectLevel(level)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  activeLevel === level
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg font-medium mb-2">No courses found</p>
            <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={clearAll} className="text-indigo-600 font-semibold hover:underline text-sm">Clear all filters</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5">{courses.length} course{courses.length !== 1 ? "s" : ""} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => {
                const categoryName = course.category?.name ?? "General"
                const gradient     = gradients[categoryName] ?? "from-slate-400 to-slate-600"
                const emoji        = emojis[categoryName]    ?? "📚"
                const students     = Number(course.totalStudents ?? course._count?.enrollments ?? 0)
                const rating       = Number(course.avgRating ?? 0)
                const price        = Number(course.price ?? 0)
                const teacherName  = course.teacher?.name ?? "Instructor"

                return (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="h-36 w-full object-cover" />
                    ) : (
                      <div className={`bg-gradient-to-br ${gradient} h-36 flex items-center justify-center`}>
                        <span className="text-5xl">{emoji}</span>
                      </div>
                    )}
                    <div className="p-5">
                      <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
                        {categoryName}
                      </span>
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">by {teacherName}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {students.toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" /> {rating > 0 ? rating.toFixed(1) : "New"}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-sm font-bold text-indigo-600">
                          {price === 0 ? "Free" : `TK${price.toLocaleString()} BDT`}
                        </span>
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
