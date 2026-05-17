"use client"

// app/(teacher)/teacher/centralized-evaluation/page.tsx

import { useEffect, useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import {
  getStudentsByClass,
  classStats,
  gradeDistribution,
  housePerformance,
  subjectClassAverage,
  type Student,
  type EvalGrade,
  type Grade,
} from "@/lib/mock/centralizedEvaluation"

// ─── Constants ────────────────────────────────────────────────────────────────

const CLASSES = [7, 9, 10, 11, 12] as const
type ClassOption = (typeof CLASSES)[number]

const GRADE_COLORS: Record<string, string> = {
  "A+": "#6366f1",
  A: "#22c55e",
  "A-": "#14b8a6",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
}

const HOUSE_COLORS: Record<string, string> = {
  Alpha: "#6366f1",
  Beta: "#22c55e",
  Charlie: "#eab308",
}

const EVAL_BADGE: Record<EvalGrade, string> = {
  Alpha: "bg-indigo-100 text-indigo-700",
  Beta: "bg-green-100 text-green-700",
  Charlie: "bg-yellow-100 text-yellow-700",
  Delta: "bg-orange-100 text-orange-700",
  Echo: "bg-red-100 text-red-700",
}

const GRADE_BADGE: Record<Grade, string> = {
  "A+": "bg-indigo-100 text-indigo-700",
  A: "bg-green-100 text-green-700",
  "A-": "bg-teal-100 text-teal-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-yellow-100 text-yellow-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className={`text-2xl font-extrabold ${color ?? "text-slate-900"}`}>
        {value}
      </p>
      <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function HouseDot({ house }: { house: string }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle"
      style={{ background: HOUSE_COLORS[house] ?? "#94a3b8" }}
    />
  )
}

function LoadingState() {
  return (
    <main className="flex-1 p-6 space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Student Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Loading centralized evaluation data...
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="h-7 w-20 bg-slate-100 rounded mb-2" />
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeacherCentralizedEvaluationPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassOption>(7)

  useEffect(() => {
    setMounted(true)
  }, [])

  const students = useMemo(
    () => getStudentsByClass(selectedClass),
    [selectedClass]
  )

  const stats = useMemo(() => classStats(students), [students])
  const gradeDist = useMemo(() => gradeDistribution(students), [students])
  const housPerf = useMemo(() => housePerformance(students), [students])
  const subjAvg = useMemo(() => subjectClassAverage(students), [students])

  if (!mounted) {
    return <LoadingState />
  }

  return (
    <main className="flex-1 p-6 space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Student Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Class {selectedClass} — All students performance
          </p>
        </div>

        {/* Class tabs */}
        <div className="flex gap-2 flex-wrap">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                selectedClass === cls
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Class Average"
          value={`${stats.avg}%`}
          sub="Overall class mean"
        />
        <StatCard
          label="Highest Score"
          value={`${stats.highest}%`}
          sub={stats.highestStudent?.name}
          color="text-emerald-600"
        />
        <StatCard
          label="Lowest Score"
          value={`${stats.lowest}%`}
          sub={stats.lowestStudent?.name}
          color="text-red-500"
        />
        <StatCard
          label="Pass Rate"
          value={`${stats.passRate}%`}
          sub={`${Math.round((students.length * stats.passRate) / 100)} of ${
            students.length
          } students above 50%`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade distribution histogram */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Class Performance Distribution
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Grade breakdown for Class {selectedClass}
          </p>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeDist} barSize={40}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="grade"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                formatter={(v: number) => [v, "Students"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                {gradeDist.map((entry, i) => (
                  <Cell
                    key={`${entry.grade}-${i}`}
                    fill={GRADE_COLORS[entry.grade] ?? "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* House performance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            House Performance Comparison
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Term-wise average per house
          </p>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={housPerf} barSize={22}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="term"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              {["Alpha", "Beta", "Charlie"].map((h) => (
                <Bar
                  key={h}
                  dataKey={h}
                  fill={HOUSE_COLORS[h]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-3">
            {["Alpha", "Beta", "Charlie"].map((h) => (
              <div
                key={h}
                className="flex items-center gap-1.5 text-xs text-slate-500"
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: HOUSE_COLORS[h] }}
                />
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject-wise class average */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Subject-wise Class Average
        </h2>

        <div className="space-y-3">
          {subjAvg.map(({ subject, average }) => (
            <div key={subject} className="flex items-center gap-4">
              <span className="text-sm text-slate-600 w-28 shrink-0">
                {subject}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${average}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700 w-10 text-right">
                {average}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All students ranking table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            All Students at a Glance
          </h2>
          <p className="text-sm text-slate-500">
            Class {selectedClass} — ranked by academic average
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Rank",
                  "Name",
                  "House",
                  "T1%",
                  "T2%",
                  "T3%",
                  "Overall%",
                  "Grade",
                  "Eval",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((s: Student) => {
                const t1Avg =
                  Math.round(
                    (s.subjects.reduce((sum, sub) => sum + sub.t1, 0) /
                      s.subjects.length) *
                      10
                  ) / 10

                const t2Avg =
                  Math.round(
                    (s.subjects.reduce((sum, sub) => sum + sub.t2, 0) /
                      s.subjects.length) *
                      10
                  ) / 10

                const t3Avg =
                  Math.round(
                    (s.subjects.reduce((sum, sub) => sum + sub.t3, 0) /
                      s.subjects.length) *
                      10
                  ) / 10

                return (
                  <tr
                    key={s.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      #{s.rank}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {s.name}
                    </td>

                    <td className="py-3 px-4">
                      <HouseDot house={s.house} />
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                        style={{
                          background: `${HOUSE_COLORS[s.house] ?? "#94a3b8"}20`,
                          color: HOUSE_COLORS[s.house] ?? "#94a3b8",
                        }}
                      >
                        {s.house}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{t1Avg}%</td>
                    <td className="py-3 px-4 text-slate-600">{t2Avg}%</td>
                    <td className="py-3 px-4 text-slate-600">{t3Avg}%</td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {s.academicAvg}%
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          GRADE_BADGE[s.academicGrade]
                        }`}
                      >
                        {s.academicGrade}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          EVAL_BADGE[s.overallGrade]
                        }`}
                      >
                        {s.overallGrade}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}