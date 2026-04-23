"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Star, Users, TrendingUp, PlusCircle, Pencil, Trash2, BookOpen, Calendar, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

const gradients: Record<string, string> = {
  Programming: "from-blue-400 to-indigo-600",
  Design:      "from-pink-400 to-rose-600",
  CS:          "from-purple-400 to-violet-600",
  Business:    "from-amber-400 to-orange-600",
  Marketing:   "from-green-400 to-teal-600",
  "Data Science": "from-cyan-400 to-blue-600",
  "Web Development": "from-blue-400 to-indigo-600",
  "Backend Development": "from-indigo-400 to-violet-600",
  "Frontend Development": "from-cyan-400 to-blue-600",
}
const emojis: Record<string, string> = {
  Programming: "💻", Design: "🎨", CS: "🔬", Business: "📊", Marketing: "📣",
  "Data Science": "📈", "Web Development": "💻", "Backend Development": "⚙️", "Frontend Development": "🖥️",
}

const levelStyles: Record<string, string> = {
  BEGINNER:     "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-blue-100    text-blue-700",
  ADVANCED:     "bg-red-100     text-red-700",
}
const statusStyles: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING:  "bg-amber-100   text-amber-700",
  DRAFT:    "bg-slate-100   text-slate-600",
}
const statusLabels: Record<string, string> = {
  APPROVED: "Approved", PENDING: "Pending", DRAFT: "Draft",
}

function DeleteModal({ course, onClose, onConfirm }: { course: any; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Course</h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">"{course.title}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course, onDelete }: { course: any; onDelete: () => void }) {
  const categoryName = course.category?.name ?? "General"
  const gradient     = gradients[categoryName] ?? "from-slate-400 to-slate-600"
  const emoji        = emojis[categoryName]    ?? "📚"
  const statusStyle  = statusStyles[course.status]  ?? statusStyles.DRAFT
  const statusLabel  = statusLabels[course.status]  ?? course.status
  const levelStyle   = levelStyles[course.level]   ?? levelStyles.BEGINNER

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col">
      {course.thumbnail ? (
        <div className="relative h-36 flex-shrink-0">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyle}`}>{statusLabel}</span>
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${levelStyle}`}>{course.level}</span>
        </div>
      ) : (
        <div className={`bg-gradient-to-br ${gradient} h-36 flex items-center justify-center relative flex-shrink-0`}>
          <span className="text-5xl">{emoji}</span>
          <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyle}`}>{statusLabel}</span>
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${levelStyle}`}>{course.level}</span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">{course.title}</h4>
        <p className="text-xs text-slate-500 line-clamp-1 mb-4">{categoryName}</p>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 font-medium">{(course.totalStudents ?? 0).toLocaleString()} students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-600">৳{Number(course.totalEarnings ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= Math.round(course.avgRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
            ))}
            <span className="text-xs text-slate-600 ml-0.5">
              {course.avgRating > 0 ? `${Number(course.avgRating).toFixed(1)}/5.0` : "No ratings"}
              {(course.totalReviews ?? 0) > 0 && <span className="text-slate-400"> ({course.totalReviews})</span>}
            </span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500">
              Created {new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-indigo-600">৳{Number(course.price ?? 0).toLocaleString()} BDT</span>
          <div className="flex items-center gap-1.5">
            <Link href={`/teacher/courses/${course.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
              <Pencil className="w-3 h-3" /> Edit
            </Link>
            <button onClick={onDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeacherCoursesPage() {
  const searchParams = useSearchParams()
  const search = (searchParams.get("search") ?? "").toLowerCase()

  const [courses, setCourses]           = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null)

  useEffect(() => {
    api.get("/api/teacher/courses")
      .then(({ data }) => setCourses(data.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function confirmDelete() {
    if (!deletingCourse) return
    try {
      await api.delete(`/api/courses/${deletingCourse.id}`)
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id))
    } catch {
      // ignore
    } finally {
      setDeletingCourse(null)
    }
  }

  const approved = courses.filter((c) => c.status === "APPROVED").length
  const pending  = courses.filter((c) => c.status === "PENDING").length
  const draft    = courses.filter((c) => c.status === "DRAFT").length

  const filtered = search
    ? courses.filter((c) =>
        (c.title ?? "").toLowerCase().includes(search) ||
        (c.category?.name ?? "").toLowerCase().includes(search)
      )
    : courses

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search courses…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search courses…" />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Courses</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{approved} Approved</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{pending} Pending</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{draft} Draft</span>
              {search && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{searchParams.get("search")}"</span>}
            </div>
          </div>
          <Link href="/teacher/courses/create" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20">
            <PlusCircle className="w-4 h-4" /> New Course
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            {search ? (
              <>
                <p className="text-lg font-bold text-slate-700 mb-1">No courses match "{searchParams.get("search")}"</p>
                <p className="text-slate-400 text-sm">Try a different search term.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-slate-700 mb-1">No courses yet</p>
                <p className="text-slate-400 text-sm mb-6">Create your first course and start teaching.</p>
                <Link href="/teacher/courses/create" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Create First Course
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} onDelete={() => setDeletingCourse(course)} />
            ))}
          </div>
        )}
      </main>

      {deletingCourse && (
        <DeleteModal course={deletingCourse} onClose={() => setDeletingCourse(null)} onConfirm={confirmDelete} />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <TeacherCoursesPage />
    </Suspense>
  )
}
