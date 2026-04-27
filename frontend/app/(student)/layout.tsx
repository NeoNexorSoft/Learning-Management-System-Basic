import type { Metadata } from "next";
import Sidebar from "@/components/shared/Sidebar";
import ContentProtectionWrapper from "@/components/shared/ContentProtectionWrapper";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata: Metadata = { title: "Student Dashboard – Neo Nexor" };

/**
 * Student panel layout.
 *
 * Wraps the entire student panel with <NotificationProvider> so that:
 *   - TopBar bell icon  ── reads unread count & notifications
 *   - Sidebar Bell nav  ── reads unread count for badge
 *
 * Both components share ONE fetch, ONE state — no double requests.
 * Poll interval: 60 s for near-real-time updates without hammering the API.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider pollInterval={60_000}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar role="student" />
        <ContentProtectionWrapper>
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {children}
          </div>
        </ContentProtectionWrapper>
      </div>
    </NotificationProvider>
  );
}
