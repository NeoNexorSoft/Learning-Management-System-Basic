import type { Metadata } from "next"
import AuthForm from "@/components/auth/AuthForm"

export const metadata: Metadata = { title: "Student Registration – Neo Nexor" }

export default function StudentRegisterPage() {
  return <AuthForm role="student" mode="register" />
}
