"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, Bell, User, BookOpen, LogOut, LayoutDashboard } from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"
import api from "@/lib/axios"
import { getToken, getUser } from "@/lib/auth"

const navLinks = [
  { href: "/",        label: "Home"       },
  { href: "/courses", label: "Courses"    },
  { href: "/teachers",label: "Teachers"   },
  { href: "/about",   label: "About"      },
  { href: "/blogs",   label: "Blogs"      },
  { href: "/contact", label: "Contact Us" },
]

const loginItems = [
  { href: "/auth/login/student",   label: "Login as Student"   },
  { href: "/auth/login/teacher",   label: "Login as Teacher"   },
]

const registerItems = [
  { href: "/auth/register/student", label: "Register as Student" },
  { href: "/auth/register/teacher", label: "Register as Teacher" },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [loginOpen, setLoginOpen]       = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const [token, setToken]             = useState<string | null>(null)
  const [user, setUser]               = useState<any>(null)
  const [notifs, setNotifs]           = useState<any[]>([])
  const [unread, setUnread]           = useState(0)
  const [bellOpen, setBellOpen]       = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const loginRef    = useRef<HTMLDivElement>(null)
  const registerRef = useRef<HTMLDivElement>(null)
  const bellRef     = useRef<HTMLDivElement>(null)
  const profileRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function syncUser() {
        const t = getToken()
      const u = getUser()
      setToken(t)
      setUser(u)
      if (t && u?.role === "STUDENT") {
        api.get("/api/notifications/my")
          .then(({ data }) => {
            const list = data.data?.notifications ?? data.data ?? []
            setNotifs(list.slice(0, 5))
            setUnread(list.filter((n: any) => !n.read).length)
          })
          .catch(() => {})
      }
    }

    syncUser()
    window.addEventListener("storage", syncUser)
    return () => window.removeEventListener("storage", syncUser)
  }, [])

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (loginRef.current    && !loginRef.current.contains(e.target as Node))    setLoginOpen(false)
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) setRegisterOpen(false)
      if (bellRef.current     && !bellRef.current.contains(e.target as Node))     setBellOpen(false)
      if (profileRef.current  && !profileRef.current.contains(e.target as Node))  setProfileOpen(false)
    }
    document.addEventListener("mousedown", onOutsideClick)
    return () => document.removeEventListener("mousedown", onOutsideClick)
  }, [])

  function toggleLogin()    { setLoginOpen((o) => !o); setRegisterOpen(false) }
  function toggleRegister() { setRegisterOpen((o) => !o); setLoginOpen(false) }

  function markAllRead() {
    api.patch("/api/notifications/read-all").catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  async function handleLogout() {
    setProfileOpen(false)
    try { await api.post("/api/auth/logout") } catch {}
    setToken(null)
    setUser(null)
    setNotifs([])
    setUnread(0)
    localStorage.clear()
    window.location.replace("/")
  }

  const isStudent = token && user?.role === "STUDENT"
  const isTeacher = token && user?.role === "TEACHER"

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow`}>
              <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
            </div>
            <span className="text-lg font-bold text-slate-900">{BRAND_NAME}</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-1.5">
            {isStudent || isTeacher ? (
              <div className="flex items-center gap-2">

                {/* Bell */}
                <div ref={bellRef} className="relative">
                  <button
                    onClick={() => setBellOpen(o => !o)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-900">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifs.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-slate-400 text-center">No notifications yet.</p>
                        ) : notifs.map(n => (
                          <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-indigo-50" : ""}`}>
                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 px-4 py-2.5">
                        <Link href={isTeacher ? "/teacher/notifications" : "/student/notifications"} onClick={() => setBellOpen(false)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button onClick={() => setProfileOpen(o => !o)}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 overflow-hidden">
                    {user?.avatar
                      ? <img
                          src={user.avatar}
                          alt={user.name}
                          key={user.avatar}
                          className="w-full h-full object-cover"
                        />
                      : (user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "S")
                    }
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      {/* Links */}
                      <div className="py-1">
                        <Link
                          href={isTeacher ? "/teacher/dashboard" : "/student/dashboard"}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          href={isTeacher ? "/teacher/settings" : "/student/settings"}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <User className="w-4 h-4" /> Edit Profile
                        </Link>
                      </div>
                      {/* Logout */}
                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <>
                {/* Login dropdown */}
                <div ref={loginRef} className="relative">
                  <button
                    onClick={toggleLogin}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Login <ChevronDown className={`w-3.5 h-3.5 transition-transform ${loginOpen ? "rotate-180" : ""}`} />
                  </button>
                  {loginOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      {loginItems.map(({ href, label }) => (
                        <Link key={href} href={href} onClick={() => setLoginOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Register dropdown */}
                <div ref={registerRef} className="relative">
                  <button
                    onClick={toggleRegister}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200"
                  >
                    Register <ChevronDown className={`w-3.5 h-3.5 transition-transform ${registerOpen ? "rotate-180" : ""}`} />
                  </button>
                  {registerOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      {registerItems.map(({ href, label }) => (
                        <Link key={href} href={href} onClick={() => setRegisterOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              {label}
            </Link>
          ))}

          {isStudent || isTeacher ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="px-3 py-2 flex items-center gap-2.5">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Link href={isTeacher ? "/teacher/dashboard" : "/student/dashboard"} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <BookOpen className="w-4 h-4" /> My Courses
              </Link>
              <Link href={isTeacher ? "/teacher/notifications" : "/student/notifications"} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Bell className="w-4 h-4" /> Notifications {unread > 0 && <span className="ml-auto text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{unread}</span>}
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <>
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login</p>
                {loginItems.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
              <div className="pt-2 space-y-1">
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Register</p>
                {registerItems.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
