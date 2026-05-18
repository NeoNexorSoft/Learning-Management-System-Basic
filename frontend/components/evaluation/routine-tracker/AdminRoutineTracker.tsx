"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Gauge,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { routineTrackerApi } from "@/lib/routineTrackerApi";
import type {
  AdminStudentTrackerProfile,
  AdminTrackerOverview,
  AdminTrackerStudent,
  RoutineTrackerOverview,
  WeaknessLevel,
} from "@/types/routine-tracker";

type AdminTab = "dashboard" | "weakness" | "comparison" | "engagement" | "performance";

type ClassSummary = {
  className: string;
  students: number;
  avgPerformance: number;
  completionRate: number;
  highRisk: number;
};

const FALLBACK_OVERVIEW: AdminTrackerOverview = {
  students: 128,
  activePlans: 94,
  totalTasks: 1840,
  completedTasks: 1325,
  completionRate: 72,
  highWeaknesses: 31,
  activeCategories: 8,
};

const FALLBACK_STUDENTS: AdminTrackerStudent[] = [
  { id: "adm-s-1", name: "Alice Brown", email: "alice@neonexor.com", _count: { routineTasks: 26, studentWeaknesses: 3, trackerRecommendations: 4 } },
  { id: "adm-s-2", name: "David Khan", email: "david@neonexor.com", _count: { routineTasks: 22, studentWeaknesses: 4, trackerRecommendations: 5 } },
  { id: "adm-s-3", name: "Nadia Islam", email: "nadia@neonexor.com", _count: { routineTasks: 31, studentWeaknesses: 1, trackerRecommendations: 2 } },
  { id: "adm-s-4", name: "Rafi Ahmed", email: "rafi@neonexor.com", _count: { routineTasks: 18, studentWeaknesses: 5, trackerRecommendations: 6 } },
  { id: "adm-s-5", name: "Sadia Rahman", email: "sadia@neonexor.com", _count: { routineTasks: 28, studentWeaknesses: 2, trackerRecommendations: 3 } },
  { id: "adm-s-6", name: "Tanvir Hasan", email: "tanvir@neonexor.com", _count: { routineTasks: 20, studentWeaknesses: 3, trackerRecommendations: 4 } },
];

const FALLBACK_PROFILES: AdminStudentTrackerProfile[] = [
  {
    student: FALLBACK_STUDENTS[0],
    overview: { todayStudyPlan: { total: 5, completed: 3 }, overallPerformance: 68, weakSubjects: 2, strongestSubject: { subject: "English", score: 82 } },
    weaknesses: [],
    routine: [],
    completionRate: 72,
    riskLevel: "MEDIUM",
  },
  {
    student: FALLBACK_STUDENTS[1],
    overview: { todayStudyPlan: { total: 4, completed: 2 }, overallPerformance: 56, weakSubjects: 3, strongestSubject: { subject: "Biology", score: 76 } },
    weaknesses: [],
    routine: [],
    completionRate: 55,
    riskLevel: "HIGH",
  },
  {
    student: FALLBACK_STUDENTS[2],
    overview: { todayStudyPlan: { total: 6, completed: 5 }, overallPerformance: 84, weakSubjects: 1, strongestSubject: { subject: "Mathematics", score: 91 } },
    weaknesses: [],
    routine: [],
    completionRate: 86,
    riskLevel: "LOW",
  },
  {
    student: FALLBACK_STUDENTS[3],
    overview: { todayStudyPlan: { total: 4, completed: 1 }, overallPerformance: 42, weakSubjects: 4, strongestSubject: { subject: "Bangla", score: 63 } },
    weaknesses: [],
    routine: [],
    completionRate: 32,
    riskLevel: "HIGH",
  },
  {
    student: FALLBACK_STUDENTS[4],
    overview: { todayStudyPlan: { total: 5, completed: 4 }, overallPerformance: 77, weakSubjects: 1, strongestSubject: { subject: "English", score: 88 } },
    weaknesses: [],
    routine: [],
    completionRate: 79,
    riskLevel: "LOW",
  },
  {
    student: FALLBACK_STUDENTS[5],
    overview: { todayStudyPlan: { total: 3, completed: 2 }, overallPerformance: 61, weakSubjects: 2, strongestSubject: { subject: "Physics", score: 72 } },
    weaknesses: [],
    routine: [],
    completionRate: 66,
    riskLevel: "MEDIUM",
  },
];

const SUBJECT_WEAKNESS_DATA = [
  { subject: "Mathematics", high: 18, medium: 24, low: 31, avgScore: 51 },
  { subject: "Physics", high: 14, medium: 22, low: 37, avgScore: 58 },
  { subject: "Chemistry", high: 11, medium: 19, low: 43, avgScore: 63 },
  { subject: "Biology", high: 8, medium: 17, low: 48, avgScore: 68 },
  { subject: "English", high: 5, medium: 13, low: 55, avgScore: 78 },
  { subject: "Bangla", high: 7, medium: 15, low: 51, avgScore: 74 },
];

const MONTHLY_PERFORMANCE = [
  { month: "Jan", performance: 56, engagement: 48, completion: 52 },
  { month: "Feb", performance: 61, engagement: 57, completion: 59 },
  { month: "Mar", performance: 64, engagement: 63, completion: 65 },
  { month: "Apr", performance: 68, engagement: 69, completion: 71 },
  { month: "May", performance: 72, engagement: 74, completion: 76 },
  { month: "Jun", performance: 75, engagement: 78, completion: 80 },
];

const ENGAGEMENT_BREAKDOWN = [
  { name: "Completed", value: 72 },
  { name: "Pending", value: 18 },
  { name: "Missed", value: 10 },
];

const CLASS_COMPARISON: ClassSummary[] = [
  { className: "Class 6", students: 34, avgPerformance: 68, completionRate: 73, highRisk: 6 },
  { className: "Class 7", students: 31, avgPerformance: 72, completionRate: 78, highRisk: 4 },
  { className: "Class 8", students: 29, avgPerformance: 64, completionRate: 69, highRisk: 9 },
  { className: "Class 9", students: 27, avgPerformance: 76, completionRate: 81, highRisk: 3 },
];

function safeCount(student: AdminTrackerStudent, key: "routineTasks" | "studentWeaknesses" | "trackerRecommendations") {
  return student._count?.[key] ?? 0;
}

function completionRateFromOverview(overview: RoutineTrackerOverview) {
  const total = overview.todayStudyPlan.total || 0;
  if (!total) return Math.round(overview.overallPerformance);
  return Math.round((overview.todayStudyPlan.completed / total) * 100);
}

function riskFromProfile(overview: RoutineTrackerOverview, weaknessCount: number): WeaknessLevel {
  if (overview.overallPerformance < 50 || weaknessCount >= 4) return "HIGH";
  if (overview.overallPerformance < 70 || weaknessCount >= 2) return "MEDIUM";
  return "LOW";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function riskClass(level: WeaknessLevel) {
  if (level === "HIGH") return "bg-rose-50 text-rose-600 border-rose-100";
  if (level === "MEDIUM") return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-emerald-50 text-emerald-600 border-emerald-100";
}

function StatCard({ icon: Icon, label, value, meta, tone }: { icon: ElementType; label: string; value: string; meta: string; tone: "purple" | "green" | "orange" | "rose" | "blue" }) {
  const tones = {
    purple: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{meta}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <Gauge className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 text-sm font-semibold text-slate-700">No tracker data found yet</p>
      <p className="mt-1 text-xs text-slate-500">The dashboard will populate as students start using routines and weakness tracking.</p>
    </div>
  );
}

export default function AdminRoutineTracker() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [overview, setOverview] = useState<AdminTrackerOverview>(FALLBACK_OVERVIEW);
  const [students, setStudents] = useState<AdminTrackerStudent[]>(FALLBACK_STUDENTS);
  const [profiles, setProfiles] = useState<AdminStudentTrackerProfile[]>(FALLBACK_PROFILES);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncingStudentId, setSyncingStudentId] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadAdminTracker() {
      try {
        setLoading(true);
        setUsingFallback(false);
        const [adminOverview, adminStudents] = await Promise.all([
          routineTrackerApi.getAdminOverview(),
          routineTrackerApi.getAdminStudents(),
        ]);

        if (!alive) return;
        const normalizedStudents = adminStudents.length ? adminStudents : FALLBACK_STUDENTS;
        setOverview(adminOverview ?? FALLBACK_OVERVIEW);
        setStudents(normalizedStudents);

        const profileResponses = await Promise.allSettled(
          normalizedStudents.slice(0, 12).map(async (student) => {
            const studentOverview = await routineTrackerApi.getAdminStudentOverview(student.id);
            const rate = completionRateFromOverview(studentOverview);
            const riskLevel = riskFromProfile(studentOverview, safeCount(student, "studentWeaknesses"));
            return {
              student,
              overview: studentOverview,
              weaknesses: [],
              routine: [],
              completionRate: rate,
              riskLevel,
            } satisfies AdminStudentTrackerProfile;
          })
        );

        if (!alive) return;
        const loadedProfiles = profileResponses
          .filter((item): item is PromiseFulfilledResult<AdminStudentTrackerProfile> => item.status === "fulfilled")
          .map((item) => item.value);

        setProfiles(loadedProfiles.length ? loadedProfiles : FALLBACK_PROFILES);
        if (!adminStudents.length || !loadedProfiles.length) setUsingFallback(true);
      } catch {
        if (!alive) return;
        setOverview(FALLBACK_OVERVIEW);
        setStudents(FALLBACK_STUDENTS);
        setProfiles(FALLBACK_PROFILES);
        setUsingFallback(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAdminTracker();
    return () => {
      alive = false;
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return profiles;
    return profiles.filter((profile) =>
      [profile.student.name, profile.student.email]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [profiles, query]);

  const highRiskCount = useMemo(() => profiles.filter((profile) => profile.riskLevel === "HIGH").length, [profiles]);
  const avgPerformance = useMemo(() => {
    if (!profiles.length) return 0;
    return Math.round(profiles.reduce((sum, profile) => sum + profile.overview.overallPerformance, 0) / profiles.length);
  }, [profiles]);
  const avgCompletion = useMemo(() => {
    if (!profiles.length) return overview.completionRate;
    return Math.round(profiles.reduce((sum, profile) => sum + profile.completionRate, 0) / profiles.length);
  }, [overview.completionRate, profiles]);

  const riskDistribution = useMemo(() => {
    const low = profiles.filter((profile) => profile.riskLevel === "LOW").length;
    const medium = profiles.filter((profile) => profile.riskLevel === "MEDIUM").length;
    const high = profiles.filter((profile) => profile.riskLevel === "HIGH").length;
    return [
      { name: "Low Risk", value: low },
      { name: "Medium Risk", value: medium },
      { name: "High Risk", value: high },
    ];
  }, [profiles]);

  const studentPerformanceRows = useMemo(() => {
    return [...filteredProfiles]
      .sort((a, b) => a.overview.overallPerformance - b.overview.overallPerformance)
      .slice(0, 10);
  }, [filteredProfiles]);

  const radarData = useMemo(() => {
    return SUBJECT_WEAKNESS_DATA.map((item) => ({
      subject: item.subject,
      score: item.avgScore,
      weaknessLoad: item.high + item.medium,
    }));
  }, []);

  async function handleRecalculate(studentId: string) {
    try {
      setSyncingStudentId(studentId);
      await routineTrackerApi.recalculateAdminStudentWeaknesses(studentId);
    } finally {
      setSyncingStudentId(null);
    }
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: ElementType }> = [
    { id: "dashboard", label: "Institution Analytics", icon: Gauge },
    { id: "weakness", label: "Weakness Reports", icon: ShieldAlert },
    { id: "comparison", label: "Class Comparison", icon: Layers3 },
    { id: "engagement", label: "Routine Engagement", icon: BookOpenCheck },
    { id: "performance", label: "Performance Dashboard", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-600">Centralized Evaluation System</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Routine & Weakness Tracker</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Institution-wide analytics for student routines, weakness patterns, class comparison, and performance progress.
          </p>
          {usingFallback ? (
            <p className="mt-2 text-xs font-medium text-amber-600">Showing sample analytics until live tracker data is available.</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active ? "border-violet-600 text-violet-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Loading admin tracker analytics...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Total Students" value={`${overview.students}`} meta={`${overview.activePlans} active routine plans`} tone="purple" />
            <StatCard icon={CheckCircle2} label="Routine Completion" value={`${avgCompletion}%`} meta={`${overview.completedTasks} of ${overview.totalTasks} tasks completed`} tone="green" />
            <StatCard icon={AlertTriangle} label="High Weakness Alerts" value={`${overview.highWeaknesses || highRiskCount}`} meta={`${highRiskCount} high-risk monitored students`} tone="rose" />
            <StatCard icon={TrendingUp} label="Avg Performance" value={`${avgPerformance || overview.completionRate}%`} meta={`${overview.activeCategories} active weakness categories`} tone="blue" />
          </div>

          {activeTab === "dashboard" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <SectionCard title="Institution-wide Performance Trend" subtitle="Monthly performance, engagement, and routine completion">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MONTHLY_PERFORMANCE} margin={{ left: -20, right: 10 }}>
                        <defs>
                          <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6d5dfc" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6d5dfc" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="performance" stroke="#6d5dfc" fill="url(#performanceFill)" strokeWidth={3} name="Performance" />
                        <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} name="Completion" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              <SectionCard title="Risk Distribution" subtitle="Student risk level by tracker data">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistribution} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
                        {riskDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={["#10b981", "#f59e0b", "#f43f5e"][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {riskDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"][index] }} />
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeTab === "weakness" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SectionCard title="Subject Weakness Overview" subtitle="Average score and weakness load by subject">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#334155" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Radar dataKey="score" stroke="#6d5dfc" fill="#6d5dfc" fillOpacity={0.18} strokeWidth={2} name="Average Score" />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Weakness Reports" subtitle="Subjects ordered by institutional weakness risk">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3 font-bold">Subject</th>
                        <th className="px-4 py-3 font-bold">Avg Score</th>
                        <th className="px-4 py-3 font-bold">High</th>
                        <th className="px-4 py-3 font-bold">Medium</th>
                        <th className="px-4 py-3 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUBJECT_WEAKNESS_DATA.map((item) => (
                        <tr key={item.subject} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.subject}</td>
                          <td className="px-4 py-3 text-slate-700">{item.avgScore}%</td>
                          <td className="px-4 py-3 text-rose-600 font-semibold">{item.high}</td>
                          <td className="px-4 py-3 text-amber-600 font-semibold">{item.medium}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">Review Plan</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeTab === "comparison" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SectionCard title="Class Comparison" subtitle="Performance and routine completion by class">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CLASS_COMPARISON} margin={{ left: -20, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="className" tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avgPerformance" fill="#6d5dfc" radius={[8, 8, 0, 0]} name="Avg Performance" />
                      <Bar dataKey="completionRate" fill="#10b981" radius={[8, 8, 0, 0]} name="Completion" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Class Risk Table" subtitle="High-risk distribution by class">
                <div className="space-y-3">
                  {CLASS_COMPARISON.map((item) => (
                    <div key={item.className} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{item.className}</p>
                          <p className="text-xs text-slate-500">{item.students} students</p>
                        </div>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">{item.highRisk} high risk</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Performance</p>
                          <p className="font-bold text-slate-900">{item.avgPerformance}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Completion</p>
                          <p className="font-bold text-slate-900">{item.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeTab === "engagement" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <SectionCard title="Routine Engagement Analytics" subtitle="Completed, pending, and missed study sessions">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MONTHLY_PERFORMANCE} margin={{ left: -20, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="engagement" stroke="#6d5dfc" strokeWidth={3} name="Engagement" />
                        <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={3} name="Completion" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              <SectionCard title="Task Status Split" subtitle="Current institution routine status">
                <div className="space-y-4">
                  {ENGAGEMENT_BREAKDOWN.map((item, index) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">{item.name}</span>
                        <span className="font-bold text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.value}%`, backgroundColor: ["#10b981", "#6d5dfc", "#f43f5e"][index] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeTab === "performance" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <SectionCard title="Student Performance Dashboard" subtitle="Students sorted by weakness and performance risk">
                  {studentPerformanceRows.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-4 py-3 font-bold">Student</th>
                            <th className="px-4 py-3 font-bold">Performance</th>
                            <th className="px-4 py-3 font-bold">Routine Completion</th>
                            <th className="px-4 py-3 font-bold">Weaknesses</th>
                            <th className="px-4 py-3 font-bold">Recommendations</th>
                            <th className="px-4 py-3 font-bold">Risk</th>
                            <th className="px-4 py-3 font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentPerformanceRows.map((profile) => (
                            <tr key={profile.student.id} className="border-b border-slate-100 last:border-0">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                                    {initials(profile.student.name)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{profile.student.name}</p>
                                    <p className="text-xs text-slate-500">{profile.student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-900">{profile.overview.overallPerformance}%</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-violet-600" style={{ width: `${profile.completionRate}%` }} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">{profile.completionRate}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{safeCount(profile.student, "studentWeaknesses")}</td>
                              <td className="px-4 py-3 text-slate-700">{safeCount(profile.student, "trackerRecommendations")}</td>
                              <td className="px-4 py-3">
                                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${riskClass(profile.riskLevel)}`}>{profile.riskLevel}</span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleRecalculate(profile.student.id)}
                                  disabled={syncingStudentId === profile.student.id}
                                  className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-100 disabled:opacity-60"
                                >
                                  {syncingStudentId === profile.student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                  Recalculate
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </SectionCard>
              </div>

              <SectionCard title="Admin Recommendations" subtitle="Institution-level actions suggested by tracker analytics">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <div className="flex items-start gap-3">
                      <Target className="mt-0.5 h-5 w-5 text-rose-600" />
                      <div>
                        <p className="font-bold text-rose-700">Focus on Mathematics</p>
                        <p className="mt-1 text-sm text-rose-600">Mathematics has the highest institutional weakness load.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-bold text-amber-700">Review Missed Routines</p>
                        <p className="mt-1 text-sm text-amber-600">Create follow-up reminders for students with low completion.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="mt-0.5 h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-700">Reward Consistent Students</p>
                        <p className="mt-1 text-sm text-emerald-600">Highlight students maintaining 80%+ routine engagement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
