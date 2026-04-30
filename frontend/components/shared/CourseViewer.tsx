"use client"

import { useState } from "react"
import {
  Lock, CheckCircle2, Users, Star,
  BookOpen, ChevronDown, ChevronUp, PlayCircle,
  FileIcon, AlignLeft, HelpCircle,
} from "lucide-react"
import FilePreview from "@/components/shared/FilePreview"
import QuizPreview from "@/components/shared/QuizPreview"

interface CourseViewerProps {
  course: any
  accessLevel: "public" | "full"
  showApproveReject?: boolean
  onApprove?: () => void
  onReject?: () => void
  onEnroll?: () => void
}

const GRADIENTS: Record<string, string> = {
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
const EMOJIS: Record<string, string> = {
  "Web Development": "💻", "Frontend Development": "🖥️", "Backend Development": "⚙️",
  Programming: "💻", Design: "🎨", "Data Science": "📈",
  "Machine Learning": "🤖", CS: "🔬", Business: "📊", Marketing: "📣",
}
function totalDuration(sections: any[]): string {
  let mins = 0
  sections?.forEach((s: any) => s.lessons?.forEach((l: any) => { mins += Number(l.duration ?? 0) }))
  if (!mins) return ""
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

function totalLessons(sections: any[]): number {
  return sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length ?? 0), 0) ?? 0
}

function LessonIcon({ type }: { type: string }) {
  switch (type?.toUpperCase()) {
    case "VIDEO":    return <PlayCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
    case "DOCUMENT": return <FileIcon   className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
    case "TEXT":     return <AlignLeft  className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
    default:         return <BookOpen   className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
  }
}

export default function CourseViewer({
  course,
  accessLevel,
  showApproveReject,
  onApprove,
  onReject,
  onEnroll,
}: CourseViewerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleSection(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const categoryName    = course.category?.name ?? "General"
  const subcategoryName = course.category?.parent?.name ?? null
  const gradient        = GRADIENTS[categoryName] ?? "from-slate-500 to-slate-700"
  const emoji           = EMOJIS[categoryName]    ?? "📚"
  const teacherName     = course.teacher?.name    ?? "Instructor"
  const teacherInitials = (teacherName.split(" ").map((p: string) => p[0] ?? "").join("").toUpperCase().slice(0, 2)) || "IN"
  const lessons         = totalLessons(course.sections ?? [])
  const status          = course.status as string

  const objectives  = course.objectives ?? []
  const learnList   = objectives.filter((o: any) =>
    ["LEARNING_OUTCOME", "WHAT_YOU_WILL_LEARN", "OUTCOME"].includes(o.type),
  )
  const reqList     = objectives.filter((o: any) =>
    ["REQUIREMENT", "PREREQUISITE"].includes(o.type),
  )
  const audienceList = objectives.filter((o: any) =>
    ["TARGET_AUDIENCE", "WHO_IS_THIS_FOR"].includes(o.type),
  )
  const fallbackLearnList = learnList.length > 0 ? learnList : objectives

  return (
    <div>
      {/* Approve / Reject */}
      {showApproveReject && status === "PENDING" && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={onApprove}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            ✓ Approve
          </button>
          <button
            onClick={onReject}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
          >
            ✕ Reject
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className={`bg-gradient-to-br ${gradient} h-52 flex items-center justify-center`}>
            <span className="text-7xl">{emoji}</span>
          </div>
        )}

        <div className="p-6">
          {/* Title */}
          <h1 className="text-2xl font-extrabold text-slate-900 leading-snug mb-2">
            {course.title}
          </h1>

          {/* Subtitle */}
          {course.subtitle && (
            <p className="text-slate-500 mb-4">{course.subtitle}</p>
          )}

          {/* Category, subcategory, level */}
          <div className="flex flex-wrap gap-2 mb-3">
            {subcategoryName && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
                {subcategoryName}
              </span>
            )}
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold">
              {categoryName}
            </span>
            {course.level && (
              <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold">
                {course.level}
              </span>
            )}
          </div>

          {/* Published date */}
          {course.published_at && (
            <p className="text-xs text-slate-400 mb-4">
              Published {new Date(course.published_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}

          {/* Teacher */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            {course.teacher?.avatar ? (
              <img
                src={course.teacher.avatar}
                alt={teacherName}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                {teacherInitials}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-700">{teacherName}</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BookOpen,   label: "Sections", value: course.totalSections ?? course.sections?.length ?? 0 },
          { icon: PlayCircle, label: "Lessons",  value: course.totalLessons ?? 0 },
          { icon: HelpCircle, label: "Quizzes",  value: course.totalQuizzes ?? 0 },
          { icon: Users,      label: "Students", value: course.totalStudents ?? 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
            <p className="text-lg font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* What You'll Learn */}
      {fallbackLearnList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">What You&apos;ll Learn</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {fallbackLearnList.map((obj: any) => (
              <div key={obj.id} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{obj.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {reqList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Requirements</h2>
          <ul className="space-y-2">
            {reqList.map((obj: any) => (
              <li key={obj.id} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                <span>{obj.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Audience */}
      {audienceList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Who Is This Course For</h2>
          <ul className="space-y-2">
            {audienceList.map((obj: any) => (
              <li key={obj.id} className="flex items-start gap-2 text-sm text-slate-700">
                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{obj.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Pricing</h3>
        {(() => {
          const p  = Number(course?.price ?? 0)
          const dp = Number(course?.discount_price ?? 0)
          const hd = dp > 0 && dp < p
          const fp = hd ? dp : p
          return (
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {fp === 0 ? "Free" : `৳${fp.toLocaleString()}`}
                </span>
                {hd && (
                  <>
                    <span className="text-lg text-slate-400 line-through">
                      ৳{p.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {Math.round(((p - dp) / p) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              {course?.discount_ends_at && hd && (
                <p className="text-xs text-red-500">
                  Offer ends: {new Date(course.discount_ends_at).toLocaleDateString("en-BD")}
                </p>
              )}
              {course?.discount_type && hd && (
                <p className="text-xs text-slate-400">
                  {course.discount_type === "PERCENTAGE"
                    ? `${course.discount_value}% discount applied`
                    : `৳${p - fp} discount applied`}
                </p>
              )}
            </div>
          )
        })()}
      </div>

      {/* Curriculum */}
      {course.sections?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Course Curriculum
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({course.sections.length} section{course.sections.length !== 1 ? "s" : ""} · {lessons} lesson{lessons !== 1 ? "s" : ""})
            </span>
          </h2>

          {accessLevel === "public" && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                Purchase this course to access videos, documents and quizzes.
              </p>
            </div>
          )}

          <div className="space-y-2 mb-4">
            {course.sections.map((section: any) => {
              const open = expanded.has(section.id)
              const sectionLessons: number = section.lessons?.length ?? 0
              return (
                <div key={section.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{section.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">{sectionLessons} lesson{sectionLessons !== 1 ? "s" : ""}</span>
                      {open
                        ? <ChevronUp   className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {section.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {accessLevel === "full"
                              ? <LessonIcon type={lesson.type} />
                              : <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            }
                            <span className="text-sm text-slate-600 flex-1">{lesson.title}</span>
                            {accessLevel === "full" && lesson.duration > 0 && (
                              <span className="text-xs text-slate-400 flex-shrink-0">
                                {Math.ceil(Number(lesson.duration) / 60)}m
                              </span>
                            )}
                            {accessLevel === "public" && (
                              <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                            )}
                          </div>

                          {accessLevel === "full" && (
                            <>
                              {lesson.type === "VIDEO" && lesson.video_urls.length && (
                                <>
                                  {lesson.video_urls.map((url: string, idx: number) => (
                                    <FilePreview key={idx} url={url} type="VIDEO" className="mt-2" />
                                  ))}
                                </>
                              )}
                              {lesson.type === "DOCUMENT" && lesson.file_urls.length && (
                                <>
                                  {lesson.file_urls.map((url: string, idx: number) => (
                                    <FilePreview key={idx} url={url} type="DOCUMENT" className="mt-2" />
                                  ))}
                                </>
                              )}
                              {lesson.type === "TEXT" && lesson.content && (
                                <div
                                  className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 prose max-w-none text-sm"
                                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                                />
                              )}
                              {lesson.lessonQuizzes?.map((quiz: any) => (
                                <QuizPreview key={quiz.id} quiz={quiz} accessLevel="full" />
                              ))}
                            </>
                          )}
                          {accessLevel === "public" && lesson.lessonQuizzes?.map((quiz: any) => (
                            <QuizPreview key={quiz.id} quiz={quiz} accessLevel="locked" />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {accessLevel === "public" && onEnroll && (
            <button
              onClick={onEnroll}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
            >
              Enroll Now
            </button>
          )}
        </div>
      )}

      {/* Instructor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Your Instructor</h2>
        <div className="flex items-center gap-4">
          {course.teacher?.avatar ? (
            <img
              src={course.teacher.avatar}
              alt={teacherName}
              className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg font-bold text-white flex-shrink-0`}>
              {teacherInitials}
            </div>
          )}
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Student Reviews</h2>
          <div className="space-y-4">
            {course.reviews.map((review: any) => (
              <div key={review.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0 overflow-hidden">
                  {review.student?.avatar ? (
                    <img
                      src={review.student.avatar}
                      alt={review.student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (review.student?.name ?? "?")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-800">
                      {review.student?.name ?? "Student"}
                    </span>
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
      {/* Welcome / Completion Messages */}
      {course?.welcome_message && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-indigo-700 mb-1">Welcome Message</p>
          <p className="text-sm text-indigo-800">{course.welcome_message}</p>
        </div>
      )}
      {course?.congrats_message && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-emerald-700 mb-1">Completion Message</p>
          <p className="text-sm text-emerald-800">{course.congrats_message}</p>
        </div>
      )}
    </div>
  )
}
