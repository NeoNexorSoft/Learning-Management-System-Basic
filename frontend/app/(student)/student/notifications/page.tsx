"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import PageHeader from "@/components/shared/PageHeader"
import { Bell, ShieldCheck, Loader2, CheckCheck } from "lucide-react"
import api from "@/lib/axios"

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
  sender?: string
  senderRole?: string
}

function formatDateTime(timestamp: string): string {
  const d = new Date(timestamp)
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    "  ·  " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  )
}

function NotificationsPage() {
  const searchParams = useSearchParams()
  const search = (searchParams.get("search") ?? "").toLowerCase()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    api.get("/api/notifications/my")
      .then(({ data }) => {
        setNotifications(data.data?.notifications ?? data.data ?? [])
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  function markAllRead() {
    api.patch("/api/notifications/read-all").catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markOneRead(id: string) {
    api.patch(`/api/notifications/${id}/read`).catch(() => {})
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const filtered = search
    ? notifications.filter((n) =>
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search)
      )
    : notifications

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">


      <main className="flex-1 p-6 max-w-3xl w-full">
        <div className="flex items-start justify-between mb-6">
          <PageHeader
            title="Notifications"
            subtitle={search
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchParams.get("search")}"`
              : `${unreadCount} unread · ${notifications.length} total`
            }
          />
          {unreadCount > 0 && !search && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-12 h-12 text-slate-300 mb-4" />
            {search ? (
              <p className="text-slate-500 font-medium">No notifications match "{searchParams.get("search")}".</p>
            ) : (
              <>
                <p className="text-slate-500 font-medium">No notifications yet.</p>
                <p className="text-slate-400 text-sm mt-1">You will be notified about course updates and assignments here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`bg-white border rounded-2xl p-5 flex gap-4 transition-all ${
                  n.read ? "border-slate-200" : "border-indigo-200 shadow-sm shadow-indigo-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.senderRole === "Admin" ? "bg-purple-100" : "bg-emerald-100"
                }`}>
                  {n.senderRole === "Admin"
                    ? <ShieldCheck className="w-5 h-5 text-purple-600" />
                    : <Bell className="w-5 h-5 text-emerald-600" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-slate-900">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      </div>
                      {n.sender && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mb-2 inline-block">
                          {n.sender}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(n.created_at)}
                      </span>
                      {!n.read && (
                        <button
                          onClick={() => markOneRead(n.id)}
                          className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors whitespace-nowrap"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <NotificationsPage />
    </Suspense>
  )
}
