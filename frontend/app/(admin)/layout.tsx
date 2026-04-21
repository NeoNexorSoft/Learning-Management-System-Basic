"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopBar from "@/components/admin/AdminTopBar"
import type { AdminUser } from "@/types/admin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    const raw   = localStorage.getItem("admin_user")
    if (!token || !raw) {
      router.replace("/admin/login")
      return
    }
    try {
      const user: AdminUser = JSON.parse(raw)
      if (user.role !== "ADMIN") { router.replace("/admin/login"); return }
      setAdmin(user)
    } catch {
      router.replace("/admin/login")
      return
    }
    setReady(true)
  }, [router])

  if (!ready || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="w-8 h-8 border-4 border-[#334155] border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A]">
      <AdminSidebar adminName={admin.name} adminEmail={admin.email} />
      <div
        className="flex-1 flex flex-col min-w-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#E5EEE4] [&::-webkit-scrollbar-thumb]:bg-[#334155] [&::-webkit-scrollbar-thumb:hover]:bg-[#6366F1]"
        style={{ backgroundColor: "#EEEEEE" }}
      >
        <AdminTopBar adminName={admin.name} adminEmail={admin.email} />
        {children}
      </div>
    </div>
  )
}
