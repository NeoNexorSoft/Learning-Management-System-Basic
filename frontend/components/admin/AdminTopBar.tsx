"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, User, ShieldCheck } from "lucide-react"
import api from "@/lib/axios"

const MOCK_ADMIN_NOTIFS = [
  { id: "a1", title: "New Teacher Registration", message: "A new teacher has registered and is awaiting approval.", read: false },
  { id: "a2", title: "Course Pending Review",    message: "3 courses are waiting for admin approval.",           read: false },
  { id: "a3", title: "Withdrawal Request",       message: "A teacher has requested a payout of TK 5,000.",      read: true  },
]

export default function AdminTopBar({
                                      adminName,
                                      adminEmail,
                                      adminAvatar,
                                    }: {
  adminName?: string
  adminEmail?: string
  adminAvatar?: string
}) {
  const router = useRouter()

  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen]       = useState(false)
  const [notifs, setNotifs]           = useState(MOCK_ADMIN_NOTIFS)

  const [name,   setName]   = useState(adminName   ?? "")
  const [email,  setEmail]  = useState(adminEmail  ?? "")
  const [avatar, setAvatar] = useState(adminAvatar ?? "")

  const profileRef = useRef<HTMLDivElement>(null)
  const bellRef    = useRef<HTMLDivElement>(null)

  // Always fetch latest user data from server
  useEffect(() => {
    api.get("/api/auth/me")
        .then(({ data }) => {
          const u = data.data.user
          if (u?.name)   setName(u.name)
          if (u?.email)  setEmail(u.email)
          if (u?.avatar) setAvatar(u.avatar)
        })
        .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (bellRef.current    && !bellRef.current.contains(e.target as Node))    setBellOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleLogout() {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    document.cookie = "admin_role=; path=/; max-age=0; SameSite=Lax"
    router.push("/admin/login")
    router.refresh()
  }

  const unread = notifs.filter((n) => !n.read).length

  const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex-1 max-w-md relative" />

        <div className="flex items-center gap-2">

          {/* Bell */}
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
                        <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-slate-50 last:border-0 ${!n.read ? "bg-indigo-50/60" : ""}`}
                        >
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

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
                onClick={() => setProfileOpen((o) => !o)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity overflow-hidden"
            >
              {avatar
                  ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  : initials
              }
            </button>

            {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-bold text-slate-900">{name}</p>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                  </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{email}</p>
                  </div>

                  <div className="py-1">
                    <button
                        onClick={() => { setProfileOpen(false); router.push("/admin/settings") }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Edit Profile
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