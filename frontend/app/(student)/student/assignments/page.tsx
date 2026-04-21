"use client"

import { useEffect, useState } from "react"
import type { Assignment } from "@/types/index"
import { CheckCircle2, Clock, AlertCircle, ClipboardList, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import PageHeader from "@/components/shared/PageHeader"
import api from "@/lib/axios"

const statusConfig = {
  pending:   { label: "Pending",   bg: "bg-amber-100",   text: "text-amber-700",   Icon: Clock },
  submitted: { label: "Submitted", bg: "bg-blue-100",    text: "text-blue-700",    Icon: CheckCircle2 },
  graded:    { label: "Graded",    bg: "bg-emerald-100", text: "text-emerald-700", Icon: CheckCircle2 },
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const cfg       = statusConfig[assignment.status]
  const StatusIcon = cfg.Icon
  const isOverdue = assignment.status === "pending" && new Date(assignment.dueDate) < new Date()

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          <span className="font-medium text-slate-800 text-sm">{assignment.title}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-500 hidden sm:table-cell">{assignment.course}</td>
      <td className="py-3.5 px-4 text-sm hidden md:table-cell">
        <span className={isOverdue ? "text-red-500 font-medium" : "text-slate-500"}>
          {new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </td>
      <td className="py-3.5 px-4 text-sm font-medium text-slate-700 hidden lg:table-cell">
        {assignment.marks !== null ? `${assignment.marks}/${assignment.totalMarks}` : "—"}
      </td>
    </tr>
  )
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    api.get("/api/assignments/my")
      .then(({ data }) => {
        const raw: any[] = data.data.assignments ?? data.data ?? []
        const mapped: Assignment[] = raw.map((a: any) => ({
          id:         a.id,
          title:      a.title,
          course:     a.lesson?.section?.course?.title ?? "Unknown Course",
          dueDate:    a.due_date ?? new Date().toISOString(),
          status:     a.submission
            ? (a.submission.grade !== null ? "graded" : "submitted")
            : "pending",
          marks:      a.submission?.grade ?? null,
          totalMarks: a.total_marks ?? 100,
        }))
        setAssignments(mapped)
      })
      .catch(() => setError("Failed to load assignments."))
      .finally(() => setLoading(false))
  }, [])

  const pending = assignments.filter((a) => a.status === "pending").length

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search assignments…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search assignments…" />
      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader
          title="Assignments"
          subtitle={error ?? `${assignments.length} total — ${pending} pending`}
        />

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No assignments yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignment</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Course</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Due Date</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Marks</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => <AssignmentRow key={a.id} assignment={a} />)}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
