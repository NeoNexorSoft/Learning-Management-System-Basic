"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCheck,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  ListChecks,
  CheckSquare,
  AlignLeft,
  ImageIcon,
  ClipboardList,
  FlaskConical,
  Banknote,
  History,
  Star,
  CreditCard,
  Settings,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    href: "/teacher/courses",
    icon: BookOpen,
  },
  {
    label: "Enrollments",
    href: "/teacher/enrollments",
    icon: UserCheck,
  },
  {
    label: "Students",
    href: "/teacher/students",
    icon: Users,
  },
];

const examModuleLinks = [
  {
    label: "Question Generator",
    href: "/teacher/exam-module/question-generator",
    icon: FileQuestion,
  },
  {
    label: "Quiz Module",
    icon: ListChecks,
    submenu: [
      {
        label: "MCQ",
        href: "/teacher/exam-module/quiz/mcq",
        icon: CheckSquare,
      },
      {
        label: "True / False",
        href: "/teacher/exam-module/quiz/true-false",
        icon: ListChecks,
      },
      {
        label: "Fill in the Blanks",
        href: "/teacher/exam-module/quiz/fill-blanks",
        icon: AlignLeft,
      },
      {
        label: "Image Based Question",
        href: "/teacher/exam-module/quiz/image-based",
        icon: ImageIcon,
      },
    ],
  },
  {
    label: "Assignment",
    href: "/teacher/exam-module/assignment",
    icon: ClipboardList,
  },
  {
    label: "Self Test",
    href: "/teacher/exam-module/self-test",
    icon: FlaskConical,
  },
];

const bottomLinks = [
  { label: "Withdraw", href: "/teacher/withdraw", icon: Banknote },
  { label: "Withdraw History", href: "/teacher/withdraw-history", icon: History },
  { label: "Reviews", href: "/teacher/reviews", icon: Star },
  { label: "Transactions", href: "/teacher/transactions", icon: CreditCard },
  { label: "Settings", href: "/teacher/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [examModuleOpen, setExamModuleOpen] = useState(true);
  const [quizModuleOpen, setQuizModuleOpen] = useState(true);

  const isActive = (href: string) => pathname === href;
  const isExamModuleActive = pathname.includes("/teacher/exam-module");

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#1a1d2e] flex flex-col z-50 overflow-y-auto scrollbar-hide">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-base tracking-wide">Neo Nexor</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isActive(link.href)
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <link.icon className="w-4 h-4 flex-shrink-0" />
            <span>{link.label}</span>
            {isActive(link.href) && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </Link>
        ))}

        {/* AI Generated Exam Module */}
        <div className="pt-2">
          <button
            onClick={() => setExamModuleOpen(!examModuleOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isExamModuleActive
                ? "text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Wand2 className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span className="flex-1 text-left text-xs leading-tight">AI Generated Exam Module</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0",
                examModuleOpen ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>

          {examModuleOpen && (
            <div className="mt-0.5 space-y-0.5">
              {examModuleLinks.map((item) => {
                if (item.submenu) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setQuizModuleOpen(!quizModuleOpen)}
                        className={cn(
                          "w-full flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-sm transition-all duration-150",
                          pathname.includes("/quiz")
                            ? "text-white"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            quizModuleOpen ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>

                      {quizModuleOpen && (
                        <div className="mt-0.5 space-y-0.5">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                "flex items-center gap-2 pl-14 pr-3 py-2 rounded-lg text-xs transition-all duration-150",
                                isActive(sub.href)
                                  ? "text-white bg-white/10"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                              )}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-sm transition-all duration-150",
                      isActive(item.href!)
                        ? "text-white bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom links */}
        <div className="pt-2 space-y-0.5">
          {bottomLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive(link.href)
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}