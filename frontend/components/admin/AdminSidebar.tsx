"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ShieldCheck,
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
  { icon: FileWarning, label: "Reports", href: "/admin/reports" }, //new adding
];

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
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
      {active && <ChevronRight className="w-4 h-4 opacity-70" />}
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
        {navItems.map(({ icon, label, href }) => (
          <NavLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname.startsWith(href)}
          />
        ))}
      </nav>
    </aside>
  );
}
