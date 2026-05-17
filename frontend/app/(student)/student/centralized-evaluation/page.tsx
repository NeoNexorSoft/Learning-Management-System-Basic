"use client";

// app/(student)/student/centralized-evaluation/page.tsx
// Academic only — no Sports / Co-Curricular / Discipline

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  getStudentsByClass,
  type Student,
  type Grade,
} from "@/lib/mock/centralizedEvaluation";

// ─── Mock: logged-in student is rank #2 of Class 9 ───────────────────────────
// In real app, read from auth context / API

const LOGGED_IN_CLASS = 9;
const LOGGED_IN_ROLL = 2; // pick student at rank 2

// ─── Constants ────────────────────────────────────────────────────────────────

const TERM_COLORS = ["#6366f1", "#22c55e", "#eab308"];

const GRADE_BADGE: Record<Grade, string> = {
  "A+": "bg-indigo-100 text-indigo-700",
  A: "bg-green-100 text-green-700",
  "A-": "bg-teal-100 text-teal-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-yellow-100 text-yellow-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className={`text-2xl font-extrabold ${highlight ?? "text-slate-900"}`}>
        {value}
      </p>
      <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentCentralizedEvaluationPage() {
  const students = useMemo(() => getStudentsByClass(LOGGED_IN_CLASS), []);

  // find the logged-in student (by rank position)
  const student: Student = students[LOGGED_IN_ROLL - 1] ?? students[0];

  // ── Derived ─────────────────────────────────────────────────────────────────

  // Best term (highest avg across all subjects for that term)
  const termAvgs = useMemo(() => {
    const t1 =
      Math.round(
        (student.subjects.reduce((s, m) => s + m.t1, 0) /
          student.subjects.length) *
          10,
      ) / 10;
    const t2 =
      Math.round(
        (student.subjects.reduce((s, m) => s + m.t2, 0) /
          student.subjects.length) *
          10,
      ) / 10;
    const t3 =
      Math.round(
        (student.subjects.reduce((s, m) => s + m.t3, 0) /
          student.subjects.length) *
          10,
      ) / 10;
    return { t1, t2, t3 };
  }, [student]);

  const bestTerm =
    termAvgs.t1 >= termAvgs.t2 && termAvgs.t1 >= termAvgs.t3
      ? { label: "Term 1", value: termAvgs.t1 }
      : termAvgs.t2 >= termAvgs.t3
        ? { label: "Term 2", value: termAvgs.t2 }
        : { label: "Term 3", value: termAvgs.t3 };

  const bestSubject = [...student.subjects].sort(
    (a, b) => b.average - a.average,
  )[0];

  // Data for grouped bar chart (term performance)
  const barData = useMemo(
    () =>
      student.subjects.map((m) => ({
        subject: m.subject.length > 7 ? m.subject.slice(0, 7) + "…" : m.subject,
        "Term 1": m.t1,
        "Term 2": m.t2,
        "Term 3": m.t3,
      })),
    [student],
  );

  // Data for line chart (term-wise trend per subject)
  const lineData = useMemo(
    () => [
      {
        term: "Term 1",
        ...Object.fromEntries(student.subjects.map((m) => [m.subject, m.t1])),
      },
      {
        term: "Term 2",
        ...Object.fromEntries(student.subjects.map((m) => [m.subject, m.t2])),
      },
      {
        term: "Term 3",
        ...Object.fromEntries(student.subjects.map((m) => [m.subject, m.t3])),
      },
    ],
    [student],
  );

  const SUBJECT_COLORS = [
    "#6366f1",
    "#22c55e",
    "#ef4444",
    "#eab308",
    "#14b8a6",
    "#f97316",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
  ];

  return (
    <main className="flex-1 p-6 space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            My Academic Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Class {LOGGED_IN_CLASS} — Full year performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">
              {student.name}
            </p>
            <p className="text-xs text-slate-500">Roll: {student.roll}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-100 text-indigo-700">
            {student.house} House
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Average"
          value={`${student.academicAvg}%`}
          sub={`Across all 3 terms, ${student.subjects.length} subjects`}
        />
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-start justify-center gap-1">
          <div className="w-10 h-10 rounded-full border-4 border-green-400 flex items-center justify-center">
            <span className="text-base font-extrabold text-green-600">
              {student.academicGrade}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            Overall grade
          </p>
          <p className="text-xs text-slate-400">Final academic grade</p>
        </div>
        <StatCard
          label="Best Term"
          value={`${bestTerm.value}%`}
          sub={bestTerm.label}
          highlight="text-indigo-600"
        />
        <StatCard
          label="Best Subject"
          value={bestSubject.average}
          sub={bestSubject.subject}
          highlight="text-emerald-600"
        />
      </div>

      {/* Grouped bar — term performance by subject */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Term Performance
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Score per subject across 3 terms
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} barSize={14} barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              iconType="square"
              iconSize={10}
            />
            {["Term 1", "Term 2", "Term 3"].map((t, i) => (
              <Bar
                key={t}
                dataKey={t}
                fill={TERM_COLORS[i]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subject-wise details table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Subject-wise Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Subject",
                  "T1 Total",
                  "T2 Total",
                  "T3 Total",
                  "Average",
                  "Grade",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((m, i) => (
                <tr
                  key={m.subject}
                  className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                    i % 2 === 1 ? "bg-slate-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-5 font-medium text-slate-800">
                    {m.subject}
                  </td>
                  <td className="py-3 px-5 text-slate-600">{m.t1}</td>
                  <td className="py-3 px-5 text-slate-600">{m.t2}</td>
                  <td className="py-3 px-5 text-slate-600">{m.t3}</td>
                  <td className="py-3 px-5 font-bold text-slate-900">
                    {m.average}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${GRADE_BADGE[m.grade]}`}
                    >
                      {m.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Term-wise trend line chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Term-wise Trend
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Score progression across 3 terms per subject
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="term" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconSize={10}
            />
            {student.subjects.map((m, i) => (
              <Line
                key={m.subject}
                type="monotone"
                dataKey={m.subject}
                stroke={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
