"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, School } from "lucide-react";
import { getAllCollegeStats, CollegeStats } from "@/lib/interCadetService";

const BASE_PATH = "/student/evaluation/inter-cadet";
// MOCK: hardcoded studentCollegeId = 1 — replace with useAuth() derived college
const MOCK_STUDENT_COLLEGE_ID = 1;

function getRankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-yellow-400 text-yellow-900";
  if (rank === 2) return "bg-slate-300 text-slate-700";
  if (rank === 3) return "bg-amber-600 text-white";
  return "bg-slate-100 text-slate-600";
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function CollegeCard({
  college,
  onViewDetails,
  canView,
}: {
  college: CollegeStats;
  onViewDetails: () => void;
  canView: boolean;
}) {
  const stats = [
    { label: "Participated", value: String(college.totalStudents),      cls: "text-slate-800"   },
    { label: "A+ Count",     value: String(college.totalAplusStudents), cls: "text-indigo-600"  },
    { label: "Passed",       value: String(college.totalPassed),        cls: "text-emerald-600" },
    { label: "Failed",       value: String(college.totalFailed),        cls: "text-red-500"     },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getRankBadgeClass(college.rank)}`}>
            #{college.rank}
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2 leading-tight">
            {college.collegeName}
          </h3>
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
            {college.boardName} Board
          </span>
        </div>
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <School className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {stats.map(({ label, value, cls }) => (
          <div key={label} className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className={`font-semibold ${cls}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">A+ Rate</span>
            <span className="font-semibold text-indigo-600">{college.aplusPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${college.aplusPercentage}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Pass Rate</span>
            <span className="font-semibold text-emerald-600">{college.passPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${college.passPercentage}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Average GPA</span>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
          {college.averageGPA.toFixed(2)}
        </span>
      </div>

      {canView ? (
        <button
          onClick={onViewDetails}
          className="w-full py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          View Details
        </button>
      ) : (
        <button
          disabled
          className="w-full py-2 text-sm font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
        >
          Members Only
        </button>
      )}
    </div>
  );
}

export default function StudentInterCadetClient() {
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API-READY: replace with interCadetService.getAllCollegeStats()
    getAllCollegeStats()
      .then(setColleges)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const champion = colleges[0];
  const totalAplus   = colleges.reduce((s, c) => s + c.totalAplusStudents, 0);
  const totalPassed  = colleges.reduce((s, c) => s + c.totalPassed, 0);
  const overallPassRate = ((totalPassed / 250) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Inter Cadet College Evaluation</h1>
        <p className="text-sm text-slate-500 mt-1">SSC 2026 — Comparative Performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Colleges"    value="5"                      />
        <StatCard label="Total Students"    value="250"                    />
        <StatCard label="Overall A+"        value={String(totalAplus)}     />
        <StatCard label="Overall Pass Rate" value={`${overallPassRate}%`} />
      </div>

      {champion && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl p-8 text-white">
          <div className="flex flex-col items-center text-center gap-3">
            <Trophy className="w-14 h-14 text-amber-300" />
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
              Overall Champion
            </p>
            <h2 className="text-3xl font-extrabold">{champion.collegeName}</h2>
            <div className="flex gap-8 mt-2">
              <div className="text-center">
                <p className="text-2xl font-black">{champion.averageGPA.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-0.5">Average GPA</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">{champion.aplusPercentage}%</p>
                <p className="text-xs opacity-75 mt-0.5">A+ Percentage</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {colleges.map((college) => (
          <CollegeCard
            key={college.collegeId}
            college={college}
            onViewDetails={() => router.push(`${BASE_PATH}/${college.collegeId}`)}
            canView={college.collegeId === MOCK_STUDENT_COLLEGE_ID}
          />
        ))}
      </div>
    </div>
  );
}
