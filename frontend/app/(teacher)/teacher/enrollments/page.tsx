"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

function EnrollmentRow({ enrollment }: { enrollment: any }) {
  const isCompleted = enrollment.status === "COMPLETED"
  const studentName  = enrollment.student?.name  ?? "Student"
  const studentEmail = enrollment.student?.email ?? ""
  const courseTitle  = enrollment.course?.title  ?? "Course"
  const enrolledAt   = enrollment.enrolled_at    ?? enrollment.enrolledAt ?? new Date().toISOString()

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <p className="font-medium text-slate-800 text-sm">{studentName}</p>
        <p className="text-xs text-slate-400">{studentEmail}</p>
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-600 hidden sm:table-cell">{courseTitle}</td>
      <td className="py-3.5 px-4 text-sm text-slate-500 hidden md:table-cell">
        {new Date(enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[80px]">
            <div className={`h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${enrollment.progress ?? 0}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-600 w-9 text-right">{enrollment.progress ?? 0}%</span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
          {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {isCompleted ? "Completed" : "Active"}
        </span>
      </td>
    </tr>
  )
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const coursesRes = await api.get("/api/teacher/courses")
        const courseList: any[] = coursesRes.data.data.data ?? []

        const allEnrollments: any[] = []
        await Promise.all(
          courseList.slice(0, 10).map(async (course: any) => {
            try {
              const res = await api.get(`/api/courses/${course.id}/enrolled-students?limit=100`)
              const list: any[] = res.data.data.enrollments ?? []
              list.forEach((e: any) => {
                allEnrollments.push({ ...e, course })
              })
            } catch {}
          }),
        )
        setEnrollments(allEnrollments)
      } catch {
        // empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const active    = enrollments.filter((e) => e.status !== "COMPLETED").length
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search enrollments…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search enrollments…" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Enrollments</h1>
          <p className="text-slate-500 mt-1">{enrollments.length} total — {active} active, {completed} completed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Course</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Enrolled</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Progress</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm">No enrollments yet.</td></tr>
              ) : (
                enrollments.map((e, i) => <EnrollmentRow key={`${e.id}-${i}`} enrollment={e} />)
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
