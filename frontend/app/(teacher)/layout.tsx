import type { Metadata } from "next";
import Sidebar from "@/components/shared/Sidebar";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata: Metadata = { title: "Teacher Panel – Neo Nexor" };

/**
 * Teacher panel layout.
 * Same <NotificationProvider> pattern as the student layout —
 * reuses the identical hook, single fetch, shared state.
 */
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider pollInterval={60_000}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar role="teacher" />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </NotificationProvider>
  );
}
