"use client";

import {
  students,
  getSubjectTotal,
  getTermPercentage,
  getOverallAverage,
  getGrade,
  SubjectKey,
  Student,
} from "@/lib/evaluationData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const SUBJECT_KEYS: SubjectKey[] = [
  "bangla",
  "english",
  "mathematics",
  "science",
  "bgs",
  "ict",
  "religion",
];

const SUBJECT_LABELS: Record<SubjectKey, string> = {
  bangla: "Bangla",
  english: "English",
  mathematics: "Math",
  science: "Science",
  bgs: "BGS",
  ict: "ICT",
  religion: "Religion",
};

const GRADE_ORDER = ["A+", "A", "A-", "B", "C", "D", "F"] as const;

function getGradeBadgeClass(grade: string): string {
  switch (grade) {
    case "A+": return "bg-emerald-100 text-emerald-700";
    case "A":  return "bg-green-100 text-green-700";
    case "A-": return "bg-blue-100 text-blue-700";
    case "B":  return "bg-yellow-100 text-yellow-700";
    case "C":  return "bg-orange-100 text-orange-700";
    case "D":  return "bg-red-100 text-red-700";
    case "F":  return "bg-red-200 text-red-800";
    default:   return "bg-slate-100 text-slate-700";
  }
}

function getHouseBadgeClass(house: string): string {
  switch (house) {
    case "Alpha":   return "bg-indigo-100 text-indigo-700";
    case "Beta":    return "bg-emerald-100 text-emerald-700";
    case "Charlie": return "bg-amber-100 text-amber-700";
    default:        return "bg-slate-100 text-slate-700";
  }
}

type StudentRow = {
  student: Student;
  t1Pct: number;
  t2Pct: number;
  t3Pct: number;
  overall: number;
  grade: string;
};

type HouseTermPoint = {
  term: string;
  Alpha: number;
  Beta: number;
  Charlie: number;
};

type SubjectAvgPoint = {
  subject: string;
  avg: number;
};

function houseTermAvg(
  rows: StudentRow[],
  house: "Alpha" | "Beta" | "Charlie",
  termKey: "t1Pct" | "t2Pct" | "t3Pct"
): number {
  const filtered = rows.filter((r) => r.student.house === house);
  if (filtered.length === 0) return 0;
  const sum = filtered.reduce((acc, r) => acc + r[termKey], 0);
  return Math.round((sum / filtered.length) * 10) / 10;
}

export default function AdminOverviewClient() {
  // API-READY: replace with evaluationService.getStudents()
  const studentData: StudentRow[] = students.map((s) => {
    const overall = getOverallAverage(s);
    return {
      student: s,
      t1Pct: getTermPercentage(s.marks.term1),
      t2Pct: getTermPercentage(s.marks.term2),
      t3Pct: getTermPercentage(s.marks.term3),
      overall,
      grade: getGrade(overall),
    };
  });

  const sorted = [...studentData].sort((a, b) => b.overall - a.overall);

  // ── Class-level stats ──────────────────────────────────────────────────────
  const classAvg =
    Math.round(
      (studentData.reduce((sum, s) => sum + s.overall, 0) / studentData.length) * 10
    ) / 10;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const passCount = studentData.filter((s) => s.overall >= 50).length;
  const passRate = Math.round((passCount / studentData.length) * 100 * 10) / 10;

  // ── Grade distribution ─────────────────────────────────────────────────────
  const gradeDistribution = GRADE_ORDER.map((g) => ({
    grade: g,
    count: studentData.filter((s) => s.grade === g).length,
  }));

  // ── House × Term averages ──────────────────────────────────────────────────
  const houseTermData: HouseTermPoint[] = [
    {
      term: "Term 1",
      Alpha:   houseTermAvg(studentData, "Alpha",   "t1Pct"),
      Beta:    houseTermAvg(studentData, "Beta",    "t1Pct"),
      Charlie: houseTermAvg(studentData, "Charlie", "t1Pct"),
    },
    {
      term: "Term 2",
      Alpha:   houseTermAvg(studentData, "Alpha",   "t2Pct"),
      Beta:    houseTermAvg(studentData, "Beta",    "t2Pct"),
      Charlie: houseTermAvg(studentData, "Charlie", "t2Pct"),
    },
    {
      term: "Term 3",
      Alpha:   houseTermAvg(studentData, "Alpha",   "t3Pct"),
      Beta:    houseTermAvg(studentData, "Beta",    "t3Pct"),
      Charlie: houseTermAvg(studentData, "Charlie", "t3Pct"),
    },
  ];

  // ── Subject class averages ─────────────────────────────────────────────────
  const subjectClassAvg: SubjectAvgPoint[] = SUBJECT_KEYS.map((key) => {
    const total = students.reduce((sum, s) => {
      const subAvg =
        (getSubjectTotal(s.marks.term1[key]) +
          getSubjectTotal(s.marks.term2[key]) +
          getSubjectTotal(s.marks.term3[key])) /
        3;
      return sum + subAvg;
    }, 0);
    return {
      subject: SUBJECT_LABELS[key],
      avg: Math.round((total / students.length) * 10) / 10,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* SECTION 1 — Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Class 8 — All Students Performance</p>
      </div>

      {/* SECTION 2 — Class Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Class Average
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{classAvg}%</p>
          <p className="text-xs text-slate-400 mt-1">Overall class mean</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Highest Score
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{highest.overall}%</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{highest.student.name}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Lowest Score
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{lowest.overall}%</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{lowest.student.name}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Pass Rate
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{passRate}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {passCount} of {studentData.length} students above 50%
          </p>
        </div>
      </div>

      {/* SECTION 3 — Class Performance Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Class Performance Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={gradeDistribution}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="grade" tick={{ fontSize: 13, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={4} name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 4 — House Performance Comparison */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          House Performance Comparison
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={houseTermData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="term" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Alpha"   fill="#6366f1" radius={4} />
            <Bar dataKey="Beta"    fill="#10b981" radius={4} />
            <Bar dataKey="Charlie" fill="#f59e0b" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 5 — Subject-wise Class Average (horizontal) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Subject-wise Class Average
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={subjectClassAvg}
            layout="vertical"
            margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              dataKey="subject"
              type="category"
              tick={{ fontSize: 12, fill: "#64748b" }}
              width={72}
            />
            <Tooltip />
            <Bar dataKey="avg" fill="#6366f1" radius={4} name="Class Average">
              <LabelList
                dataKey="avg"
                position="right"
                style={{ fontSize: 12, fill: "#64748b" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 6 — All Students Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          All Students at a Glance
        </h2>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-200">
                {["Rank", "Name", "House", "T1%", "T2%", "T3%", "Overall%", "Grade"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                        h === "Name" || h === "House" || h === "Rank"
                          ? "text-left"
                          : "text-center"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr
                  key={s.student.id}
                  className={`border-b border-slate-100 last:border-0 ${
                    i % 2 === 1 ? "bg-slate-50" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-500 text-sm">
                    #{i + 1}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {s.student.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getHouseBadgeClass(
                        s.student.house
                      )}`}
                    >
                      {s.student.house}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{s.t1Pct}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{s.t2Pct}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{s.t3Pct}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                    {s.overall}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadgeClass(
                        s.grade
                      )}`}
                    >
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
