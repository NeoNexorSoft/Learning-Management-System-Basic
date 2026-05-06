"use client";

import { useRouter } from "next/navigation";
import { Trophy, Crown, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getHouseStandings,
  students,
  getTermPercentage,
  HouseStanding,
} from "@/lib/evaluationData";

const BASE_PATH = "/teacher/evaluation/house";

const HOUSE_BADGE: Record<string, string> = {
  Alpha: "bg-indigo-100 text-indigo-700",
  Beta: "bg-emerald-100 text-emerald-700",
  Charlie: "bg-amber-100 text-amber-700",
};

function computeHouseTermAvg(
  houseName: string,
  termKey: "term1" | "term2" | "term3"
): number {
  const cohort = students.filter((s) => s.house === houseName);
  const avg =
    cohort.reduce((sum, s) => sum + getTermPercentage(s.marks[termKey]), 0) /
    cohort.length;
  return Math.round(avg * 10) / 10;
}

function PositionIcon({ label }: { label: HouseStanding["label"] }) {
  if (label === "Champion")
    return <Crown className="w-5 h-5 text-amber-500" />;
  if (label === "1st Runner Up")
    return <Award className="w-5 h-5 text-slate-400" />;
  return <Award className="w-5 h-5 text-orange-500" />;
}

export default function TeacherHouseClient() {
  const router = useRouter();

  // API-READY: replace with evaluationService.getHouseStandings()
  const standings = getHouseStandings();
  const champion = standings[0];

  const chartData = [
    {
      term: "Term 1",
      Alpha: computeHouseTermAvg("Alpha", "term1"),
      Beta: computeHouseTermAvg("Beta", "term1"),
      Charlie: computeHouseTermAvg("Charlie", "term1"),
    },
    {
      term: "Term 2",
      Alpha: computeHouseTermAvg("Alpha", "term2"),
      Beta: computeHouseTermAvg("Beta", "term2"),
      Charlie: computeHouseTermAvg("Charlie", "term2"),
    },
    {
      term: "Term 3",
      Alpha: computeHouseTermAvg("Alpha", "term3"),
      Beta: computeHouseTermAvg("Beta", "term3"),
      Charlie: computeHouseTermAvg("Charlie", "term3"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          House Wise Competition
        </h1>
        <p className="text-sm text-slate-500 mt-1">Class 8</p>
      </div>

      {/* SECTION 1 — Champion Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl p-8 text-white">
        <div className="flex flex-col items-center text-center gap-3">
          <Trophy className="w-16 h-16 text-amber-300" />
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
            Champion
          </p>
          <h2 className="text-4xl font-extrabold">{champion.house} House</h2>
          <p className="text-5xl font-black">{champion.averageScore}%</p>
          <p className="text-sm opacity-75">House Average Score</p>
        </div>
      </div>

      {/* SECTION 2 — House Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {standings.map((standing) => (
          <div
            key={standing.house}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <PositionIcon label={standing.label} />
              <span className="text-sm font-semibold text-slate-600">
                {standing.label}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {standing.house}
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                HOUSE_BADGE[standing.house]
              }`}
            >
              {standing.house} House
            </span>
            <p className="text-4xl font-extrabold text-slate-900">
              {standing.averageScore}%
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Average Score &bull; 17 students
            </p>
            <button
              onClick={() =>
                router.push(`${BASE_PATH}/${standing.house.toLowerCase()}`)
              }
              className="w-full px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              View House Details
            </button>
          </div>
        ))}
      </div>

      {/* SECTION 3 — Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          House Average Comparison by Term
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="term" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Alpha" fill="#6366f1" radius={4} />
            <Bar dataKey="Beta" fill="#10b981" radius={4} />
            <Bar dataKey="Charlie" fill="#f59e0b" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
