"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/axios"

interface NotifItem {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
  sender?: string
  senderRole?: string
}

export default function TopBar({
  placeholder = "Search…",
}: {
  placeholder?: string
}) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { user, logout } = useAuth()
  const isTeacher = pathname.startsWith("/teacher")

  const [profileOpen,  setProfileOpen]  = useState(false)
  const [bellOpen,     setBellOpen]     = useState(false)
  const [notifs,       setNotifs]       = useState<NotifItem[]>([])
  const [notifsLoaded, setNotifsLoaded] = useState(false)
  const [inputValue,   setInputValue]   = useState(searchParams.get("search") ?? "")

  const profileRef = useRef<HTMLDivElement>(null)
  const bellRef    = useRef<HTMLDivElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (bellRef.current    && !bellRef.current.contains(e.target as Node))    setBellOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    api.get("/api/notifications/my")
      .then(({ data }) => {
        setNotifs(data.data?.notifications ?? data.data ?? [])
      })
      .catch(() => setNotifs([]))
      .finally(() => setNotifsLoaded(true))
  }, [])

  // Sync input with URL on page navigation
  useEffect(() => {
    setInputValue(searchParams.get("search") ?? "")
  }, [searchParams])

  function handleSearch(value: string) {
    setInputValue(value)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) params.set("search", value.trim())
      else params.delete("search")
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    }, 500)
  }

  function markAllRead() {
    api.patch("/api/notifications/read-all").catch(() => {})
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unread     = notifs.filter((n) => !n.read).length
  const preview    = notifs.slice(0, 5)

  const settingsHref = isTeacher ? "/teacher/settings" : "/student/settings"
  const notifHref    = isTeacher ? "/teacher/dashboard"  : "/student/notifications"
  const displayName  = user?.name ?? (isTeacher ? "Teacher" : "Student")
  const userEmail    = user?.email ?? ""
  const initials     = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Bell + notification dropdown */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifsLoaded && unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {preview.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No notifications yet.</p>
                ) : (
                  preview.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 ${!n.read ? "bg-indigo-50/60" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        n.senderRole === "Admin" ? "bg-purple-100" : "bg-emerald-100"
                      }`}>
                        {n.senderRole === "Admin"
                          ? <ShieldCheck className="w-4 h-4 text-purple-600" />
                          : <Bell className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 px-4 py-2.5">
                <Link
                  href={notifHref}
                  onClick={() => setBellOpen(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity overflow-hidden"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href={settingsHref}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
