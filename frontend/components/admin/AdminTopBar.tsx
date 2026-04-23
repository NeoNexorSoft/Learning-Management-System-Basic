"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, ShieldCheck } from "lucide-react"

const MOCK_ADMIN_NOTIFS = [
  { id: "a1", title: "New Teacher Registration", message: "A new teacher has registered and is awaiting approval.", read: false },
  { id: "a2", title: "Course Pending Review",    message: "3 courses are waiting for admin approval.",           read: false },
  { id: "a3", title: "Withdrawal Request",       message: "A teacher has requested a payout of TK 5,000.",      read: true  },
]

export default function AdminTopBar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen]       = useState(false)
  const [notifs, setNotifs]           = useState(MOCK_ADMIN_NOTIFS)
  const [inputValue, setInputValue]   = useState(searchParams.get("search") ?? "")

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

  function handleLogout() {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    document.cookie = "admin_role=; path=/; max-age=0; SameSite=Lax"
    router.push("/admin/login")
    router.refresh()
  }

  const unread = notifs.filter((n) => !n.read).length

  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
      <div className="flex-1 max-w-md relative">
       {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users, courses, categories…"
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
        />*/}
      </div>

      <div className="flex items-center gap-2">
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifs.map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${!n.read ? "bg-indigo-50/60" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            {initials}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold text-slate-900">{adminName}</p>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
              </div>

              <div className="py-1">
                <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
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
