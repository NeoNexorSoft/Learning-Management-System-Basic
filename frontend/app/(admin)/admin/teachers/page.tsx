"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, Ban, CheckCircle } from "lucide-react"
import api from "@/lib/axios"
import type { UserRow } from "@/types/admin"
import DataTable, { Column } from "@/components/admin/DataTable"
import Pagination from "@/components/admin/Pagination"
import SearchInput from "@/components/admin/SearchInput"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import Badge from "@/components/admin/Badge"

const TABS = ["ALL", "ACTIVE", "BANNED"] as const
type Tab = typeof TABS[number]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function AdminTeachersPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const tab    = (searchParams.get("tab")?.toUpperCase() as Tab) ?? "ALL"
  const search = searchParams.get("search") ?? ""

  const [page,       setPage]       = useState(1)
  const [teachers,   setTeachers]   = useState<UserRow[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [targetTeacher, setTargetTeacher] = useState<UserRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/admin/teachers?${params.toString()}`)
  }

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page, limit: 10, role: "TEACHER",
        ...(search && { search }),
        ...(tab === "ACTIVE" && { is_banned: "false" }),
        ...(tab === "BANNED" && { is_banned: "true"  }),
      }
      const { data } = await api.get("/api/users", { params })
      const result   = data.data
      const userList: any[] = Array.isArray(result) ? result : (result?.users ?? result?.data ?? [])
      setTeachers(userList)
      const totalCount = (!Array.isArray(result) && result?.total) ? result.total : userList.length
      setTotal(totalCount)
      setTotalPages((!Array.isArray(result) && result?.totalPages) ? result.totalPages : Math.ceil(totalCount / 10))
    } catch {
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [tab, search, page])

  useEffect(() => { fetchTeachers() }, [fetchTeachers])
  useEffect(() => { setPage(1) }, [tab, search])

  async function handleBanToggle() {
    if (!targetTeacher) return
    setActionLoading(true)
    try {
      await api.post(`/api/users/${targetTeacher.id}/ban`)
      await fetchTeachers()
    } finally {
      setActionLoading(false)
      setConfirmOpen(false)
      setTargetTeacher(null)
    }
  }

  const columns: Column<UserRow>[] = [
    {
      header: "Teacher",
      render: (u) => (
        <div>
          <p className="font-semibold text-slate-800">{u.name}</p>
          <p className="text-xs text-slate-400">@{u.username}</p>
        </div>
      ),
    },
    { header: "Email",   render: (u) => <span className="text-slate-600">{u.email}</span> },
    { header: "Mobile",  render: (u) => <span className="text-slate-500">{u.mobile ?? "—"}</span> },
    { header: "Country", render: (u) => <span className="text-slate-500">{u.country ?? "—"}</span> },
    { header: "Joined",  render: (u) => <span className="text-slate-500">{formatDate(u.created_at)}</span> },
    {
      header: "Total Courses",
      render: (u) => <span className="font-semibold text-slate-700">{u.total_courses ?? 0}</span>,
    },
    {
      header: "Total Earnings",
      render: (u) => (
        <span className="font-semibold text-slate-700">
          ৳ {parseFloat(u.total_earnings ?? "0").toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (u) => <Badge label={u.is_banned ? "Banned" : "Active"} />,
    },
    {
      header: "Action",
      render: (u) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/teachers/${u.id}`)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setTargetTeacher(u); setConfirmOpen(true) }}
            className={`p-1.5 rounded-lg transition-colors ${
              u.is_banned
                ? "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                : "hover:bg-red-50 text-slate-400 hover:text-red-600"
            }`}
            title={u.is_banned ? "Unban Teacher" : "Ban Teacher"}
          >
            {u.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Teachers</h1>
        <p className="text-sm text-slate-500 mt-1">Manage instructors on the platform — {total.toLocaleString()} total</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
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
            placeholder="Search by name or email…"
            className="max-w-sm flex-1"
          />
          <span className="text-sm text-slate-400 flex-shrink-0">{total} result{total !== 1 ? "s" : ""}</span>
        </div>

        <DataTable columns={columns} data={teachers} loading={loading} keyFn={(u) => u.id} emptyMessage="No teachers found." />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setTargetTeacher(null) }}
        onConfirm={handleBanToggle}
        loading={actionLoading}
        title={targetTeacher?.is_banned ? "Unban Teacher?" : "Ban Teacher?"}
        message={
          targetTeacher?.is_banned
            ? `Restore access for ${targetTeacher?.name}?`
            : `Ban ${targetTeacher?.name}? They will lose access to the platform.`
        }
        confirmLabel={targetTeacher?.is_banned ? "Yes, Unban" : "Yes, Ban"}
        danger={!targetTeacher?.is_banned}
      />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense>
      <AdminTeachersPage />
    </Suspense>
  )
}
