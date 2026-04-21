"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, TrendingUp, CreditCard } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import PageHeader from "@/components/shared/PageHeader"
import api from "@/lib/axios"

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100  text-amber-700",
  FAILED:    "bg-red-100    text-red-700",
  INITIATED: "bg-slate-100  text-slate-600",
  REJECTED:  "bg-red-100    text-red-700",
}

export default function TransactionsPage() {
  const [stats, setStats]             = useState<any>(null)
  const [transactions, setTxns]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/api/users/teacher/stats"),
      api.get("/api/teacher/transactions"),
    ])
      .then(([statsRes, txnRes]) => {
        setStats(statsRes.data.data)
        setTxns(txnRes.data.data?.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search transactions…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search transactions…" />
      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader title="Transactions" subtitle="Earnings history from course purchases" />

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Total Earnings",      value: stats?.totalEarnings      ?? 0, color: "text-emerald-600" },
            { label: "This Month Earnings", value: stats?.thisMonthEarnings  ?? 0, color: "text-indigo-600"  },
            { label: "Pending Withdrawals", value: stats?.pendingWithdrawals ?? 0, color: "text-amber-600"   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-2xl font-extrabold ${color}`}>TK{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No transactions yet.</p>
              <p className="text-slate-400 text-xs mt-1">Course purchase revenue will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">TXN ID</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Student</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Course</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.trx_id?.slice(0, 14)}…</td>
                      <td className="px-6 py-4 text-slate-800 hidden sm:table-cell">{t.user?.name ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-700 hidden md:table-cell max-w-[180px] truncate">{t.course?.title ?? "—"}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">TK{Number(t.amount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs hidden lg:table-cell whitespace-nowrap">
                        {t.completed_at ? new Date(t.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
