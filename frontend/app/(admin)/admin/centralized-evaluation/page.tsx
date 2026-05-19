"use client"

// app/(admin)/admin/centralized-evaluation/page.tsx

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import {
  Users, TrendingUp, Award, AlertTriangle,
} from "lucide-react"
import {
  getStudentsByClass,
  classStats,
  gradeDistribution,
  classCompositeScores,
  evalGradeDistributionAll,
  allStudents,
  type EvalGrade,
} from "@/lib/mock/centralizedEvaluation"

// ─── Constants ────────────────────────────────────────────────────────────────

const CLASSES = [0, 7, 9, 10, 11, 12] as const
type ClassOption = (typeof CLASSES)[number]

const EVAL_COLORS: Record<EvalGrade, string> = {
  Alpha:   "#6366f1",
  Beta:    "#22c55e",
  Charlie: "#eab308",
  Delta:   "#f97316",
  Echo:    "#ef4444",
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#6366f1",
  A:    "#22c55e",
  "A-": "#14b8a6",
  B:    "#3b82f6",
  C:    "#eab308",
  D:    "#f97316",
  F:    "#ef4444",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-sm text-slate-500">{sub}</p>}
    </div>
  )
}

function EvalBadge({ grade }: { grade: EvalGrade }) {
  const colors: Record<EvalGrade, string> = {
    Alpha:   "bg-indigo-100 text-indigo-700",
    Beta:    "bg-green-100 text-green-700",
    Charlie: "bg-yellow-100 text-yellow-700",
    Delta:   "bg-orange-100 text-orange-700",
    Echo:    "bg-red-100 text-red-700",
  }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${colors[grade]}`}>
      {grade}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCentralizedEvaluationPage() {
  const [selectedClass, setSelectedClass] = useState<ClassOption>(0)

  const students = useMemo(
    () => (selectedClass === 0 ? allStudents : getStudentsByClass(selectedClass)),
    [selectedClass],
  )

  const stats        = useMemo(() => classStats(students), [students])
  const gradeDist    = useMemo(() => gradeDistribution(students), [students])
  const compositeScores = useMemo(() => classCompositeScores(), [])
  const evalDist     = useMemo(() => evalGradeDistributionAll(), [])

  const alphaCount = students.filter((s) => s.overallGrade === "Alpha").length
  const echoCount  = students.filter((s) => s.overallGrade === "Echo").length

  return (
    <main className="flex-1 p-6 space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Centralized Evaluation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Academic year 2025–26 · {students.length} students
          </p>
        </div>

        {/* Class filter */}
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
              {cls === 0 ? "All Classes" : `Class ${cls}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Students"     value={students.length}       sub={selectedClass === 0 ? "5 classes" : `Class ${selectedClass}`} color="bg-indigo-500" />
        <StatCard icon={TrendingUp}    label="Class Average"      value={`${stats.avg}%`}       sub="Academic score"   color="bg-emerald-500" />
        <StatCard icon={Award}         label="Alpha Grade"        value={alphaCount}             sub="Top performers"   color="bg-violet-500" />
        <StatCard icon={AlertTriangle} label="Echo Grade"         value={echoCount}              sub="Needs intervention" color="bg-red-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Class-wise composite score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <SectionTitle title="Class-wise Academic Score" sub="Average academic score per class" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compositeScores} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="class" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Avg Score"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {compositeScores.map((entry, i) => (
                  <Cell key={i} fill={EVAL_COLORS[entry.grade as EvalGrade]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <SectionTitle
            title="Grade Distribution"
            sub={selectedClass === 0 ? "All classes combined" : `Class ${selectedClass}`}
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeDist} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                formatter={(v: number) => [v, "Students"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
              />
              <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                {gradeDist.map((entry, i) => (
                  <Cell key={i} fill={GRADE_COLORS[entry.grade] ?? "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Eval grade distribution (all) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <SectionTitle title="Overall Evaluation Grade Distribution" sub="All classes — Alpha through Echo" />
        <div className="flex gap-4 flex-wrap">
          {evalDist.map(({ grade, count }) => (
            <div
              key={grade}
              className="flex-1 min-w-[100px] rounded-2xl p-4 text-center"
              style={{ background: EVAL_COLORS[grade as EvalGrade] + "18" }}
            >
              <p className="text-2xl font-extrabold" style={{ color: EVAL_COLORS[grade as EvalGrade] }}>
                {count}
              </p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{grade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inter-class comparison table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SectionTitle title="Inter-Class Comparison" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Class", "Students", "Avg Score", "Highest", "Lowest", "Pass Rate", "Grade"].map((h) => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([7, 9, 10, 11, 12] as const).map((cls) => {
              const s = getStudentsByClass(cls)
              const cs = classStats(s)
              return (
                <tr key={cls} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">Class {cls}</td>
                  <td className="py-3 px-4 text-slate-600">{s.length}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{cs.avg}%</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{cs.highest}%</td>
                  <td className="py-3 px-4 text-red-500 font-semibold">{cs.lowest}%</td>
                  <td className="py-3 px-4 text-slate-600">{cs.passRate}%</td>
                  <td className="py-3 px-4">
                    <EvalBadge grade={s[0]?.overallGrade ?? "Charlie"} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
