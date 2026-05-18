"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
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
  AlertCircle,
  BarChart2,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lightbulb,
  Loader2,
  MoreVertical,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";

import { routineTrackerApi } from "@/lib/routineTrackerApi";
import type {
  CreateRoutineTaskPayload,
  PerformancePoint,
  RoutineTask,
  RoutineTaskStatus,
  RoutineTaskType,
  RoutineTrackerOverview,
  StudentWeakness,
  TrackerRecommendation,
  WeaknessLevel,
} from "@/types/routine-tracker";

const MOCK_OVERVIEW: RoutineTrackerOverview = {
  todayStudyPlan: { total: 5, completed: 2 },
  overallPerformance: 68,
  weakSubjects: 2,
  strongestSubject: { subject: "English", score: 82 },
};

const MOCK_TASKS: RoutineTask[] = [
  { id: "m-1", subject: "Mathematics", topic: "Algebra Basics", task_type: "PRACTICE", date: "2025-05-21", start_time: "2025-05-21T06:00:00", end_time: "2025-05-21T07:00:00", status: "COMPLETED" },
  { id: "m-2", subject: "Physics", topic: "Newton's Laws", task_type: "READING", date: "2025-05-21", start_time: "2025-05-21T08:00:00", end_time: "2025-05-21T09:00:00", status: "COMPLETED" },
  { id: "m-3", subject: "Chemistry", topic: "Chemical Bonding", task_type: "READING", date: "2025-05-21", start_time: "2025-05-21T16:00:00", end_time: "2025-05-21T17:00:00", status: "UPCOMING" },
  { id: "m-4", subject: "English", topic: "Grammar Rules", task_type: "PRACTICE", date: "2025-05-21", start_time: "2025-05-21T19:00:00", end_time: "2025-05-21T20:00:00", status: "UPCOMING" },
  { id: "m-5", subject: "Biology", topic: "Cell Structure", task_type: "READING", date: "2025-05-21", start_time: "2025-05-21T20:30:00", end_time: "2025-05-21T21:30:00", status: "PENDING" },
  { id: "m-6", subject: "Physics", topic: "Mechanics", task_type: "PRACTICE", date: "2025-05-19", start_time: "2025-05-19T06:00:00", end_time: "2025-05-19T07:00:00", status: "UPCOMING" },
  { id: "m-7", subject: "Biology", topic: "Plant Cell", task_type: "READING", date: "2025-05-19", start_time: "2025-05-19T16:00:00", end_time: "2025-05-19T17:00:00", status: "COMPLETED" },
  { id: "m-8", subject: "Bangla", topic: "Essay Practice", task_type: "READING", date: "2025-05-20", start_time: "2025-05-20T19:00:00", end_time: "2025-05-20T20:00:00", status: "MISSED" },
  { id: "m-9", subject: "Mathematics", topic: "Trigonometry", task_type: "PRACTICE", date: "2025-05-22", start_time: "2025-05-22T06:00:00", end_time: "2025-05-22T07:00:00", status: "UPCOMING" },
  { id: "m-10", subject: "Chemistry", topic: "Organic Basics", task_type: "REVISION", date: "2025-05-22", start_time: "2025-05-22T08:00:00", end_time: "2025-05-22T09:00:00", status: "PENDING" },
  { id: "m-11", subject: "English", topic: "Reading", task_type: "READING", date: "2025-05-23", start_time: "2025-05-23T06:00:00", end_time: "2025-05-23T07:00:00", status: "COMPLETED" },
  { id: "m-12", subject: "Physics", topic: "Problem Solving", task_type: "PRACTICE", date: "2025-05-24", start_time: "2025-05-24T19:00:00", end_time: "2025-05-24T20:00:00", status: "UPCOMING" },
  { id: "m-13", subject: "Revision", topic: "Weekly Notes", task_type: "REVISION", date: "2025-05-25", start_time: "2025-05-25T06:00:00", end_time: "2025-05-25T07:00:00", status: "PENDING" },
];

const MOCK_WEAKNESSES: StudentWeakness[] = [
  { id: "w-1", score: 42, level: "HIGH", category: { id: "c-1", name: "Mathematics" } },
  { id: "w-2", score: 48, level: "MEDIUM", category: { id: "c-2", name: "Physics" } },
  { id: "w-3", score: 55, level: "MEDIUM", category: { id: "c-3", name: "Chemistry" } },
  { id: "w-4", score: 68, level: "LOW", category: { id: "c-4", name: "Biology" } },
  { id: "w-5", score: 82, level: "LOW", category: { id: "c-5", name: "English" } },
  { id: "w-6", score: 70, level: "LOW", category: { id: "c-6", name: "Bangla" } },
];

const MOCK_RECOMMENDATIONS: TrackerRecommendation[] = [
  { id: "r-1", title: "Focus on Mathematics", description: "Your score is below 50%. Practice algebra and trigonometry more.", priority: "HIGH", action_label: "Study Now" },
  { id: "r-2", title: "Improve Physics Concepts", description: "Work on mechanics and problem solving questions.", priority: "MEDIUM", action_label: "Study Now" },
  { id: "r-3", title: "Keep it up in English", description: "You are doing great! Maintain your performance.", priority: "LOW", action_label: "View Resources" },
];

const MOCK_PERFORMANCE: PerformancePoint[] = [
  { date: "2025-05-01", score: 44 },
  { date: "2025-05-04", score: 51 },
  { date: "2025-05-07", score: 58 },
  { date: "2025-05-10", score: 55 },
  { date: "2025-05-12", score: 63 },
  { date: "2025-05-14", score: 69 },
  { date: "2025-05-18", score: 73 },
  { date: "2025-05-21", score: 74 },
  { date: "2025-05-24", score: 72 },
  { date: "2025-05-28", score: 71 },
];

const SUBJECT_STYLES: Record<string, string> = {
  mathematics: "bg-violet-50 text-violet-700 border-violet-100",
  physics: "bg-sky-50 text-sky-700 border-sky-100",
  chemistry: "bg-orange-50 text-orange-700 border-orange-100",
  biology: "bg-emerald-50 text-emerald-700 border-emerald-100",
  english: "bg-teal-50 text-teal-700 border-teal-100",
  bangla: "bg-rose-50 text-rose-700 border-rose-100",
  revision: "bg-stone-50 text-stone-700 border-stone-100",
};

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla", "Revision"];
const TIME_SLOTS = ["06:00 AM", "08:00 AM", "04:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"];

type ActiveTab = "routine" | "weakness";
type PlannerMode = "day" | "week" | "month";

const pad = (value: number) => String(value).padStart(2, "0");
const toISODate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = addDays(date, diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function displayDateRange(start: Date) {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endText = sameMonth
    ? end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })
    : end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startText} – ${endText}`;
}

function dateLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeLabel(value?: string | null) {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function taskTimeRange(task: RoutineTask) {
  const start = timeLabel(task.start_time ?? task.startTime);
  const end = timeLabel(task.end_time ?? task.endTime);
  return start === "--" && end === "--" ? "Flexible" : `${start} - ${end}`;
}

function getTaskType(task: RoutineTask): RoutineTaskType {
  return (task.task_type ?? task.taskType ?? "READING") as RoutineTaskType;
}

function getCategoryName(weakness: StudentWeakness) {
  return weakness.category?.name ?? "Subject";
}

function getSubjectClass(subject: string) {
  return SUBJECT_STYLES[subject.toLowerCase()] ?? "bg-slate-50 text-slate-700 border-slate-100";
}

function getLevelClass(level: WeaknessLevel) {
  if (level === "HIGH") return "bg-rose-50 text-rose-600";
  if (level === "MEDIUM") return "bg-amber-50 text-amber-600";
  return "bg-emerald-50 text-emerald-600";
}

function getStatusClass(status: RoutineTaskStatus) {
  if (status === "COMPLETED") return "text-emerald-600 bg-emerald-50";
  if (status === "MISSED") return "text-rose-600 bg-rose-50";
  if (status === "PENDING") return "text-blue-600 bg-blue-50";
  if (status === "CANCELLED") return "text-slate-500 bg-slate-100";
  return "text-amber-600 bg-amber-50";
}

function getPriorityClasses(priority: string) {
  if (priority === "HIGH") {
    return {
      icon: "bg-rose-50 text-rose-500 border-rose-100",
      title: "text-rose-600",
      button: "border-rose-200 text-rose-600 hover:bg-rose-50",
    };
  }
  if (priority === "MEDIUM") {
    return {
      icon: "bg-orange-50 text-orange-500 border-orange-100",
      title: "text-orange-600",
      button: "border-orange-200 text-orange-600 hover:bg-orange-50",
    };
  }
  return {
    icon: "bg-emerald-50 text-emerald-500 border-emerald-100",
    title: "text-emerald-600",
    button: "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
  };
}

function normalizeScore(value: number | undefined | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <BookOpen className="mb-3 h-8 w-8 text-slate-300" />
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, meta, tone, hrefLabel }: { icon: LucideIcon; label: string; value: string; meta: string; tone: "purple" | "green" | "orange" | "blue"; hrefLabel?: string }) {
  const toneMap = {
    purple: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{meta}</p>
          </div>
        </div>
        <span aria-label={hrefLabel ?? label} className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-full sm:flex ${toneMap[tone]}`}>
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function RoutineTaskModal({ open, onClose, onSubmit, selectedDate }: { open: boolean; onClose: () => void; onSubmit: (payload: CreateRoutineTaskPayload) => Promise<void>; selectedDate: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ subject: "Mathematics", topic: "", task_type: "PRACTICE" as RoutineTaskType, date: selectedDate, start_time: "06:00", end_time: "07:00" });

  useEffect(() => {
    if (open) setForm((current) => ({ ...current, date: selectedDate }));
  }, [open, selectedDate]);

  if (!open) return null;

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const start = `${form.date}T${form.start_time}:00`;
      const end = `${form.date}T${form.end_time}:00`;
      await onSubmit({
        subject: form.subject,
        topic: form.topic || undefined,
        task_type: form.task_type,
        date: form.date,
        start_time: start,
        end_time: end,
        status: "UPCOMING",
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Study Session</h3>
            <p className="mt-1 text-sm text-slate-500">Create a routine task for your weekly planner.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            Subject
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50">
              {SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            Type
            <select value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value as RoutineTaskType })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50">
              {(["READING", "PRACTICE", "REVISION", "TEST", "ASSIGNMENT", "OTHER"] as RoutineTaskType[]).map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
            Topic
            <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Example: Algebra basics" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50" />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            Date
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              Start
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              End
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50" />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isSaving || !form.subject} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Session
          </button>
        </div>
      </div>
    </div>
  );
}

function RoutinePlanner({ tasks, selectedDate, setSelectedDate, onAddClick }: { tasks: RoutineTask[]; selectedDate: string; setSelectedDate: (date: string) => void; onAddClick: () => void }) {
  const [mode, setMode] = useState<PlannerMode>("week");
  const selected = new Date(`${selectedDate}T00:00:00`);
  const weekStart = startOfWeek(selected);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekEnd = addDays(weekStart, 6);
  const weekTasks = tasks.filter((task) => task.date.slice(0, 10) >= toISODate(weekStart) && task.date.slice(0, 10) <= toISODate(weekEnd));
  const completed = weekTasks.filter((task) => task.status === "COMPLETED").length;
  const progress = weekTasks.length ? Math.round((completed / weekTasks.length) * 100) : 0;

  const tasksByDate = useMemo(() => {
    return weekTasks.reduce<Record<string, RoutineTask[]>>((acc, task) => {
      const key = task.date.slice(0, 10);
      acc[key] = [...(acc[key] ?? []), task];
      return acc;
    }, {});
  }, [weekTasks]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">Routine Planner <AlertCircle className="h-4 w-4 text-slate-400" /></h2>
        </div>
        <button type="button" onClick={onAddClick} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-100 transition hover:bg-violet-700 sm:w-auto">
          <Plus className="h-4 w-4" /> Add Session
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["day", "week", "month"] as PlannerMode[]).map((item) => (
            <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${mode === item ? "bg-violet-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => setSelectedDate(toISODate(addDays(selected, -7)))} className="rounded-full border border-slate-200 p-2 text-violet-600 hover:bg-violet-50"><ChevronLeft className="h-4 w-4" /></button>
          <p className="min-w-[185px] text-center text-sm font-extrabold text-slate-800">{displayDateRange(weekStart)}</p>
          <button type="button" onClick={() => setSelectedDate(toISODate(addDays(selected, 7)))} className="rounded-full border border-slate-200 p-2 text-violet-600 hover:bg-violet-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[74px_repeat(7,minmax(90px,1fr))] border-b border-slate-100 text-center text-xs font-bold text-slate-500">
            <div />
            {weekDays.map((day) => {
              const key = toISODate(day);
              const isSelected = key === selectedDate;
              return (
                <button key={key} type="button" onClick={() => setSelectedDate(key)} className="flex flex-col items-center gap-1 pb-3">
                  <span>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${isSelected ? "bg-violet-600 text-white" : "text-slate-600"}`}>{day.getDate()}</span>
                </button>
              );
            })}
          </div>

          {TIME_SLOTS.map((slot) => (
            <div key={slot} className="grid min-h-[72px] grid-cols-[74px_repeat(7,minmax(90px,1fr))] border-b border-slate-100">
              <div className="flex items-start justify-center pt-4 text-xs font-semibold text-slate-500">{slot}</div>
              {weekDays.map((day) => {
                const key = toISODate(day);
                const hour = Number(slot.slice(0, 2)) + (slot.includes("PM") && !slot.startsWith("12") ? 12 : 0);
                const matching = (tasksByDate[key] ?? []).filter((task) => {
                  const startValue = task.start_time ?? task.startTime;
                  if (!startValue) return false;
                  const taskHour = new Date(startValue).getHours();
                  return Math.abs(taskHour - hour) <= 1;
                }).slice(0, 2);

                return (
                  <div key={`${key}-${slot}`} className="border-l border-slate-100 p-1.5">
                    {matching.map((task) => (
                      <div key={task.id} className={`mb-1 rounded-lg border px-2 py-2 text-center text-[11px] font-bold leading-tight ${getSubjectClass(task.subject)}`}>
                        <p className="truncate">{task.subject}</p>
                        <p className="mt-0.5 text-[10px] font-semibold opacity-80">{timeLabel(task.start_time ?? task.startTime)} - {timeLabel(task.end_time ?? task.endTime)}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Completed</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Upcoming</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Pending</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Missed</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span>Week Progress: {progress}%</span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TodayRoutineTable({ tasks, onComplete }: { tasks: RoutineTask[]; onComplete: (task: RoutineTask) => Promise<void> }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900"><CalendarDays className="h-4 w-4 text-slate-500" /> Today&apos;s Study Routine</h2>
        <button type="button" className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-100 hover:bg-violet-700">View Full Routine</button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No routine for today" description="Add a session from the planner to start tracking your daily study routine." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] overflow-hidden rounded-xl text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr key={task.id} className="text-slate-700 hover:bg-slate-50/70">
                  <td className="px-4 py-4 font-bold text-slate-800">{taskTimeRange(task)}</td>
                  <td className="px-4 py-4 font-semibold">{task.subject}</td>
                  <td className="px-4 py-4 text-slate-600">{task.topic ?? "General Study"}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600">{getTaskType(task)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(task.status)}`}>
                      {task.status === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      {task.status.charAt(0) + task.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {task.status !== "COMPLETED" ? (
                      <button type="button" onClick={() => onComplete(task)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50">Complete</button>
                    ) : (
                      <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function WeaknessOverview({ weaknesses }: { weaknesses: StudentWeakness[] }) {
  const chartData = weaknesses.map((weakness) => ({ subject: getCategoryName(weakness), score: normalizeScore(weakness.score) }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">Subject Weakness Overview <AlertCircle className="h-4 w-4 text-slate-400" /></h2>
        <button type="button" className="hidden items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 sm:inline-flex">View Details <ChevronRight className="h-4 w-4" /></button>
      </div>

      {weaknesses.length === 0 ? (
        <EmptyState title="No weakness data yet" description="Weakness analytics will appear after your teacher or admin adds evaluation data." />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.85fr]">
          <div className="h-[290px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="72%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6366f1", fontSize: 10 }} />
                <Radar name="Average Score (%)" dataKey="score" stroke="#6d28d9" fill="#7c3aed" fillOpacity={0.16} strokeWidth={3} />
                <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[330px] overflow-hidden rounded-xl border border-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weaknesses.map((weakness) => (
                  <tr key={weakness.id}>
                    <td className="px-4 py-3 font-bold text-slate-700">{getCategoryName(weakness)}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">{normalizeScore(weakness.score)}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getLevelClass(weakness.level)}`}>{weakness.level.toLowerCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-xs font-bold text-violet-600 hover:bg-violet-50">View Detailed Analysis <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </section>
  );
}

function Recommendations({ recommendations }: { recommendations: TrackerRecommendation[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-slate-500" />
        <h2 className="text-base font-extrabold text-slate-900">Recommended For You</h2>
      </div>

      <div className="space-y-3">
        {recommendations.map((item) => {
          const classes = getPriorityClasses(item.priority);
          return (
            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-100 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${classes.icon}`}>
                  {item.priority === "HIGH" ? <Target className="h-4 w-4" /> : item.priority === "MEDIUM" ? <BarChart2 className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                </span>
                <div>
                  <p className={`text-sm font-extrabold ${classes.title}`}>{item.title}</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{item.description ?? "Follow this recommendation to improve your academic performance."}</p>
                </div>
              </div>
              <button type="button" className={`w-full rounded-lg border px-4 py-2 text-xs font-bold transition sm:w-auto ${classes.button}`}>{item.action_label ?? item.actionLabel ?? "Study Now"}</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PerformanceChart({ points }: { points: PerformancePoint[] }) {
  const chartData = points.map((point) => ({ ...point, label: dateLabel(point.date), score: normalizeScore(point.score) }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900"><TrendingUp className="h-4 w-4 text-slate-500" /> Performance Over Time</h2>
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50">
          <option>This Month</option>
          <option>This Week</option>
          <option>This Term</option>
        </select>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -16, right: 12, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="routinePerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value}%`, "Score"]} labelClassName="font-bold" />
            <Area type="monotone" dataKey="score" stroke="#5b21b6" strokeWidth={3} fill="url(#routinePerformance)" activeDot={{ r: 6, strokeWidth: 3, stroke: "#ffffff", fill: "#5b21b6" }} />
            <Line type="monotone" dataKey="score" stroke="#5b21b6" strokeWidth={0} dot={{ r: 3, fill: "#5b21b6" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function StudentRoutineTracker() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("routine");
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [overview, setOverview] = useState<RoutineTrackerOverview>(MOCK_OVERVIEW);
  const [tasks, setTasks] = useState<RoutineTask[]>(MOCK_TASKS);
  const [weaknesses, setWeaknesses] = useState<StudentWeakness[]>(MOCK_WEAKNESSES);
  const [recommendations, setRecommendations] = useState<TrackerRecommendation[]>(MOCK_RECOMMENDATIONS);
  const [performance, setPerformance] = useState<PerformancePoint[]>(MOCK_PERFORMANCE);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const range = useMemo(() => {
    const start = startOfWeek(new Date(`${selectedDate}T00:00:00`));
    return { start_date: toISODate(start), end_date: toISODate(addDays(start, 30)) };
  }, [selectedDate]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [overviewData, routineData, weaknessData, recommendationData, performanceData] = await Promise.all([
          routineTrackerApi.getMyOverview(),
          routineTrackerApi.getMyRoutine(range),
          routineTrackerApi.getMyWeaknesses(),
          routineTrackerApi.getMyRecommendations(),
          routineTrackerApi.getMyPerformance(range),
        ]);

        if (!mounted) return;
        setOverview(overviewData ?? MOCK_OVERVIEW);
        setTasks(routineData?.length ? routineData : MOCK_TASKS);
        setWeaknesses(weaknessData?.length ? weaknessData : MOCK_WEAKNESSES);
        setRecommendations(recommendationData?.length ? recommendationData : MOCK_RECOMMENDATIONS);
        setPerformance(performanceData?.length ? performanceData : MOCK_PERFORMANCE);
        const hasLiveData = Boolean(routineData?.length || weaknessData?.length || recommendationData?.length || performanceData?.length);
        setUsingMockData(!hasLiveData);
        if (!hasLiveData && selectedDate !== "2025-05-21") setSelectedDate("2025-05-21");
      } catch {
        if (!mounted) return;
        setOverview(MOCK_OVERVIEW);
        setTasks(MOCK_TASKS);
        setWeaknesses(MOCK_WEAKNESSES);
        setRecommendations(MOCK_RECOMMENDATIONS);
        setPerformance(MOCK_PERFORMANCE);
        setUsingMockData(true);
        if (selectedDate !== "2025-05-21") setSelectedDate("2025-05-21");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [range, selectedDate]);

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.date.slice(0, 10) === selectedDate)
      .sort((a, b) => (a.start_time ?? a.startTime ?? "").localeCompare(b.start_time ?? b.startTime ?? ""));
  }, [tasks, selectedDate]);

  const strongest = overview.strongestSubject ?? weaknesses.reduce<{ subject: string; score: number } | null>((best, item) => {
    const current = { subject: getCategoryName(item), score: normalizeScore(item.score) };
    if (!best || current.score > best.score) return current;
    return best;
  }, null);

  const weakSubjectCount = overview.weakSubjects || weaknesses.filter((item) => item.level === "HIGH" || item.level === "MEDIUM").length;

  const handleAddTask = async (payload: CreateRoutineTaskPayload) => {
    if (usingMockData) {
      setTasks((current) => [
        ...current,
        { id: `local-${Date.now()}`, ...payload, date: payload.date, status: payload.status ?? "UPCOMING" },
      ]);
      return;
    }
    const task = await routineTrackerApi.createMyTask(payload);
    setTasks((current) => [...current, task]);
  };

  const handleCompleteTask = async (task: RoutineTask) => {
    if (usingMockData || task.id.startsWith("m-") || task.id.startsWith("local-")) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "COMPLETED" } : item));
      return;
    }
    const updated = await routineTrackerApi.completeMyTask(task.id);
    setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
  };

  return (
    <main className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <RoutineTaskModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddTask} selectedDate={selectedDate} />

      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Routine &amp; Weakness Tracker</h1>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-violet-500" />}
          </div>
          <p className="text-sm font-medium text-slate-500">Plan your study routine and track your academic strengths &amp; weaknesses</p>
        </div>

        <div className="border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto">
            <button type="button" onClick={() => setActiveTab("routine")} className={`relative px-1 pb-3 text-sm font-extrabold transition ${activeTab === "routine" ? "text-violet-600" : "text-slate-500 hover:text-slate-800"}`}>
              My Routine
              {activeTab === "routine" && <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-violet-600" />}
            </button>
            <button type="button" onClick={() => setActiveTab("weakness")} className={`relative px-1 pb-3 text-sm font-extrabold transition ${activeTab === "weakness" ? "text-violet-600" : "text-slate-500 hover:text-slate-800"}`}>
              Weakness Tracker
              {activeTab === "weakness" && <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-violet-600" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <StatCard icon={CalendarDays} label="Today's Study Plan" value={`${overview.todayStudyPlan.total || todayTasks.length} ${activeTab === "routine" ? "Sessions" : "Classes"}`} meta={`${overview.todayStudyPlan.completed || todayTasks.filter((task) => task.status === "COMPLETED").length} Completed`} tone="purple" />
          <StatCard icon={TrendingUp} label="Overall Performance" value={`${normalizeScore(overview.overallPerformance)}%`} meta="Good" tone="green" />
          <StatCard icon={AlertCircle} label="Weak Subjects" value={`${weakSubjectCount}`} meta="Need Improvement" tone="orange" />
          <StatCard icon={Trophy} label="Strongest Subject" value={strongest?.subject ?? "N/A"} meta={strongest ? `${normalizeScore(strongest.score)}% Average` : "No data yet"} tone="blue" />
        </div>

        {activeTab === "routine" ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.95fr]">
            <div className="space-y-5">
              <RoutinePlanner tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onAddClick={() => setIsModalOpen(true)} />
              <TodayRoutineTable tasks={todayTasks} onComplete={handleCompleteTask} />
            </div>
            <div className="space-y-5">
              <WeaknessOverview weaknesses={weaknesses} />
              <Recommendations recommendations={recommendations} />
              <PerformanceChart points={performance} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <WeaknessOverview weaknesses={weaknesses} />
              <TodayRoutineTable tasks={todayTasks.slice(0, 4)} onComplete={handleCompleteTask} />
            </div>
            <div className="space-y-5">
              <Recommendations recommendations={recommendations} />
              <PerformanceChart points={performance} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
