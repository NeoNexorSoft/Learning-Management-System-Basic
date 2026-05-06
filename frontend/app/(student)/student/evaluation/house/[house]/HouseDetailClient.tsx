"use client";

import { useParams, useRouter } from "next/navigation";
import {
  getStudentById,
  getHouseRanking,
  getOverallAverage,
  getTermPercentage,
  getGrade,
  getComment,
  getSubjectTotal,
  SubjectKey,
} from "@/lib/evaluationData";

const BACK_PATH = "/student/evaluation/house";

// MOCK: hardcoded studentId = 1
// replace with useAuth() user.id when connecting real API
const STUDENT_ID = 1;

const ROW_ACCENTS = [
  "border-l-4 border-amber-400",
  "border-l-4 border-slate-400",
  "border-l-4 border-orange-500",
];

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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

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

function getCommentBannerClass(pct: number): string {
  if (pct >= 90) return "bg-emerald-50 border border-emerald-200 text-emerald-700";
  if (pct >= 80) return "bg-green-50 border border-green-200 text-green-700";
  if (pct >= 70) return "bg-blue-50 border border-blue-200 text-blue-700";
  if (pct >= 60) return "bg-yellow-50 border border-yellow-200 text-yellow-700";
  return "bg-red-50 border border-red-200 text-red-700";
}

export default function StudentHouseDetailClient() {
  const router = useRouter();
  const { house } = useParams<{ house: string }>();
  const houseName = capitalize(house);

  // API-READY: replace with evaluationService.getStudentById(STUDENT_ID)
  const student = getStudentById(STUDENT_ID);

  // API-READY: replace with evaluationService.getHouseRanking(houseName)
  const ranking = getHouseRanking(houseName);

  const studentEntry = ranking.find((r) => r.student.id === STUDENT_ID);
  const houseRank = studentEntry?.rank ?? 0;
  const totalInHouse = ranking.length;

  const overallAvg = getOverallAverage(student);
  const grade = getGrade(overallAvg);
  const comment = getComment(overallAvg);

  const t1Pct = getTermPercentage(student.marks.term1);
  const t2Pct = getTermPercentage(student.marks.term2);
  const t3Pct = getTermPercentage(student.marks.term3);

  const subjectRows = SUBJECT_KEYS.map((key) => {
    const t1 = Math.round(getSubjectTotal(student.marks.term1[key]) * 10) / 10;
    const t2 = Math.round(getSubjectTotal(student.marks.term2[key]) * 10) / 10;
    const t3 = Math.round(getSubjectTotal(student.marks.term3[key]) * 10) / 10;
    const avg = Math.round(((t1 + t2 + t3) / 3) * 10) / 10;
    return { subject: SUBJECT_LABELS[key], t1, t2, t3, avg, grade: getGrade(avg) };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(BACK_PATH)}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <span>&#8592;</span>
        <span>Back to House Competition</span>
      </button>

      {/* SECTION 1 — Student Position Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Your House Ranking
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-shrink-0 text-center">
            <p className="text-6xl font-black text-indigo-600">
              {ordinal(houseRank)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              out of {totalInHouse} in {houseName} House
            </p>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Roll: {student.rollNumber}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                {houseName} House
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getGradeBadgeClass(grade)}`}
              >
                Grade: {grade}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Overall Average
            </p>
            <p className="text-4xl font-extrabold text-slate-900 mt-1">
              {overallAvg}%
            </p>
          </div>
        </div>
        <div className={`px-4 py-3 rounded-xl ${getCommentBannerClass(overallAvg)}`}>
          <p className="text-sm font-medium">{comment}</p>
        </div>
      </div>

      {/* SECTION 2 — House Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {houseName} House Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{totalInHouse} students</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Rank", "Name", "Overall%", "Grade"].map((h) => (
                  <th
                    key={h}
                    className={`py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      ["Rank", "Name"].includes(h) ? "text-left" : "text-center"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, i) => {
                const isMe = entry.student.id === STUDENT_ID;
                const rowBase =
                  "border-b border-slate-100 last:border-0 transition-colors";
                const rowAccent = isMe
                  ? "bg-indigo-50 border-l-4 border-indigo-600"
                  : i < 3
                  ? ROW_ACCENTS[i]
                  : i % 2 !== 0
                  ? "bg-slate-50"
                  : "bg-white";
                return (
                  <tr key={entry.student.id} className={`${rowBase} ${rowAccent}`}>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">
                      #{entry.rank}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {entry.student.name}
                      {isMe && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-600">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                      {entry.overallAverage}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadgeClass(
                          getGrade(entry.overallAverage)
                        )}`}
                      >
                        {getGrade(entry.overallAverage)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3 — Student's Own Detailed Results */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800">
          Your Detailed Results
        </h2>

        {/* Term Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Term 1", pct: t1Pct },
            { label: "Term 2", pct: t2Pct },
            { label: "Term 3", pct: t3Pct },
          ].map(({ label, pct }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
            >
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

        {/* Subject Breakdown Table */}
        {/* API-READY: replace with evaluationService call */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              Subject Breakdown
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
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
                {subjectRows.map((row) => (
                  <tr
                    key={row.subject}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {row.subject}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {row.t1}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {row.t2}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {row.t3}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                      {row.avg}
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
      </div>
    </div>
  );
}
