"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Filter,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Search,
  Send,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { routineTrackerApi } from "@/lib/routineTrackerApi";
import type {
  CreateRecommendationPayload,
  RoutineTask,
  RoutineTaskStatus,
  RoutineTrackerOverview,
  StudentWeakness,
  TeacherStudentTrackerProfile,
  TeacherTrackerStudent,
  WeaknessLevel,
} from "@/types/routine-tracker";

type ViewMode = "monitoring" | "analytics" | "recommendations" | "progress";

const MOCK_STUDENTS: TeacherTrackerStudent[] = [
  { id: "s-1", name: "Alice Brown", email: "alice@neonexor.com", courses: [{ id: "c-1", title: "Mathematics" }] },
  { id: "s-2", name: "David Khan", email: "david@neonexor.com", courses: [{ id: "c-1", title: "Mathematics" }, { id: "c-2", title: "Physics" }] },
  { id: "s-3", name: "Nadia Islam", email: "nadia@neonexor.com", courses: [{ id: "c-3", title: "English" }] },
  { id: "s-4", name: "Rafi Ahmed", email: "rafi@neonexor.com", courses: [{ id: "c-2", title: "Physics" }] },
];

const MOCK_WEAKNESSES: Record<string, StudentWeakness[]> = {
  "s-1": [
    { id: "w-1", score: 42, level: "HIGH", category: { id: "cat-math", name: "Mathematics" } },
    { id: "w-2", score: 52, level: "MEDIUM", category: { id: "cat-phy", name: "Physics" } },
    { id: "w-3", score: 78, level: "LOW", category: { id: "cat-eng", name: "English" } },
  ],
  "s-2": [
    { id: "w-4", score: 46, level: "HIGH", category: { id: "cat-che", name: "Chemistry" } },
    { id: "w-5", score: 58, level: "MEDIUM", category: { id: "cat-math", name: "Mathematics" } },
    { id: "w-6", score: 74, level: "LOW", category: { id: "cat-bio", name: "Biology" } },
  ],
  "s-3": [
    { id: "w-7", score: 68, level: "LOW", category: { id: "cat-eng", name: "English" } },
    { id: "w-8", score: 62, level: "MEDIUM", category: { id: "cat-ban", name: "Bangla" } },
  ],
  "s-4": [
    { id: "w-9", score: 39, level: "HIGH", category: { id: "cat-phy", name: "Physics" } },
    { id: "w-10", score: 44, level: "HIGH", category: { id: "cat-math", name: "Mathematics" } },
  ],
};

const MOCK_ROUTINES: Record<string, RoutineTask[]> = {
  "s-1": [
    { id: "t-1", subject: "Mathematics", topic: "Algebra", date: "2025-05-21", start_time: "2025-05-21T06:00:00", end_time: "2025-05-21T07:00:00", status: "MISSED", task_type: "PRACTICE" },
    { id: "t-2", subject: "Physics", topic: "Newton's Laws", date: "2025-05-21", start_time: "2025-05-21T08:00:00", end_time: "2025-05-21T09:00:00", status: "COMPLETED", task_type: "READING" },
    { id: "t-3", subject: "English", topic: "Grammar", date: "2025-05-22", start_time: "2025-05-22T16:00:00", end_time: "2025-05-22T17:00:00", status: "UPCOMING", task_type: "READING" },
  ],
  "s-2": [
    { id: "t-4", subject: "Chemistry", topic: "Bonding", date: "2025-05-21", start_time: "2025-05-21T07:00:00", end_time: "2025-05-21T08:00:00", status: "PENDING", task_type: "REVISION" },
    { id: "t-5", subject: "Mathematics", topic: "Trigonometry", date: "2025-05-22", start_time: "2025-05-22T18:00:00", end_time: "2025-05-22T19:00:00", status: "COMPLETED", task_type: "PRACTICE" },
  ],
  "s-3": [
    { id: "t-6", subject: "English", topic: "Reading", date: "2025-05-21", start_time: "2025-05-21T06:30:00", end_time: "2025-05-21T07:30:00", status: "COMPLETED", task_type: "READING" },
    { id: "t-7", subject: "Bangla", topic: "Essay", date: "2025-05-23", start_time: "2025-05-23T16:00:00", end_time: "2025-05-23T17:00:00", status: "UPCOMING", task_type: "PRACTICE" },
  ],
  "s-4": [
    { id: "t-8", subject: "Physics", topic: "Mechanics", date: "2025-05-20", start_time: "2025-05-20T07:00:00", end_time: "2025-05-20T08:00:00", status: "MISSED", task_type: "PRACTICE" },
    { id: "t-9", subject: "Mathematics", topic: "Geometry", date: "2025-05-21", start_time: "2025-05-21T19:00:00", end_time: "2025-05-21T20:00:00", status: "MISSED", task_type: "PRACTICE" },
  ],
};

const MOCK_OVERVIEWS: Record<string, RoutineTrackerOverview> = {
  "s-1": { todayStudyPlan: { total: 3, completed: 1 }, overallPerformance: 33, weakSubjects: 2, strongestSubject: { subject: "English", score: 78 } },
  "s-2": { todayStudyPlan: { total: 2, completed: 1 }, overallPerformance: 50, weakSubjects: 2, strongestSubject: { subject: "Biology", score: 74 } },
  "s-3": { todayStudyPlan: { total: 2, completed: 1 }, overallPerformance: 72, weakSubjects: 1, strongestSubject: { subject: "English", score: 68 } },
  "s-4": { todayStudyPlan: { total: 2, completed: 0 }, overallPerformance: 18, weakSubjects: 2, strongestSubject: { subject: "Mathematics", score: 44 } },
};

const WEEKLY_PROGRESS = [
  { day: "Mon", completion: 55 },
  { day: "Tue", completion: 61 },
  { day: "Wed", completion: 58 },
  { day: "Thu", completion: 69 },
  { day: "Fri", completion: 74 },
  { day: "Sat", completion: 71 },
  { day: "Sun", completion: 78 },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getCategoryName(weakness: StudentWeakness) {
  return weakness.category?.name ?? "Subject";
}

function getTaskDate(task: RoutineTask) {
  const parsed = new Date(task.date);
  if (Number.isNaN(parsed.getTime())) return task.date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTaskTime(task: RoutineTask) {
  const start = task.start_time ?? task.startTime;
  const end = task.end_time ?? task.endTime;
  const format = (value?: string | null) => {
    if (!value) return "--";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "--";
    return parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };
  return `${format(start)} - ${format(end)}`;
}

function completionRate(tasks: RoutineTask[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "COMPLETED").length / tasks.length) * 100);
}

function riskFromWeaknesses(weaknesses: StudentWeakness[], rate: number): WeaknessLevel {
  if (weaknesses.some((weakness) => weakness.level === "HIGH") || rate < 40) return "HIGH";
  if (weaknesses.some((weakness) => weakness.level === "MEDIUM") || rate < 70) return "MEDIUM";
  return "LOW";
}

function riskClass(level: WeaknessLevel) {
  if (level === "HIGH") return "bg-rose-50 text-rose-600 border-rose-100";
  if (level === "MEDIUM") return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-emerald-50 text-emerald-600 border-emerald-100";
}

function statusClass(status: RoutineTaskStatus) {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-600";
  if (status === "MISSED") return "bg-rose-50 text-rose-600";
  if (status === "PENDING") return "bg-blue-50 text-blue-600";
  return "bg-amber-50 text-amber-600";
}

function subjectTone(subject: string) {
  const key = subject.toLowerCase();
  if (key.includes("math")) return "bg-violet-50 text-violet-700 border-violet-100";
  if (key.includes("physics")) return "bg-sky-50 text-sky-700 border-sky-100";
  if (key.includes("chem")) return "bg-orange-50 text-orange-700 border-orange-100";
  if (key.includes("english")) return "bg-teal-50 text-teal-700 border-teal-100";
  if (key.includes("bangla")) return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
}

function makeMockProfiles(): TeacherStudentTrackerProfile[] {
  return MOCK_STUDENTS.map((student) => {
    const routine = MOCK_ROUTINES[student.id] ?? [];
    const rate = completionRate(routine);
    const weaknesses = MOCK_WEAKNESSES[student.id] ?? [];
    return {
      student,
      overview: MOCK_OVERVIEWS[student.id],
      routine,
      weaknesses,
      completionRate: rate,
      riskLevel: riskFromWeaknesses(weaknesses, rate),
    };
  });
}

function aggregateSubjectWeakness(profiles: TeacherStudentTrackerProfile[]) {
  const map = new Map<string, { subject: string; total: number; count: number; high: number; medium: number; low: number }>();
  profiles.forEach((profile) => {
    profile.weaknesses.forEach((weakness) => {
      const subject = getCategoryName(weakness);
      const item = map.get(subject) ?? { subject, total: 0, count: 0, high: 0, medium: 0, low: 0 };
      item.total += weakness.score;
      item.count += 1;
      if (weakness.level === "HIGH") item.high += 1;
      if (weakness.level === "MEDIUM") item.medium += 1;
      if (weakness.level === "LOW") item.low += 1;
      map.set(subject, item);
    });
  });
  return Array.from(map.values()).map((item) => ({ ...item, avgScore: Math.round(item.total / item.count) })).sort((a, b) => a.avgScore - b.avgScore);
}

function StatCard({ icon: Icon, label, value, meta, tone }: { icon: ElementType; label: string; value: string; meta: string; tone: "purple" | "green" | "orange" | "rose" }) {
  const tones = {
    purple: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{meta}</p>
        </div>
      </div>
    </div>
  );
}

function StudentMonitorCard({ profile, selected, onSelect }: { profile: TeacherStudentTrackerProfile; selected: boolean; onSelect: () => void }) {
  const weakest = [...profile.weaknesses].sort((a, b) => a.score - b.score)[0];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md ${selected ? "border-violet-400 ring-2 ring-violet-100" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-500 text-sm font-bold text-white">
            {initials(profile.student.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{profile.student.name}</p>
            <p className="truncate text-xs text-slate-500">{profile.student.courses?.map((course) => course.title).join(", ") || profile.student.email}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${riskClass(profile.riskLevel)}`}>{profile.riskLevel}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-base font-extrabold text-slate-900">{profile.overview.overallPerformance}%</p>
          <p className="text-[10px] font-semibold text-slate-500">Performance</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-base font-extrabold text-slate-900">{profile.completionRate}%</p>
          <p className="text-[10px] font-semibold text-slate-500">Routine</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-base font-extrabold text-slate-900">{profile.overview.weakSubjects}</p>
          <p className="text-[10px] font-semibold text-slate-500">Weak</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500">Weakest subject</span>
        <span className="font-bold text-slate-800">{weakest ? `${getCategoryName(weakest)} (${weakest.score}%)` : "Not found"}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-violet-600" style={{ width: `${profile.completionRate}%` }} />
      </div>
    </button>
  );
}

function RecommendationComposer({ profile, onCreated }: { profile: TeacherStudentTrackerProfile | null; onCreated: () => void }) {
  const [title, setTitle] = useState("Focus on weak subject practice");
  const [description, setDescription] = useState("Add one extra practice session and review mistakes after each class.");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");
  const [saving, setSaving] = useState(false);
  const weakest = profile ? [...profile.weaknesses].sort((a, b) => a.score - b.score)[0] : null;

  useEffect(() => {
    if (weakest) {
      setTitle(`Focus on ${getCategoryName(weakest)}`);
      setDescription(`Current score is ${weakest.score}%. Recommend targeted practice and short revision sessions.`);
      setPriority(weakest.level === "HIGH" ? "HIGH" : weakest.level === "MEDIUM" ? "MEDIUM" : "LOW");
    }
  }, [profile?.student.id, weakest?.id]);

  const submit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const payload: CreateRecommendationPayload = {
        category_id: weakest?.category?.id ?? undefined,
        title,
        description,
        priority,
        action_label: "Study Now",
      };
      await routineTrackerApi.createTeacherStudentRecommendation(profile.student.id, payload);
      onCreated();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Teacher Recommendation</h3>
          <p className="text-xs text-slate-500">Create a targeted action for the selected student.</p>
        </div>
        <Lightbulb className="h-5 w-5 text-violet-600" />
      </div>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          placeholder="Recommendation title"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          placeholder="Recommendation details"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
          <button
            type="button"
            onClick={submit}
            disabled={!profile || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackBox({ profile }: { profile: TeacherStudentTrackerProfile | null }) {
  const [message, setMessage] = useState("Please follow the recommended routine and complete the missed sessions this week.");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await routineTrackerApi.createTeacherStudentFeedback(profile.student.id, { message });
      setMessage("");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquarePlus className="h-5 w-5 text-violet-600" />
        <h3 className="text-base font-bold text-slate-900">Progress Feedback</h3>
      </div>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        placeholder="Write feedback for the student"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!profile || saving || !message.trim()}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Save Feedback
      </button>
    </div>
  );
}

export default function TeacherRoutineTracker() {
  const [profiles, setProfiles] = useState<TeacherStudentTrackerProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("monitoring");
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const loadTeacherTracker = async () => {
    setLoading(true);
    setUsingMock(false);
    try {
      const students = await routineTrackerApi.getTeacherStudents();
      if (!students.length) throw new Error("No assigned students returned from API");
      const loadedProfiles = await Promise.all(
        students.map(async (student) => {
          const [overview, weaknesses, routine] = await Promise.all([
            routineTrackerApi.getTeacherStudentOverview(student.id),
            routineTrackerApi.getTeacherStudentWeaknesses(student.id),
            routineTrackerApi.getTeacherStudentRoutine(student.id),
          ]);
          const rate = completionRate(routine);
          return {
            student,
            overview,
            weaknesses,
            routine,
            completionRate: rate,
            riskLevel: riskFromWeaknesses(weaknesses, rate),
          } satisfies TeacherStudentTrackerProfile;
        }),
      );
      setProfiles(loadedProfiles);
      setSelectedStudentId((current) => current || loadedProfiles[0]?.student.id || "");
    } catch (error) {
      console.error(error);
      const mockProfiles = makeMockProfiles();
      setProfiles(mockProfiles);
      setSelectedStudentId((current) => current || mockProfiles[0]?.student.id || "");
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeacherTracker();
  }, []);

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((profile) => profile.student.courses?.forEach((course) => map.set(course.id, course.title)));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesSearch = !query || profile.student.name.toLowerCase().includes(query) || profile.student.email.toLowerCase().includes(query);
      const matchesCourse = courseFilter === "all" || profile.student.courses?.some((course) => course.id === courseFilter);
      return matchesSearch && matchesCourse;
    });
  }, [profiles, search, courseFilter]);

  const selectedProfile = profiles.find((profile) => profile.student.id === selectedStudentId) ?? filteredProfiles[0] ?? profiles[0] ?? null;
  const weakProfiles = profiles.filter((profile) => profile.riskLevel === "HIGH" || profile.riskLevel === "MEDIUM");
  const highRisk = profiles.filter((profile) => profile.riskLevel === "HIGH").length;
  const classAverage = profiles.length ? Math.round(profiles.reduce((sum, profile) => sum + profile.overview.overallPerformance, 0) / profiles.length) : 0;
  const avgCompletion = profiles.length ? Math.round(profiles.reduce((sum, profile) => sum + profile.completionRate, 0) / profiles.length) : 0;
  const subjectAnalytics = aggregateSubjectWeakness(profiles);
  const strongest = subjectAnalytics.length ? [...subjectAnalytics].sort((a, b) => b.avgScore - a.avgScore)[0] : null;
  const selectedWeaknessChart = selectedProfile?.weaknesses.map((weakness) => ({ subject: getCategoryName(weakness), score: weakness.score })) ?? [];
  const trendData = profiles.map((profile) => ({ name: profile.student.name.split(" ")[0], performance: profile.overview.overallPerformance, completion: profile.completionRate, weak: profile.overview.weakSubjects }));
  const recommendedActions = subjectAnalytics.slice(0, 3).map((item, index) => ({
    id: item.subject,
    title: index === 0 ? `Immediate support for ${item.subject}` : `Review ${item.subject} routine`,
    description: `${item.count} student${item.count > 1 ? "s" : ""} affected. Average score is ${item.avgScore}%.`,
    priority: item.avgScore < 50 ? "HIGH" : item.avgScore < 70 ? "MEDIUM" : "LOW",
  }));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Routine & Weakness Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor weak students, analyze class progress, and assign recommendations.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:w-72"
            />
          </div>
          <button
            type="button"
            onClick={loadTeacherTracker}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {usingMock && (
        <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Showing sample tracker data because live teacher tracker API data is not available yet.
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            ["monitoring", "Weak Student Monitoring"],
            ["analytics", "Class Analytics"],
            ["recommendations", "Recommendations"],
            ["progress", "Student Progress"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key as ViewMode)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${viewMode === key ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20" : "bg-white text-slate-500 hover:text-violet-700"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Assigned Students" value={String(profiles.length)} meta={`${weakProfiles.length} need attention`} tone="purple" />
        <StatCard icon={AlertTriangle} label="High Risk Students" value={String(highRisk)} meta="High weakness or low routine" tone="rose" />
        <StatCard icon={TrendingUp} label="Class Average" value={`${classAverage}%`} meta="Overall performance" tone="green" />
        <StatCard icon={CheckCircle2} label="Routine Completion" value={`${avgCompletion}%`} meta="Average completed sessions" tone="orange" />
      </div>

      {loading ? (
        <div className="flex min-h-105 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Weak Student Monitoring</h2>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">{filteredProfiles.length}</span>
              </div>
              <div className="space-y-3">
                {filteredProfiles.map((profile) => (
                  <StudentMonitorCard key={profile.student.id} profile={profile} selected={selectedProfile?.student.id === profile.student.id} onSelect={() => setSelectedStudentId(profile.student.id)} />
                ))}
                {!filteredProfiles.length && <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">No student found.</p>}
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            {selectedProfile && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-500 text-base font-extrabold text-white">
                      {initials(selectedProfile.student.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedProfile.student.name}</h2>
                      <p className="text-sm text-slate-500">{selectedProfile.student.email}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{selectedProfile.student.courses?.map((course) => course.title).join(" • ")}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center sm:min-w-90">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xl font-extrabold text-slate-900">{selectedProfile.overview.overallPerformance}%</p>
                      <p className="text-[11px] font-semibold text-slate-500">Performance</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xl font-extrabold text-slate-900">{selectedProfile.completionRate}%</p>
                      <p className="text-[11px] font-semibold text-slate-500">Routine</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xl font-extrabold text-slate-900">{selectedProfile.overview.weakSubjects}</p>
                      <p className="text-[11px] font-semibold text-slate-500">Weak Subjects</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "monitoring" && (
              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Subject Weakness Overview</h3>
                    <Target className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={selectedWeaknessChart}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#475569" }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                          <Radar dataKey="score" stroke="#6d5dfc" fill="#6d5dfc" fillOpacity={0.18} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold">Subject</th>
                            <th className="px-4 py-3 text-left font-bold">Score</th>
                            <th className="px-4 py-3 text-left font-bold">Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedProfile?.weaknesses.map((weakness) => (
                            <tr key={weakness.id}>
                              <td className="px-4 py-3 font-bold text-slate-800">{getCategoryName(weakness)}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">{weakness.score}%</td>
                              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskClass(weakness.level)}`}>{weakness.level}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Today's / Upcoming Routine</h3>
                  <div className="space-y-3">
                    {selectedProfile?.routine.slice(0, 5).map((task) => (
                      <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${subjectTone(task.subject)}`}>{task.subject}</span>
                            <p className="mt-2 text-sm font-bold text-slate-900">{task.topic || "Study Session"}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {getTaskDate(task)} • {getTaskTime(task)}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(task.status)}`}>{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === "analytics" && (
              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Class Analytics by Student</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="performance" radius={[8, 8, 0, 0]} fill="#6d5dfc" />
                        <Bar dataKey="completion" radius={[8, 8, 0, 0]} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Subject Weakness Distribution</h3>
                  <div className="space-y-3">
                    {subjectAnalytics.map((item) => (
                      <div key={item.subject} className="rounded-2xl border border-slate-100 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-bold text-slate-900">{item.subject}</p>
                          <p className="text-sm font-extrabold text-slate-900">{item.avgScore}% avg</p>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-violet-600" style={{ width: `${item.avgScore}%` }} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">High {item.high}</span>
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">Medium {item.medium}</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Low {item.low}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === "recommendations" && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Recommended Actions</h3>
                  <div className="space-y-3">
                    {recommendedActions.map((action) => (
                      <div key={action.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-xl ${action.priority === "HIGH" ? "bg-rose-50 text-rose-500" : action.priority === "MEDIUM" ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-500"}`}>
                            <Lightbulb className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{action.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => selectedProfile && setViewMode("recommendations")} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-3 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50">
                          Apply <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-5">
                  <RecommendationComposer profile={selectedProfile} onCreated={loadTeacherTracker} />
                  <FeedbackBox profile={selectedProfile} />
                </div>
              </div>
            )}

            {viewMode === "progress" && (
              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Student Progress Tracking</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={WEEKLY_PROGRESS}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="completion" stroke="#6d5dfc" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Routine Status Summary</h3>
                  <div className="space-y-4">
                    {(["COMPLETED", "UPCOMING", "PENDING", "MISSED"] as RoutineTaskStatus[]).map((status) => {
                      const count = selectedProfile?.routine.filter((task) => task.status === status).length ?? 0;
                      const total = selectedProfile?.routine.length || 1;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={status}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-bold text-slate-700">{status}</span>
                            <span className="font-extrabold text-slate-900">{count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-violet-600" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
