"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Printer, XCircle } from "lucide-react";
import { getStudentById, CadetStudent } from "@/lib/interCadetService";

const GRADING_SCALE = [
  { grade: "A+", interval: "80–100", point: "5.00" },
  { grade: "A",  interval: "70–79",  point: "4.00" },
  { grade: "A-", interval: "60–69",  point: "3.50" },
  { grade: "B",  interval: "50–59",  point: "3.00" },
  { grade: "C",  interval: "40–49",  point: "2.00" },
  { grade: "D",  interval: "33–39",  point: "1.00" },
  { grade: "F",  interval: "00–32",  point: "0.00" },
];

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800 mt-0.5">{value}</span>
    </div>
  );
}

export default function StudentResultClient({
  studentId,
}: {
  collegeId: number;
  studentId: number;
}) {
  const router = useRouter();
  const [student, setStudent] = useState<CadetStudent | null>(null);

  useEffect(() => {
    // API-READY: replace with interCadetService.getStudentById(id)
    getStudentById(studentId).then(setStudent).catch(() => {});
  }, [studentId]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const getGradeBadgeClass = (grade: string) => {
    switch (grade) {
      case "A+": return "bg-emerald-100 text-emerald-700";
      case "A":  return "bg-green-100 text-green-700";
      case "A-": return "bg-blue-100 text-blue-700";
      case "B":  return "bg-yellow-100 text-yellow-700";
      case "C":  return "bg-orange-100 text-orange-700";
      case "D":  return "bg-red-100 text-red-700";
      case "F":  return "bg-red-200 text-red-800 font-bold";
      default:   return "bg-slate-100 text-slate-600";
    }
  };

  const getMarksClass = (marks: number) => {
    if (marks >= 80) return "text-emerald-600 font-bold";
    if (marks >= 70) return "text-green-600 font-semibold";
    if (marks >= 60) return "text-blue-600";
    if (marks >= 50) return "text-yellow-600";
    if (marks >= 40) return "text-orange-600";
    return "text-red-600 font-bold";
  };

  const compulsorySubjects = student.subjects.filter(s =>
    [101, 102, 107, 108, 109, 154, 111].includes(s.subjectCode)
  );
  const groupSubjects = student.subjects.filter(s =>
    !s.isOptional && ![101, 102, 107, 108, 109, 154, 111].includes(s.subjectCode)
  );
  const optionalSubject = student.subjects.find(s => s.isOptional);

  const isFailed       = student.subjects.some(s => s.letterGrade === "F");
  const getGPAClass    = (gpa: number) => {
    if (gpa >= 5.00) return "text-emerald-600";
    if (gpa >= 4.00) return "text-green-600";
    if (gpa >= 3.00) return "text-yellow-600";
    return "text-red-600";
  };
  const bestSubject    = student.subjects.reduce((a, b) => a.marks > b.marks ? a : b);
  const weakestSubject = student.subjects.reduce((a, b) => a.marks < b.marks ? a : b);
  const aplusCount     = student.subjects.filter(s => s.letterGrade === "A+").length;

  return (
    <>
      <style>{`
  @media print {
    /* Hide everything except transcript */
    body * { visibility: hidden; }
    /* Show only print area */
    #transcript-print-area,
    #transcript-print-area * {
       visibility: visible;
     }
    /* Position print area top-left */
    #transcript-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    /* Hide sidebar, navbar,
       topbar, back button, print button */
    aside,
    nav,
    header,
    .no-print {
       display: none !important;
     }
    /* Clean page margins */
    @page {
      margin: 1cm;
    }
    /* Avoid page breaks inside cards */
    .print-card {
      page-break-inside: avoid;
    }
  }`}</style>
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Transcript
        </button>
      </div>

      <div id="transcript-print-area">
      {/* Section 1 — Official Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 print-card">
        <div className="flex justify-between items-start gap-6">
          <div>
            <p className="text-2xl font-bold text-slate-800 mt-1">Academic Summary</p>
            <p className="text-sm text-slate-500 mt-1">SSC Examination — 2026</p>
          </div>

          <table className="text-xs border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-3 py-1.5 text-slate-600 font-semibold">Letter Grade</th>
                <th className="px-3 py-1.5 text-slate-600 font-semibold">Class Interval</th>
                <th className="px-3 py-1.5 text-slate-600 font-semibold">Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {GRADING_SCALE.map(({ grade, interval, point }, idx) => (
                <tr key={grade} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-1 text-center font-semibold">{grade}</td>
                  <td className="px-3 py-1 text-center">{interval}</td>
                  <td className="px-3 py-1 text-center">{point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 my-6" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <InfoField label="Name of Student"     value={student.name} />
          <InfoField label="Roll No"              value={student.boardRollNumber} />

          <InfoField label="Name of Institution" value={student.cadetCollegeName} />
          <InfoField label="Registration No"      value={student.boardRegistrationNumber} />

          <InfoField label="Board"                value={student.boardName} />
          <InfoField label="Year"                 value={String(student.year)} />

          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Group</span>
            <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold w-fit ${
              student.group === "Science"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}>
              {student.group}
            </span>
          </div>
          <InfoField label="Type of Student" value="Regular" />
        </div>
      </div>

      {/* Section 2 — Subject Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden print-card">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-700">Subject-wise Results</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-4 py-3 text-center w-12">Sl.</th>
                <th className="px-4 py-3 text-center w-28">Subject Code</th>
                <th className="px-4 py-3 text-left">Name of Subject</th>
                <th className="px-4 py-3 text-center w-16">Marks</th>
                <th className="px-4 py-3 text-center w-28">Letter Grade</th>
                <th className="px-4 py-3 text-center w-28">Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {/* Compulsory Subjects */}
              <tr className="bg-indigo-50">
                <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Compulsory Subjects
                </td>
              </tr>
              {compulsorySubjects.map((s, i) => (
                <tr
                  key={s.subjectCode}
                  className={i % 2 === 0 ? "bg-white hover:bg-indigo-50" : "bg-slate-50 hover:bg-indigo-50"}
                  style={{ transition: "background 0.15s" }}
                >
                  <td className="px-4 py-3 text-center text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-indigo-600">
                    {s.subjectCode}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{s.subjectName}</td>
                  <td className={`px-4 py-3 text-center ${getMarksClass(s.marks)}`}>{s.marks}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getGradeBadgeClass(s.letterGrade)}`}>
                      {s.letterGrade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                    {s.gradePoint.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Group Subjects */}
              <tr className="bg-indigo-50">
                <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Group Subjects — {student.group}
                </td>
              </tr>
              {groupSubjects.map((s, i) => (
                <tr
                  key={s.subjectCode}
                  className={i % 2 === 0 ? "bg-white hover:bg-indigo-50" : "bg-slate-50 hover:bg-indigo-50"}
                  style={{ transition: "background 0.15s" }}
                >
                  <td className="px-4 py-3 text-center text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-indigo-600">
                    {s.subjectCode}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{s.subjectName}</td>
                  <td className={`px-4 py-3 text-center ${getMarksClass(s.marks)}`}>{s.marks}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getGradeBadgeClass(s.letterGrade)}`}>
                      {s.letterGrade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                    {s.gradePoint.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Optional Subject */}
              {optionalSubject && (
                <>
                  <tr className="bg-indigo-50">
                    <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                      Optional Subject
                    </td>
                  </tr>
                  <tr
                    className="bg-white hover:bg-indigo-50"
                    style={{ transition: "background 0.15s" }}
                  >
                    <td className="px-4 py-3 text-center text-slate-500">1</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-indigo-600">
                      {optionalSubject.subjectCode}
                    </td>
                    <td className="px-4 py-3 text-slate-800">{optionalSubject.subjectName}</td>
                    <td className={`px-4 py-3 text-center ${getMarksClass(optionalSubject.marks)}`}>
                      {optionalSubject.marks}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getGradeBadgeClass(optionalSubject.letterGrade)}`}>
                        {optionalSubject.letterGrade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {optionalSubject.gradePoint.toFixed(2)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3 — GPA Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 print-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold text-slate-700">GPA Summary</h2>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-6">
          {/* GPA boxes */}
          <div className="flex gap-8 flex-wrap">
            <div className="flex flex-col items-center bg-slate-50 rounded-2xl px-8 py-5 border border-slate-200">
              <span className="text-xs text-slate-500 mb-2 text-center">
                GPA (Without Additional Subject)
              </span>
              <span className="text-4xl font-bold text-indigo-600">
                {student.gpaWithoutOptional.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 mt-1">out of 5.00</span>
            </div>
            <div className="flex flex-col items-center bg-slate-50 rounded-2xl px-8 py-5 border border-slate-200">
              <span className="text-xs text-slate-500 mb-2 text-center">
                Final GPA
              </span>
              <span className={`text-4xl font-bold ${getGPAClass(student.finalGPA)}`}>
                {student.finalGPA.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 mt-1">out of 5.00</span>
            </div>
          </div>

          {/* Pass / Fail badge */}
          {isFailed ? (
            <div className="flex items-center gap-3 bg-red-100 border border-red-300 text-red-700 font-bold text-lg px-8 py-4 rounded-2xl">
              <XCircle className="w-6 h-6" />
              FAILED
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold text-lg px-8 py-4 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
              PASSED
            </div>
          )}
        </div>
      </div>

      {/* Section 4 — Performance Analysis Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 print-card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Performance Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Subject */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
              Best Subject
            </p>
            <p className="text-sm font-semibold text-slate-800">{bestSubject.subjectName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-emerald-600">{bestSubject.marks}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getGradeBadgeClass(bestSubject.letterGrade)}`}>
                {bestSubject.letterGrade}
              </span>
            </div>
          </div>

          {/* Weakest Subject */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
              Needs Improvement
            </p>
            <p className="text-sm font-semibold text-slate-800">{weakestSubject.subjectName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-red-500">{weakestSubject.marks}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getGradeBadgeClass(weakestSubject.letterGrade)}`}>
                {weakestSubject.letterGrade}
              </span>
            </div>
          </div>

          {/* A+ Count */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
              Subjects with A+
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-indigo-600">{aplusCount}</span>
              <span className="text-sm text-slate-500">/ {student.subjects.length}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">subjects scored A+</p>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}
