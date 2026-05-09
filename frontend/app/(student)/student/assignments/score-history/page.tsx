"use client"

import { useEffect, useState , Suspense } from "react"
import {
  Loader2,
  Award,
  TrendingUp,
  BarChart2,
  ClipboardList,
  MessageSquareText,
  AlertCircle,
} from "lucide-react"
import PageHeader from "@/components/shared/PageHeader"
import StatCard   from "@/components/shared/StatCard"
import api from "@/lib/axios"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreEntry {
  id: string
  grade: string | number
  feedback: string | null
  status: string
  submitted_at: string
  assignment: {
    id: string
    title: string
    total_marks: number
    course: { id: string; title: string } | null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ScoreHistoryPage() {
  const [scores,  setScores]  = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    api
      .get("/api/assignments/score-history")
      .then(({ data }) => setScores(data.data?.scores ?? []))
      .catch(() => setError("Failed to load score history."))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────

  const total = scores.length

  const avgPercent =
    total > 0
      ? Math.round(
          scores.reduce(
            (sum, s) =>
              sum + (Number(s.grade) / s.assignment.total_marks) * 100,
            0,
          ) / total,
        )
      : 0

  const highestPercent =
    total > 0
      ? Math.round(
          Math.max(
            ...scores.map(
              s => (Number(s.grade) / s.assignment.total_marks) * 100,
            ),
          ),
        )
      : 0

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader
          title="Score History"
          subtitle={
            error ||
            (total > 0
              ? `${total} graded assignment${total !== 1 ? "s" : ""} — ${avgPercent}% average`
              : "No graded assignments yet")
          }
        />

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={ClipboardList}
            label="Total Graded"
            value={total}
            sub="assignments with scores"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={BarChart2}
            label="Average Score"
            value={total > 0 ? `${avgPercent}%` : "—"}
            sub="across all assignments"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Award}
            label="Highest Score"
            value={total > 0 ? `${highestPercent}%` : "—"}
            sub="best single result"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {total === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold text-base">
              No graded assignments yet
            </p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
              Your scores will appear here once a teacher grades your
              submissions and releases the results.
            </p>
          </div>
        ) : (
          /* ── Table ─────────────────────────────────────────────────────── */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Assignment
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Grade
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Feedback
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map(s => {
                    const gradeNum   = Number(s.grade)
                    const percent    = Math.round((gradeNum / s.assignment.total_marks) * 100)
                    const gradeColor =
                      percent >= 75
                        ? "text-emerald-700"
                        : percent >= 50
                        ? "text-amber-700"
                        : "text-red-700"

                    return (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors align-top"
                      >
                        {/* Assignment */}
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-800 text-sm">
                            {s.assignment.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 sm:hidden">
                            {s.assignment.course?.title ?? "Unknown Course"}
                          </p>
                        </td>

                        {/* Course */}
                        <td className="py-4 px-4 text-sm text-slate-500 hidden sm:table-cell">
                          {s.assignment.course?.title ?? (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Grade */}
                        <td className="py-4 px-4">
                          <span
                            className={`text-sm font-bold ${gradeColor}`}
                          >
                            {gradeNum}/{s.assignment.total_marks}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">
                            ({percent}%)
                          </span>
                        </td>

                        {/* Feedback */}
                        <td className="py-4 px-4 text-sm text-slate-500 hidden md:table-cell max-w-[280px]">
                          {s.feedback ? (
                            <div className="flex items-start gap-2">
                              <MessageSquareText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <p className="leading-relaxed line-clamp-2">
                                {s.feedback}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              No feedback
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-sm text-slate-500 hidden lg:table-cell whitespace-nowrap">
                          {formatDate(s.submitted_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <ScoreHistoryPage />
    </Suspense>
  )
}
