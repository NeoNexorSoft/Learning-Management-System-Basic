"use client";

import { useParams, useRouter } from "next/navigation";
import {
  getStudentById,
  getSubjectTotal,
  getTermPercentage,
  getOverallAverage,
  getGrade,
  getComment,
  getOverallRanking,
  getQuizAverage,
  getAssignmentAverage,
  SubjectKey,
} from "@/lib/evaluationData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BACK_PATH = "/teacher/evaluation/leaderboard";

const SUBJECT_KEYS: SubjectKey[] = [
  "bangla", "english", "mathematics", "science", "bgs", "ict", "religion",
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
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899",
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

function getCommentBannerClass(pct: number): string {
  if (pct >= 90) return "bg-emerald-50 border border-emerald-200 text-emerald-700";
  if (pct >= 80) return "bg-green-50 border border-green-200 text-green-700";
  if (pct >= 70) return "bg-blue-50 border border-blue-200 text-blue-700";
  if (pct >= 60) return "bg-yellow-50 border border-yellow-200 text-yellow-700";
  return "bg-red-50 border border-red-200 text-red-700";
}

type BarPoint = {
  subject: string;
  "Term 1": number;
  "Term 2": number;
  "Term 3": number;
};

type TermRow = {
  subject: string;
  quizAvg: number;
  assignAvg: number;
  termExam: number;
  total: number;
  grade: string;
};

export default function TeacherDetailClient() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  // API-READY: replace with evaluationService.getStudentById(id)
  const student = getStudentById(studentId);

  // API-READY: replace with evaluationService.getOverallRanking()
  const ranking = getOverallRanking();
  const rankEntry = ranking.find((r) => r.student.id === studentId);
  const rank = rankEntry?.rank ?? 0;
  const totalStudents = ranking.length;

  const overallAvg = getOverallAverage(student);
  const grade = getGrade(overallAvg);
  const comment = getComment(overallAvg);
  const t1Pct = getTermPercentage(student.marks.term1);
  const t2Pct = getTermPercentage(student.marks.term2);
  const t3Pct = getTermPercentage(student.marks.term3);

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

  const getTermRows = (termKey: "term1" | "term2" | "term3"): TermRow[] =>
    SUBJECT_KEYS.map((key) => {
      const s = student.marks[termKey][key];
      const quizAvg = Math.round(getQuizAverage(s.quiz) * 10) / 10;
      const assignAvg = Math.round(getAssignmentAverage(s.assignment) * 10) / 10;
      const total = Math.round(getSubjectTotal(s) * 10) / 10;
      return {
        subject: SUBJECT_LABELS[key],
        quizAvg,
        assignAvg,
        termExam: s.termExam,
        total,
        grade: getGrade(total),
      };
    });

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(BACK_PATH)}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <span>←</span>
        <span>Back to Leaderboard</span>
      </button>

      {/* SECTION 1 — Student Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
            {student.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Roll: {student.rollNumber}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getHouseBadgeClass(
                  student.house
                )}`}
              >
                {student.house} House
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                Rank #{rank} of {totalStudents}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getGradeBadgeClass(grade)}`}
              >
                Grade: {grade}
              </span>
            </div>
          </div>

          {/* Overall Average */}
          <div className="flex-shrink-0 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Overall Average
            </p>
            <p className="text-4xl font-extrabold text-slate-900 mt-1">{overallAvg}%</p>
          </div>
        </div>

        {/* Comment Banner */}
        <div className={`mt-4 px-4 py-3 rounded-xl ${getCommentBannerClass(overallAvg)}`}>
          <p className="text-sm font-medium">{comment}</p>
        </div>
      </div>

      {/* SECTION 2 — Term Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Term 1", pct: t1Pct },
          { label: "Term 2", pct: t2Pct },
          { label: "Term 3", pct: t3Pct },
        ].map(({ label, pct }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {label}
            </p>
            <p className="text-3xl font-extrabold text-slate-900">{pct}%</p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadgeClass(
                getGrade(pct)
              )}`}
            >
              {getGrade(pct)}
            </span>
          </div>
        ))}
      </div>

      {/* SECTION 3 — Performance Trend (Line Chart) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Performance Trend</h2>
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

      {/* SECTION 4 — Subject Breakdown (Bar Chart) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Subject Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barChartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Term 1" fill="#6366f1" radius={4} />
            <Bar dataKey="Term 2" fill="#10b981" radius={4} />
            <Bar dataKey="Term 3" fill="#f59e0b" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 5 — Detailed Marks Tables (one per term) */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800">Detailed Marks Breakdown</h2>
        {(["term1", "term2", "term3"] as const).map((termKey, ti) => (
          <div
            key={termKey}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-700">Term {ti + 1}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      "Subject",
                      "Quiz Avg (/15)",
                      "Assign Avg (/15)",
                      "Term Exam (/70)",
                      "Total (/100)",
                      "Grade",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                          h === "Subject" ? "text-left" : "text-center"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getTermRows(termKey).map((row) => (
                    <tr
                      key={row.subject}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-700">{row.subject}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{row.quizAvg}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{row.assignAvg}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{row.termExam}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                        {row.total}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadgeClass(
                            row.grade
                          )}`}
                        >
                          {row.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
