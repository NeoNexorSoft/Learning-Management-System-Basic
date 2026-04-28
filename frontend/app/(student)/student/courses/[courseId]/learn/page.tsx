"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
  Loader2, PlayCircle, FileIcon, AlignLeft,
  BookOpen, ChevronDown, ChevronUp
} from "lucide-react"
import api from "@/lib/axios"

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const searchParams = useSearchParams()
  const [course, setCourse]             = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [successMsg, setSuccessMsg]     = useState("")

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setSuccessMsg("Payment successful! Welcome to the course 🎉")
      setTimeout(() => setSuccessMsg(""), 5000)
    }
    api.get(`/api/courses/learn/${courseId}`)
      .then(({ data }) => {
        const c = data.data.course
        setCourse(c)
        setOpenSections(new Set(c.sections?.map((s: any) => s.id) ?? []))
        setActiveLesson(c.sections?.[0]?.lessons?.[0] ?? null)
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [courseId])

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Course not found or not enrolled.</p>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden pt-16">
      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-sm line-clamp-2">{course.title}</h2>
        </div>
        {course.sections?.map((section: any) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-200 text-left hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="flex-1 text-xs font-semibold text-slate-700">{section.title}</span>
              {openSections.has(section.id)
                ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              }
            </button>
            {openSections.has(section.id) && section.lessons?.map((lesson: any) => (
              <button key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 text-left transition-colors ${
                  activeLesson?.id === lesson.id
                    ? "bg-indigo-50 border-l-2 border-l-indigo-600"
                    : "hover:bg-slate-50"
                }`}
              >
                {lesson.type === "VIDEO"
                  ? <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  : lesson.type === "TEXT"
                  ? <AlignLeft className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  : <FileIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                }
                <span className="text-xs text-slate-700 line-clamp-2">
                  {lesson.title}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
            {successMsg}
          </div>
        )}
        {activeLesson ? (
          <div>
            <h1 className="text-xl font-bold text-slate-800 mb-4">{activeLesson.title}</h1>
            {activeLesson.type === "VIDEO" && activeLesson.video_url && (
              <video
                src={activeLesson.video_url}
                controls
                className="w-full rounded-xl border border-slate-200 bg-black"
              />
            )}
            {activeLesson.type === "TEXT" && activeLesson.content && (
              <div
                className="rounded-xl border border-slate-200 prose max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: activeLesson.content }}
              />
            )}
            {activeLesson.type === "DOCUMENT" && activeLesson.file_url && (() => {
              const ext = activeLesson.file_url.split(".").pop()?.toLowerCase()
              return ext === "pdf" ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.file_url)}&embedded=true`}
                  className="w-full h-96 rounded-xl border border-slate-200"
                />
              ) : (
                <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activeLesson.file_url)}`}
                  className="w-full h-96 rounded-xl border border-slate-200"
                />
              )
            })()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-sm">Select a lesson to begin.</p>
          </div>
        )}
      </div>
    </div>
  )
}
