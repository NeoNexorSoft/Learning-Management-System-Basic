import type { Metadata } from "next"
import VerifyEmail from "@/components/auth/VerifyEmail"

export const metadata: Metadata = { title: "Teacher Login – Neo Nexor" }

export default function TeacherLoginPage() {
  return <VerifyEmail />
}
