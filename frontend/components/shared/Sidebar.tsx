"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  Bell,
  Settings,
  LogOut,
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
} from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"
import { useAuth } from "@/hooks/useAuth"

type NavItem = { icon: LucideIcon; label: string; href: string }

const studentNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/student/dashboard" },
  { icon: BookOpen,        label: "My Courses",      href: "/student/courses" },
  { icon: ClipboardList,   label: "Assignments",     href: "/student/assignments" },
  { icon: Trophy,          label: "Results",         href: "/student/results" },
  { icon: Award,           label: "Certificates",    href: "/student/certificates" },
  { icon: Bell,            label: "Notifications",   href: "/student/notifications" },
  { icon: Receipt,         label: "Purchase History", href: "/student/deposit-history" },
  { icon: Settings,        label: "Settings",        href: "/student/settings" },
]

const teacherMainNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
]
const teacherCourseNav: NavItem[] = [
  { icon: List,       label: "All Courses",   href: "/teacher/courses" },
  { icon: PlusCircle, label: "Create Course", href: "/teacher/courses/create" },
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
  href, icon: Icon, label, active, sub = false,
}: {
  href: string; icon: LucideIcon; label: string; active: boolean; sub?: boolean
}) {
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
    >
      <Icon className={`${sub ? "w-4 h-4" : "w-5 h-5"} flex-shrink-0`} />
      <span className="flex-1">{label}</span>
      {active && !sub && <ChevronRight className="w-4 h-4 opacity-70" />}
    </Link>
  )
}

export default function Sidebar({ role }: { role: "student" | "teacher" }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user: authUser, logout } = useAuth()
  const [coursesOpen, setCoursesOpen] = useState(
    role === "teacher" && pathname.startsWith("/teacher/courses")
  )

  const displayName = authUser?.name ?? (role === "student" ? "Student" : "Teacher")
  const displayEmail = authUser?.email ?? ""
  const nameParts = displayName.split(" ")
  const initials = nameParts.map((p: string) => p[0] ?? "").join("").toUpperCase().slice(0, 2) || "?"

  function handleLogout() {
    logout()
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-slate-900 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow-lg`}>
            <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
          </div>
          <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {role === "student" ? (
          studentNav.map(({ icon, label, href }) => (
            <NavLink key={href} href={href} icon={icon} label={label} active={pathname === href} />
          ))
        ) : (
          <>
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
                <BookOpen className="w-5 h-5 flex-shrink-0" />
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

            {teacherBottomNav.map(({ icon, label, href }) => (
              <NavLink key={href} href={href} icon={icon} label={label} active={pathname === href} />
            ))}
          </>
        )}
      </nav>

    </aside>
  )
}
