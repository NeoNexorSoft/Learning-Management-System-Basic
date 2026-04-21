import type { Metadata } from "next"
import Sidebar from "@/components/shared/Sidebar"

export const metadata: Metadata = { title: "Teacher Panel – Neo Nexor" }

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="teacher" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
