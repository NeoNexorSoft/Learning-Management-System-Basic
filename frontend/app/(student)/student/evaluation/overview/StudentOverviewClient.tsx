"use client";

import {
  getStudentById,
  getSubjectTotal,
  getTermPercentage,
  getOverallAverage,
  getGrade,
  SubjectKey,
} from "@/lib/evaluationData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// MOCK: hardcoded for demo — replace with useAuth() user.id when connecting to real API
const MOCK_STUDENT_ID = 1;

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

const SUBJECT_COLORS: string[] = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

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

type SubjectRow = {
  key: SubjectKey;
  label: string;
  t1: number;
  t2: number;
  t3: number;
  avg: number;
};

type BarPoint = {
  subject: string;
  "Term 1": number;
  "Term 2": number;
  "Term 3": number;
};

export default function StudentOverviewClient() {
  // API-READY: replace with evaluationService.getStudentById(id)
  const student = getStudentById(MOCK_STUDENT_ID);

  const t1Pct = getTermPercentage(student.marks.term1);
  const t2Pct = getTermPercentage(student.marks.term2);
  const t3Pct = getTermPercentage(student.marks.term3);
  const overallAvg = getOverallAverage(student);
  const grade = getGrade(overallAvg);

  const terms = [
    { label: "Term 1", pct: t1Pct },
    { label: "Term 2", pct: t2Pct },
    { label: "Term 3", pct: t3Pct },
  ];
  const bestTerm = terms.reduce((best, curr) =>
    curr.pct > best.pct ? curr : best
  );

  const subjectRows: SubjectRow[] = SUBJECT_KEYS.map((key) => {
    const t1 = Math.round(getSubjectTotal(student.marks.term1[key]) * 10) / 10;
    const t2 = Math.round(getSubjectTotal(student.marks.term2[key]) * 10) / 10;
    const t3 = Math.round(getSubjectTotal(student.marks.term3[key]) * 10) / 10;
    return { key, label: SUBJECT_LABELS[key], t1, t2, t3, avg: Math.round(((t1 + t2 + t3) / 3) * 10) / 10 };
  });

  const bestSubject = subjectRows.reduce((best, curr) =>
    curr.avg > best.avg ? curr : best
  );

  const barChartData: BarPoint[] = SUBJECT_KEYS.map((key) => ({
    subject: SUBJECT_LABELS[key],
    "Term 1": Math.round(getSubjectTotal(student.marks.term1[key])),
    "Term 2": Math.round(getSubjectTotal(student.marks.term2[key])),
    "Term 3": Math.round(getSubjectTotal(student.marks.term3[key])),
  }));

  const lineChartData = [
    {
      name: "Term 1",
      Bangla:   Math.round(getSubjectTotal(student.marks.term1.bangla)),
      English:  Math.round(getSubjectTotal(student.marks.term1.english)),
      Math:     Math.round(getSubjectTotal(student.marks.term1.mathematics)),
      Science:  Math.round(getSubjectTotal(student.marks.term1.science)),
      BGS:      Math.round(getSubjectTotal(student.marks.term1.bgs)),
      ICT:      Math.round(getSubjectTotal(student.marks.term1.ict)),
      Religion: Math.round(getSubjectTotal(student.marks.term1.religion)),
    },
    {
      name: "Term 2",
      Bangla:   Math.round(getSubjectTotal(student.marks.term2.bangla)),
      English:  Math.round(getSubjectTotal(student.marks.term2.english)),
      Math:     Math.round(getSubjectTotal(student.marks.term2.mathematics)),
      Science:  Math.round(getSubjectTotal(student.marks.term2.science)),
      BGS:      Math.round(getSubjectTotal(student.marks.term2.bgs)),
      ICT:      Math.round(getSubjectTotal(student.marks.term2.ict)),
      Religion: Math.round(getSubjectTotal(student.marks.term2.religion)),
    },
    {
      name: "Term 3",
      Bangla:   Math.round(getSubjectTotal(student.marks.term3.bangla)),
      English:  Math.round(getSubjectTotal(student.marks.term3.english)),
      Math:     Math.round(getSubjectTotal(student.marks.term3.mathematics)),
      Science:  Math.round(getSubjectTotal(student.marks.term3.science)),
      BGS:      Math.round(getSubjectTotal(student.marks.term3.bgs)),
      ICT:      Math.round(getSubjectTotal(student.marks.term3.ict)),
      Religion: Math.round(getSubjectTotal(student.marks.term3.religion)),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* SECTION 1 — Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Academic Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Class 8 — Full Year Performance</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-semibold text-slate-800">{student.name}</p>
            <p className="text-sm text-slate-500">Roll: {student.rollNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getHouseBadgeClass(student.house)}`}>
            {student.house} House
          </span>
        </div>
      </div>

      {/* SECTION 2 — Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Overall Average
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{overallAvg}%</p>
          <p className="text-xs text-slate-400 mt-1">Across all 3 terms, 7 subjects</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Grade
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xl font-extrabold ${getGradeBadgeClass(grade)}`}
          >
            {grade}
          </span>
          <p className="text-xs text-slate-400 mt-2">Overall final grade</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Best Term
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{bestTerm.pct}%</p>
          <p className="text-xs text-slate-400 mt-1">{bestTerm.label}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Best Subject
          </p>
          <p className="text-3xl font-extrabold text-slate-900">{bestSubject.avg}</p>
          <p className="text-xs text-slate-400 mt-1">{bestSubject.label}</p>
        </div>
      </div>

      {/* SECTION 3 — Term by Term Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Term Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barChartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="subject"
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Term 1" fill="#6366f1" radius={4} />
            <Bar dataKey="Term 2" fill="#10b981" radius={4} />
            <Bar dataKey="Term 3" fill="#f59e0b" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 4 — Subject Breakdown Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Subject-wise Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {["Subject", "T1 Total", "T2 Total", "T3 Total", "Average", "Grade"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${
                        h === "Subject" ? "text-left" : "text-center"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row) => (
                <tr
                  key={row.key}
                  className={`border-b border-slate-100 last:border-0 ${
                    row.key === bestSubject.key ? "bg-indigo-50" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {row.label}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{row.t1}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{row.t2}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{row.t3}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                    {row.avg}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadgeClass(
                        getGrade(row.avg)
                      )}`}
                    >
                      {getGrade(row.avg)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5 — Term Trend Line Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Term-wise Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={lineChartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip />
            <Legend />
            {SUBJECT_KEYS.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={SUBJECT_LABELS[key]}
                stroke={SUBJECT_COLORS[i]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
