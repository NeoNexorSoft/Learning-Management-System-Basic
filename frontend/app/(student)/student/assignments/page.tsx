"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardList,
  Loader2,
  MessageSquareText,
} from "lucide-react";
import TopBar from "@/components/shared/TopBar";
import PageHeader from "@/components/shared/PageHeader";
import api from "@/lib/axios";

type SubmissionStatus = "pending" | "submitted" | "graded" | "returned";
type StatusFilter = "all" | "graded" | "pending";

type StudentAssignmentFeedback = {
  id: string;
  title: string;
  course: string;
  submittedAt: string | null;
  dueDate: string;
  status: SubmissionStatus;
  marks: number | null;
  totalMarks: number;
  feedback: string | null;
};

const statusConfig: Record<
  SubmissionStatus,
  {
    label: string;
    bg: string;
    text: string;
    Icon: typeof Clock;
  }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-700",
    Icon: Clock,
  },
  submitted: {
    label: "Submitted",
    bg: "bg-blue-100",
    text: "text-blue-700",
    Icon: CheckCircle2,
  },
  graded: {
    label: "Graded",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    Icon: CheckCircle2,
  },
  returned: {
    label: "Returned",
    bg: "bg-rose-100",
    text: "text-rose-700",
    Icon: AlertCircle,
  },
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSubmissionStatus(
  rawStatus: string | undefined,
  grade: number | null,
): SubmissionStatus {
  const normalized = rawStatus?.toLowerCase();

  if (normalized === "returned") return "returned";
  if (grade !== null) return "graded";
  if (normalized === "submitted") return "submitted";

  return "pending";
}

function AssignmentRow({
  assignment,
}: {
  assignment: StudentAssignmentFeedback;
}) {
  const cfg = statusConfig[assignment.status];
  const StatusIcon = cfg.Icon;
  const isOverdue =
    assignment.status === "pending" &&
    new Date(assignment.dueDate) < new Date();

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
      <td className="py-4 px-4">
        <div className="flex items-start gap-2">
          {isOverdue && (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-slate-800 text-sm">
              {assignment.title}
            </p>
            <p className="text-xs text-slate-400 mt-1 sm:hidden">
              {assignment.course}
            </p>
          </div>
        </div>
      </td>

      <td className="py-4 px-4 text-sm text-slate-500 hidden sm:table-cell">
        {assignment.course}
      </td>

      <td className="py-4 px-4 text-sm text-slate-500 hidden md:table-cell">
        {formatDate(assignment.submittedAt)}
      </td>

      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
        >
          <StatusIcon className="w-3 h-3" />
          {assignment.status === "submitted" ? "Pending" : cfg.label}
        </span>
      </td>

      <td className="py-4 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">
        {assignment.marks !== null
          ? `${assignment.marks}/${assignment.totalMarks}`
          : "Pending"}
      </td>

      <td className="py-4 px-4 text-sm text-slate-500 min-w-[240px]">
        {assignment.feedback ? (
          <div className="flex items-start gap-2">
            <MessageSquareText className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{assignment.feedback}</p>
          </div>
        ) : (
          <span className="text-slate-400">No feedback yet</span>
        )}
      </td>
    </tr>
  );
}

function StudentAssignmentsPage() {
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") ?? "").toLowerCase();

  const [assignments, setAssignments] = useState<StudentAssignmentFeedback[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    api
      .get("/api/assignments/my")
      .then(({ data }) => {
        const raw: any[] = data.data?.assignments ?? data.data ?? [];

        if (raw.length === 0 && process.env.NODE_ENV === "development") {
          // only for local testing (dev only)
          setAssignments([
            {
              id: "demo-1",
              title: "Demo Assignment - React Components",
              course: "Complete React Developer Bootcamp",
              dueDate: new Date().toISOString(),
              submittedAt: new Date().toISOString(),
              status: "graded",
              marks: 85,
              totalMarks: 100,
              feedback:
                "Good work. Please improve formatting and add more explanation in the final section.",
            },
            {
              id: "demo-2",
              title: "Demo Assignment - Node.js API",
              course: "Node.js API Development Masterclass",
              dueDate: new Date().toISOString(),
              submittedAt: new Date().toISOString(),
              status: "submitted",
              marks: null,
              totalMarks: 100,
              feedback: null,
            },
          ]);
          return;
        }
        const mapped: StudentAssignmentFeedback[] = raw.map(
          (assignment: any) => {
            const submission = assignment.submission ?? null;
            const grade = submission?.grade ?? null;
            const status = getSubmissionStatus(submission?.status, grade);

            return {
              id: assignment.id,
              title: assignment.title,
              course:
                assignment.lesson?.section?.course?.title ?? "Unknown Course",
              dueDate: assignment.due_date ?? new Date().toISOString(),
              submittedAt: submission?.submitted_at ?? null,
              status,
              marks: grade,
              totalMarks: assignment.total_marks ?? 100,
              feedback: submission?.feedback ?? null,
            };
          },
        );

        setAssignments(mapped);
      })
      .catch(() => setError("Failed to load assignments."))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const graded = assignments.filter(
      (assignment) => assignment.status === "graded",
    ).length;
    const pending = assignments.filter(
      (assignment) =>
        assignment.status === "pending" || assignment.status === "submitted",
    ).length;

    return {
      total: assignments.length,
      graded,
      pending,
    };
  }, [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        !search ||
        assignment.title.toLowerCase().includes(search) ||
        assignment.course.toLowerCase().includes(search) ||
        assignment.feedback?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "graded" && assignment.status === "graded") ||
        (statusFilter === "pending" &&
          (assignment.status === "pending" ||
            assignment.status === "submitted"));

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search assignments…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search assignments…" />

      <main className="flex-1 p-6 overflow-y-auto">
        <PageHeader
          title="Assignments"
          subtitle={
            error ??
            (search
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchParams.get("search")}"`
              : `${counts.total} total — ${counts.graded} graded — ${counts.pending} pending`)
          }
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "graded", label: "Graded" },
              { key: "pending", label: "Pending" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(item.key as StatusFilter)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  statusFilter === item.key
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              {search
                ? `No assignments match "${searchParams.get("search")}".`
                : "No assignments found."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Assignment
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Submission Date
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Marks
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Teacher Feedback
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((assignment) => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StudentAssignmentsPage />
    </Suspense>
  );
}
