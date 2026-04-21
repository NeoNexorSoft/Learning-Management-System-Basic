"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, ArrowLeft, BookOpen, Users, Award, CheckCircle } from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"
import { translations } from "@/lib/translations"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/axios"

type Props = {
  role: "student" | "teacher"
  mode: "login" | "register"
}

export default function AuthForm({ role, mode }: Props) {
  const router = useRouter()
  const t = translations
  const { login } = useAuth()

  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const heading = {
    "student-login":    t.auth.studentLogin,
    "teacher-login":    t.auth.teacherLogin,
    "student-register": t.auth.studentRegister,
    "teacher-register": t.auth.teacherRegister,
  }[`${role}-${mode}`]

  const demoCreds = role === "student"
    ? [{ email: "alice@neonexor.com", password: "Password123" }, { email: "bob@neonexor.com", password: "Password123" }]
    : [{ email: "john@neonexor.com",  password: "Password123" }, { email: "sarah@neonexor.com", password: "Password123" }]
  const primaryDemo = demoCreds[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const form     = new FormData(e.currentTarget)
    const email    = (form.get("email") as string).trim().toLowerCase()
    const password = form.get("password") as string

    try {
      if (mode === "login") {
        await login(email, password, role)
        // login() handles redirect; loading stays true during navigation
      } else {
        const name = (new FormData(e.currentTarget).get("name") as string)?.trim()
        await api.post("/api/auth/register", {
          name,
          email,
          password,
          role: role.toUpperCase(),
        })
        setSuccess(t.auth.registrationSuccess)
        setLoading(false)
        setTimeout(() => router.push(`/auth/login/${role}`), 1500)
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error && (err as any).response?.data?.message
          ? (err as any).response.data.message
          : err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      setError(msg)
      setLoading(false)
    }
  }

  function fillDemo() {
    const emailEl    = document.getElementById("email")    as HTMLInputElement
    const passwordEl = document.getElementById("password") as HTMLInputElement
    if (emailEl)    emailEl.value    = primaryDemo.email
    if (passwordEl) passwordEl.value = primaryDemo.password
  }

  const oppositeMode  = mode === "login" ? "register" : "login"
  const oppositeLabel = mode === "login" ? t.auth.signUpFree : t.auth.signInHere
  const oppositeNote  = mode === "login" ? t.auth.noAccount  : t.auth.hasAccount

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className={`w-11 h-11 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow-lg`}>
            <BrandIcon className={`w-6 h-6 ${BRAND_ICON_COLOR}`} />
          </div>
          <span className="text-2xl font-bold text-white">{BRAND_NAME}</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            {mode === "login" ? "Welcome back!" : "Join us today!"}<br />
            <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              {mode === "login" ? "Continue learning" : "Start learning"}
            </span>
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            {mode === "login"
              ? "Sign in to access your courses, track progress, and unlock new skills."
              : "Create your account and join thousands of learners transforming their careers."}
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users,    value: "10K+", label: "Students" },
              { icon: BookOpen, value: "500+", label: "Courses"  },
              { icon: Award,    value: "98%",  label: "Success"  },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <Icon className="w-5 h-5 text-indigo-300 mx-auto mb-2" />
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-indigo-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white/10 border border-white/20 rounded-2xl p-5">
          <p className="text-indigo-100 text-sm italic mb-3">
            &ldquo;{BRAND_NAME} transformed my career. I landed a developer job within 6 months of completing my first course.&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              MC
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Michael Chen</p>
              <p className="text-indigo-400 text-xs">Full-Stack Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 bg-white">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {t.auth.backToHome}
          </Link>

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center`}>
              <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
            </div>
            <span className="text-xl font-bold text-slate-900">{BRAND_NAME}</span>
          </div>

          <div className="flex">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            role === "student" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
          }`}>
            {role === "student" ? "Student" : "Teacher"}
          </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{heading}</h1>
          <p className="text-slate-500 mb-8">
            {oppositeNote}{" "}
            <Link href={`/auth/${oppositeMode}/${role}`} className="text-indigo-600 font-semibold hover:underline">
              {oppositeLabel}
            </Link>
          </p>

          {/* Demo credentials — login only */}
          {mode === "login" && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-800 font-semibold mb-2">{t.auth.demoCredentials}</p>
              {demoCreds.map((cred, i) => (
                <div key={cred.email} className={i > 0 ? "mt-2 pt-2 border-t border-indigo-200" : ""}>
                  <p className="text-xs text-indigo-600">
                    Email: <span className="font-mono font-bold">{cred.email}</span>
                  </p>
                  <p className="text-xs text-indigo-600">
                    Password: <span className="font-mono font-bold">{cred.password}</span>
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline underline-offset-2"
              >
                {t.auth.autoFill}
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.auth.name}
                </label>
                <input
                  id="name" name="name" type="text" required autoComplete="name" placeholder="John Doe"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t.auth.email}
              </label>
              <input
                id="email" name="email" type="email" required autoComplete="email" placeholder={primaryDemo.email}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  {t.auth.password}
                </label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-indigo-600 font-medium hover:underline">
                    {t.auth.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} required
                  autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} required
                    autoComplete="new-password" placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                  <button
                    type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" name="remember" className="w-4 h-4 rounded border-slate-300 accent-indigo-600" />
                <label htmlFor="remember" className="text-sm text-slate-600">{t.auth.rememberMe}</label>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? t.auth.signingIn : t.auth.registering}
                </>
              ) : (
                mode === "login" ? t.auth.signIn : t.auth.signUp
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">{t.auth.termsNote}</p>
        </div>
      </div>
    </div>
  )
}
