"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import CourseViewer from "@/components/shared/CourseViewer"

export default function TeacherCoursePreviewPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/api/teacher/courses/${id}`)
      .then(({ data }) => {
        const slug = data.data.course.slug
        return api.get(`/api/admin/courses/preview/${slug}`)
      })
      .then(({ data }) => setCourse(data.data.course))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-500 text-lg mb-4">Course not found.</p>
        <button
          onClick={() => router.push("/teacher/courses")}
          className="text-indigo-600 font-semibold hover:underline"
        >
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
          onClick={() => router.push("/teacher/courses")}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium">Course Preview</p>
          <p className="text-sm font-semibold text-slate-800 truncate">{course.title}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <CourseViewer
          course={course}
          accessLevel="full"
          showApproveReject={false}
        />
      </div>
    </div>
  )
}
