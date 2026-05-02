"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Loader2,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import StatusBadge from "@/components/shared/StatusBadge"
import api from "@/lib/axios"
import CreateAssignmentModal from "./create-modal"

interface Assignment {
  id: string
  title: string
  description: string | null
  target: "COURSE" | "ALL_ENROLLED"
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  due_date: string
  total_marks: number
  score_released: boolean
  submission_count: number
  course: { id: string; title: string } | null
}

function TeacherAssignmentsPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search")?.toLowerCase() ?? ""

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [showCreate, setShowCreate]   = useState(false)
  const [releasing, setReleasing]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get("/api/assignments/teacher")
      setAssignments(data.data?.assignments ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleReleaseScores(id: string) {
    setReleasing(id)
    setError("")
    try {
      await api.patch(`/api/assignments/${id}/release-scores`)
      setAssignments(prev =>
        prev.map(a => (a.id === id ? { ...a, score_released: true } : a))
      )
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to release scores")
    } finally {
      setReleasing(null)
    }
  }

  const filtered = search
    ? assignments.filter(
        a =>
          a.title.toLowerCase().includes(search) ||
          (a.course?.title ?? "").toLowerCase().includes(search)
      )
    : assignments

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
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar placeholder="Search assignments…" />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Assignments</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Title
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                  Course
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                  Target
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                  Due Date
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                  Submissions
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    {search
                      ? `No assignments match "${search}"`
                      : "No assignments yet. Create your first one!"}
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 text-sm">{a.title}</p>
                      {a.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {a.description}
                        </p>
                      )}
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-4 text-sm text-slate-600 hidden md:table-cell">
                      {a.course?.title ?? (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {a.target === "ALL_ENROLLED" ? "All Enrolled" : "Course"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {a.status === "APPROVED" && (
                        <StatusBadge
                          label="Approved"
                          bg="bg-emerald-100"
                          text="text-emerald-700"
                          icon={CheckCircle2}
                        />
                      )}
                      {a.status === "REJECTED" && (
                        <StatusBadge
                          label="Rejected"
                          bg="bg-red-100"
                          text="text-red-700"
                          icon={XCircle}
                        />
                      )}
                      {a.status === "PENDING_APPROVAL" && (
                        <StatusBadge
                          label="Pending"
                          bg="bg-amber-100"
                          text="text-amber-700"
                          icon={Clock}
                        />
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 text-sm text-slate-600 hidden sm:table-cell whitespace-nowrap">
                      {new Date(a.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Submissions count */}
                    <td className="py-3.5 px-4 text-sm text-slate-600 hidden lg:table-cell">
                      {a.submission_count}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.status === "APPROVED" && (
                          <Link
                            href={`/teacher/assignments/${a.id}/submissions`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Submissions
                          </Link>
                        )}

                        {a.status === "APPROVED" && !a.score_released && (
                          <button
                            onClick={() => handleReleaseScores(a.id)}
                            disabled={releasing === a.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-60"
                          >
                            {releasing === a.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Release Scores
                          </button>
                        )}

                        {a.status === "APPROVED" && a.score_released && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Scores Released
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <CreateAssignmentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false)
          load()
        }}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <TeacherAssignmentsPage />
    </Suspense>
  )
}
