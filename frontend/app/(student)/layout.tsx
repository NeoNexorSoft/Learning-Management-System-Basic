"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/shared/Sidebar"
import ContentProtectionWrapper from "@/components/shared/ContentProtectionWrapper"
import Navbar from "@/components/landing/Navbar"
import { getToken } from "@/lib/auth"
import { NotificationProvider } from "@/hooks/useNotifications";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        if (!getToken()) router.replace("/auth/login/student")
    }, [])

    return (
        <NotificationProvider pollInterval={60_000}>
            <div className="flex flex-col h-screen bg-slate-50">
                <Navbar/>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    <Sidebar role="student"/>
                    <ContentProtectionWrapper>
                        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                            {children}
                        </div>
                    </ContentProtectionWrapper>
                </div>
            </div>
        </NotificationProvider>
    );
}
