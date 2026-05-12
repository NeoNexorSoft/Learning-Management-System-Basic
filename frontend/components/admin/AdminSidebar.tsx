"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Tag,
  Ticket,
  ClipboardList,
  CreditCard,
  Wallet,
  FileWarning,
  ChevronRight,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Settings,
  SlidersHorizontal,
  BarChart2,
  Trophy,
  Award,
  Atom,
  School,
  Star,
  BrainCircuit,
} from "lucide-react";

import {
  BrandIcon,
  BRAND_NAME,
  BRAND_ICON_BG,
  BRAND_ICON_COLOR,
} from "@/lib/brand";

type NavItem = { icon: LucideIcon; label: string; href: string };

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",   href: "/admin/dashboard" },
  { icon: Users,           label: "Students",    href: "/admin/users" },
  { icon: GraduationCap,  label: "Teachers",    href: "/admin/teachers" },
  { icon: BookOpen,        label: "Courses",     href: "/admin/courses" },
  { icon: ClipboardList,   label: "Assignments", href: "/admin/assignments" },
  { icon: Tag,             label: "Categories",  href: "/admin/categories" },
  /* { icon: Ticket,          label: "Coupons",     href: "/admin/coupons" },
   { icon: CreditCard,      label: "Payments",    href: "/admin/payments" },
   { icon: Wallet,          label: "Withdrawals", href: "/admin/withdrawals" },*/
  { icon: Settings,        label: "Settings",    href: "/admin/settings" },
  {
    icon: SlidersHorizontal,
    label: "System Config",
    href: "/admin/system-config",
  }, // adding new section
 /* { icon: FileWarning, label: "Reports", href: "/admin/reports" }, *///new adding
  { icon: Atom, label: "Simulations", href: "/admin/simulations" }, // simulations page
];

const adminEvaluationNav: NavItem[] = [
  { icon: BarChart2, label: "Student Overview",              href: "/admin/evaluation/overview" },
  { icon: Trophy,    label: "Self Evaluation & Leaderboard", href: "/admin/evaluation/leaderboard" },
  { icon: Award,     label: "House Competition",             href: "/admin/evaluation/house" },
  { icon: School,    label: "Inter Cadet College Evaluation",href: "/admin/evaluation/inter-cadet" },
  { icon: BarChart2, label: "Routine & Weakness Tracker",    href: "/admin/evaluation/tracker" }, // new
];

const adminAiExamNav: NavItem[] = [ // new
  { icon: BrainCircuit,  label: "Question Generator", href: "/admin/ai-exam/questions" },
  { icon: ClipboardList, label: "Quiz Module",         href: "/admin/ai-exam/quiz" },
  { icon: Trophy,        label: "Assignment",          href: "/admin/assignments" },
  { icon: Award,         label: "Self Test",           href: "/admin/ai-exam/self-test" },
];

function NavLink({
                   href,
                   icon: Icon,
                   label,
                   active,
                   badge,
                 }: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
      <Link
          href={href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{label}</span>
        {badge && badge > 0 ? (
            <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
        ) : active ? (
            <ChevronRight className="w-4 h-4 opacity-70" />
        ) : null}
      </Link>
  );
}

export default function AdminSidebar({
                                       adminName,
                                       adminEmail,
                                     }: {
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [assignmentPendingCount, setAssignmentPendingCount] = useState<number | null>(null); // ← add
  const [evalOpen, setEvalOpen] = useState(false);                                           // ← add
  const [aiExamOpen, setAiExamOpen] = useState(pathname.startsWith("/admin/ai-exam"));       // ← add
  const [contentOpen, setContentOpen] = useState(                                            // ← add
      pathname.startsWith("/admin/courses") ||
      pathname.startsWith("/admin/categories") ||
      pathname.startsWith("/admin/assignments"),
  );

  useEffect(() => {
    function fetchPending() {
      api.get("/api/admin/courses?status=PENDING&limit=1")
          .then(({ data }) => setPendingCount(data.total ?? 0))
          .catch(() => setPendingCount(0))
      api.get("/api/assignments/admin", { params: { filter: "pending" } })
          .then(({ data }) => setAssignmentPendingCount(data.data?.assignments?.length ?? 0))
          .catch(() => setAssignmentPendingCount(0))
    }
    fetchPending()
    window.addEventListener("pendingCountChanged", fetchPending)
    return () => window.removeEventListener("pendingCountChanged", fetchPending)
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    document.cookie = "admin_role=; path=/; max-age=0; SameSite=Lax";
    router.push("/admin/login");
    router.refresh();
  }

  const initials = adminName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
      <aside
          className="w-64 h-screen sticky top-0 flex flex-col flex-shrink-0"
          style={{ backgroundColor: "#040720" }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div
                className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
            </div>
            <div>
            <span className="text-base font-bold text-white block leading-none">
              {BRAND_NAME}
            </span>
              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 mt-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> Admin Panel
            </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* 1. Dashboard, 2. Students, 3. Teachers */}
          {navItems.slice(0, 3).map(({ icon: Icon, label, href }) => {
            const active = pathname.startsWith(href);
            return (
                <NavLink key={href} href={href} icon={Icon} label={label} active={active} />
            );
          })}

          {/* 4. Content Management & Study */}
          <div>
            <button
                onClick={() => setContentOpen(o => !o)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname.startsWith("/admin/courses") || pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/assignments")
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Content Management & Study</span>
              {contentOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
            {contentOpen && (
                <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                  <Link
                      href="/admin/courses"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pathname.startsWith("/admin/courses") ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    <BookOpen className="w-5 h-5 flex-shrink-0" />
                    <span className="flex items-start gap-0.5">
                  All Courses
                      {pendingCount !== null && pendingCount > 0 && (
                          <span style={{
                            fontSize: "9px",
                            fontWeight: "bold",
                            backgroundColor: "#ef4444",
                            color: "white",
                            borderRadius: "9999px",
                            minWidth: "14px",
                            height: "14px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 3px",
                            marginTop: "-4px",
                            marginLeft: "2px",
                          }}>
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                      )}
                </span>
                  </Link>
                  <NavLink href="/admin/categories" icon={Tag} label="Course Category & Subcategory" active={pathname.startsWith("/admin/categories")} />
                  <Link
                      href="/admin/assignments"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pathname.startsWith("/admin/assignments") ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    <ClipboardList className="w-5 h-5 flex-shrink-0" />
                    <span className="flex items-start gap-0.5">
                  Assignment
                      {assignmentPendingCount !== null && assignmentPendingCount > 0 && (
                          <span style={{
                            fontSize: "9px",
                            fontWeight: "bold",
                            backgroundColor: "#ef4444",
                            color: "white",
                            borderRadius: "9999px",
                            minWidth: "14px",
                            height: "14px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 3px",
                            marginTop: "-4px",
                            marginLeft: "2px",
                          }}>
                      {assignmentPendingCount > 9 ? "9+" : assignmentPendingCount}
                    </span>
                      )}
                </span>
                  </Link>
                </div>
            )}
          </div>

          {/* 5. AI Generated Exam Module */}
          <div>
            <button
                onClick={() => setAiExamOpen(o => !o)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname.startsWith("/admin/ai-exam")
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <BrainCircuit className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">AI Generated Exam Module</span>
              {aiExamOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
            {aiExamOpen && (
                <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                  {adminAiExamNav.map(({ icon: Icon, label, href }) => (
                      <NavLink key={href} href={href} icon={Icon} label={label} active={pathname === href} />
                  ))}
                </div>
            )}
          </div>

          {/* 6. Simulations */}
          <NavLink href="/admin/simulations" icon={Atom} label="Simulations" active={pathname.startsWith("/admin/simulations")} />

          {/* 7. Centralized Evaluation — expandable */}
          <div>
            <button
                onClick={() => setEvalOpen(o => !o)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname.startsWith("/admin/evaluation")
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <BarChart2 className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Centralized Evaluation System</span>
              {evalOpen
                  ? <ChevronDown className="w-4 h-4 opacity-70" />
                  : <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
            {evalOpen && (
                <div className="mt-1 ml-3 pl-4 border-l border-slate-700 space-y-0.5">
                  {adminEvaluationNav.map(({ icon: Icon, label, href }) => (
                      <NavLink
                          key={href}
                          href={href}
                          icon={Icon}
                          label={label}
                          active={pathname === href}
                      />
                  ))}
                </div>
            )}
          </div>

          {/* 8. Post Cadet College Preparation */}
          <NavLink href="/admin/post-cadet" icon={GraduationCap} label="Post Cadet College Preparation" active={pathname.startsWith("/admin/post-cadet")} />

          {/* 9. Teacher Evaluation */}
          <NavLink href="/admin/teacher-evaluation" icon={Star} label="Teacher Evaluation" active={pathname.startsWith("/admin/teacher-evaluation")} />

          {/* 10. System Settings */}
          <NavLink href="/admin/system-config" icon={SlidersHorizontal} label="System Settings" active={pathname.startsWith("/admin/system-config")} />

          {/* 11. Profile Settings */}
          <NavLink href="/admin/settings" icon={Settings} label="Profile Settings" active={pathname.startsWith("/admin/settings")} />
        </nav>
      </aside>
  );
}