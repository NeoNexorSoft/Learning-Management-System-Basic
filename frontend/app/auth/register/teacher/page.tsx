import type { Metadata } from "next"
import AuthForm from "@/components/auth/AuthForm"

export const metadata: Metadata = { title: "Teacher Registration – Neo Nexor" }

export default function TeacherRegisterPage() {
  return <AuthForm role="teacher" mode="register" />
}
