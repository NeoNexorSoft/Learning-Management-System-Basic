"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
} from "lucide-react";
import axios from "axios";
import {
  BrandIcon,
  BRAND_NAME,
  BRAND_ICON_BG,
  BRAND_ICON_COLOR,
} from "@/lib/brand";

type LoginResponse = {
  status?: string;
  message?: string;
  data?: {
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken?: string;
    refreshToken?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken?: string;
  refreshToken?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (token && user) router.replace("/admin/dashboard");
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const payload = response.data.data ?? response.data;
      const user = payload.user;
      const accessToken = payload.accessToken;

      if (!user || !accessToken) {
        throw new Error("Invalid login response from server.");
      }

      if (user.role !== "ADMIN") {
        setError("Access denied. Admin account required.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem(
        "admin_user",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }),
      );

      document.cookie = "admin_role=admin; path=/; max-age=86400; SameSite=Lax";

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Invalid email or password."
        : err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";

      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
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
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div
            className={`w-11 h-11 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <BrandIcon className={`w-6 h-6 ${BRAND_ICON_COLOR}`} />
          </div>
          <div>
            <span className="text-2xl font-bold text-white">{BRAND_NAME}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-indigo-400 font-semibold">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Manage everything
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              from one place
            </span>
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Full control over users, courses, payments, and platform settings.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, value: "10K+", label: "Users" },
              { icon: BookOpen, value: "500+", label: "Courses" },
              { icon: Award, value: "98%", label: "Uptime" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center"
              >
                <Icon className="w-5 h-5 text-indigo-300 mx-auto mb-2" />
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-indigo-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white/10 border border-white/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <p className="text-indigo-200 text-sm font-semibold">
              Restricted Access
            </p>
          </div>
          <p className="text-indigo-300 text-xs leading-relaxed">
            This portal is exclusively for authorized administrators. All
            actions are logged for security purposes.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 bg-white">
        <div className="max-w-md w-full mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className={`w-9 h-9 ${BRAND_ICON_BG} rounded-xl flex items-center justify-center`}
            >
              <BrandIcon className={`w-5 h-5 ${BRAND_ICON_COLOR}`} />
            </div>
            <span className="text-xl font-bold text-slate-900">
              {BRAND_NAME}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 bg-purple-100 text-purple-700">
            <ShieldCheck className="w-3 h-3" /> Administrator
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Admin Sign In
          </h1>
          <p className="text-slate-500 mb-8">
            Restricted access — admin accounts only.
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@neonexor.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="123456"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            All admin activity is monitored and logged for security compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
