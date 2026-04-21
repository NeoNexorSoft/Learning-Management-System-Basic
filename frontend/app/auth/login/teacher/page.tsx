import type { Metadata } from "next"
import AuthForm from "@/components/auth/AuthForm"

export const metadata: Metadata = { title: "Teacher Login – Neo Nexor" }

export default function TeacherLoginPage() {
  return <AuthForm role="teacher" mode="login" />
}
