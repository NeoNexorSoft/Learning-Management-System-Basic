"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Courses", href: "/dashboard/courses" },
  { icon: ClipboardList, label: "Assignments", href: "/dashboard/assignments" },
  { icon: Trophy, label: "Results", href: "/dashboard/results" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    // Clear the auth cookie
    document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax"
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
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
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">John Doe</p>
            <p className="text-slate-500 text-xs truncate">john@example.com</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
