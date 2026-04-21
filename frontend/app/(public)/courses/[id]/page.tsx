"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Users, Clock, BookOpen, Award, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { getToken, getUser } from "@/lib/auth"

const gradients: Record<string, string> = {
  "Web Development":      "from-blue-500 to-indigo-600",
  "Frontend Development": "from-blue-500 to-indigo-600",
  "Backend Development":  "from-indigo-500 to-violet-600",
  Programming:            "from-blue-500 to-indigo-600",
  Design:                 "from-pink-500 to-rose-600",
  "Data Science":         "from-cyan-500 to-blue-600",
  "Machine Learning":     "from-emerald-500 to-teal-600",
  CS:                     "from-purple-500 to-violet-600",
  Business:               "from-amber-500 to-orange-600",
  Marketing:              "from-green-500 to-teal-600",
}
const emojis: Record<string, string> = {
  "Web Development": "💻", "Frontend Development": "🖥️", "Backend Development": "⚙️",
  Programming: "💻", Design: "🎨", "Data Science": "📈",
  "Machine Learning": "🤖", CS: "🔬", Business: "📊", Marketing: "📣",
}

function totalDuration(sections: any[]): string {
  let mins = 0
  sections?.forEach((s: any) => s.lessons?.forEach((l: any) => { mins += Number(l.duration ?? 0) }))
  if (!mins) return "—"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

function totalLessons(sections: any[]): number {
  return sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length ?? 0), 0) ?? 0
}

export default function CourseDetailPage() {
  const { id: slug } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState("")
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (!slug) return
    api.get(`/api/courses/${slug}`)
      .then(({ data }) => {
        const c = data.data.course
        setCourse(c)
        // canAccessContent is true if the student is already enrolled
        if (data.data.course.canAccessContent !== undefined) {
          setIsEnrolled(!!c.canAccessContent && getUser()?.role === "STUDENT")
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleEnroll() {
    const token = getToken()
    const user  = getUser()
    if (!token || !user) {
      router.push("/auth/login/student")
      return
    }
    if (user.role !== "STUDENT") {
      router.push("/student/dashboard")
      return
    }
    setEnrolling(true)
    setEnrollError("")
    try {
      await api.post("/api/enrollments", { course_id: course.id })
      setIsEnrolled(true)
      router.push("/student/courses")
    } catch (err: any) {
      setEnrollError(err.response?.data?.message ?? "Enrollment failed. Please try again.")
    } finally {
      setEnrolling(false)
    }
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

  const categoryName = course.category?.name ?? "General"
  const gradient     = gradients[categoryName] ?? "from-slate-500 to-slate-700"
  const emoji        = emojis[categoryName]    ?? "📚"
  const teacherName  = course.teacher?.name    ?? "Instructor"
  const teacherInitials = (teacherName.split(" ").map((p: string) => p[0] ?? "").join("").toUpperCase().slice(0, 2)) || "IN"
  const price        = Number(course.price ?? 0)
  const students     = Number(course.totalStudents ?? 0)
  const rating       = Number(course.avgRating ?? 0)
  const reviewCount  = Number(course.totalReviews ?? 0)
  const duration     = totalDuration(course.sections ?? [])
  const lessons      = totalLessons(course.sections ?? [])

  function toggleSection(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <main className="pt-16 bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${gradient} py-16`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4">
            {categoryName}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">{course.title}</h1>
          {course.description && (
            <p className="text-white/80 text-lg mb-6 max-w-2xl">{course.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-5 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{rating > 0 ? rating.toFixed(1) : "New"}</span>
              {reviewCount > 0 && <span className="text-white/60">({reviewCount.toLocaleString()} reviews)</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{students.toLocaleString()} students</span>
            </div>
            {duration !== "—" && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
            )}
            {lessons > 0 && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{lessons} lessons</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Objectives */}
            {course.objectives?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">What You&apos;ll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.objectives.map((obj: any) => (
                    <div key={obj.id} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {obj.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.sections?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Course Curriculum</h2>
                <div className="space-y-2">
                  {course.sections.map((section: any) => {
                    const open = expanded.has(section.id)
                    return (
                      <div key={section.id} className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm font-semibold text-slate-800">{section.title}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-400">{section.lessons?.length ?? 0} lessons</span>
                            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>
                        {open && section.lessons?.length > 0 && (
                          <div className="border-t border-slate-100 divide-y divide-slate-100">
                            {section.lessons.map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                <span className="text-sm text-slate-600 flex-1">{lesson.title}</span>
                                {lesson.duration ? (
                                  <span className="text-xs text-slate-400">{lesson.duration}m</span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Your Instructor</h2>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg font-bold text-white flex-shrink-0 overflow-hidden`}>
                  {course.teacher?.avatar ? (
                    <img src={course.teacher.avatar} alt={teacherName} className="w-full h-full object-cover" />
                  ) : (
                    teacherInitials
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{teacherName}</p>
                  {course.teacher?.bio && (
                    <p className="text-sm text-slate-500 mt-0.5">{course.teacher.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            {course.reviews?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {course.reviews.map((review: any) => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0 overflow-hidden">
                        {review.student?.avatar ? (
                          <img src={review.student.avatar} alt={review.student.name} className="w-full h-full object-cover" />
                        ) : (
                          (review.student?.name ?? "?")[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-slate-800">{review.student?.name ?? "Student"}</span>
                          <span className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" /> {review.rating}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-500">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enroll card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24 shadow-sm">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover rounded-xl mb-5" />
              ) : (
                <div className={`bg-gradient-to-br ${gradient} rounded-xl h-32 flex items-center justify-center mb-5`}>
                  <span className="text-5xl">{emoji}</span>
                </div>
              )}

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {price === 0 ? "Free" : `TK${price.toLocaleString()}`}
                </span>
              </div>
              {price > 0 && (
                <p className="text-xs text-slate-400 mb-5">BDT</p>
              )}

              {isEnrolled ? (
                <Link
                  href="/student/courses"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm mb-3"
                >
                  <CheckCircle2 className="w-4 h-4" /> Go to My Courses
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm mb-3 disabled:opacity-70"
                >
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {enrolling ? "Enrolling…" : "Enrol Now"}
                </button>
              )}
              {enrollError && (
                <p className="text-xs text-red-600 text-center mb-3">{enrollError}</p>
              )}
              <Link
                href="/student/dashboard"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Go to Dashboard
              </Link>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-indigo-400" /> Certificate of completion</div>
                {duration !== "—" && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {duration} of content</div>}
                {lessons > 0 && <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> {lessons} lessons</div>}
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> {students.toLocaleString()} students enrolled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
