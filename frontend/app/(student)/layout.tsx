export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Sidebar from "@/components/shared/Sidebar";
import ContentProtectionWrapper from "@/components/shared/ContentProtectionWrapper";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata: Metadata = { title: "Student Panel – Neo Nexor" };

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider pollInterval={60_000}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar role="student" />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <ContentProtectionWrapper>
            {children}
          </ContentProtectionWrapper>
        </div>
      </div>
    </NotificationProvider>
  );
}