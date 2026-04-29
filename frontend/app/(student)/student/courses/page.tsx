"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"

import PageHeader from "@/components/shared/PageHeader"
import api from "@/lib/axios"

interface CourseItem {
  id: string
  title: string
  teacher: string
  progress: number
  category: string
  status: "in-progress" | "completed"
  thumbnail: string
  totalLessons: number
  completedLessons: number
}

const gradients: Record<string, string> = {
  "Web Development": "from-blue-400 to-indigo-600",
  Programming: "from-blue-400 to-indigo-600",
  Design: "from-pink-400 to-rose-600",
  CS: "from-purple-400 to-violet-600",
  Business: "from-amber-400 to-orange-600",
  "Data Science": "from-cyan-400 to-blue-600",
}
const emojis: Record<string, string> = {
  "Web Development": "💻", Programming: "💻", Design: "🎨", CS: "🔬", Business: "📊", "Data Science": "📈",
}

function CourseCard({ course }: { course: CourseItem }) {
  const gradient  = gradients[course.category] ?? "from-slate-400 to-slate-600"
  const emoji     = emojis[course.category]    ?? "📚"
  const completed = course.status === "completed"

  return (
    <Link href={`/student/courses/${course.id ?? (course as any).course_id ?? (course as any).course?.id}/learn`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group block cursor-pointer">
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="h-32 w-full object-cover" />
      ) : (
        <div className={`bg-gradient-to-br ${gradient} h-32 flex items-center justify-center`}>
          <span className="text-5xl">{emoji}</span>
        </div>
      )}
      <div className="p-5">
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
          completed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
        }`}>
          {completed ? "Completed" : "In Progress"}
        </span>
        <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h4>
        <p className="text-xs text-slate-500 mb-4">by {course.teacher} · {course.category}</p>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-bold text-indigo-600">
              {course.progress ?? 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all"
              style={{ width: `${course.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

function StudentCoursesPage() {
  const searchParams = useSearchParams()
  const search = (searchParams.get("search") ?? "").toLowerCase()

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get("/api/enrollments/my")
      .then(({ data }) => {
        const enrollments: any[] = data.data.enrollments ?? []
        const mapped: CourseItem[] = enrollments.map((e: any) => ({
          id:               e.course?.id ?? e.id,
          title:            e.course?.title ?? "Untitled",
          teacher:          e.course?.teacher?.name ?? "Unknown",
          progress:         Number(e.progress ?? 0),
          category:         e.course?.category?.name ?? "General",
          status:           e.status === "COMPLETED" ? "completed" : "in-progress",
          thumbnail:        e.course?.thumbnail ?? "",
          totalLessons:     0,
          completedLessons: 0,
        }))
        setCourses(mapped)
      })
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoading(false))
  }, [])

  const inProgress = courses.filter((c) => c.status !== "completed").length
  const completed  = courses.filter((c) => c.status === "completed").length

  const filtered = search
    ? courses.filter((c) =>
        c.title.toLowerCase().includes(search)    ||
        c.teacher.toLowerCase().includes(search)  ||
        c.category.toLowerCase().includes(search)
      )
    : courses

  if (loading) {
    return (
      <div className="flex flex-col flex-1">

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader
          title="My Courses"
          subtitle={
            error ?? (search
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchParams.get("search")}"`
              : `${courses.length} enrolled — ${inProgress} in progress, ${completed} completed`
            )
          }
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
            {search ? (
              <p className="text-slate-500 font-medium">No courses match "{searchParams.get("search")}".</p>
            ) : (
              <>
                <p className="text-slate-500 font-medium">No courses yet.</p>
                <p className="text-slate-400 text-sm mt-1">Browse the course catalogue to get started.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <StudentCoursesPage />
    </Suspense>
  )
}
