"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import {
  Plus, Eye, Edit, Clock, CheckCircle, XCircle,
  FileText, BookOpen, AlertCircle, Loader2,
  PlayCircle, HelpCircle, Users
} from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

type Course = {
  id: string
  title: string
  slug: string
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  price: number
  discount_price?: number
  thumbnail?: string
  category?: { name: string }
  _count?: { enrollments: number; sections: number }
  totalSections?: number
  totalLessons?: number
  totalQuizzes?: number
  totalStudents?: number
  created_at: string
}

const STATUS_CONFIG = {
  DRAFT:    { label: "Draft",       icon: FileText,       color: "text-slate-600",  bg: "bg-slate-100",  border: "border-slate-200" },
  PENDING:  { label: "Under Review",icon: Clock,          color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200" },
  APPROVED: { label: "Approved",    icon: CheckCircle,    color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200" },
  REJECTED: { label: "Rejected",    icon: XCircle,        color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200" },
}

function TeacherCoursesPage() {
  const [courses, setCourses] = useState<{ data: Course[]; total: number; page: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/teacher/courses", { params: { limit: 100 } })
        .then(({ data }) => setCourses(data))
        .catch(() => setCourses(null))
        .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:    courses?.data?.length ?? 0,
    approved: courses?.data?.filter(c => c.status === "APPROVED").length ?? 0,
    pending:  courses?.data?.filter(c => c.status === "PENDING").length ?? 0,
    rejected: courses?.data?.filter(c => c.status === "REJECTED").length ?? 0,
  }

  return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search courses…" />
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">My Courses</h1>
              <p className="text-sm text-slate-500 mt-0.5">{stats.total} course{stats.total !== 1 ? "s" : ""} total</p>
            </div>
            <Link href="/teacher/courses/create"
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Create Course
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",    value: stats.total,    color: "text-slate-800" },
              { label: "Approved", value: stats.approved, color: "text-emerald-700" },
              { label: "Pending",  value: stats.pending,  color: "text-amber-700" },
              { label: "Rejected", value: stats.rejected, color: "text-red-700" },
            ].map(s => (
                <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
                </div>
            ))}
          </div>

          {/* Course list */}
          {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
          ) : !courses?.data?.length ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium mb-4">No courses yet. Create your first one!</p>
                <Link href="/teacher/courses/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> Create Course
                </Link>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.data?.map(course => {
                  const cfg           = STATUS_CONFIG[course.status]
                  const Icon          = cfg.icon
                  const price         = Number(course.price ?? 0)
                  const discountPrice = Number(course.discount_price ?? 0)
                  const hasDiscount   = discountPrice > 0 && discountPrice < price
                  const finalPrice    = hasDiscount ? discountPrice : price
                  return (
                      <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        {/* Thumbnail */}
                        <div className="h-36 bg-gradient-to-br from-indigo-100 to-purple-100 relative">
                          {course.thumbnail
                              ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-indigo-300" /></div>
                          }
                          <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="font-bold text-slate-900 line-clamp-2 text-sm leading-snug">{course.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{course.category?.name ?? "Uncategorized"}</p>

                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                            {course.totalSections ?? 0} sections
                          </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                            <PlayCircle className="w-3.5 h-3.5 text-teal-400" />
                              {course.totalLessons ?? 0} lessons
                          </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                              {course.totalQuizzes ?? 0} quizzes
                          </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                              {course.totalStudents ?? 0} students
                          </span>
                          </div>

                          {course.status === "REJECTED" && (
                              <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700">Rejected by admin.</p>
                              </div>
                          )}

                          {course.status === "PENDING" && (
                              <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">Awaiting admin review…</p>
                              </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-indigo-600">
                                {finalPrice === 0 ? "Free" : `৳${finalPrice.toLocaleString()}`}
                              </span>
                                {hasDiscount && (
                                    <span className="text-xs text-slate-400 line-through">
                                  ৳{price.toLocaleString()}
                                </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{course._count?.enrollments ?? 0} enrolled</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {course.status === "APPROVED" && (
                                  <Link href={`/teacher/courses/preview/${course.slug}`}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </Link>
                              )}
                              {course.status === "PENDING" && (
                                  <Link href={`/teacher/courses/${course.id}/edit`}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                  )
                })}
              </div>
          )}
        </div>
      </div>
  )
}

export default function Page() {
  return (
      <Suspense>
        <TeacherCoursesPage />
      </Suspense>
  )
}
