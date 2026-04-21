"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"
import api from "@/lib/axios"
import type { WithdrawalRow } from "@/types/admin"
import DataTable, { Column } from "@/components/admin/DataTable"
import Pagination from "@/components/admin/Pagination"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import Badge from "@/components/admin/Badge"

type StatusTab = "ALL" | "PENDING" | "APPROVED" | "REJECTED"
const TABS: StatusTab[] = ["ALL", "PENDING", "APPROVED", "REJECTED"]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

type DialogAction = "approve" | "reject" | null

export default function AdminWithdrawalsPage() {
  const searchParams = useSearchParams()

  const [tab,          setTab]          = useState<StatusTab>((searchParams.get("tab") as StatusTab) ?? "ALL")
  const [page,         setPage]         = useState(1)
  const [withdrawals,  setWithdrawals]  = useState<WithdrawalRow[]>([])
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [loading,      setLoading]      = useState(true)

  const [dialog,        setDialog]        = useState<DialogAction>(null)
  const [targetW,       setTargetW]       = useState<WithdrawalRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 10 }
      if (tab !== "ALL") params.status = tab
      const { data } = await api.get("/api/admin/withdrawals", { params })
      setWithdrawals(data.data?.data ?? [])
      setTotal(data.data?.total ?? 0)
      setTotalPages(data.data?.totalPages ?? 1)
    } catch {
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => { fetchWithdrawals() }, [fetchWithdrawals])
  useEffect(() => { setPage(1) }, [tab])

  async function handleAction() {
    if (!targetW || !dialog) return
    setActionLoading(true)
    try {
      await api.put(`/api/admin/withdrawals/${targetW.id}/${dialog}`)
      await fetchWithdrawals()
    } finally {
      setActionLoading(false)
      setDialog(null)
      setTargetW(null)
    }
  }

  const columns: Column<WithdrawalRow>[] = [
    {
      header: "Teacher",
      render: (w) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{w.teacher.name}</p>
          <p className="text-xs text-slate-400">{w.teacher.email}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (w) => <span className="font-bold text-slate-800">৳ {parseFloat(w.amount).toFixed(2)}</span>,
    },
    { header: "Method",     render: (w) => <span className="capitalize text-slate-600 text-sm">{w.method}</span> },
    { header: "Status",     render: (w) => <Badge label={w.status} /> },
    { header: "Requested",  render: (w) => <span className="text-slate-500 text-xs">{formatDate(w.requested_at)}</span> },
    {
      header: "Action",
      render: (w) => (
        w.status === "PENDING" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setTargetW(w); setDialog("approve") }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => { setTargetW(w); setDialog("reject") }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      ),
    },
  ]

  const dialogConfig = {
    approve: { title: "Approve Withdrawal?", message: `Approve ৳${parseFloat(targetW?.amount ?? "0").toFixed(2)} withdrawal for ${targetW?.teacher.name}?`, label: "Yes, Approve", danger: false },
    reject:  { title: "Reject Withdrawal?",  message: `Reject the withdrawal request from ${targetW?.teacher.name}? The amount will be refunded to their balance.`, label: "Yes, Reject", danger: true },
  }

  const dc = dialog ? dialogConfig[dialog] : null

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Withdrawals</h1>
        <p className="text-sm text-slate-500 mt-1">Review and process teacher withdrawal requests — {total.toLocaleString()} total</p>
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
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-end">
          <span className="text-sm text-slate-400">{total} result{total !== 1 ? "s" : ""}</span>
        </div>

        <DataTable columns={columns} data={withdrawals} loading={loading} keyFn={(w) => w.id} emptyMessage="No withdrawal requests found." />

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
          onClose={() => { setDialog(null); setTargetW(null) }}
          onConfirm={handleAction}
          loading={actionLoading}
          title={dc.title}
          message={dc.message}
          confirmLabel={dc.label}
          danger={dc.danger}
        />
      )}
    </main>
  )
}
