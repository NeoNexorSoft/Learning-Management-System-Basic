import type { Metadata } from "next"
import AuthForm from "@/components/auth/AuthForm"

export const metadata: Metadata = { title: "Student Login – Neo Nexor" }

export default function StudentLoginPage() {
  return <AuthForm role="student" mode="login" />
}
