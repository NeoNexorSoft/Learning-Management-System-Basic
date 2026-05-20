export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import Sidebar from "@/components/shared/Sidebar";
import ContentProtectionWrapper from "@/components/shared/ContentProtectionWrapper";
import TopBar from "@/components/shared/TopBar";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata: Metadata = { title: "Student Panel – Neo Nexor" };

export default function StudentLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <NotificationProvider pollInterval={60_000}>
            <div className="flex h-screen overflow-hidden bg-slate-50">
                <Sidebar role="student" />
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    <TopBar placeholder="Search courses, assignments…" />
                    <ContentProtectionWrapper>
                        {children}
                    </ContentProtectionWrapper>
                </div>
            </div>
        </NotificationProvider>
    );
}