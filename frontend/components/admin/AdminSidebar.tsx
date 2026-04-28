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
  CreditCard,
  Wallet,
  FileWarning,
  ChevronRight,
  LogOut,
  ShieldCheck, Settings,
} from "lucide-react";

import {
  BrandIcon,
  BRAND_NAME,
  BRAND_ICON_BG,
  BRAND_ICON_COLOR,
} from "@/lib/brand";

type NavItem = { icon: LucideIcon; label: string; href: string };

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Students", href: "/admin/users" },
  { icon: GraduationCap, label: "Teachers", href: "/admin/teachers" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Tag, label: "Categories", href: "/admin/categories" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: Wallet, label: "Withdrawals", href: "/admin/withdrawals" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
  { icon: FileWarning, label: "Reports", href: "/admin/reports" }, //new adding
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
      <Icon className="w-5 h-5 flex-shrink-0" />
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

  useEffect(() => {
    function fetchPending() {
      api.get("/api/admin/courses?status=PENDING&limit=1")
        .then(({ data }) => setPendingCount(data.total ?? 0))
        .catch(() => setPendingCount(0))
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
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname.startsWith(href);
          if (href === "/admin/courses") {
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex items-start gap-0.5">
                  Courses
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
            );
          }
          return (
            <NavLink
              key={href}
              href={href}
              icon={Icon}
              label={label}
              active={active}
            />
          );
        })}
      </nav>
    </aside>
  );
}
