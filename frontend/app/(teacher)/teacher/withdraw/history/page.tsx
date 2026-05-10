"use client"

import { useEffect, useState, Suspense } from "react"
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

const statusConfig: Record<string, { label: string; bg: string; text: string; Icon: any }> = {
    APPROVED: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", Icon: CheckCircle2 },
    PENDING:  { label: "Pending",  bg: "bg-amber-100",   text: "text-amber-700",   Icon: Clock },
    REJECTED: { label: "Rejected", bg: "bg-red-100",     text: "text-red-700",     Icon: AlertCircle },
}

function WithdrawRow({ req }: { req: any }) {
    const status = (req.status ?? "PENDING").toUpperCase()
    const cfg    = statusConfig[status] ?? statusConfig.PENDING
    const StatusIcon = cfg.Icon
    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4 text-sm font-bold text-slate-900">TK{Number(req.amount ?? 0).toLocaleString()} BDT</td>
            <td className="py-3.5 px-4 text-sm text-slate-600 hidden sm:table-cell">{req.method ?? "—"}</td>
            <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <StatusIcon className="w-3 h-3" />
            {cfg.label}
        </span>
            </td>
            <td className="py-3.5 px-4 text-sm text-slate-500 hidden md:table-cell">
                {new Date(req.requested_at ?? req.requestedAt ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </td>
            <td className="py-3.5 px-4 text-sm text-slate-500 hidden lg:table-cell">
                {req.processed_at ?? req.processedAt
                    ? new Date(req.processed_at ?? req.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
            </td>
        </tr>
    )
}

function WithdrawHistoryPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading]   = useState(true)

    useEffect(() => {
        api.get("/api/withdrawals/my")
            .then(({ data }) => setRequests(data.data?.data ?? []))
            .catch(() => setRequests([]))
            .finally(() => setLoading(false))
    }, [])

    const totalWithdrawn = requests
        .filter((r) => (r.status ?? "").toUpperCase() === "APPROVED")
        .reduce((s, r) => s + Number(r.amount ?? 0), 0)

    if (loading) {
        return (
            <div className="flex flex-col flex-1">
                <TopBar placeholder="Search withdrawals…" />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1">
            <TopBar placeholder="Search withdrawals…" />
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-slate-900">Withdraw History</h1>
                    <p className="text-slate-500 mt-1">
                        {requests.length} request{requests.length !== 1 ? "s" : ""} — TK{totalWithdrawn.toLocaleString()} BDT total withdrawn
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Method</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Requested</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Processed</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm">No withdrawal requests yet.</td></tr>
                        ) : (
                            requests.map((r, i) => <WithdrawRow key={`${r.id}-${i}`} req={r} />)
                        )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense>
            <WithdrawHistoryPage />
        </Suspense>
    )
}
