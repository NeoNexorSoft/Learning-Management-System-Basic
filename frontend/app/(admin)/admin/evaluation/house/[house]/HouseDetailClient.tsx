"use client";

import { useParams, useRouter } from "next/navigation";
import {
  getHouseRanking,
  getTermPercentage,
  getGrade,
} from "@/lib/evaluationData";

const BACK_PATH = "/admin/evaluation/house";
const DETAIL_BASE = "/admin/evaluation/leaderboard";

const ROW_ACCENTS = [
  "border-l-4 border-amber-400",
  "border-l-4 border-slate-400",
  "border-l-4 border-orange-500",
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function getHouseBadgeClass(house: string): string {
  switch (house) {
    case "Alpha":   return "bg-indigo-100 text-indigo-700";
    case "Beta":    return "bg-emerald-100 text-emerald-700";
    case "Charlie": return "bg-amber-100 text-amber-700";
    default:        return "bg-slate-100 text-slate-700";
  }
}

const TABLE_HEADERS = ["Rank", "Name", "T1%", "T2%", "T3%", "Overall%", "Grade", "Action"];

export default function AdminHouseDetailClient() {
  const router = useRouter();
  const { house } = useParams<{ house: string }>();
  const houseName = capitalize(house);

  // API-READY: replace with evaluationService.getHouseRanking(houseName)
  const ranking = getHouseRanking(houseName);

  // API-READY: replace with evaluationService.getHouseStandings() to get averageScore
  const houseAvg =
    ranking.length > 0
      ? Math.round(
          (ranking.reduce((sum, e) => sum + e.overallAverage, 0) /
            ranking.length) *
            10
        ) / 10
      : 0;

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

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {houseName} House &mdash; Full Results
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Class 8 &bull; {ranking.length} students
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getHouseBadgeClass(
            houseName
          )}`}
        >
          {houseName} House
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600">
          House Avg: {houseAvg}%
        </span>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {TABLE_HEADERS.map((h) => (
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
              {ranking.map((entry, i) => (
                <tr
                  key={entry.student.id}
                  className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-600">
                    #{entry.rank}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {entry.student.name}
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
                      onClick={() =>
                        router.push(`${DETAIL_BASE}/${entry.student.id}`)
                      }
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
