"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import CourseViewer from "@/components/shared/CourseViewer"

const STATUS_BADGE: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700 border border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border border-red-200",
  DRAFT:    "bg-slate-100 text-slate-600 border border-slate-200",
}

export default function AdminCoursePreviewPage() {
  const { slug }  = useParams<{ slug: string }>()
  const router    = useRouter()
  const [course, setCourse]        = useState<any>(null)
  const [loading, setLoading]      = useState(true)
  const [actionLoading, setAction] = useState(false)
  const [error, setError]          = useState("")

  useEffect(() => {
    if (!slug) return
    api.get(`/api/admin/courses/preview/${slug}`)
      .then(({ data }) => setCourse(data.data.course))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [slug])

  async function approve() {
    setAction(true); setError("")
    try {
      await api.put(`/api/admin/courses/${course.id}/approve`)
      setCourse((c: any) => ({ ...c, status: "APPROVED" }))
      window.dispatchEvent(new CustomEvent("pendingCountChanged"))
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed to approve") }
    finally { setAction(false) }
  }

  async function reject() {
    const reason = window.prompt("Reason for rejection:")
    if (!reason?.trim()) return
    setAction(true); setError("")
    try {
      await api.put(`/api/admin/courses/${course.id}/reject`, { reason })
      setCourse((c: any) => ({ ...c, status: "REJECTED" }))
      window.dispatchEvent(new CustomEvent("pendingCountChanged"))
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed to reject") }
    finally { setAction(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-500 text-lg mb-4">Course not found.</p>
        <button onClick={() => router.push("/admin/courses")}
                className="text-indigo-600 font-semibold hover:underline">
          ← Back to Courses
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/courses")}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-800 truncate flex-1 text-sm">{course.title}</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${STATUS_BADGE[course.status] ?? STATUS_BADGE.DRAFT}`}>
          {course.status}
        </span>
        {error && <span className="text-xs text-red-600 shrink-0">{error}</span>}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <CourseViewer
          course={course}
          accessLevel="full"
          showApproveReject={true}
          onApprove={approve}
          onReject={reject}
        />
      </div>
    </div>
  )
}
