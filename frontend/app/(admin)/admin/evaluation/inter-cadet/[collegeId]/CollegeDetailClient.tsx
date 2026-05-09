"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import {
  getCollegeStats,
  getStudentsByCollege,
  CollegeStats,
  CadetStudent,
} from "@/lib/interCadetService";

const BASE_PATH = "/admin/evaluation/inter-cadet";

function getGpaColor(gpa: number): string {
  if (gpa >= 5)   return "text-emerald-600 font-bold";
  if (gpa >= 4)   return "text-green-600";
  if (gpa >= 3)   return "text-yellow-600";
  return "text-red-600";
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "indigo" | "emerald" | "red";
}) {
  const cls =
    accent === "indigo"  ? "text-indigo-600"  :
    accent === "emerald" ? "text-emerald-600" :
    accent === "red"     ? "text-red-500"     :
                           "text-slate-800";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${cls}`}>{value}</p>
    </div>
  );
}

const TABLE_HEADERS = [
  "Cadet ID", "Name", "Group", "Board Roll",
  "Registration No", "Board", "Year", "GPA", "Action",
];

export default function AdminCollegeDetailClient() {
  const router    = useRouter();
  const params    = useParams();
  const collegeId = parseInt(params.collegeId as string, 10);

  const [stats,    setStats]    = useState<CollegeStats | null>(null);
  const [students, setStudents] = useState<CadetStudent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sortDir,  setSortDir]  = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (isNaN(collegeId)) { setLoading(false); return; }
    // API-READY: replace with interCadetService calls
    Promise.all([
      getCollegeStats(collegeId),
      getStudentsByCollege(collegeId),
    ])
      .then(([s, studs]) => { setStats(s); setStudents(studs); })
      .finally(() => setLoading(false));
  }, [collegeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-slate-500">College not found.</p>
      </div>
    );
  }

  const sorted = [...students].sort((a, b) =>
    sortDir === "desc" ? b.finalGPA - a.finalGPA : a.finalGPA - b.finalGPA
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Back */}
      <button
        onClick={() => router.push(BASE_PATH)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inter Cadet Evaluation
      </button>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-800">{stats.collegeName}</h1>
          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
            {stats.boardName} Board
          </span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
            Year: 2026
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total"  value={String(stats.totalStudents)}      />
        <StatCard label="A+"     value={String(stats.totalAplusStudents)} accent="indigo"  />
        <StatCard label="Passed" value={String(stats.totalPassed)}        accent="emerald" />
        <StatCard label="Failed" value={String(stats.totalFailed)}        accent="red"     />
      </div>

      {/* Students table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Students ({students.length})
          </h2>
          <button
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Sort by GPA
            {sortDir === "desc"
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronUp   className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((student, idx) => (
                <tr key={student.id} className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {student.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      student.group === "Science"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {student.group}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {student.boardRollNumber}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {student.boardRegistrationNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {student.boardName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{student.year}</td>
                  <td className={`px-4 py-3 font-mono text-xs ${getGpaColor(student.finalGPA)}`}>
                    {student.finalGPA.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        router.push(`${BASE_PATH}/${collegeId}/${student.id}`)
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
