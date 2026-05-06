"use client"

import { useEffect, useState , Suspense } from "react"

import PageHeader from "@/components/shared/PageHeader"
import { CreditCard, Loader2 } from "lucide-react"
import api from "@/lib/axios"

interface EnrollmentRow {
  id: string
  date: string
  courseName: string
  amount: number
  status: string
}

const statusStyles: Record<string, string> = {
  ACTIVE:     "bg-emerald-100 text-emerald-700",
  COMPLETED:  "bg-blue-100 text-blue-700",
  CANCELLED:  "bg-red-100 text-red-700",
}

function DepositHistoryPage() {
  const [rows, setRows]       = useState<EnrollmentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/enrollments/my")
      .then(({ data }) => {
        const enrollments: any[] = data.data?.enrollments ?? data.data ?? []
        const mapped: EnrollmentRow[] = enrollments.map((e: any) => ({
          id:         e.id,
          date:       new Date(e.enrolled_at ?? e.enrolledAt ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          courseName: e.course?.title ?? "Course",
          amount:     Number(e.course?.price ?? 0),
          status:     (e.status ?? "ACTIVE").toUpperCase(),
        }))
        setRows(mapped)
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const totalSpent = rows.reduce((sum, r) => sum + r.amount, 0)

  function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">


      <main className="flex-1 p-6 space-y-6">
        <PageHeader
          title="Purchase History"
          subtitle="All your course enrollments and payments"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SummaryCard label="Total Spent"  value={`TK${totalSpent.toLocaleString()}`} sub="all time" />
          <SummaryCard label="Enrollments" value={`${rows.length}`}                   sub="total" />
          <SummaryCard label="Active"      value={`${rows.filter(r => r.status === "ACTIVE").length}`} sub="in progress" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900">Enrollment Records</h2>
          </div>

          {rows.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No enrollments yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Course</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">{r.date}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{r.courseName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {r.amount === 0 ? "Free" : `TK${r.amount.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                        </span>
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

export default function Page() {
  return (
    <Suspense>
      <DepositHistoryPage />
    </Suspense>
  )
}
