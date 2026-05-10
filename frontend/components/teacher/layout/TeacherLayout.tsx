"use client";

import Sidebar from "./Sidebar";
import { Bell, Search } from "lucide-react";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f4f5fa]">
      <Sidebar />

      {/* Main content */}
      <div className="ml-[220px] min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, students..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-4.5 h-4.5 text-slate-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
              D
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}