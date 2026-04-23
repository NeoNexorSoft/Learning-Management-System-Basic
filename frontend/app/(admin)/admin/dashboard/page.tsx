"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users, UserCheck, Mail, GraduationCap, BookOpen, Clock,
  CheckCircle, XCircle, CreditCard, Wallet, TrendingUp, AlertCircle,
} from "lucide-react"
import api from "@/lib/axios"
import type { DashboardStats } from "@/types/admin"

const zero: DashboardStats = {
  totalUsers: 0, activeUsers: 0, emailVerified: 0,
  totalTeachers: 0, activeTeachers: 0,
  totalCourses: 0, pendingCourses: 0, approvedCourses: 0, rejectedCourses: 0,
  totalPayments: "0.00", pendingPayments: "0.00",
  totalWithdrawals: "0.00", pendingWithdrawals: "0.00",
}

function StatCard({
  icon: Icon, label, value, sub, iconBg, iconColor, href, onClick,
}: {
  icon: React.ElementType; label: string; value: string | number; sub: string
  iconBg: string; iconColor: string; href?: string; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{sub}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats,   setStats]   = useState<DashboardStats>(zero)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [studentsRes, teachersRes, allCoursesRes, pendingRes, approvedRes, rejectedRes] =
          await Promise.allSettled([
            api.get("/api/users", { params: { role: "STUDENT", limit: 1 } }),
            api.get("/api/users", { params: { role: "TEACHER", limit: 1 } }),
            api.get("/api/admin/courses", { params: { limit: 1 } }),
            api.get("/api/admin/courses", { params: { status: "PENDING",  limit: 1 } }),
            api.get("/api/admin/courses", { params: { status: "APPROVED", limit: 1 } }),
            api.get("/api/admin/courses", { params: { status: "REJECTED", limit: 1 } }),
          ])

        function getTotal(res: typeof studentsRes): number {
          if (res.status !== "fulfilled") return 0
          const d = res.value.data?.data
          if (!d) return 0
          return d.total ?? d.count ?? (Array.isArray(d) ? d.length : 0)
        }

        setStats({
          totalUsers:         getTotal(studentsRes),
          activeUsers:        getTotal(studentsRes),
          emailVerified:      0,
          totalTeachers:      getTotal(teachersRes),
          activeTeachers:     getTotal(teachersRes),
          totalCourses:       getTotal(allCoursesRes),
          pendingCourses:     getTotal(pendingRes),
          approvedCourses:    getTotal(approvedRes),
          rejectedCourses:    getTotal(rejectedRes),
          totalPayments:      "0.00",
          pendingPayments:    "0.00",
          totalWithdrawals:   "0.00",
          pendingWithdrawals: "0.00",
        })
      } catch {
        setError("Failed to load dashboard statistics.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n: number) => loading ? "…" : n.toLocaleString()
  const fmtBDT = (v: string) => loading ? "…" : `৳ ${parseFloat(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  return (
    <main className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and key metrics</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Users */}
      <div>
        <SectionTitle title="Users" sub="Registered students and overall activity" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard icon={Users}     label="Total Users"           value={fmt(stats.totalUsers)}    sub="All registered users"        iconBg="bg-indigo-50"  iconColor="text-indigo-600" onClick={() => router.push("/admin/users")} />
          <StatCard icon={UserCheck} label="Active Users"          value={fmt(stats.activeUsers)}   sub="Non-banned accounts"         iconBg="bg-emerald-50" iconColor="text-emerald-600" onClick={() => router.push("/admin/users?tab=ACTIVE")} />
          <StatCard icon={Mail}      label="Email Verified"        value={fmt(stats.emailVerified)} sub="Confirmed email addresses"   iconBg="bg-sky-50"     iconColor="text-sky-600" onClick={() => router.push("/admin/users?tab=VERIFIED")} />
          <StatCard icon={GraduationCap} label="Total Teachers"   value={fmt(stats.totalTeachers)} sub="Registered instructors"      iconBg="bg-violet-50"  iconColor="text-violet-600" onClick={() => router.push("/admin/teachers")} />
          <StatCard icon={UserCheck} label="Active Teachers"       value={fmt(stats.activeTeachers)} sub="Unbanned instructors"       iconBg="bg-teal-50"    iconColor="text-teal-600" onClick={() => router.push("/admin/teachers?tab=ACTIVE")} />
        </div>
      </div>

      {/* Courses */}
      <div>
        <SectionTitle title="Courses" sub="Published, pending, and rejected content" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen}    label="Total Courses"    value={fmt(stats.totalCourses)}    sub="All course records"       iconBg="bg-indigo-50"  iconColor="text-indigo-600" onClick={() => router.push("/admin/courses")} />
          <StatCard icon={Clock}       label="Pending Review"   value={fmt(stats.pendingCourses)}  sub="Awaiting admin approval"  iconBg="bg-amber-50"   iconColor="text-amber-600" onClick={() => router.push("/admin/courses?tab=PENDING")} />
          <StatCard icon={CheckCircle} label="Approved Courses" value={fmt(stats.approvedCourses)} sub="Live on the platform"     iconBg="bg-emerald-50" iconColor="text-emerald-600" onClick={() => router.push("/admin/courses?tab=APPROVED")} />
          <StatCard icon={XCircle}     label="Rejected Courses" value={fmt(stats.rejectedCourses)} sub="Declined by admin"        iconBg="bg-red-50"     iconColor="text-red-600" onClick={() => router.push("/admin/courses?tab=REJECTED")} />
        </div>
      </div>

      {/* Payments & Withdrawals */}
      <div>
        <SectionTitle title="Financials" sub="Payment collections and withdrawal requests" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CreditCard} label="Total Payments"       value={fmtBDT(stats.totalPayments)}       sub="All-time revenue collected"  iconBg="bg-indigo-50"  iconColor="text-indigo-600" onClick={() => router.push("/admin/payments")} />
          <StatCard icon={AlertCircle} label="Pending Payments"    value={fmtBDT(stats.pendingPayments)}     sub="Awaiting confirmation"       iconBg="bg-amber-50"   iconColor="text-amber-600" onClick={() => router.push("/admin/payments?tab=PENDING")} />
          <StatCard icon={Wallet}     label="Total Withdrawals"    value={fmtBDT(stats.totalWithdrawals)}    sub="Paid out to teachers"        iconBg="bg-violet-50"  iconColor="text-violet-600" onClick={() => router.push("/admin/withdrawals")} />
          <StatCard icon={Clock}      label="Pending Withdrawals"  value={fmtBDT(stats.pendingWithdrawals)}  sub="Awaiting admin approval"     iconBg="bg-rose-50"    iconColor="text-rose-600" onClick={() => router.push("/admin/withdrawals?tab=PENDING")} />
        </div>
      </div>
    </main>
  )
}
