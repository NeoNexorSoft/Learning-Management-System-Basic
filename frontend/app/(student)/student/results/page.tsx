"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { Result } from "@/types/index"
import { Trophy, Loader2 } from "lucide-react"

import PageHeader from "@/components/shared/PageHeader"
import api from "@/lib/axios"

const gradeColors: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  A:   "bg-emerald-100 text-emerald-700",
  "B+":"bg-blue-100 text-blue-700",
  B:   "bg-blue-100 text-blue-700",
  C:   "bg-amber-100 text-amber-700",
}

function ResultRow({ result }: { result: Result }) {
  const pct        = Math.round((result.marks / result.totalMarks) * 100)
  const gradeStyle = gradeColors[result.grade] ?? "bg-slate-100 text-slate-700"

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <p className="font-medium text-slate-800 text-sm">{result.assignment}</p>
        <p className="text-xs text-slate-400">{result.course}</p>
      </td>
      <td className="py-3.5 px-4 text-sm font-semibold text-slate-800 hidden sm:table-cell">
        {result.marks} / {result.totalMarks}
      </td>
      <td className="py-3.5 px-4 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[80px]">
            <div
              className={`h-1.5 rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-indigo-500" : "bg-amber-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 w-9 text-right">{pct}%</span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${gradeStyle}`}>{result.grade}</span>
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-500 hidden lg:table-cell">
        {new Date(result.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
    </tr>
  )
}

function StudentResultsPage() {
  const searchParams = useSearchParams()
  const search = (searchParams.get("search") ?? "").toLowerCase()

  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get("/api/assignments/my")
      .then(({ data }) => {
        const raw: any[] = data.data.assignments ?? data.data ?? []
        const graded = raw.filter((a: any) => a.submission?.grade !== null && a.submission?.grade !== undefined)
        const mapped: Result[] = graded.map((a: any) => {
          const marks      = a.submission.grade ?? 0
          const totalMarks = a.total_marks ?? 100
          const pct        = (marks / totalMarks) * 100
          const grade      = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : "C"
          return {
            id:         a.id,
            course:     a.lesson?.section?.course?.title ?? "Unknown Course",
            assignment: a.title,
            marks,
            totalMarks,
            grade,
            date:       a.submission.graded_at ?? new Date().toISOString(),
          }
        })
        setResults(mapped)
      })
      .catch(() => setError("Failed to load results."))
      .finally(() => setLoading(false))
  }, [])

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0

  const filtered = search
    ? results.filter((r) =>
        r.assignment.toLowerCase().includes(search) ||
        r.course.toLowerCase().includes(search)
      )
    : results

  if (loading) {
    return (
      <div className="flex flex-col flex-1">

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader
          title="Results"
          subtitle={
            error ?? (search
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchParams.get("search")}"`
              : `${results.length} graded assignment${results.length !== 1 ? "s" : ""} — avg score ${avgScore}%`
            )
          }
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              {search ? `No results match "${searchParams.get("search")}".` : "No graded results yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignment</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Marks</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Score</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Grade</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => <ResultRow key={r.id} result={r} />)}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <StudentResultsPage />
    </Suspense>
  )
}
