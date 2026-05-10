"use client"

import { useState, useContext } from "react"
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
  GraduationCap,
  CreditCard,
  Star,
  Wallet,
  List,
  PlusCircle,
  History,
  Receipt,
  Award,
  BrainCircuit,
} from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@/hooks/useAuth"


// ─── Nav item types ──────────────────────────────────────────────────────────

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  /** If true, shows the shared notification unread badge */
  showNotifBadge?: boolean;
};

// ─── Nav configs ─────────────────────────────────────────────────────────────

const studentLearningNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/student/dashboard" },
  { icon: BookOpen,        label: "My Courses",   href: "/student/courses" },
  { icon: ClipboardList,   label: "Assignments",  href: "/student/assignments" },
  { icon: Trophy,          label: "Results",      href: "/student/results" },
  { icon: Award,           label: "Certificates", href: "/student/certificates" },
]

const studentAccountNav: NavItem[] = [
  { icon: Bell,    label: "Notifications",   href: "/student/notifications" },
  { icon: Receipt, label: "Purchase History", href: "/student/deposit-history" },
  { icon: Settings, label: "Settings",       href: "/student/settings" },
]

const teacherMainNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
]
const teacherCourseNav: NavItem[] = [
  { icon: List,       label: "All Courses",   href: "/teacher/courses" },
  { icon: PlusCircle, label: "Create Course", href: "/teacher/courses/create" },
]
const teacherAiExamNav: NavItem[] = [
  { icon: BrainCircuit, label: "Question Generator", href: "/teacher/ai-exam/questions" },
  { icon: ClipboardList, label: "Quiz Module",       href: "/teacher/ai-exam/quiz" },
  { icon: Trophy,        label: "Assignment",        href: "/teacher/ai-exam/assignment" },
  { icon: Award,         label: "Self Test",         href: "/teacher/ai-exam/self-test" },
]
const teacherBottomNav: NavItem[] = [
  { icon: ClipboardList, label: "Enrollments",      href: "/teacher/enrollments" },
  { icon: GraduationCap, label: "Students",         href: "/teacher/students" },
  { icon: Wallet,        label: "Withdraw",         href: "/teacher/withdraw" },
  { icon: History,       label: "Withdraw History", href: "/teacher/withdraw/history" },
  { icon: Star,          label: "Reviews",          href: "/teacher/reviews" },
  { icon: CreditCard,    label: "Transactions",     href: "/teacher/transactions" },
  { icon: Settings,      label: "Settings",         href: "/teacher/settings" },
]

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
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
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

      {/* Notification badge on the nav item */}
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

export default function Sidebar({ role }: { role: "student" | "teacher" }) {
  const pathname = usePathname()
  const [coursesOpen, setCoursesOpen] = useState(
    role === "teacher" && pathname.startsWith("/teacher/courses"),
  );
  const [aiExamOpen, setAiExamOpen] = useState(
    role === "teacher" && pathname.startsWith("/teacher/ai-exam"),
  );

  // Safe — NotificationProvider wraps both student and teacher layouts
  const { unreadCount, isLoaded } = useNotifications();
  const { user: authUser } = useAuth();

  const displayName =
    authUser?.name ?? (role === "student" ? "Student" : "Teacher");
  const displayEmail = authUser?.email ?? "";
  const initials =
    displayName
      .split(" ")
      .map((p: string) => p[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <aside className="w-64 h-screen sticky top-0 bg-slate-900 flex flex-col shrink-0 overflow-hidden border-r border-slate-700/50">
      {/* Logo — teacher only */}
      {role === "teacher" && (
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow-lg`}>
              <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
            </div>
            <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      {role === "student" ? (
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">
            Learning
          </p>
          {studentLearningNav.map(({ icon, label, href }) => (
            <NavLink
              key={href}
              href={href}
              icon={icon}
              label={label}
              active={pathname === href}
              variant="student"
            />
          ))}

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-5">
            Account
          </p>
          {studentAccountNav.map(({ icon, label, href }) => (
            <NavLink
              key={href}
              href={href}
              icon={icon}
              label={label}
              active={pathname === href}
              variant="student"
              unreadCount={href === "/student/notifications" ? unreadCount : 0}
            />
          ))}
        </nav>
      ) : (
        <nav className="flex-1 p-4 space-y-1">
          {teacherMainNav.map(({ icon, label, href }) => (
            <NavLink key={href} href={href} icon={icon} label={label} active={pathname === href} />
          ))}

          {/* Courses — expandable */}
          <div>
            <button
              onClick={() => setCoursesOpen(o => !o)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith("/teacher/courses")
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">Courses</span>
              {coursesOpen
                ? <ChevronDown className="w-4 h-4 opacity-70" />
                : <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
            {coursesOpen && (
              <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                {teacherCourseNav.map(({ icon, label, href }) => (
                  <NavLink key={href} href={href} icon={icon} label={label} active={pathname === href} sub />
                ))}
              </div>
            )}
          </div>

          {/* AI Generated Exam — expandable */}
          <div>
            <button
              onClick={() => setAiExamOpen(o => !o)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith("/teacher/ai-exam")
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BrainCircuit className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">AI Exam Module</span>
              {aiExamOpen
                ? <ChevronDown className="w-4 h-4 opacity-70" />
                : <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
            {aiExamOpen && (
              <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                {teacherAiExamNav.map(({ icon, label, href }) => (
                  <NavLink key={href} href={href} icon={icon} label={label} active={pathname === href} sub />
                ))}
              </div>
            )}
          </div>

          {teacherBottomNav.map(({ icon, label, href }) => (
            <NavLink key={href} href={href} icon={icon} label={label} active={pathname === href} />
          ))}
        </nav>
      )}

      {/* User profile — bottom of sidebar */}
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
