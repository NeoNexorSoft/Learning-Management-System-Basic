"use client";

/**
 * AdminTopBar (updated)
 *
 * Changes from original:
 * - Removed local MOCK_ADMIN_NOTIFS — now driven by AdminNotificationContext
 * - Replaced inline bell logic with <NotificationBell /> component
 * - Bell open/close state managed here and passed as props
 */

import { useState, useRef, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, ShieldCheck } from "lucide-react";
import NotificationBell from "@/components/admin/NotificationBell";

export default function AdminTopBar({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; avatar?: string } | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync user avatar/name from localStorage, updated by the settings page on save
  useEffect(() => {
    function syncUser() {
      const u = JSON.parse(localStorage.getItem("user") ?? "{}")
      setUser(u)
    }
    syncUser()
    window.addEventListener("storage", syncUser)
    return () => window.removeEventListener("storage", syncUser)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    document.cookie = "admin_role=; path=/; max-age=0; SameSite=Lax";
    router.push("/admin/login");
    router.refresh();
  }

  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left side — reserved for future search bar */}
      <div className="flex-1 max-w-md" />

      {/* Right side — Bell + Profile */}
      <div className="flex items-center gap-2">
        {/* ── Notification Bell ──────────────────────────────────────────── */}
        <NotificationBell
          isOpen={bellOpen}
          onToggle={() => setBellOpen((o) => !o)}
          onClose={() => setBellOpen(false)}
        />

        {/* ── Profile Dropdown ───────────────────────────────────────────── */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity overflow-hidden"
            aria-label="Profile menu"
          >
            {user?.avatar
              ? <img key={user.avatar} src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              : initials}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-[9999] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    {adminName}
                  </p>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </Link>
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
  );
}
