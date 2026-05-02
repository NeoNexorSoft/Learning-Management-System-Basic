"use client";

import { useState, useEffect , Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Mail,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
  Banknote,
  CircleDollarSign,
} from "lucide-react";
import api from "@/lib/axios";
import type { DashboardStats } from "@/types/admin";

const zero: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  emailVerified: 0,
  totalTeachers: 0,
  activeTeachers: 0,
  totalCourses: 0,
  pendingCourses: 0,
  approvedCourses: 0,
  rejectedCourses: 0,
  totalPayments: "0.00",
  pendingPayments: "0.00",
  totalWithdrawals: "0.00",
  pendingWithdrawals: "0.00",
};

type PaymentSummary = {
  totalRevenue: number;
  pendingAmount: number;
  completedPayments: number;
  pendingPayments: number;
};

const zeroPaymentSummary: PaymentSummary = {
  totalRevenue: 0,
  pendingAmount: 0,
  completedPayments: 0,
  pendingPayments: 0,
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatBDT(value: number, loading: boolean) {
  if (loading) return "…";

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(value);
}

function buildPaymentSummary(payments: any[]): PaymentSummary {
  return payments.reduce<PaymentSummary>(
    (summary, payment) => {
      const amount = toNumber(
        payment.amount ?? payment.converted_amount ?? payment.convertedAmount,
      );

      if (payment.status === "COMPLETED") {
        summary.totalRevenue += amount;
        summary.completedPayments += 1;
      }

      if (payment.status === "PENDING" || payment.status === "INITIATED") {
        summary.pendingAmount += amount;
        summary.pendingPayments += 1;
      }

      return summary;
    },
    { ...zeroPaymentSummary },
  );
}

function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(zero);
  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummary>(zeroPaymentSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          studentsRes,
          teachersRes,
          allCoursesRes,
          pendingRes,
          approvedRes,
          rejectedRes,
          paymentsRes,
        ] = await Promise.allSettled([
          api.get("/api/users", { params: { role: "STUDENT", limit: 1 } }),
          api.get("/api/users", { params: { role: "TEACHER", limit: 1 } }),
          api.get("/api/admin/courses", { params: { limit: 1 } }),
          api.get("/api/admin/courses", {
            params: { status: "PENDING", limit: 1 },
          }),
          api.get("/api/admin/courses", {
            params: { status: "APPROVED", limit: 1 },
          }),
          api.get("/api/admin/courses", {
            params: { status: "REJECTED", limit: 1 },
          }),
          api.get("/api/admin/payments", { params: { limit: 100 } }),
        ]);

        function getTotal(res: typeof studentsRes): number {
          if (res.status !== "fulfilled") return 0;
          const d = res.value.data?.data;
          if (!d) return 0;
          return d.total ?? d.count ?? (Array.isArray(d) ? d.length : 0);
        }

        function getPayments(): any[] {
          if (paymentsRes.status !== "fulfilled") return [];

          const payload = paymentsRes.value.data?.data;

          if (Array.isArray(payload)) return payload;
          if (Array.isArray(payload?.payments)) return payload.payments;
          if (Array.isArray(payload?.data)) return payload.data;

          return [];
        }

        const payments = getPayments();
        const summary = buildPaymentSummary(payments);

        setStats({
          totalUsers: getTotal(studentsRes),
          activeUsers: getTotal(studentsRes),
          emailVerified: 0,
          totalTeachers: getTotal(teachersRes),
          activeTeachers: getTotal(teachersRes),
          totalCourses: getTotal(allCoursesRes),
          pendingCourses: getTotal(pendingRes),
          approvedCourses: getTotal(approvedRes),
          rejectedCourses: getTotal(rejectedRes),
          totalPayments: summary.totalRevenue.toFixed(2),
          pendingPayments: summary.pendingAmount.toFixed(2),
          totalWithdrawals: "0.00",
          pendingWithdrawals: "0.00",
        });

        setPaymentSummary(summary);
      } catch {
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const fmt = (n: number) => (loading ? "…" : n.toLocaleString());

  return (
    <main className="flex-1 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <SectionTitle
          title="Users"
          sub="Registered students and teachers and overall activity"
        />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={fmt(stats.totalUsers)}
            sub="All registered users"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            onClick={() => router.push("/admin/users")}
          />
          <StatCard
            icon={UserCheck}
            label="Active Students"
            value={fmt(stats.activeUsers)}
            sub="Non-banned accounts"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => router.push("/admin/users?tab=ACTIVE")}
          />
          <StatCard
            icon={Mail}
            label="Email Verified"
            value={fmt(stats.emailVerified)}
            sub="Confirmed email addresses"
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
            onClick={() => router.push("/admin/users?tab=VERIFIED")}
          />
          <StatCard
            icon={GraduationCap}
            label="Total Teachers"
            value={fmt(stats.totalTeachers)}
            sub="Registered instructors"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            onClick={() => router.push("/admin/teachers")}
          />
          <StatCard
            icon={UserCheck}
            label="Active Teachers"
            value={fmt(stats.activeTeachers)}
            sub="Unbanned instructors"
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            onClick={() => router.push("/admin/teachers?tab=ACTIVE")}
          />
        </div>
      </div>

      <div>
        <SectionTitle
          title="Courses"
          sub="Published, pending, and rejected content"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={fmt(stats.totalCourses)}
            sub="All course records"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            onClick={() => router.push("/admin/courses")}
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={fmt(stats.pendingCourses)}
            sub="Awaiting admin approval"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            onClick={() => router.push("/admin/courses?tab=PENDING")}
          />
          <StatCard
            icon={CheckCircle}
            label="Approved Courses"
            value={fmt(stats.approvedCourses)}
            sub="Live on the platform"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => router.push("/admin/courses?tab=APPROVED")}
          />
          <StatCard
            icon={XCircle}
            label="Rejected Courses"
            value={fmt(stats.rejectedCourses)}
            sub="Declined by admin"
            iconBg="bg-red-50"
            iconColor="text-red-600"
            onClick={() => router.push("/admin/courses?tab=REJECTED")}
          />
        </div>
      </div>

      <div>
        <SectionTitle
          title="Payments Summary"
          sub="Revenue, pending amount, and completed payment overview"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={CircleDollarSign}
            label="Total Revenue"
            value={formatBDT(paymentSummary.totalRevenue, loading)}
            sub="Completed payment revenue"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => router.push("/admin/payments")}
          />

          <StatCard
            icon={AlertCircle}
            label="Pending Amount"
            value={formatBDT(paymentSummary.pendingAmount, loading)}
            sub="Awaiting confirmation"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            onClick={() => router.push("/admin/payments?tab=PENDING")}
          />

          <StatCard
            icon={CheckCircle}
            label="Completed Payments"
            value={fmt(paymentSummary.completedPayments)}
            sub="Successfully completed"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            onClick={() => router.push("/admin/payments?tab=COMPLETED")}
          />

          <StatCard
            icon={Banknote}
            label="Pending Payments"
            value={fmt(paymentSummary.pendingPayments)}
            sub="Pending payment count"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            onClick={() => router.push("/admin/payments?tab=PENDING")}
          />
        </div>
      </div>

      <div>
        <SectionTitle
          title="Financials"
          sub="Payment collections and withdrawal requests"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CreditCard}
            label="Total Payments"
            value={formatBDT(toNumber(stats.totalPayments), loading)}
            sub="All-time revenue collected"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            onClick={() => router.push("/admin/payments")}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Payments"
            value={formatBDT(toNumber(stats.pendingPayments), loading)}
            sub="Awaiting confirmation"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            onClick={() => router.push("/admin/payments?tab=PENDING")}
          />
          <StatCard
            icon={Wallet}
            label="Total Withdrawals"
            value={formatBDT(toNumber(stats.totalWithdrawals), loading)}
            sub="Paid out to teachers"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            onClick={() => router.push("/admin/withdrawals")}
          />
          <StatCard
            icon={Clock}
            label="Pending Withdrawals"
            value={formatBDT(toNumber(stats.pendingWithdrawals), loading)}
            sub="Awaiting admin approval"
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            onClick={() => router.push("/admin/withdrawals?tab=PENDING")}
          />
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AdminDashboardPage />
    </Suspense>
  )
}
