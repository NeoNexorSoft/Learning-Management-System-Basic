"use client"

import { useEffect, useState } from "react"
import { BookOpen, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group">
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
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{course.progress}% complete</span>
            <span className="font-semibold text-slate-700">{course.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${completed ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get("/api/enrollments/my")
      .then(({ data }) => {
        const enrollments: any[] = data.data.enrollments ?? []
        const mapped: CourseItem[] = enrollments.map((e: any) => {
          const progress         = Number(e.progress ?? 0)
          const totalLessons     = 0
          const completedLessons = 0
          return {
            id:               e.id,
            title:            e.course?.title ?? "Untitled",
            teacher:          e.course?.teacher?.name ?? "Unknown",
            progress,
            category:         e.course?.category?.name ?? "General",
            status:           e.status === "COMPLETED" ? "completed" : "in-progress",
            thumbnail:        e.course?.thumbnail ?? "",
            totalLessons,
            completedLessons,
          }
        })
        setCourses(mapped)
      })
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoading(false))
  }, [])

  const inProgress = courses.filter((c) => c.status !== "completed").length
  const completed  = courses.filter((c) => c.status === "completed").length

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
      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader
          title="My Courses"
          subtitle={error ?? `${courses.length} enrolled — ${inProgress} in progress, ${completed} completed`}
        />

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No courses yet.</p>
            <p className="text-slate-400 text-sm mt-1">Browse the course catalogue to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        )}
      </main>
    </div>
  )
}
