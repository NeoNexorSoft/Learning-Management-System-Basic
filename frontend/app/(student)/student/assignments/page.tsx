"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardList,
  Loader2,
  MessageSquareText,
  Upload,
  FileText,
  Trash2,
  Send,
} from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import Modal from "@/components/admin/Modal";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmissionStatus = "pending" | "submitted" | "graded" | "returned";
type StatusFilter     = "all" | "graded" | "pending";

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

// ─── Status config (unchanged) ────────────────────────────────────────────────

const statusConfig: Record<
  SubmissionStatus,
  { label: string; bg: string; text: string; Icon: typeof Clock }
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

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────

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

// ─── Deadline countdown ───────────────────────────────────────────────────────

function DueDateDisplay({ dueDate }: { dueDate: string }) {
  const now      = new Date();
  const due      = new Date(dueDate);
  const diffMs   = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
        <AlertCircle className="w-3 h-3" />
        Overdue
      </span>
    );
  }
  if (diffHours <= 48) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
        <Clock className="w-3 h-3" />
        Due Soon
      </span>
    );
  }
  return <span className="text-xs text-slate-500">{formatDate(dueDate)}</span>;
}

// ─── Assignment row ───────────────────────────────────────────────────────────

function AssignmentRow({
  assignment,
  onSubmit,
  onDelete,
  deletingId,
}: {
  assignment: StudentAssignmentFeedback;
  onSubmit: (a: StudentAssignmentFeedback) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const cfg       = statusConfig[assignment.status];
  const StatusIcon = cfg.Icon;

  const now          = new Date();
  const isPastDeadline = new Date(assignment.dueDate) < now;
  const isOverdue    = assignment.status === "pending" && isPastDeadline;
  const canSubmit    = assignment.status === "pending" && !isPastDeadline;
  const canDelete    = assignment.status === "submitted" && !isPastDeadline;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
      {/* Assignment */}
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

      {/* Course */}
      <td className="py-4 px-4 text-sm text-slate-500 hidden sm:table-cell">
        {assignment.course}
      </td>

      {/* Due Date */}
      <td className="py-4 px-4 hidden md:table-cell">
        <DueDateDisplay dueDate={assignment.dueDate} />
      </td>

      {/* Submission Date */}
      <td className="py-4 px-4 text-sm text-slate-500 hidden md:table-cell">
        {formatDate(assignment.submittedAt)}
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
        >
          <StatusIcon className="w-3 h-3" />
          {assignment.status === "submitted" ? "Pending" : cfg.label}
        </span>
      </td>

      {/* Marks */}
      <td className="py-4 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">
        {assignment.marks !== null
          ? `${assignment.marks}/${assignment.totalMarks}`
          : "—"}
      </td>

      {/* Feedback */}
      <td className="py-4 px-4 text-sm text-slate-500 min-w-[200px]">
        {assignment.feedback ? (
          <div className="flex items-start gap-2">
            <MessageSquareText className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{assignment.feedback}</p>
          </div>
        ) : (
          <span className="text-slate-400">No feedback yet</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1.5">
          {canSubmit && (
            <button
              onClick={() => onSubmit(assignment)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(assignment.id)}
              disabled={deletingId === assignment.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {deletingId === assignment.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function StudentAssignmentsPage() {
  const searchParams  = useSearchParams();
  const search        = (searchParams.get("search") ?? "").toLowerCase();

  const [assignments,  setAssignments]  = useState<StudentAssignmentFeedback[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // ── Submission modal state ─────────────────────────────────────────────────
  const [submittingAssignment, setSubmittingAssignment] =
    useState<StudentAssignmentFeedback | null>(null);
  const [submitContent,  setSubmitContent]  = useState("");
  const [submitFileUrl,  setSubmitFileUrl]  = useState("");
  const [submitFile,     setSubmitFile]     = useState<File | null>(null);
  const [uploading,      setUploading]      = useState(false);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [submitError,    setSubmitError]    = useState("");
  const [deletingId,     setDeletingId]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    api
      .get("/api/assignments/my")
      .then(({ data }) => {
        const raw: any[] = data.data?.assignments ?? data.data ?? [];

        if (raw.length === 0 && process.env.NODE_ENV === "development") {
          setAssignments([
            {
              id: "demo-1",
              title: "Demo Assignment - React Components",
              course: "Complete React Developer Bootcamp",
              dueDate: new Date(Date.now() + 86400000).toISOString(),
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
              dueDate: new Date(Date.now() + 172800000).toISOString(),
              submittedAt: null,
              status: "pending",
              marks: null,
              totalMarks: 100,
              feedback: null,
            },
          ]);
          return;
        }

        const mapped: StudentAssignmentFeedback[] = raw.map((assignment: any) => {
          const submission = assignment.my_submission ?? null;
          const grade      = submission?.grade ?? null;
          const status     = getSubmissionStatus(submission?.status, grade);

          return {
            id:          assignment.id,
            title:       assignment.title,
            // Fixed: course now comes from assignment.course.title (not lesson.section.course)
            course:      assignment.course?.title ?? "Unknown Course",
            dueDate:     assignment.due_date ?? new Date().toISOString(),
            submittedAt: submission?.submitted_at ?? null,
            status,
            marks:       grade,
            totalMarks:  assignment.total_marks ?? 100,
            feedback:    submission?.feedback ?? null,
          };
        });

        setAssignments(mapped);
      })
      .catch(() => setError("Failed to load assignments."))
      .finally(() => setLoading(false));
  }, []);

  // ── Submission handlers ────────────────────────────────────────────────────

  function openSubmitModal(a: StudentAssignmentFeedback) {
    setSubmittingAssignment(a);
    setSubmitContent("");
    setSubmitFileUrl("");
    setSubmitFile(null);
    setSubmitError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function closeSubmitModal() {
    setSubmittingAssignment(null);
    setSubmitContent("");
    setSubmitFileUrl("");
    setSubmitFile(null);
    setSubmitError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSubmitFile(f);
    setUploading(true);
    setSubmitError("");
    try {
      const form = new FormData();
      form.append("file", f);
      const { data } = await api.post("/api/upload/cloudinary", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitFileUrl(data.url ?? data.data?.url ?? "");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? "File upload failed");
      setSubmitFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!submittingAssignment) return;
    if (!submitContent.trim() && !submitFileUrl) {
      setSubmitError("Please provide text content or upload a file.");
      return;
    }

    setSubmitError("");
    setSubmitLoading(true);
    try {
      await api.post(`/api/assignments/${submittingAssignment.id}/submit`, {
        content:  submitContent.trim() || undefined,
        file_url: submitFileUrl || undefined,
      });
      setAssignments(prev =>
        prev.map(a =>
          a.id === submittingAssignment.id
            ? { ...a, status: "submitted" as SubmissionStatus, submittedAt: new Date().toISOString() }
            : a
        )
      );
      closeSubmitModal();
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ?? "Failed to submit assignment"
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDeleteSubmission(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/api/assignments/${id}/submission`);
      setAssignments(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, status: "pending" as SubmissionStatus, submittedAt: null }
            : a
        )
      );
    } catch {
      // no-op — row state unchanged on failure
    } finally {
      setDeletingId(null);
    }
  }

  // ── Derived data (unchanged logic) ────────────────────────────────────────

  const counts = useMemo(() => {
    const graded  = assignments.filter(a => a.status === "graded").length;
    const pending = assignments.filter(
      a => a.status === "pending" || a.status === "submitted"
    ).length;
    return { total: assignments.length, graded, pending };
  }, [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search) ||
        a.course.toLowerCase().includes(search) ||
        a.feedback?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "graded" && a.status === "graded") ||
        (statusFilter === "pending" &&
          (a.status === "pending" || a.status === "submitted"));

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  // ── Loading state (unchanged) ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1">
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

        {/* Filter buttons (unchanged) */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all",    label: "All" },
              { key: "graded", label: "Graded" },
              { key: "pending", label: "Pending" },
            ].map(item => (
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
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Assignment
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Course
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Due Date
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Submitted
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
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(assignment => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                      onSubmit={openSubmitModal}
                      onDelete={handleDeleteSubmission}
                      deletingId={deletingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Submission Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!submittingAssignment}
        onClose={closeSubmitModal}
        title="Submit Assignment"
        size="lg"
      >
        {submittingAssignment && (
          <div className="space-y-5">
            {submitError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Assignment info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                {submittingAssignment.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {submittingAssignment.course}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Due {formatDate(submittingAssignment.dueDate)}
              </p>
            </div>

            {/* Text content */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Answer{" "}
                <span className="text-slate-400 font-normal">
                  (optional if uploading a file)
                </span>
              </label>
              <textarea
                value={submitContent}
                onChange={e => setSubmitContent(e.target.value)}
                placeholder="Write your submission here…"
                rows={5}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Attachment{" "}
                <span className="text-slate-400 font-normal">
                  (optional if providing text)
                </span>
              </label>
              <input
                ref={fileRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : submitFile ? (
                  <>
                    <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="truncate max-w-xs text-slate-700 font-medium">
                      {submitFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Click to upload file
                  </>
                )}
              </button>
              {submitFileUrl && !uploading && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  File uploaded successfully
                </p>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={closeSubmitModal}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitLoading || uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Export (unchanged) ───────────────────────────────────────────────────────

export default function Page() {
  return (
    <Suspense>
      <StudentAssignmentsPage />
    </Suspense>
  );
}
