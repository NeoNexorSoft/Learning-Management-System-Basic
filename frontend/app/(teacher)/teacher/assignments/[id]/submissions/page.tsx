"use client"

import { useEffect, useState, useCallback , Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileDown,
  Award,
  Users,
  MessageSquare,
  BarChart2,
} from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import StatCard from "@/components/shared/StatCard"
import StatusBadge from "@/components/shared/StatusBadge"
import Modal from "@/components/admin/Modal"
import api from "@/lib/axios"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: string
  name: string
  email: string
  avatar: string | null
}

interface Submission {
  id: string
  student_id: string
  content: string | null
  file_url: string | null
  grade: number | null
  feedback: string | null
  status: "SUBMITTED" | "GRADED" | "RETURNED"
  submitted_at: string
  student: Student
}

interface Assignment {
  id: string
  title: string
  total_marks: number
  score_released: boolean
  due_date: string
  course: { id: string; title: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SubmissionTypeBadge({
  content,
  fileUrl,
}: {
  content: string | null
  fileUrl: string | null
}) {
  if (content && fileUrl)
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
        Both
      </span>
    )
  if (fileUrl)
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
        File
      </span>
    )
  if (content)
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
        Text
      </span>
    )
  return <span className="text-slate-400 text-xs">—</span>
}

function StudentAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
      />
    )
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SubmissionsPage() {
  const { id: assignmentId } = useParams<{ id: string }>()
  const router = useRouter()

  const [assignment, setAssignment]   = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")

  // Grade modal
  const [grading, setGrading]       = useState<Submission | null>(null)
  const [grade, setGrade]           = useState<number | "">("")
  const [feedback, setFeedback]     = useState("")
  const [gradeError, setGradeError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [assignRes, subRes] = await Promise.all([
        api.get("/api/assignments/teacher"),
        api.get(`/api/assignments/${assignmentId}/submissions`),
      ])

      const allAssignments: Assignment[] = assignRes.data.data?.assignments ?? []
      const found = allAssignments.find((a: Assignment) => a.id === assignmentId)
      if (!found) {
        router.push("/teacher/assignments")
        return
      }
      setAssignment(found)
      setSubmissions(subRes.data.data?.submissions ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }, [assignmentId, router])

  useEffect(() => {
    load()
  }, [load])

  function openGradeModal(s: Submission) {
    setGrading(s)
    setGrade(s.grade ?? "")
    setFeedback(s.feedback ?? "")
    setGradeError("")
  }

  function closeGradeModal() {
    setGrading(null)
    setGrade("")
    setFeedback("")
    setGradeError("")
  }

  async function handleGrade() {
    if (!grading || !assignment) return
    if (grade === "" || grade < 0) {
      setGradeError("Please enter a valid grade.")
      return
    }
    if (Number(grade) > assignment.total_marks) {
      setGradeError(`Grade cannot exceed ${assignment.total_marks}.`)
      return
    }

    setGradeError("")
    setSubmitting(true)
    try {
      await api.post(`/api/assignments/submissions/${grading.id}/grade`, {
        grade: Number(grade),
        feedback: feedback.trim() || undefined,
      })
      setSubmissions(prev =>
        prev.map(s =>
          s.id === grading.id
            ? {
                ...s,
                grade: Number(grade),
                feedback: feedback.trim() || null,
                status: "GRADED" as const,
              }
            : s
        )
      )
      closeGradeModal()
    } catch (err: any) {
      setGradeError(err.response?.data?.message ?? "Failed to save grade")
    } finally {
      setSubmitting(false)
    }
  }

  // Derived stats
  const submittedCount = submissions.length
  const gradedCount    = submissions.filter(s => s.status === "GRADED").length
  const pendingCount   = submissions.filter(s => s.status === "SUBMITTED").length
  const gradePercent   =
    submittedCount > 0 ? Math.round((gradedCount / submittedCount) * 100) : 0

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar placeholder="Search…" />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* ── Back + Header ─────────────────────────────────────────────── */}
        <div>
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {assignment?.title ?? "Submissions"}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {assignment?.course && (
              <span className="text-slate-500 text-sm">{assignment.course.title}</span>
            )}
            {assignment?.due_date && (
              <span className="text-slate-400 text-sm">
                Due{" "}
                {new Date(assignment.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Award}
            label="Total Marks"
            value={assignment?.total_marks ?? 0}
            sub="points per submission"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={Users}
            label="Submitted"
            value={submittedCount}
            sub="submissions received"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Graded"
            value={gradedCount}
            sub={`${gradePercent}% of submissions`}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
            sub="awaiting grade"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Table header with count */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              {submittedCount} submission{submittedCount !== 1 ? "s" : ""}
            </p>
          </div>

          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Student
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                  Submitted At
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                  Type
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                  Grade
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.map(s => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={s.student.name} avatar={s.student.avatar} />
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {s.student.name}
                          </p>
                          <p className="text-xs text-slate-400 hidden sm:block">
                            {s.student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3.5 px-4 text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">
                      {new Date(s.submitted_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <SubmissionTypeBadge
                        content={s.content}
                        fileUrl={s.file_url}
                      />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {s.status === "GRADED" && (
                        <StatusBadge
                          label="Graded"
                          bg="bg-emerald-100"
                          text="text-emerald-700"
                          icon={CheckCircle2}
                        />
                      )}
                      {s.status === "SUBMITTED" && (
                        <StatusBadge
                          label="Submitted"
                          bg="bg-blue-100"
                          text="text-blue-700"
                          icon={Clock}
                        />
                      )}
                      {s.status === "RETURNED" && (
                        <StatusBadge
                          label="Returned"
                          bg="bg-red-100"
                          text="text-red-700"
                          icon={RefreshCw}
                        />
                      )}
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 text-sm hidden sm:table-cell">
                      {s.grade !== null ? (
                        <span className="font-semibold text-slate-800">
                          {Number(s.grade)}
                          <span className="text-slate-400 font-normal">
                            {" "}/ {assignment?.total_marks}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openGradeModal(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        View & Grade
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Grade Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!grading}
        onClose={closeGradeModal}
        title="View & Grade Submission"
        size="xl"
      >
        {grading && (
          <div className="space-y-5">

            {/* Student header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <StudentAvatar
                name={grading.student.name}
                avatar={grading.student.avatar}
              />
              <div>
                <p className="font-semibold text-slate-800">
                  {grading.student.name}
                </p>
                <p className="text-sm text-slate-500">{grading.student.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-400">Submitted</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(grading.submitted_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Text content */}
            {grading.content && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Submission Text
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {grading.content}
                </div>
              </div>
            )}

            {/* File attachment */}
            {grading.file_url && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Attached File
                </p>
                <a
                  href={grading.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Download / View File
                </a>
              </div>
            )}

            {!grading.content && !grading.file_url && (
              <p className="text-sm text-slate-400 italic">
                No content was submitted.
              </p>
            )}

            {/* Grade + Feedback */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Grade{" "}
                  <span className="text-slate-400 font-normal">
                    (0 – {assignment?.total_marks})
                  </span>
                </label>
                <input
                  type="number"
                  value={grade}
                  min={0}
                  max={assignment?.total_marks ?? 100}
                  onChange={e =>
                    setGrade(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder={`0 – ${assignment?.total_marks ?? 100}`}
                  className="w-48 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Feedback{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Write feedback for the student…"
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {gradeError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {gradeError}
              </div>
            )}

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={closeGradeModal}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGrade}
                disabled={submitting || grade === ""}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Grade"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <SubmissionsPage />
    </Suspense>
  )
}
