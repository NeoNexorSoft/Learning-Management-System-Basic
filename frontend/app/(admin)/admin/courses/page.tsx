"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, CheckCircle, XCircle, Trash2, BookOpen } from "lucide-react"
import api from "@/lib/axios"
import type { CourseRow } from "@/types/admin"
import DataTable, { Column } from "@/components/admin/DataTable"
import Pagination from "@/components/admin/Pagination"
import SearchInput from "@/components/admin/SearchInput"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import Badge from "@/components/admin/Badge"

type StatusTab = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "POPULAR"
const TABS: StatusTab[] = ["ALL", "PENDING", "APPROVED", "REJECTED", "POPULAR"]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

type DialogAction = "approve" | "reject" | "delete" | null

function AdminCoursesPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const tab    = (searchParams.get("tab")?.toUpperCase() as StatusTab) ?? "ALL"
  const search = searchParams.get("search") ?? ""

  const [page,       setPage]       = useState(1)
  const [courses,    setCourses]    = useState<CourseRow[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  const [dialog,        setDialog]        = useState<DialogAction>(null)
  const [targetCourse,  setTargetCourse]  = useState<CourseRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason,  setRejectReason]  = useState("")

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/admin/courses?${params.toString()}`)
  }

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 10 }
      if (search)                                  params.search = search
      if (tab !== "ALL" && tab !== "POPULAR")      params.status = tab
      if (tab === "POPULAR")                       params.sort   = "popular"
      const { data } = await api.get("/api/admin/courses", { params })
      const result    = data.data
      const rawList: any[] = Array.isArray(result) ? result : (result?.courses ?? result?.data ?? [])
      const mapped = rawList.map((c: any) => ({
        ...c,
        instructor: c.instructor ?? { name: c.teacher?.name ?? "—", email: c.teacher?.email ?? "" },
        price: String(c.price ?? "0"),
        created_at: c.created_at ?? c.createdAt ?? new Date().toISOString(),
      }))
      setCourses(mapped)
      const totalCount = (!Array.isArray(result) && result?.total) ? result.total : rawList.length
      setTotal(totalCount)
      setTotalPages((!Array.isArray(result) && result?.totalPages) ? result.totalPages : Math.ceil(totalCount / 10))
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [tab, search, page])

  useEffect(() => { fetchCourses() }, [fetchCourses])
  useEffect(() => { setPage(1) }, [tab, search])

  function openDialog(action: DialogAction, course: CourseRow) {
    setDialog(action)
    setTargetCourse(course)
    setRejectReason("")
  }

  async function handleAction() {
    if (!targetCourse || !dialog) return
    setActionLoading(true)
    try {
      if (dialog === "approve") await api.put(`/api/admin/courses/${targetCourse.id}/approve`)
      if (dialog === "reject")  await api.put(`/api/admin/courses/${targetCourse.id}/reject`, { reason: rejectReason || "Does not meet platform guidelines." })
      if (dialog === "delete")  await api.delete(`/api/admin/courses/${targetCourse.id}`)
      await fetchCourses()
    } finally {
      setActionLoading(false)
      setDialog(null)
      setTargetCourse(null)
      setRejectReason("")
    }
  }

  const columns: Column<CourseRow>[] = [
    {
      header: "Thumbnail",
      render: (c) =>
        c.thumbnail ? (
          <Image src={c.thumbnail} alt={c.title} width={56} height={36} className="rounded-lg object-cover w-14 h-9 flex-shrink-0" />
        ) : (
          <div className="w-14 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
        ),
    },
    {
      header: "Title",
      render: (c) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="font-semibold text-slate-800 truncate">{c.title}</p>
          <p className="text-xs text-slate-400">{c.category?.name ?? "Uncategorized"}</p>
        </div>
      ),
    },
    {
      header: "Teacher",
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{c.instructor.name}</p>
          <p className="text-xs text-slate-400">{c.instructor.email}</p>
        </div>
      ),
    },
    { header: "Price",   render: (c) => <span className="font-semibold text-slate-700">৳ {parseFloat(c.price).toFixed(2)}</span> },
    { header: "Created", render: (c) => <span className="text-slate-500 text-sm">{formatDate(c.created_at)}</span> },
    { header: "Status",  render: (c) => <Badge label={c.status} /> },
    {
      header: "Action",
      render: (c) => (
        <div className="flex items-center gap-1">
          <a
            href={`/courses/${c.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            title="View Course"
          >
            <Eye className="w-4 h-4" />
          </a>
          {c.status !== "APPROVED" && (
            <button
              onClick={() => openDialog("approve", c)}
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {c.status !== "REJECTED" && (
            <button
              onClick={() => openDialog("reject", c)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openDialog("delete", c)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const dialogConfig = {
    approve: { title: "Approve Course?", message: `Approve "${targetCourse?.title}"? It will go live on the platform.`, label: "Yes, Approve", danger: false },
    reject:  { title: "Reject Course?",  message: `Reject "${targetCourse?.title}"? The instructor will be notified.`,  label: "Yes, Reject",  danger: true  },
    delete:  { title: "Delete Course?",  message: `Permanently delete "${targetCourse?.title}"? This cannot be undone.`, label: "Yes, Delete", danger: true  },
  }

  const dc = dialog ? dialogConfig[dialog] : null

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Courses</h1>
        <p className="text-sm text-slate-500 mt-1">Review, approve, and manage all courses — {total.toLocaleString()} total</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setParam("tab", t === "ALL" ? null : t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(val) => setParam("search", val || null)}
            placeholder="Search by title…"
            className="max-w-sm flex-1"
          />
          <span className="text-sm text-slate-400 flex-shrink-0">{total} result{total !== 1 ? "s" : ""}</span>
        </div>

        <DataTable columns={columns} data={courses} loading={loading} keyFn={(c) => c.id} emptyMessage="No courses found." />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {dc && (
        <ConfirmDialog
          isOpen={!!dialog}
          onClose={() => { setDialog(null); setTargetCourse(null); setRejectReason("") }}
          onConfirm={handleAction}
          loading={actionLoading}
          title={dc.title}
          message={dc.message}
          confirmLabel={dc.label}
          danger={dc.danger}
        >
          {dialog === "reject" && (
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)…"
              rows={3}
              className="w-full mt-3 px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          )}
        </ConfirmDialog>
      )}
    </main>
  )
}

export default function Page() {
  return (
    <Suspense>
      <AdminCoursesPage />
    </Suspense>
  )
}
