"use client";

import { useRouter } from "next/navigation";
import {
  getOverallRanking,
  getTermPercentage,
  getGrade,
} from "@/lib/evaluationData";

const DETAIL_BASE = "/teacher/evaluation/leaderboard";

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

const TOP3_STYLES = [
  {
    medal: "🥇",
    position: "1st Place",
    borderClass: "border-2 border-amber-400",
    positionBadge: "bg-amber-100 text-amber-700",
  },
  {
    medal: "🥈",
    position: "2nd Place",
    borderClass: "border-2 border-slate-300",
    positionBadge: "bg-slate-100 text-slate-600",
  },
  {
    medal: "🥉",
    position: "3rd Place",
    borderClass: "border-2 border-orange-400",
    positionBadge: "bg-orange-100 text-orange-700",
  },
];

const ROW_ACCENTS = [
  "border-l-4 border-amber-400",
  "border-l-4 border-slate-400",
  "border-l-4 border-orange-500",
];

const TABLE_HEADERS = ["Rank", "Name", "House", "T1%", "T2%", "T3%", "Overall%", "Grade", "Action"];

export default function TeacherLeaderboardClient() {
  const router = useRouter();

  // API-READY: replace with evaluationService.getOverallRanking()
  const ranking = getOverallRanking();
  const top3 = ranking.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* SECTION 1 — Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Leaderboard</h1>
        <p className="text-sm text-slate-500 mt-1">Class 8 — Overall Rankings</p>
      </div>

      {/* SECTION 2 — Top 3 Podium */}
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Top Performers
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((entry, i) => {
            const style = TOP3_STYLES[i];
            return (
              <div
                key={entry.student.id}
                className={`bg-white rounded-2xl p-5 ${style.borderClass} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{style.medal}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${style.positionBadge}`}
                  >
                    {style.position}
                  </span>
                </div>
                <p className="font-bold text-slate-800 text-base leading-tight">
                  {entry.student.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Roll: {entry.student.rollNumber}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getHouseBadgeClass(
                      entry.student.house
                    )}`}
                  >
                    {entry.student.house}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadgeClass(
                      getGrade(entry.overallAverage)
                    )}`}
                  >
                    {getGrade(entry.overallAverage)}
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-3">
                  {entry.overallAverage}%
                </p>
                <button
                  onClick={() => router.push(`${DETAIL_BASE}/${entry.student.id}`)}
                  className="mt-3 w-full px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3 — Full Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Full Rankings</h2>
            <p className="text-xs text-slate-400 mt-0.5">{ranking.length} students</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className={`py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      ["Rank", "Name", "House"].includes(h) ? "text-left" : "text-center"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, i) => (
                <tr
                  key={entry.student.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-600">
                    #{entry.rank}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {entry.student.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getHouseBadgeClass(
                        entry.student.house
                      )}`}
                    >
                      {entry.student.house}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    {getTermPercentage(entry.student.marks.term1)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    {getTermPercentage(entry.student.marks.term2)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    {getTermPercentage(entry.student.marks.term3)}
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
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => router.push(`${DETAIL_BASE}/${entry.student.id}`)}
                      className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
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
