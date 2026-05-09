"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
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
  Pencil,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import StatusBadge from "@/components/shared/StatusBadge"
import Modal from "@/components/admin/Modal"
import dynamic from "next/dynamic"
const PdfViewer = dynamic(() => import("@/components/shared/PdfViewer"), { ssr: false })
import api from "@/lib/axios"
import CreateAssignmentModal from "./create-modal"

interface Assignment {
  id: string
  title: string
  description: string | null
  file_url: string | null
  created_at: string
  target: "COURSE" | "ALL_ENROLLED"
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  due_date: string
  total_marks: number
  score_released: boolean
  submission_count: number
  course: { id: string; title: string } | null
}

interface Course {
  id: string
  title: string
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function TeacherAssignmentsPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search")?.toLowerCase() ?? ""

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [showCreate, setShowCreate]   = useState(false)
  const [releasing, setReleasing]     = useState<string | null>(null)

  // ── View modal ─────────────────────────────────────────────────────────────
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)
  const [showViewPdf, setShowViewPdf]       = useState(false)

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editAssignment, setEditAssignment]     = useState<Assignment | null>(null)
  const [courses, setCourses]                   = useState<Course[]>([])
  const [editTitle, setEditTitle]               = useState("")
  const [editDescription, setEditDescription]   = useState("")
  const [editTarget, setEditTarget]             = useState<"COURSE" | "ALL_ENROLLED">("COURSE")
  const [editCourseId, setEditCourseId]         = useState("")
  const [editDueDate, setEditDueDate]           = useState("")
  const [editTotalMarks, setEditTotalMarks]     = useState(100)
  const [editFileUrl, setEditFileUrl]           = useState<string | null>(null)
  const [editFile, setEditFile]                 = useState<File | null>(null)
  const [editUploading, setEditUploading]       = useState(false)
  const [editLoading, setEditLoading]           = useState(false)
  const [editError, setEditError]               = useState("")
  const editFileRef = useRef<HTMLInputElement>(null)

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

  // ── View modal handlers ────────────────────────────────────────────────────

  function openViewModal(a: Assignment) {
    setViewAssignment(a)
    setShowViewPdf(false)
  }

  function closeViewModal() {
    setViewAssignment(null)
    setShowViewPdf(false)
  }

  // ── Edit modal handlers ────────────────────────────────────────────────────

  async function openEditModal(a: Assignment) {
    setEditAssignment(a)
    setEditTitle(a.title)
    setEditDescription(a.description ?? "")
    setEditTarget(a.target)
    setEditCourseId(a.course?.id ?? "")
    setEditDueDate(a.due_date ? new Date(a.due_date).toISOString().slice(0, 16) : "")
    setEditTotalMarks(a.total_marks)
    setEditFileUrl(a.file_url)
    setEditFile(null)
    setEditError("")
    setEditUploading(false)
    if (editFileRef.current) editFileRef.current.value = ""

    if (courses.length === 0) {
      try {
        const { data } = await api.get("/api/teacher/courses")
        setCourses(data.data?.courses ?? data.data ?? [])
      } catch {
        // non-fatal — dropdown stays empty
      }
    }
  }

  function closeEditModal() {
    setEditAssignment(null)
    setEditError("")
    if (editFileRef.current) editFileRef.current.value = ""
  }

  async function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setEditFile(f)
    setEditUploading(true)
    setEditError("")
    try {
      const form = new FormData()
      form.append("file", f)
      const { data } = await api.post("/api/upload/document", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setEditFileUrl(data.data?.url ?? null)
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "File upload failed")
      setEditFile(null)
      if (editFileRef.current) editFileRef.current.value = ""
    } finally {
      setEditUploading(false)
    }
  }

  async function handleEditSubmit() {
    if (!editAssignment) return
    setEditError("")
    setEditLoading(true)
    try {
      await api.put(`/api/assignments/teacher/${editAssignment.id}`, {
        title:       editTitle.trim(),
        description: editDescription.trim() || null,
        target:      editTarget,
        course_id:   editTarget === "COURSE" ? editCourseId || undefined : undefined,
        due_date:    editDueDate,
        total_marks: editTotalMarks,
        file_url:    editFileUrl,
      })
      closeEditModal()
      load()
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Failed to update assignment")
    } finally {
      setEditLoading(false)
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
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
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Created
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
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
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
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 text-sm text-slate-600 hidden md:table-cell">
                        {a.course?.title ?? <span className="text-slate-400">—</span>}
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {a.target === "ALL_ENROLLED" ? "All Enrolled" : "Course"}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-sm text-slate-600 hidden lg:table-cell whitespace-nowrap">
                        {formatDateTime(a.created_at)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {a.status === "APPROVED" && (
                          <StatusBadge label="Approved" bg="bg-emerald-100" text="text-emerald-700" icon={CheckCircle2} />
                        )}
                        {a.status === "REJECTED" && (
                          <StatusBadge label="Rejected" bg="bg-red-100" text="text-red-700" icon={XCircle} />
                        )}
                        {a.status === "PENDING_APPROVAL" && (
                          <StatusBadge label="Pending" bg="bg-amber-100" text="text-amber-700" icon={Clock} />
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-sm text-slate-600 hidden sm:table-cell whitespace-nowrap">
                        {formatDateTime(a.due_date)}
                      </td>

                      {/* Submissions count */}
                      <td className="py-3.5 px-4 text-sm text-slate-600 hidden lg:table-cell">
                        {a.submission_count}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openViewModal(a)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>

                          <button
                            onClick={() => openEditModal(a)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          {a.status === "APPROVED" && (
                            <Link
                              href={`/teacher/assignments/${a.id}/submissions`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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

      {/* ── View Modal ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!viewAssignment}
        onClose={closeViewModal}
        title={viewAssignment?.title ?? "Assignment"}
        size="lg"
      >
        {viewAssignment && (
          <div className="space-y-4">
            {viewAssignment.description && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Instructions
                </label>
                <div className="px-3.5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewAssignment.description}
                </div>
              </div>
            )}

            {viewAssignment.file_url && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowViewPdf(prev => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {showViewPdf ? "Hide PDF" : "View PDF"}
                  {showViewPdf ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {showViewPdf && (
                  <div className="mt-3">
                    <PdfViewer url={viewAssignment.file_url} />
                  </div>
                )}
              </div>
            )}

            {!viewAssignment.description && !viewAssignment.file_url && (
              <p className="text-sm text-slate-400 text-center py-4">
                No instructions or file attached.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editAssignment}
        onClose={closeEditModal}
        title="Edit Assignment"
        size="lg"
      >
        {editAssignment && (
          <div className="space-y-4">
            {editError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {editError}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={4}
                placeholder="Assignment instructions…"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Target
              </label>
              <select
                value={editTarget}
                onChange={e => setEditTarget(e.target.value as "COURSE" | "ALL_ENROLLED")}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="COURSE">Course</option>
                <option value="ALL_ENROLLED">All Enrolled</option>
              </select>
            </div>

            {/* Course — only when target is COURSE */}
            {editTarget === "COURSE" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Course
                </label>
                <select
                  value={editCourseId}
                  onChange={e => setEditCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a course…</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Total Marks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                value={editTotalMarks}
                onChange={e => setEditTotalMarks(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Assignment PDF
              </label>
              <input
                ref={editFileRef}
                type="file"
                accept=".pdf"
                onChange={handleEditFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => editFileRef.current?.click()}
                disabled={editUploading}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-60"
              >
                {editUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : editFile ? (
                  <>
                    <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="truncate max-w-xs text-slate-700 font-medium">
                      {editFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {editFileUrl ? "Replace PDF" : "Upload PDF (optional)"}
                  </>
                )}
              </button>
              {editFileUrl && !editUploading && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editFile ? "New file uploaded" : "Current file attached"}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={closeEditModal}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading || editUploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
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
      <TeacherAssignmentsPage />
    </Suspense>
  )
}
