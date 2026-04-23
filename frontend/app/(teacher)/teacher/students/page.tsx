"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { GraduationCap, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

interface StudentRow {
  id: string
  name: string
  email: string
  avatar: string
  coursesEnrolled: number
  progress: number
  lastActive: string
}

function StudentRowComp({ student }: { student: StudentRow }) {
  const initials      = student.name.split(" ").map((n) => n[0]).join("").toUpperCase()
  const progressColor = student.progress >= 75 ? "bg-emerald-500" : student.progress >= 40 ? "bg-indigo-500" : "bg-amber-500"

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">{student.name}</p>
            <p className="text-xs text-slate-400">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          {student.coursesEnrolled}
        </div>
      </td>
      <td className="py-3.5 px-4 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[80px]">
            <div className={`h-1.5 rounded-full ${progressColor}`} style={{ width: `${student.progress}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-600 w-9 text-right">{student.progress}%</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-500 hidden lg:table-cell">
        {new Date(student.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
    </tr>
  )
}

function StudentsOverviewPage() {
  const searchParams = useSearchParams()
  const search = (searchParams.get("search") ?? "").toLowerCase()

  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const coursesRes = await api.get("/api/teacher/courses")
        const courseList: any[] = coursesRes.data.data.data ?? []

        const studentMap = new Map<string, StudentRow>()

        await Promise.all(
          courseList.slice(0, 10).map(async (course: any) => {
            try {
              const res = await api.get(`/api/courses/${course.id}/enrolled-students?limit=100`)
              const list: any[] = res.data.data.data ?? []
              list.forEach((e: any) => {
                const s = e.student
                if (!s) return
                const existing = studentMap.get(s.id)
                if (existing) {
                  existing.coursesEnrolled += 1
                  existing.progress = Math.max(existing.progress, e.progress ?? 0)
                } else {
                  studentMap.set(s.id, {
                    id:              s.id,
                    name:            s.name ?? "Student",
                    email:           s.email ?? "",
                    avatar:          s.avatar ?? "",
                    coursesEnrolled: 1,
                    progress:        e.progress ?? 0,
                    lastActive:      e.updated_at ?? new Date().toISOString(),
                  })
                }
              })
            } catch {}
          }),
        )
        setStudents(Array.from(studentMap.values()))
      } catch {
        // empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = search
    ? students.filter((s) =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      )
    : students

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search students…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search students…" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Students Overview</h1>
          <p className="text-slate-500 mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled in your courses
            {search && <span className="text-indigo-600"> · {filtered.length} match "{searchParams.get("search")}"</span>}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Courses</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Progress</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    {search ? `No students match "${searchParams.get("search")}".` : "No students enrolled yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => <StudentRowComp key={s.id} student={s} />)
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <StudentsOverviewPage />
    </Suspense>
  )
}
