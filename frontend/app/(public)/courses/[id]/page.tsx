"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { getToken, getUser } from "@/lib/auth"
import CourseViewer from "@/components/shared/CourseViewer"

export default function CourseDetailPage() {
  const { id: slug } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.get(`/api/courses/${slug}`)
      .then(({ data }) => setCourse(data.data.course))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleEnroll() {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      router.push("/auth/login/student")
      return
    }
    if (user.role !== "STUDENT") {
      router.push("/student/dashboard")
      return
    }
    // Redirect to payment page
    router.push(`/student/courses/${course.id}/payment`)
  }

  if (loading) {
    return (
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </main>
    )
  }

  if (!course) {
    return (
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-4">Course not found.</p>
          <Link href="/courses" className="text-indigo-600 font-semibold hover:underline">
            ← Back to Courses
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CourseViewer
          course={course}
          accessLevel="public"
          onEnroll={handleEnroll}
        />
      </div>
    </main>
  )
}
