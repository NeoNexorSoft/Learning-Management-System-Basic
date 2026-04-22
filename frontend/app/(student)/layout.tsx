import type { Metadata } from "next"
import Sidebar from "@/components/shared/Sidebar"
import ContentProtectionWrapper from "@/components/shared/ContentProtectionWrapper"

export const metadata: Metadata = { title: "Student Dashboard – Neo Nexor" }

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="student" />
      <ContentProtectionWrapper>
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </ContentProtectionWrapper>
    </div>
  )
}
