"use client"

import { useState, useContext, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  Bell,
  Settings,
  ChevronRight,
  ChevronDown,
  Users,
  Atom,
  GraduationCap,
  CreditCard,
  Star,
  Wallet,
  List,
  PlusCircle,
  History,
  Receipt,
  Award,
  BarChart2,
  School,
  Database,
  BrainCircuit,
} from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/axios"


type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  showNotifBadge?: boolean;
};

// ── Student nav sections ──────────────────────────────────────────────────────

const studentStudyNav: NavItem[] = [
  { icon: BookOpen,      label: "My Courses",  href: "/student/courses" },
  { icon: ClipboardList, label: "Assignments", href: "/student/assignments" },
]

const studentAiExamNav: NavItem[] = [
  { icon: ClipboardList, label: "Assignment", href: "/student/ai-exam/assignment" },
  { icon: Award,         label: "Self Test",  href: "/student/ai-exam/self-test" },
]

const studentEvaluationNav: NavItem[] = [
  { icon: BarChart2,     label: "Student Overview",               href: "/student/evaluation/overview" },
  { icon: Trophy,        label: "Self Evaluation & Leaderboard",  href: "/student/evaluation/leaderboard" },
  { icon: Award,         label: "House Competition",              href: "/student/evaluation/house" },
  { icon: School,        label: "Inter Cadet College Evaluation", href: "/student/evaluation/inter-cadet" },
  { icon: BarChart2,     label: "Routine & Weakness Tracker",     href: "/student/evaluation/tracker" },
]

// ── Teacher nav sections ──────────────────────────────────────────────────────

// 2. Content Management & Study
const teacherContentNav: NavItem[] = [
  { icon: List,       label: "All Courses",    href: "/teacher/courses" },
  { icon: PlusCircle, label: "Create Course",  href: "/teacher/courses/create" },
  { icon: Star,       label: "Course Reviews", href: "/teacher/reviews" },
]

// 3. AI Generated Exam Module
const teacherAiExamNav: NavItem[] = [
  { icon: BrainCircuit,  label: "Question Generator", href: "/teacher/ai-exam/questions" },
  { icon: ClipboardList, label: "Quiz Module",         href: "/teacher/ai-exam/quiz" },
  { icon: Trophy,        label: "Assignment",          href: "/teacher/ai-exam/assignment" },
  { icon: Award,         label: "Self Test",           href: "/teacher/ai-exam/self-test" },
]

// 5. Centralized Evaluation System
const teacherEvaluationNav: NavItem[] = [
  { icon: BarChart2,     label: "Student Overview",               href: "/teacher/evaluation/overview" },
  { icon: Trophy,        label: "Self Evaluation & Leaderboard",  href: "/teacher/evaluation/leaderboard" },
  { icon: Award,         label: "House Competition",              href: "/teacher/evaluation/house" },
  { icon: School,        label: "Inter Cadet College Evaluation", href: "/teacher/evaluation/inter-cadet" },
  { icon: BarChart2,     label: "Routine & Weakness Tracker",     href: "/teacher/evaluation/tracker" },
]

// ── NavLink component ─────────────────────────────────────────────────────────

function NavLink({
                   href, icon: Icon, label, active, sub = false, variant = "teacher", unreadCount = 0,
                 }: {
  href: string
  icon: LucideIcon
  label: string
  active: boolean
  sub?: boolean
  variant?: "student" | "teacher"
  unreadCount?: number
}) {
  if (variant === "student") {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
            aria-label={unreadCount > 0 ? `${label}, ${unreadCount} unread` : label}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{label}</span>
          {unreadCount > 0 && (
              <span
                  className={`min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1 ${
                      active ? "bg-white text-indigo-600" : "bg-red-500 text-white"
                  }`}
                  aria-hidden="true"
              >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
          )}
        </Link>
    )
  }

  return (
      <Link
          href={href}
          className={`flex items-center gap-3 px-3 rounded-xl text-sm font-medium transition-all ${
              sub ? "py-2" : "py-2.5"
          } ${
              active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          aria-label={unreadCount > 0 ? `${label}, ${unreadCount} unread` : label}
      >
        <Icon className={`${sub ? "w-4 h-4" : "w-5 h-5"} shrink-0`} />
        <span className="flex-1">{label}</span>
        {unreadCount > 0 && (
            <span
                className={`min-w-4.5 h-4.5 text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1 ${
                    active ? "bg-white text-indigo-600" : "bg-red-500 text-white"
                }`}
                aria-hidden="true"
            >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
        )}
        {active && !sub && unreadCount === 0 && (
            <ChevronRight className="w-4 h-4 opacity-70" />
        )}
      </Link>
  );
}

// ── Collapsible section button (shared for both roles) ────────────────────────

function SectionButton({
                         icon: Icon,
                         label,
                         isOpen,
                         isActive,
                         onClick,
                         variant = "teacher",
                       }: {
  icon: LucideIcon
  label: string
  isOpen: boolean
  isActive: boolean
  onClick: () => void
  variant?: "student" | "teacher"
}) {
  if (variant === "student") {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          {isOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
        </button>
    )
  }

  return (
      <button
          onClick={onClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
      </button>
  )
}

function SubNav({ items, pathname, variant = "teacher" }: { items: NavItem[]; pathname: string; variant?: "student" | "teacher" }) {
  return (
      <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
        {items.map(({ icon, label, href }) => (
            <NavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                active={pathname === href}
                sub={variant === "teacher"}
                variant={variant}
            />
        ))}
      </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ role }: { role: "student" | "teacher" }) {
  const pathname = usePathname()

  // ── Student collapse state ──
  const [studentStudyOpen, setStudentStudyOpen] = useState(
      pathname.startsWith("/student/courses") || pathname.startsWith("/student/assignments"),
  )
  const [studentAiExamOpen, setStudentAiExamOpen] = useState(
      pathname.startsWith("/student/ai-exam"),
  )
  const [studentEvalOpen, setStudentEvalOpen] = useState(
      pathname.startsWith("/student/evaluation"),
  )

  // ── Teacher collapse state ──
  const [teacherContentOpen, setTeacherContentOpen] = useState(
      pathname.startsWith("/teacher/courses") || pathname === "/teacher/reviews",
  )
  const [teacherAiExamOpen, setTeacherAiExamOpen] = useState(
      pathname.startsWith("/teacher/ai-exam"),
  )
  const [teacherEvalOpen, setTeacherEvalOpen] = useState(
      pathname.startsWith("/teacher/evaluation"),
  )

  const { unreadCount, isLoaded } = useNotifications()
  const { user: authUser } = useAuth()
  const [assignmentCount, setAssignmentCount] = useState(0)

  useEffect(() => {
    if (role !== "student") return
    api
        .get("/api/assignments/count")
        .then(({ data }) => setAssignmentCount(data.data?.count ?? 0))
        .catch(() => {})
  }, [pathname, role])

  const displayName  = authUser?.name ?? (role === "student" ? "Student" : "Teacher")
  const displayEmail = authUser?.email ?? ""
  const initials =
      displayName
          .split(" ")
          .map((p: string) => p[0] ?? "")
          .join("")
          .toUpperCase()
          .slice(0, 2) || "?"

  return (
      <aside className="w-64 h-screen sticky top-0 bg-slate-900 flex flex-col shrink-0 overflow-hidden border-r border-slate-700/50">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow-lg`}>
              <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
            </div>
            <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
          </Link>
        </div>

        {/* ── Student Nav ── */}
        {role === "student" ? (
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

              {/* 1. Dashboard */}
              <NavLink
                  href="/student/dashboard"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  active={pathname === "/student/dashboard"}
                  variant="student"
              />

              {/* 2. Content Management & Study */}
              <div>
                <SectionButton
                    icon={BookOpen}
                    label="Content Management & Study"
                    isOpen={studentStudyOpen}
                    isActive={pathname.startsWith("/student/courses") || pathname.startsWith("/student/assignments")}
                    onClick={() => setStudentStudyOpen(o => !o)}
                    variant="student"
                />
                {studentStudyOpen && (
                    <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                      {studentStudyNav.map(({ icon, label, href }) => (
                          <NavLink
                              key={href}
                              href={href}
                              icon={icon}
                              label={label}
                              active={pathname === href}
                              variant="student"
                              unreadCount={href === "/student/assignments" ? assignmentCount : 0}
                          />
                      ))}
                    </div>
                )}
              </div>

              {/* 3. AI Generated Exam Module */}
              <div>
                <SectionButton
                    icon={BrainCircuit}
                    label="AI Generated Exam Module"
                    isOpen={studentAiExamOpen}
                    isActive={pathname.startsWith("/student/ai-exam")}
                    onClick={() => setStudentAiExamOpen(o => !o)}
                    variant="student"
                />
                {studentAiExamOpen && <SubNav items={studentAiExamNav} pathname={pathname} variant="student" />}
              </div>

              {/* 4. Simulations */}
              <NavLink
                  href="/student/simulations"
                  icon={Atom}
                  label="Simulations"
                  active={pathname === "/student/simulations"}
                  variant="student"
              />

              {/* 5. Centralized Evaluation System */}
              <div>
                <SectionButton
                    icon={BarChart2}
                    label="Centralized Evaluation System"
                    isOpen={studentEvalOpen}
                    isActive={pathname.startsWith("/student/evaluation")}
                    onClick={() => setStudentEvalOpen(o => !o)}
                    variant="student"
                />
                {studentEvalOpen && <SubNav items={studentEvaluationNav} pathname={pathname} variant="student" />}
              </div>

              {/* 6. Post Cadet College Preparation */}
              <NavLink
                  href="/student/post-cadet"
                  icon={GraduationCap}
                  label="Post Cadet College Preparation"
                  active={pathname === "/student/post-cadet"}
                  variant="student"
              />

              {/* 7. Teacher Evaluation */}
              <NavLink
                  href="/student/teacher-evaluation"
                  icon={Star}
                  label="Teacher Evaluation"
                  active={pathname === "/student/teacher-evaluation"}
                  variant="student"
              />

              {/* 8. Profile Settings */}
              <NavLink
                  href="/student/settings"
                  icon={Settings}
                  label="Profile Settings"
                  active={pathname === "/student/settings"}
                  variant="student"
              />

            </nav>

        ) : (
            /* ── Teacher Nav ── */
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

              {/* 1. Dashboard */}
              <NavLink
                  href="/teacher/dashboard"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  active={pathname === "/teacher/dashboard"}
              />

              {/* 2. Content Management & Study */}
              <div>
                <SectionButton
                    icon={BookOpen}
                    label="Content Management & Study"
                    isOpen={teacherContentOpen}
                    isActive={pathname.startsWith("/teacher/courses") || pathname === "/teacher/reviews"}
                    onClick={() => setTeacherContentOpen(o => !o)}
                />
                {teacherContentOpen && <SubNav items={teacherContentNav} pathname={pathname} />}
              </div>

              {/* 3. AI Generated Exam Module */}
              <div>
                <SectionButton
                    icon={BrainCircuit}
                    label="AI Generated Exam Module"
                    isOpen={teacherAiExamOpen}
                    isActive={pathname.startsWith("/teacher/ai-exam")}
                    onClick={() => setTeacherAiExamOpen(o => !o)}
                />
                {teacherAiExamOpen && <SubNav items={teacherAiExamNav} pathname={pathname} />}
              </div>

              {/* 4. Simulations */}
              <NavLink
                  href="/teacher/simulations"
                  icon={Atom}
                  label="Simulations"
                  active={pathname === "/teacher/simulations"}
              />

              {/* 5. Centralized Evaluation System */}
              <div>
                <SectionButton
                    icon={BarChart2}
                    label="Centralized Evaluation System"
                    isOpen={teacherEvalOpen}
                    isActive={pathname.startsWith("/teacher/evaluation")}
                    onClick={() => setTeacherEvalOpen(o => !o)}
                />
                {teacherEvalOpen && <SubNav items={teacherEvaluationNav} pathname={pathname} />}
              </div>

              {/* 6. Post Cadet College Preparation */}
              <NavLink
                  href="/teacher/post-cadet"
                  icon={GraduationCap}
                  label="Post Cadet College Preparation"
                  active={pathname === "/teacher/post-cadet"}
              />

              {/* 7. Teacher Evaluation */}
              <NavLink
                  href="/teacher/teacher-evaluation"
                  icon={Star}
                  label="Teacher Evaluation"
                  active={pathname === "/teacher/teacher-evaluation"}
              />

              {/* 8. Profile Settings */}
              <NavLink
                  href="/teacher/settings"
                  icon={Settings}
                  label="Profile Settings"
                  active={pathname === "/teacher/settings"}
              />

            </nav>
        )}

        {/* User footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
            </div>
          </div>
        </div>
      </aside>
  )
}