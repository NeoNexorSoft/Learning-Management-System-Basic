"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, Ban, CheckCircle } from "lucide-react"
import api from "@/lib/axios"
import type { UserRow } from "@/types/admin"
import DataTable, { Column } from "@/components/admin/DataTable"
import Pagination from "@/components/admin/Pagination"
import SearchInput from "@/components/admin/SearchInput"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import Badge from "@/components/admin/Badge"

const TABS = ["ALL", "ACTIVE", "BANNED", "VERIFIED"] as const
type Tab = typeof TABS[number]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AdminUsersPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [tab,        setTab]        = useState<Tab>((searchParams.get("tab") as Tab) ?? "ALL")
  const [search,     setSearch]     = useState("")
  const [page,       setPage]       = useState(1)
  const [users,      setUsers]      = useState<UserRow[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser,  setTargetUser]  = useState<UserRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page, limit: 10, role: "STUDENT",
        ...(search  && { search }),
        ...(tab === "ACTIVE"   && { is_banned: "false" }),
        ...(tab === "BANNED"   && { is_banned: "true"  }),
        ...(tab === "VERIFIED" && { email_verified: "true" }),
      }
      const { data } = await api.get("/api/users", { params })
      const result   = data.data
      const userList: any[] = Array.isArray(result) ? result : (result?.users ?? result?.data ?? [])
      setUsers(userList)
      const totalCount = (!Array.isArray(result) && result?.total) ? result.total : userList.length
      setTotal(totalCount)
      setTotalPages((!Array.isArray(result) && result?.totalPages) ? result.totalPages : Math.ceil(totalCount / 10))
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [tab, search, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [tab, search])

  async function handleBanToggle() {
    if (!targetUser) return
    setActionLoading(true)
    try {
      const action = targetUser.is_banned ? "unban" : "ban"
      await api.post(`/api/users/${targetUser.id}/${action}`)
      await fetchUsers()
    } finally {
      setActionLoading(false)
      setConfirmOpen(false)
      setTargetUser(null)
    }
  }

  const columns: Column<UserRow>[] = [
    {
      header: "User",
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
      header: "Balance",
      render: (u) => <span className="font-semibold text-slate-700">৳ {parseFloat(u.balance).toFixed(2)}</span>,
    },
    {
      header: "Status",
      render: (u) => (
        <div className="flex flex-col gap-1">
          <Badge label={u.is_banned ? "Banned" : "Active"} />
          {u.email_verified && <Badge label="Verified" />}
        </div>
      ),
    },
    {
      header: "Action",
      render: (u) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/users/${u.id}`)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setTargetUser(u); setConfirmOpen(true) }}
            className={`p-1.5 rounded-lg transition-colors ${
              u.is_banned
                ? "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                : "hover:bg-red-50 text-slate-400 hover:text-red-600"
            }`}
            title={u.is_banned ? "Unban User" : "Ban User"}
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
        <h1 className="text-2xl font-extrabold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-1">Manage registered students — {total.toLocaleString()} total</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "VERIFIED" ? "Email Verified" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email…"
            className="max-w-sm flex-1"
          />
          <span className="text-sm text-slate-400 flex-shrink-0">{total} result{total !== 1 ? "s" : ""}</span>
        </div>

        <DataTable columns={columns} data={users} loading={loading} keyFn={(u) => u.id} emptyMessage="No users found." />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setTargetUser(null) }}
        onConfirm={handleBanToggle}
        loading={actionLoading}
        title={targetUser?.is_banned ? "Unban User?" : "Ban User?"}
        message={
          targetUser?.is_banned
            ? `Restore access for ${targetUser?.name}? They will be able to log in again.`
            : `Ban ${targetUser?.name}? They will lose access to the platform immediately.`
        }
        confirmLabel={targetUser?.is_banned ? "Yes, Unban" : "Yes, Ban"}
        danger={!targetUser?.is_banned}
      />
    </main>
  )
}
