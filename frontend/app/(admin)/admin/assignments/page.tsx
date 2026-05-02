"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react"
import type { ElementType } from "react"
import api from "@/lib/axios"
import DataTable, { Column } from "@/components/admin/DataTable"
import SearchInput from "@/components/admin/SearchInput"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import Badge from "@/components/admin/Badge"
import Modal from "@/components/admin/Modal"

// ─── Types ────────────────────────────────────────────────────────────────────

type AssignmentStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
type StatusTab        = "ALL" | "PENDING" | "APPROVED" | "REJECTED"

interface Assignment {
  id: string
  title: string
  description: string | null
  target: "COURSE" | "ALL_ENROLLED"
  status: AssignmentStatus
  due_date: string
  total_marks: number
  score_released: boolean
  is_deleted: boolean
  created_at: string
  teacher: { id: string; name: string; email: string }
  course: { id: string; title: string } | null
  _count: { submissions: number }
}

interface EditForm {
  title: string
  description: string
  due_date: string
  total_marks: number
}

type Toast = { type: "success" | "error"; message: string } | null

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: StatusTab[] = ["ALL", "PENDING", "APPROVED", "REJECTED"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Maps PENDING_APPROVAL → "Pending" so Badge's colorMap resolves to amber
function statusLabel(status: AssignmentStatus): string {
  if (status === "PENDING_APPROVAL") return "Pending"
  return status.charAt(0) + status.slice(1).toLowerCase()
}

// ─── Inline StatCard (extends shared design with optional onClick) ─────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  onClick,
}: {
  icon: ElementType
  label: string
  value: number
  sub: string
  iconBg: string
  iconColor: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

// ─── Inner page (needs Suspense for useSearchParams) ──────────────────────────

function AdminAssignmentsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // Default tab is PENDING (no param = pending)
  const rawTab = searchParams.get("tab")?.toUpperCase() as StatusTab | undefined
  const tab    = rawTab ?? "PENDING"
  const search = searchParams.get("search") ?? ""

  const [allAssignments, setAllAssignments] = useState<Assignment[]>([])
  const [loading,        setLoading]        = useState(true)
  const [toast,          setToast]          = useState<Toast>(null)

  // Per-row action loading
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  // Delete confirm
  const [deleteTarget,   setDeleteTarget]   = useState<Assignment | null>(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  // Edit modal
  const [editTarget,  setEditTarget]  = useState<Assignment | null>(null)
  const [editForm,    setEditForm]    = useState<EditForm>({ title: "", description: "", due_date: "", total_marks: 100 })
  const [editLoading, setEditLoading] = useState(false)
  const [editError,   setEditError]   = useState("")

  // ── URL helpers ─────────────────────────────────────────────────────────────

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/admin/assignments?${params.toString()}`)
  }

  // ── Toast ───────────────────────────────────────────────────────────────────

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Data fetching ────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/api/assignments/admin", {
        params: { filter: "all" },
      })
      setAllAssignments(data.data?.assignments ?? [])
    } catch {
      setAllAssignments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Derived data ─────────────────────────────────────────────────────────────

  const filtered = allAssignments.filter(a => {
    const matchesTab =
      tab === "ALL"      ? true :
      tab === "PENDING"  ? a.status === "PENDING_APPROVAL" :
                           a.status === tab

    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.teacher.name.toLowerCase().includes(q) ||
      (a.course?.title ?? "").toLowerCase().includes(q)

    return matchesTab && matchesSearch
  })

  const total    = allAssignments.length
  const pending  = allAssignments.filter(a => a.status === "PENDING_APPROVAL").length
  const approved = allAssignments.filter(a => a.status === "APPROVED").length
  const rejected = allAssignments.filter(a => a.status === "REJECTED").length

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function handleApprove(id: string) {
    setApprovingId(id)
    try {
      await api.patch(`/api/assignments/admin/${id}/approve`)
      showToast("success", "Assignment approved successfully")
      load()
    } catch (err: any) {
      showToast("error", err.response?.data?.message ?? "Failed to approve")
    } finally {
      setApprovingId(null)
    }
  }

  async function handleReject(id: string) {
    setRejectingId(id)
    try {
      await api.patch(`/api/assignments/admin/${id}/reject`)
      showToast("success", "Assignment rejected")
      load()
    } catch (err: any) {
      showToast("error", err.response?.data?.message ?? "Failed to reject")
    } finally {
      setRejectingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/assignments/admin/${deleteTarget.id}`)
      showToast("success", "Assignment deleted")
      setDeleteTarget(null)
      load()
    } catch (err: any) {
      showToast("error", err.response?.data?.message ?? "Failed to delete")
    } finally {
      setDeleteLoading(false)
    }
  }

  function openEdit(a: Assignment) {
    setEditTarget(a)
    setEditForm({
      title:       a.title,
      description: a.description ?? "",
      due_date:    new Date(a.due_date).toISOString().slice(0, 16),
      total_marks: a.total_marks,
    })
    setEditError("")
  }

  async function handleEdit() {
    if (!editTarget) return
    if (!editForm.title.trim()) { setEditError("Title is required."); return }
    if (!editForm.due_date)     { setEditError("Due date is required."); return }

    setEditError("")
    setEditLoading(true)
    try {
      await api.put(`/api/assignments/admin/${editTarget.id}`, {
        title:       editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        due_date:    new Date(editForm.due_date).toISOString(),
        total_marks: editForm.total_marks,
      })
      showToast("success", "Assignment updated successfully")
      setEditTarget(null)
      load()
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Failed to update assignment")
    } finally {
      setEditLoading(false)
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────

  const columns: Column<Assignment>[] = [
    {
      header: "Assignment",
      render: (a) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
          {a.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
              {a.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Teacher",
      render: (a) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{a.teacher.name}</p>
          <p className="text-xs text-slate-400">{a.teacher.email}</p>
        </div>
      ),
    },
    {
      header: "Course",
      render: (a) =>
        a.course ? (
          <span className="text-sm text-slate-600">{a.course.title}</span>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        ),
    },
    {
      header: "Target",
      render: (a) => (
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
          {a.target === "ALL_ENROLLED" ? "All Enrolled" : "Course"}
        </span>
      ),
    },
    {
      header: "Due Date",
      render: (a) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(a.due_date)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (a) => <Badge label={statusLabel(a.status)} />,
    },
    {
      header: "Created",
      render: (a) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(a.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (a) => (
        <div className="flex items-center gap-1.5 flex-wrap min-w-[160px]">
          {a.status === "PENDING_APPROVAL" && (
            <>
              <button
                onClick={() => handleApprove(a.id)}
                disabled={approvingId === a.id}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {approvingId === a.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Approve
              </button>
              <button
                onClick={() => handleReject(a.id)}
                disabled={rejectingId === a.id}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {rejectingId === a.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => openEdit(a)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => setDeleteTarget(a)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main className="flex-1 p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Assignments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and manage all teacher assignments —{" "}
          {total.toLocaleString()} total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Assignments"
          value={total}
          sub="across all teachers"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          onClick={() => setParam("tab", "ALL")}
        />
        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={pending}
          sub="awaiting your review"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => setParam("tab", null)}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={approved}
          sub="live for students"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => setParam("tab", "APPROVED")}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={rejected}
          sub="declined assignments"
          iconBg="bg-red-50"
          iconColor="text-red-600"
          onClick={() => setParam("tab", "REJECTED")}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() =>
              setParam("tab", t === "PENDING" ? null : t)
            }
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "PENDING" ? "Pending" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={val => setParam("search", val || null)}
            placeholder="Search by title, teacher or course…"
            className="max-w-sm flex-1"
          />
          <span className="text-sm text-slate-400 flex-shrink-0">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          keyFn={a => a.id}
          emptyMessage="No assignments found."
        />
      </div>

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Assignment?"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        danger={true}
      />

      {/* ── Edit modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Assignment"
        size="lg"
      >
        {editTarget && (
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
                value={editForm.title}
                onChange={e =>
                  setEditForm(p => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={e =>
                  setEditForm(p => ({ ...p, description: e.target.value }))
                }
                rows={3}
                placeholder="Optional instructions…"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Due Date + Total Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={editForm.due_date}
                  onChange={e =>
                    setEditForm(p => ({ ...p, due_date: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.total_marks}
                  onChange={e =>
                    setEditForm(p => ({
                      ...p,
                      total_marks: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editLoading}
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

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </main>
  )
}

// ─── Export with Suspense (required for useSearchParams) ──────────────────────

export default function Page() {
  return (
    <Suspense>
      <AdminAssignmentsPage />
    </Suspense>
  )
}
