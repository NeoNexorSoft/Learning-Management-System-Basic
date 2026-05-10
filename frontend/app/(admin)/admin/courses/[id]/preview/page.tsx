"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check, X, BookOpen, Users, Tag } from "lucide-react"
import api from "@/lib/axios"

type Lesson = { id: string; title: string; type: string; duration: number; order: number }
type Section = { id: string; title: string; order: number; lessons: Lesson[] }
type Objective = { id: string; type: string; content: string; order: number }
type CourseDetail = {
  id: string
  title: string
  subtitle?: string
  description?: string
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  price: number
  thumbnail?: string
  created_at: string
  totalStudents: number
  teacher: { id: string; name: string; email: string; avatar?: string; bio?: string }
  category?: { id: string; name: string; slug: string; parent?: { id: string; name: string } }
  objectives: Objective[]
  sections: Section[]
}

const STATUS_STYLES = {
  DRAFT:    "bg-slate-100 text-slate-600",
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
}

export default function AdminCoursePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [course, setCourse]         = useState<CourseDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setReason]   = useState("")
  const [actionLoading, setAction]  = useState(false)

  useEffect(() => {
    api.get(`/api/admin/courses/${id}`)
      .then(r => setCourse(r.data.data.course))
      .catch(() => setError("Failed to load course"))
      .finally(() => setLoading(false))
  }, [id])

  async function approve() {
    setAction(true)
    try {
      await api.put(`/api/admin/courses/${id}/approve`)
      setCourse(c => c ? { ...c, status: "APPROVED" } : c)
      window.dispatchEvent(new CustomEvent("pendingCountChanged"))
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed to approve") }
    finally { setAction(false) }
  }

  async function reject() {
    if (!rejectReason.trim()) return
    setAction(true)
    try {
      await api.put(`/api/admin/courses/${id}/reject`, { reason: rejectReason })
      setCourse(c => c ? { ...c, status: "REJECTED" } : c)
      window.dispatchEvent(new CustomEvent("pendingCountChanged"))
      setRejectOpen(false)
      setReason("")
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed to reject") }
    finally { setAction(false) }
  }

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
  if (error && !course) return <div className="p-8 text-center text-red-500 text-sm">{error}</div>
  if (!course) return null

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/courses")}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-slate-900">Course Preview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Admin view — all statuses</p>
        </div>
        {course.status === "PENDING" && (
          <div className="flex items-center gap-2">
            <button onClick={approve} disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              <Check className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => { setRejectOpen(true); setReason("") }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* Thumbnail */}
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title}
               className="w-full h-56 object-cover border-b border-slate-200" />
        )}

        <div className="p-6 space-y-6">

          {/* Title + status */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-slate-900">{course.title}</h2>
              {course.subtitle && <p className="text-slate-500 mt-1">{course.subtitle}</p>}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${STATUS_STYLES[course.status]}`}>
              {course.status}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{course.totalStudents} enrolled</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Tag className="w-4 h-4 text-slate-400" />
              {course.category?.parent && (
                <span className="text-slate-400">{course.category.parent.name} /</span>
              )}
              <span>{course.category?.name ?? "—"}</span>
            </div>
            <div className="font-semibold text-slate-800">
              {course.price > 0 ? `৳${course.price.toLocaleString()}` : "Free"}
            </div>
          </div>

          {/* Teacher */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
            {course.teacher.avatar ? (
              <img src={course.teacher.avatar} alt={course.teacher.name}
                   className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                {course.teacher.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800">{course.teacher.name}</p>
              <p className="text-xs text-slate-500">{course.teacher.email}</p>
              {course.teacher.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.teacher.bio}</p>}
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">{course.description}</p>
            </div>
          )}

          {/* Objectives */}
          {course.objectives.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Objectives</h3>
              <ul className="space-y-1.5">
                {course.objectives.map(obj => (
                  <li key={obj.id} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections + Lessons */}
          {course.sections.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                Curriculum ({course.sections.length} section{course.sections.length !== 1 ? "s" : ""})
              </h3>
              <div className="space-y-3">
                {course.sections.map(section => (
                  <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{section.title}</span>
                      <span className="ml-auto text-xs text-slate-400">{section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}</span>
                    </div>
                    {section.lessons.length > 0 && (
                      <ul className="divide-y divide-slate-100">
                        {section.lessons.map(lesson => (
                          <li key={lesson.id} className="px-4 py-2 flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-xs text-slate-400 w-5 text-right">{lesson.order + 1}.</span>
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs text-slate-400 uppercase">{lesson.type}</span>
                            {lesson.duration > 0 && (
                              <span className="text-xs text-slate-400">{Math.ceil(lesson.duration / 60)}m</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reject Course</h3>
            <p className="text-sm text-slate-500 mb-4">Provide a reason so the teacher can improve and resubmit.</p>
            <textarea
              value={rejectReason} onChange={e => setReason(e.target.value)}
              rows={4} placeholder="e.g. Content quality needs improvement, missing curriculum details…"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-300 resize-none"
            />
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setRejectOpen(false)}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={reject} disabled={!rejectReason.trim() || actionLoading}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
