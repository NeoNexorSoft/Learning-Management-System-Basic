import { Suspense } from "react"
import type { Metadata } from "next"
import VerifyEmail from "@/components/auth/VerifyEmail"

export const metadata: Metadata = { title: "Teacher Login – Neo Nexor" }

export default function TeacherLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white text-slate-500">Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  )
}
