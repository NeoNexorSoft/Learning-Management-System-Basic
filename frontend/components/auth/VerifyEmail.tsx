"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, BookOpen, Users, Award, CheckCircle } from "lucide-react"
import { BrandIcon, BRAND_NAME, BRAND_ICON_BG, BRAND_ICON_COLOR } from "@/lib/brand"
import { translations } from "@/lib/translations"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/axios"

export default function VerifyEmail() {
  const router = useRouter()
  const t = translations
  const { login } = useAuth()
  const [role, setRole]       = useState<string>("")
  const [error, setError]       = useState<string>("")
  const [success, setSuccess]   = useState<string>("")
  const [loading, setLoading]   = useState<boolean>(false)
  
  // extract token from url query
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) return;

    verifyToken();
  }, [token]);

  async function verifyToken() {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // call verify email api with token, if successful, log the user in and redirect to home page
      const res = await api.post("/api/auth/verify-email", { token })

      if (res && res.data) {
        const role = res?.data?.data?.user?.role.toLowerCase();
        setRole(role)
        setSuccess(t.auth.emailVerificacationSuccessMessage)
        setLoading(false)
        setTimeout(() => router.replace(`/auth/login/${role}`), 1500)
      }
    } catch (err: unknown) {
      setError(t.auth.emailVerificationFailedMessage)
      setLoading(false)
    }
  }

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
            Welcome back!<br />
            <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Continue learning and growing with us.
            </span>
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Create your account and join thousands of learners transforming their careers.
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

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Email verification</h1>
          <p className="text-slate-500 mb-8">
            {!token && t.auth.emailVerificationSentText}
            {token && (
              <>
                {t.auth.emailVerifingText}
                <Link href={`/auth/login/${role}`} className="text-indigo-600 font-semibold hover:underline">
                  Click here
                </Link>
              </>
            )}
          </p>

          {/* Email verification messages */}

          {loading && (
            <div>
              <p className="text-black/80 text-md mb-2">
                Please wait
                <span className="animate-pulse">.</span>
                <span className="animate-pulse animation-delay-200">.</span>
                <span className="animate-pulse animation-delay-400">.</span>
              </p>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
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

          <p className="text-center text-xs text-slate-400 mt-8">{t.auth.termsNote}</p>
        </div>
      </div>
    </div>
  )
}
