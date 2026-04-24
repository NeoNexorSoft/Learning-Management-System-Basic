"use client";

import { useEffect, useMemo, useState } from "react";
import type { Assignment, Result } from "@/types/index";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
  Award,
  Bell,
  FileCheck2,
  GraduationCap,
  MessageSquareText,
  Megaphone,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/shared/TopBar";
import StatCard from "@/components/shared/StatCard";
import AreaChart from "@/components/shared/AreaChart";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

const activityData = [
  { week: "Wk 1", hours: 4 },
  { week: "Wk 2", hours: 6 },
  { week: "Wk 3", hours: 5 },
  { week: "Wk 4", hours: 9 },
  { week: "Wk 5", hours: 7 },
  { week: "Wk 6", hours: 11 },
  { week: "Wk 7", hours: 8 },
  { week: "Wk 8", hours: 13 },
];

interface EnrolledCourse {
  id: string;
  title: string;
  teacher: string;
  progress: number;
  category: string;
  status: "in-progress" | "completed";
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
}

type ActivityType =
  | "lesson_completed"
  | "assignment_submitted"
  | "assignment_graded"
  | "certificate_earned"
  | "enrollment";

interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
}

const activityConfig: Record<
  ActivityType,
  {
    label: string;
    icon: typeof CheckCircle2;
    iconBg: string;
    iconColor: string;
  }
> = {
  lesson_completed: {
    label: "Lesson Completed",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  assignment_submitted: {
    label: "Assignment Submitted",
    icon: ClipboardList,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  assignment_graded: {
    label: "Assignment Graded",
    icon: FileCheck2,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  certificate_earned: {
    label: "Certificate Earned",
    icon: Award,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  enrollment: {
    label: "New Enrollment",
    icon: UserPlus,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
};

function getArrayPayload(response: any, keys: string[] = []) {
  const data = response?.data?.data ?? response?.data;

  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTimestamp(value: string | null | undefined) {
  const date = value ? new Date(value).getTime() : 0;
  return Number.isNaN(date) ? 0 : date;
}

function CourseCard({ course }: { course: EnrolledCourse }) {
  const gradients: Record<string, string> = {
    "Web Development": "from-blue-400 to-indigo-600",
    Programming: "from-blue-400 to-indigo-600",
    Design: "from-pink-400 to-rose-600",
    "Data Science": "from-cyan-400 to-blue-600",
    CS: "from-purple-400 to-violet-600",
  };

  const emojis: Record<string, string> = {
    "Web Development": "💻",
    Programming: "💻",
    Design: "🎨",
    "Data Science": "📈",
    CS: "🔬",
  };

  const gradient = gradients[course.category] ?? "from-slate-400 to-slate-600";
  const emoji = emojis[course.category] ?? "📚";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-28 w-full object-cover"
        />
      ) : (
        <div
          className={`bg-gradient-to-br ${gradient} h-28 flex items-center justify-center`}
        >
          <span className="text-5xl">{emoji}</span>
        </div>
      )}

      <div className="p-4">
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
            course.status === "completed"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {course.status === "completed" ? "Completed" : "In Progress"}
        </span>

        <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h4>

        <p className="text-xs text-slate-500 mb-3">by {course.teacher}</p>

        <div className="mb-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
            <span className="font-semibold text-slate-700">
              {course.progress}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                course.progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: Clock,
    },
    submitted: {
      label: "Submitted",
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: CheckCircle2,
    },
    graded: {
      label: "Graded",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      icon: CheckCircle2,
    },
  };

  const cfg = statusConfig[assignment.status];
  const StatusIcon = cfg.icon;
  const isOverdue =
    assignment.status === "pending" &&
    new Date(assignment.dueDate) < new Date();

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          {isOverdue && (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span className="font-medium text-slate-800 text-sm">
            {assignment.title}
          </span>
        </div>
      </td>

      <td className="py-3.5 px-4 text-sm text-slate-500 hidden sm:table-cell">
        {assignment.course}
      </td>

      <td className="py-3.5 px-4 text-sm text-slate-500 hidden md:table-cell">
        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
          {new Date(assignment.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
        >
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </td>

      <td className="py-3.5 px-4 text-sm font-medium text-slate-700 hidden lg:table-cell">
        {assignment.marks !== null
          ? `${assignment.marks}/${assignment.totalMarks}`
          : "—"}
      </td>
    </tr>
  );
}

function ResultCard({ result }: { result: Result }) {
  const gradeColors: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-700",
    A: "bg-emerald-100 text-emerald-700",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
  };

  const gradeStyle =
    gradeColors[result.grade] ??
    gradeColors[result.grade.charAt(0)] ??
    "bg-slate-100 text-slate-700";

  const pct = Math.round((result.marks / result.totalMarks) * 100);

  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <p className="font-semibold text-slate-900 text-sm truncate">
          {result.assignment}
        </p>
        <p className="text-xs text-slate-500 truncate">{result.course}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">
            {result.marks}/{result.totalMarks}
          </p>
          <p className="text-xs text-slate-400">{pct}%</p>
        </div>

        <span
          className={`text-sm font-bold px-2.5 py-1 rounded-lg ${gradeStyle}`}
        >
          {result.grade}
        </span>
      </div>
    </div>
  );
}

function ActivityItemRow({ item }: { item: ActivityFeedItem }) {
  const config = activityConfig[item.type];
  const Icon = config.icon;

  const content = (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div
        className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="font-semibold text-slate-900 text-sm truncate">
            {item.title}
          </p>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {item.description}
        </p>

        <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {config.label}
        </span>
      </div>
    </div>
  );

  if (!item.href) return content;

  return (
    <Link
      href={item.href}
      className="block hover:bg-slate-50 transition-colors rounded-xl px-2 -mx-2"
    >
      {content}
    </Link>
  );
}

function AnnouncementRow({
  announcement,
  onMarkRead,
}: {
  announcement: AnnouncementItem;
  onMarkRead: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onMarkRead(announcement.id)}
      className="w-full text-left flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl px-2 -mx-2"
    >
      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Megaphone className="w-4 h-4 text-indigo-600" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-900 text-sm line-clamp-1">
            {announcement.title}
          </p>

          {announcement.unread && (
            <span className="text-[10px] uppercase tracking-wide bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
              Unread
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {announcement.message}
        </p>

        <p className="text-xs text-slate-400 mt-2">
          {formatRelativeTime(announcement.date)}
        </p>
      </div>
    </button>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [feedTab, setFeedTab] = useState<"activity" | "announcements">(
    "activity",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [
          statsRes,
          enrollRes,
          assignRes,
          notificationRes,
          certificateRes,
        ] = await Promise.allSettled([
          api.get("/api/users/student/stats"),
          api.get("/api/enrollments/my"),
          api.get("/api/assignments/my"),
          api.get("/api/notifications/my"),
          api.get("/api/certificates/my"),
        ]);

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data.data);
        }

        const enrollments: any[] =
          enrollRes.status === "fulfilled"
            ? getArrayPayload(enrollRes.value, ["enrollments"])
            : [];

        const mappedCourses: EnrolledCourse[] = enrollments.map((e: any) => {
          const totalLessons =
            e.course?.sections?.reduce(
              (sum: number, section: any) =>
                sum + (section.lessons?.length ?? 0),
              0,
            ) ?? 0;

          const completedLessons = Math.round(
            (e.progress / 100) * (totalLessons || 1),
          );

          return {
            id: e.id,
            title: e.course?.title ?? "Untitled",
            teacher: e.course?.teacher?.name ?? "Unknown",
            progress: e.progress ?? 0,
            category: e.course?.category?.name ?? "General",
            status: e.status === "COMPLETED" ? "completed" : "in-progress",
            thumbnail: e.course?.thumbnail ?? "",
            totalLessons,
            completedLessons,
          };
        });

        setCourses(mappedCourses);

        const rawAssignments: any[] =
          assignRes.status === "fulfilled"
            ? getArrayPayload(assignRes.value, ["assignments"])
            : [];

        const mappedAssignments: Assignment[] = rawAssignments.map(
          (assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            course:
              assignment.lesson?.section?.course?.title ?? "Unknown Course",
            dueDate: assignment.due_date ?? new Date().toISOString(),
            status: assignment.submission
              ? assignment.submission.grade !== null
                ? "graded"
                : "submitted"
              : "pending",
            marks: assignment.submission?.grade ?? null,
            totalMarks: assignment.total_marks ?? 100,
          }),
        );

        setAssignments(mappedAssignments);

        const gradedAssignments = mappedAssignments.filter(
          (assignment) => assignment.status === "graded",
        );

        const mappedResults: Result[] = gradedAssignments.map((assignment) => {
          const percentage =
            assignment.marks !== null
              ? (assignment.marks / assignment.totalMarks) * 100
              : 0;

          const grade =
            percentage >= 90
              ? "A+"
              : percentage >= 80
                ? "A"
                : percentage >= 70
                  ? "B+"
                  : percentage >= 60
                    ? "B"
                    : "C";

          return {
            id: assignment.id,
            course: assignment.course,
            assignment: assignment.title,
            marks: assignment.marks!,
            totalMarks: assignment.totalMarks,
            grade,
            date: new Date().toISOString(),
          };
        });

        setResults(mappedResults);

        const certificates: any[] =
          certificateRes.status === "fulfilled"
            ? getArrayPayload(certificateRes.value, ["certificates"])
            : [];

        const notifications: any[] =
          notificationRes.status === "fulfilled"
            ? getArrayPayload(notificationRes.value, ["notifications"])
            : [];

        const enrollmentActivities: ActivityFeedItem[] = enrollments.map(
          (enrollment: any) => ({
            id: `enrollment-${enrollment.id}`,
            type: "enrollment",
            title: "Enrolled in a course",
            description: enrollment.course?.title ?? "New course enrollment",
            timestamp:
              enrollment.created_at ??
              enrollment.enrolled_at ??
              enrollment.updated_at ??
              new Date().toISOString(),
            href: "/student/courses",
          }),
        );

        const assignmentActivities: ActivityFeedItem[] = rawAssignments
          .filter((assignment: any) => assignment.submission)
          .map((assignment: any) => {
            const isGraded =
              assignment.submission?.grade !== null &&
              assignment.submission?.grade !== undefined;

            return {
              id: `assignment-${assignment.id}`,
              type: isGraded ? "assignment_graded" : "assignment_submitted",
              title: isGraded ? "Assignment graded" : "Assignment submitted",
              description: `${assignment.title} · ${
                assignment.lesson?.section?.course?.title ?? "Unknown Course"
              }`,
              timestamp:
                assignment.submission?.updated_at ??
                assignment.submission?.submitted_at ??
                assignment.updated_at ??
                new Date().toISOString(),
              href: "/student/assignments",
            };
          });

        const certificateActivities: ActivityFeedItem[] = certificates.map(
          (certificate: any) => ({
            id: `certificate-${certificate.id}`,
            type: "certificate_earned",
            title: "Certificate earned",
            description:
              certificate.course?.title ??
              certificate.course_title ??
              "You earned a new certificate",
            timestamp:
              certificate.issued_at ??
              certificate.created_at ??
              certificate.updated_at ??
              new Date().toISOString(),
            href: "/student/certificates",
          }),
        );

        const lessonActivities: ActivityFeedItem[] = enrollments
          .filter((enrollment: any) => Number(enrollment.progress ?? 0) > 0)
          .map((enrollment: any) => ({
            id: `lesson-progress-${enrollment.id}`,
            type: "lesson_completed",
            title: "Learning progress updated",
            description: `${enrollment.progress ?? 0}% completed · ${
              enrollment.course?.title ?? "Unknown Course"
            }`,
            timestamp:
              enrollment.updated_at ??
              enrollment.created_at ??
              new Date().toISOString(),
            href: "/student/courses",
          }));

        const latestActivities = [
          ...lessonActivities,
          ...assignmentActivities,
          ...certificateActivities,
          ...enrollmentActivities,
        ]
          .sort((a, b) => getTimestamp(b.timestamp) - getTimestamp(a.timestamp))
          .slice(0, 10);

        setActivities(latestActivities);

        const mappedAnnouncements: AnnouncementItem[] = notifications
          .filter(
            (notification: any) =>
              notification.sender_id || notification.sender?.id,
          )
          .map((notification: any) => ({
            id: notification.id,
            title: notification.title ?? "Announcement",
            message: notification.message ?? notification.body ?? "",
            date:
              notification.created_at ??
              notification.updated_at ??
              new Date().toISOString(),
            unread: !(
              notification.read_at ||
              notification.is_read ||
              notification.read
            ),
          }))
          .sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date))
          .slice(0, 10);

        setAnnouncements(mappedAnnouncements);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const unreadAnnouncements = useMemo(
    () => announcements.filter((announcement) => announcement.unread).length,
    [announcements],
  );

  async function handleMarkAnnouncementRead(id: string) {
    setAnnouncements((items) =>
      items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );

    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch {
      // Optimistic UI only. If the API fails, dashboard remains usable.
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search courses, assignments…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search courses, assignments…" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const pendingAssignments = stats?.pendingAssignments ?? 0;
  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, result) => sum + (result.marks / result.totalMarks) * 100,
            0,
          ) / results.length,
        )
      : 0;

  const activeFeed = feedTab === "activity" ? activities : announcements;

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search courses, assignments…" />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back, {firstName}! 👋
          </h1>

          <p className="text-slate-500 mt-1">
            You have{" "}
            <span className="font-semibold text-indigo-600">
              {pendingAssignments} pending assignment
              {pendingAssignments !== 1 ? "s" : ""}
            </span>{" "}
            due soon. Keep up the great work!
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Enrolled Courses"
            value={stats?.enrolledCourses ?? 0}
            sub="Active learning paths"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />

          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats?.completedCourses ?? 0}
            sub="Courses finished"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <StatCard
            icon={ClipboardList}
            label="Pending Tasks"
            value={pendingAssignments}
            sub="Assignments due soon"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />

          <StatCard
            icon={TrendingUp}
            label="Avg Score"
            value={`${avgScore}%`}
            sub="Across all assignments"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">My Courses</h2>

              <Link
                href="/student/courses"
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No courses enrolled yet.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {courses.slice(0, 3).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Recent Results
              </h2>

              <Link
                href="/student/results"
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2">
              {results.length > 0 ? (
                results.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No results yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Activity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest learning updates and announcements
                </p>
              </div>

              <Link
                href={
                  feedTab === "activity"
                    ? "/student/assignments"
                    : "/student/notifications"
                }
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 p-3">
                <button
                  type="button"
                  onClick={() => setFeedTab("activity")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    feedTab === "activity"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Activity
                </button>

                <button
                  type="button"
                  onClick={() => setFeedTab("announcements")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    feedTab === "announcements"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquareText className="w-4 h-4" />
                  Announcements
                  {unreadAnnouncements > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        feedTab === "announcements"
                          ? "bg-white text-indigo-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {unreadAnnouncements}
                    </span>
                  )}
                </button>
              </div>

              <div className="px-5 py-2">
                {feedTab === "activity" ? (
                  activities.length > 0 ? (
                    activities.map((activity) => (
                      <ActivityItemRow key={activity.id} item={activity} />
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">
                        No recent activity yet.
                      </p>
                    </div>
                  )
                ) : announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <AnnouncementRow
                      key={announcement.id}
                      announcement={announcement}
                      onMarkRead={handleMarkAnnouncementRead}
                    />
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      No announcements yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AreaChart
            data={activityData}
            xKey="week"
            dataKey="hours"
            gradientId="studentActivity"
            title="Learning Activity"
            subtitle="Hours studied per week"
            badge="Last 8 Weeks"
            tooltipSuffix="h"
            tooltipLabel="Study time"
          />
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Assignments
              </h2>

              <Link
                href="/student/assignments"
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full">
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
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Marks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400 text-sm"
                      >
                        No assignments yet.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <AssignmentRow
                        key={assignment.id}
                        assignment={assignment}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
