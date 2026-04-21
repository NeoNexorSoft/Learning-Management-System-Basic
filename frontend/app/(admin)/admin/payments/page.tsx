"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import api from "@/lib/axios"
import type { PaymentRow } from "@/types/admin"
import DataTable, { Column } from "@/components/admin/DataTable"
import Pagination from "@/components/admin/Pagination"
import SearchInput from "@/components/admin/SearchInput"
import Badge from "@/components/admin/Badge"

type StatusTab = "ALL" | "PENDING" | "COMPLETED" | "FAILED"
const TABS: StatusTab[] = ["ALL", "PENDING", "COMPLETED", "FAILED"]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function AdminPaymentsPage() {
  const searchParams = useSearchParams()

  const [tab,        setTab]        = useState<StatusTab>((searchParams.get("tab") as StatusTab) ?? "ALL")
  const [search,     setSearch]     = useState("")
  const [dateFrom,   setDateFrom]   = useState("")
  const [dateTo,     setDateTo]     = useState("")
  const [page,       setPage]       = useState(1)
  const [payments,   setPayments]   = useState<PaymentRow[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 10 }
      if (search)         params.search   = search
      if (tab !== "ALL")  params.status   = tab
      if (dateFrom)       params.date_from = dateFrom
      if (dateTo)         params.date_to   = dateTo
      const { data } = await api.get("/api/admin/payments", { params })
      setPayments(data.data?.data ?? [])
      setTotal(data.data?.total ?? 0)
      setTotalPages(data.data?.totalPages ?? 1)
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [tab, search, dateFrom, dateTo, page])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { setPage(1) }, [tab, search, dateFrom, dateTo])

  const columns: Column<PaymentRow>[] = [
    { header: "Gateway", render: (p) => <span className="font-semibold text-slate-700 capitalize">{p.gateway}</span> },
    {
      header: "TRX ID",
      render: (p) => <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{p.trx_id}</span>,
    },
    {
      header: "User",
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{p.user.name}</p>
          <p className="text-xs text-slate-400">{p.user.email}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (p) => <span className="font-bold text-slate-800">৳ {parseFloat(p.amount).toFixed(2)}</span>,
    },
    { header: "Status", render: (p) => <Badge label={p.status} /> },
    { header: "Date",   render: (p) => <span className="text-slate-500 text-xs">{formatDate(p.initiated_at)}</span> },
  ]

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500 mt-1">Track all platform payment transactions — {total.toLocaleString()} total</p>
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
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by username or TRX ID…"
            className="max-w-xs flex-1"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 flex-shrink-0">From</label>
            <input
              type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 flex-shrink-0">To</label>
            <input
              type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo("") }}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear dates
            </button>
          )}
          <span className="text-sm text-slate-400 ml-auto">{total} result{total !== 1 ? "s" : ""}</span>
        </div>

        <DataTable columns={columns} data={payments} loading={loading} keyFn={(p) => p.id} emptyMessage="No payments found." />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </main>
  )
}
