"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"

const navLinks = [
  { href: "/",        label: "Home"     },
  { href: "/courses", label: "Courses"  },
  { href: "/teachers",label: "Teachers" },
  { href: "/about",   label: "About"    },
  { href: "/blogs",   label: "Blogs"    },
  { href: "/contact", label: "Contact Us"  },
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen]     = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const loginRef    = useRef<HTMLDivElement>(null)
  const registerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node))       setLoginOpen(false)
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) setRegisterOpen(false)
    }
    document.addEventListener("mousedown", onOutsideClick)
    return () => document.removeEventListener("mousedown", onOutsideClick)
  }, [])

  function toggleLogin()    { setLoginOpen((o) => !o); setRegisterOpen(false) }
  function toggleRegister() { setRegisterOpen((o) => !o); setLoginOpen(false) }

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

          {/* Desktop right: dropdowns + language */}
          <div className="hidden md:flex items-center gap-1.5">

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

        </div>
      )}
    </nav>
  )
}
