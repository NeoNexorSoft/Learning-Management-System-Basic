"use client"
import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
    Loader2, PlayCircle, FileIcon, AlignLeft,
    BookOpen, ChevronDown, ChevronUp,
    ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, X,
    Users, Award, Clock
} from "lucide-react"
import api from "@/lib/axios"
import RichTextRenderer from "@/components/ui/RichTextRenderer"
import FilePreview from "@/components/shared/FilePreview"

export default function LearnPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const searchParams = useSearchParams()
    const [course, setCourse]             = useState<any>(null)
    const [loading, setLoading]           = useState(true)
    const [activeLesson, setActiveLesson] = useState<any>(null)
    const [openSections, setOpenSections] = useState<Set<string>>(new Set())
    const [successMsg, setSuccessMsg]     = useState("")

    // ── NEW STATE ──────────────────────────────────────────────
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
    const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set())
    const [activeQuiz, setActiveQuiz]             = useState<any>(null)
    const [progress, setProgress]                 = useState(0)
    // ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            setSuccessMsg("Payment successful! Welcome to the course 🎉")
            setTimeout(() => setSuccessMsg(""), 5000)
            // Remove param from URL without page reload
            const url = new URL(window.location.href)
            url.searchParams.delete("payment")
            window.history.replaceState({}, "", url.toString())
        }
        api.get(`/api/courses/learn/${courseId}`)
            .then(({ data }) => {
                const c = data.data.course
                setCourse(c)
                setOpenSections(new Set(c.sections?.map((s: any) => s.id) ?? []))
                setActiveLesson(c.sections?.[0]?.lessons?.[0] ?? null)
                api.get(`/api/courses/${courseId}/progress`)
                    .then(({ data: pd }) => {
                        const ids = pd.data.completedLessons ?? []
                        setCompletedLessons(new Set(ids))
                        const all = c.sections?.flatMap((s: any) => s.lessons) ?? []
                        setProgress(Math.round((ids.length / (all.length || 1)) * 100))
                    })
                    .catch(() => {})
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

    // ── NEW HELPERS ────────────────────────────────────────────
    function canAccessLesson(lesson: any) {
        const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
        const index = allLessons.findIndex((l: any) => l.id === lesson.id)
        if (index === 0) return true
        const prev = allLessons[index - 1]
        return completedLessons.has(prev?.id)
    }

    async function markComplete(lessonId: string) {
        try {
            await api.post("/api/lessons/complete", { lessonId, courseId })
        } catch {}
        setCompletedLessons(prev => {
            const next = new Set(prev)
            next.add(lessonId)
            const all = course?.sections?.flatMap((s: any) => s.lessons) ?? []
            setProgress(Math.round((next.size / (all.length || 1)) * 100))
            return next
        })
    }

    function goPrevLesson() {
        const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
        const index = allLessons.findIndex((l: any) => l.id === activeLesson?.id)
        if (index > 0) setActiveLesson(allLessons[index - 1])
    }

    function goNextLesson() {
        const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
        const index = allLessons.findIndex((l: any) => l.id === activeLesson?.id)
        if (index < allLessons.length - 1) setActiveLesson(allLessons[index + 1])
    }

    const prevLesson = (() => {
        const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
        const index = allLessons.findIndex((l: any) => l.id === activeLesson?.id)
        return index > 0 ? allLessons[index - 1] : null
    })()

    const nextLesson = (() => {
        const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
        const index = allLessons.findIndex((l: any) => l.id === activeLesson?.id)
        return index < allLessons.length - 1 ? allLessons[index + 1] : null
    })()
    // ──────────────────────────────────────────────────────────

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

    const allLessons   = course.sections?.flatMap((s: any) => s.lessons) ?? []
    const totalLessons = allLessons.length
    const totalQuizzes = course.sections?.reduce((sum: number, s: any) =>
        sum + s.lessons?.reduce((ls: number, l: any) =>
            ls + (l.lessonQuizzes?.length ?? 0), 0), 0) ?? 0

    return (
        <div className="bg-slate-50">
            {successMsg && (
                <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-sm font-semibold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
            )}
            {/* HERO */}
            <div className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white px-6 py-10 mb-2">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* Left: course info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                {course.category?.parent?.name && (
                                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                                        {course.category.parent.name}
                                    </span>
                                )}{course.category?.name && (
                                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                                        {course.category.name}
                                    </span>
                                )}
                                {course.level && (
                                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                                        {course.level}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-extrabold leading-tight">
                                {course.title}
                            </h1>
                            {course.subtitle && (
                                <p className="text-white/80 text-lg">{course.subtitle}</p>
                            )}
                            {/* Teacher */}
                            <div className="flex items-center gap-3">
                                {course.teacher?.avatar ? (
                                    <img src={course.teacher.avatar} alt={course.teacher.name}
                                        className="w-10 h-10 rounded-xl object-cover border-2 border-white/30" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold">
                                        {course.teacher?.name?.[0] ?? "T"}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold">{course.teacher?.name}</p>
                                    <p className="text-xs text-white/60">Instructor</p>
                                </div>
                            </div>
                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 text-sm text-white/80">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4" />
                                    {totalLessons} lessons
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <HelpCircle className="w-4 h-4" />
                                    {totalQuizzes} quizzes
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {course._count?.enrollments ?? 0} students
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Award className="w-4 h-4" />
                                    Certificate on completion
                                </span>
                            </div>
                        </div>

                        {/* Right: progress card */}
                        <div className="w-full lg:w-72 bg-white/10 rounded-2xl p-5 border border-white/20 flex-shrink-0">
                            <p className="text-sm font-bold mb-3">Your Progress</p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white/70">
                                    {completedLessons.size} of {totalLessons} lessons
                                </span>
                                <span className="text-lg font-extrabold">{progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2.5 mb-4">
                                <div
                                    className="bg-emerald-400 h-2.5 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {progress === 100 ? (
                                <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> Course Completed!
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        const el = document.getElementById("curriculum")
                                        if (el) {
                                            let box: HTMLElement | null = el.parentElement
                                            while (box && getComputedStyle(box).overflowY !== "auto") box = box.parentElement
                                            const ref = box ?? document.documentElement
                                            const top = el.getBoundingClientRect().top - ref.getBoundingClientRect().top + ref.scrollTop - 16
                                            ref.scrollTo({ top, behavior: "smooth" })
                                        }
                                    }}
                                    className="w-full py-2.5 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors"
                                >
                                    Continue Learning →
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* CURRICULUM */}
            <div id="curriculum" className="max-w-5xl mx-auto px-6 pt-10 pb-8">
                <h2 className="text-base font-bold text-slate-900 mb-4">
                    Course Curriculum
                </h2>
                <div className="space-y-3">
                    {course.sections?.map((section: any) => (
                        <div key={section.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            {/* Section header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{section.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {section.lessons?.length ?? 0} lessons
                                        {section.lessons?.reduce((sum: number, l: any) =>
                                            sum + (l.lessonQuizzes?.length ?? 0), 0) > 0 &&
                                            ` · ${section.lessons.reduce((sum: number, l: any) =>
                                                sum + (l.lessonQuizzes?.length ?? 0), 0)} quizzes`
                                        }
                                    </p>
                                </div>
                                {openSections.has(section.id)
                                    ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                }
                            </button>

                            {/* Lessons + Quizzes */}
                            {openSections.has(section.id) && (
                                <div className="border-t border-slate-100 divide-y divide-slate-100">
                                    {section.lessons?.map((lesson: any) => (
                                        <div key={lesson.id}>

                                            {/* Lesson row */}
                                            <div
                                                onClick={() => {
                                                    setActiveLesson(lesson)
                                                    setActiveQuiz(null)
                                                    const el = document.getElementById("lesson-content")
                                                        if (el) {
                                                            let box: HTMLElement | null = el.parentElement
                                                            while (box && getComputedStyle(box).overflowY !== "auto") box = box.parentElement
                                                            const ref = box ?? document.documentElement
                                                            const top = el.getBoundingClientRect().top - ref.getBoundingClientRect().top + ref.scrollTop - 16
                                                            ref.scrollTo({ top, behavior: "smooth" })
                                                        }
                                                }}
                                                className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                                                    activeLesson?.id === lesson.id
                                                        ? "bg-indigo-50 border-l-2 border-l-indigo-600"
                                                        : "hover:bg-slate-50"
                                                }`}
                                            >
                                                {completedLessons.has(lesson.id)
                                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    : lesson.type === "VIDEO"
                                                        ? <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                                        : lesson.type === "TEXT"
                                                            ? <AlignLeft className="w-4 h-4 text-teal-400 flex-shrink-0" />
                                                            : <FileIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-700 line-clamp-1 font-medium">{lesson.title}</p>
                                                    {lesson.duration ? (
                                                        <span className="text-xs text-slate-400">{lesson.duration}m</span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Quizzes under lesson */}
                                            {lesson.lessonQuizzes?.map((quiz: any) => {
                                                const attempted = quiz.attempts?.length > 0
                                                const attempt   = quiz.attempts?.[0]
                                                const pct = attempt?.score != null
                                                    ? Math.round(Number(attempt.score))
                                                    : attempt?.correct != null && attempt?.total != null
                                                    ? Math.round((attempt.correct / attempt.total) * 100)
                                                    : null
                                                console.log("attempt data:", quiz.attempts?.[0])
                                                return (
                                                    <div
                                                        key={quiz.id}
                                                        onClick={() => {
                                                            setActiveQuiz(quiz)
                                                            setActiveLesson(null)
                                                            document.getElementById("lesson-content")
                                                                ?.scrollIntoView({ behavior: "smooth" })
                                                        }}
                                                        className={`flex items-center gap-3 pl-8 pr-5 py-3 border-t border-amber-50 transition-colors cursor-pointer ${
                                                            attempted && activeQuiz?.id === quiz.id
                                                                ? "bg-emerald-100 border-l-2 border-l-emerald-500"
                                                                : attempted
                                                                ? "bg-emerald-50 hover:bg-emerald-100/70"
                                                                : activeQuiz?.id === quiz.id
                                                                ? "bg-amber-50 border-l-2 border-l-amber-500"
                                                                : "hover:bg-amber-50/50"
                                                        }`}
                                                    >
                                                        <HelpCircle className={`w-3.5 h-3.5 flex-shrink-0 ${
                                                            attempted ? "text-emerald-500" : "text-amber-500"
                                                        }`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                                                                {quiz.title}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {quiz.questions?.length ?? 0} questions
                                                            </p>
                                                        </div>
                                                        {attempted ? (
                                                            <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex-shrink-0">
                                                                {pct !== null ? `${pct}%` : "Done"} ✓
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold text-amber-600 flex-shrink-0">
                                                                Take Quiz →
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })}

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {(activeLesson || activeQuiz) && (
                <div id="lesson-content" className="max-w-5xl mx-auto px-6 pb-12">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        {activeLesson && !activeQuiz && (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <h2 className="text-xl font-extrabold text-slate-900">
                                        {activeLesson.title}
                                    </h2>
                                    {!completedLessons.has(activeLesson.id) ? (
                                        <button
                                            onClick={() => markComplete(activeLesson.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex-shrink-0"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Mark Complete
                                        </button>
                                    ) : (
                                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4" /> Completed
                                        </span>
                                    )}
                                </div>
                                {/* VIDEO */}
                                {activeLesson.type === "VIDEO" && activeLesson.video_urls && (
                                    <>
                                        {activeLesson.video_urls.map((url: string, idx: number) => (
                                            <FilePreview key={idx} url={url} type="VIDEO" className="mb-4" />
                                        ))}
                                    </>
                                )}

                                {/* TEXT */}
                                {activeLesson.type === "TEXT" && activeLesson.content && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                        <RichTextRenderer html={activeLesson.content} allowFullscreen />
                                    </div>
                                )}

                                {/* DOCUMENT */}
                                {activeLesson.type === "DOCUMENT" && activeLesson.file_urls && (
                                    <>
                                        {activeLesson.file_urls.map((url: string, idx: number) => (
                                            <FilePreview key={idx} url={url} type="DOCUMENT" className="mb-4" />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                        {activeQuiz && !activeLesson && (
                            <QuizExaminer
                                key={activeQuiz.id}
                                quiz={activeQuiz}
                                existingAttempt={activeQuiz.attempts?.[0]}
                                onComplete={(correct, total) => {
                                    setCourse((prev: any) => ({
                                        ...prev,
                                        sections: prev.sections.map((s: any) => ({
                                            ...s,
                                            lessons: s.lessons.map((l: any) => ({
                                                ...l,
                                                lessonQuizzes: l.lessonQuizzes.map((q: any) =>
                                                    q.id === activeQuiz.id
                                                        ? { ...q, attempts: [{ correct, total }] }
                                                        : q
                                                )
                                            }))
                                        }))
                                    }))
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
}

function QuizExaminer({
    quiz,
    onComplete,
    existingAttempt,
}: {
    quiz: any
    onComplete: (correct: number, total: number) => void
    existingAttempt?: any
}) {
    const [started, setStarted]             = useState(false)
    const [starting, setStarting]           = useState(false)
    const [answers, setAnswers]             = useState<Record<string, string>>({})
    const [submitted, setSubmitted]         = useState(false)
    const [results, setResults]             = useState<any>(null)
    const [submitting, setSubmitting]       = useState(false)
    const [timeLeft, setTimeLeft]           = useState<number | null>(null)
    const [loadingAttempt, setLoadingAttempt] = useState(!!existingAttempt)
    const timerRef                          = useRef<NodeJS.Timeout | null>(null)

    // Start countdown when quiz begins
    useEffect(() => {
        if (started && !submitted && quiz.timer_seconds) {
            setTimeLeft(quiz.timer_seconds)
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timerRef.current!)
                        timerRef.current = null
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started])

    // Auto-submit when time hits 0
    useEffect(() => {
        if (timeLeft === 0 && !submitted) {
            handleSubmit()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft])

    // Cleanup on unmount
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    // Load existing attempt on mount (read-only review mode)
    useEffect(() => {
        if (!existingAttempt) return
        api.get(`/api/quizzes/${quiz.id}/my-attempt`)
            .then(({ data }) => {
                setResults(data.data)
                setSubmitted(true)
                setStarted(true)
            })
            .catch(() => setStarted(true))
            .finally(() => setLoadingAttempt(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleStart() {
        setStarting(true)
        try {
            await api.post(`/api/quizzes/${quiz.id}/start`)
            setStarted(true)
        } catch (err: any) {
            const msg: string = err.response?.data?.message ?? ""
            if (err.response?.status === 400 && msg === "You have already attempted this quiz") {
                try {
                    const { data } = await api.get(`/api/quizzes/${quiz.id}/my-attempt`)
                    setResults(data.data)
                    setSubmitted(true)
                    setStarted(true)
                    onComplete(data.data.correct, data.data.total)
                } catch {
                    setStarted(true)
                }
            } else {
                alert(msg || "Failed to start quiz.")
            }
        } finally {
            setStarting(false)
        }
    }

    async function handleSubmit() {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setSubmitting(true)
        try {
            const { data } = await api.post(`/api/quizzes/${quiz.id}/attempt`, { answers })
            setResults(data.data)
            setSubmitted(true)
            onComplete(data.data.correct, data.data.total)
        } catch (err: any) {
            alert(err.response?.data?.message ?? "Submission failed.")
        } finally {
            setSubmitting(false)
        }
    }

    // Timer bar derived values
    const timerTotal    = quiz.timer_seconds ?? 1
    const timerPct      = timeLeft !== null ? (timeLeft / timerTotal) * 100 : 100
    const timerColor    = timerPct > 50
        ? "bg-emerald-500"
        : timerPct > 25
        ? "bg-amber-400"
        : "bg-red-500"
    const timerPulse    = timeLeft !== null && timeLeft < 60 && !submitted

    // ── Loading existing attempt ──────────────────────────────────────────────
    if (loadingAttempt) return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
    )

    // ── Start screen ──────────────────────────────────────────────────────────
    if (!started) {
        const minutes = quiz.timer_seconds ? Math.floor(quiz.timer_seconds / 60) : null
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Quiz</span>
                </div>
                <div className="rounded-2xl border border-slate-200 p-10 flex flex-col items-center text-center gap-5">
                    <h2 className="text-2xl font-extrabold text-slate-900">{quiz.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{quiz.questions?.length ?? 0} questions</span>
                        {minutes !== null && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="font-semibold text-amber-600">⏱ {minutes} minutes</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleStart}
                        disabled={starting}
                        className="mt-2 px-10 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2 text-base"
                    >
                        {starting
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                            : "Start Quiz"
                        }
                    </button>
                </div>
            </div>
        )
    }

    // ── Quiz / Results screen ─────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Countdown timer bar */}
            {started && !submitted && timeLeft !== null && (
                <div className="sticky top-0 z-10 bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className={`w-4 h-4 flex-shrink-0 ${timerPct <= 25 ? "text-red-500" : timerPct <= 50 ? "text-amber-500" : "text-emerald-500"}`} />
                        <span className="text-xs font-semibold text-slate-500 flex-1">Time Remaining</span>
                        <span className={`text-sm font-extrabold tabular-nums ${timerPct <= 25 ? "text-red-600" : timerPct <= 50 ? "text-amber-600" : "text-emerald-600"}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all duration-1000 ${timerColor} ${timerPulse ? "animate-pulse" : ""}`}
                            style={{ width: `${timerPct}%` }}
                        />
                    </div>
                </div>
            )}

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Quiz</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{quiz.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{quiz.questions?.length ?? 0} questions</p>
            </div>

            {/* Score summary */}
            {submitted && results && (
                <div className="rounded-2xl p-6 border text-center bg-slate-50 border-slate-200">
                    <div className="text-4xl font-extrabold text-slate-900">
                        {results.correct} out of {results.total}
                    </div>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
                {quiz.questions?.map((q: any, qi: number) => {
                    const result = results?.result?.find((r: any) => r.question_id === q.id)
                    const studentAnswer = submitted
                        ? (result?.student_answer ?? answers[q.id])
                        : answers[q.id]
                    return (
                        <div key={q.id}
                            className={`rounded-2xl border p-5 ${
                                submitted && result?.is_correct === true  ? "border-emerald-200 bg-emerald-50/30" :
                                submitted && result?.is_correct === false ? "border-red-200 bg-red-50/30" :
                                "border-slate-200"
                            }`}
                        >
                            <p className="text-sm font-bold text-slate-900 mb-3">
                                {qi + 1}. {q.question}
                            </p>
                            {q.image_url && (
                                <img src={q.image_url} alt="question"
                                    className="w-full max-h-48 object-contain rounded-xl border border-slate-200 mb-3" />
                            )}
                            {(q.type === "MCQ" || q.type === "IMAGE_MCQ") && (
                                <div className="space-y-2">
                                    {(q.options ?? []).map((opt: string, oi: number) => (
                                        <button key={oi}
                                            onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                                            disabled={submitted}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                                submitted && result?.correct_answer === opt
                                                    ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold"
                                                    : submitted && studentAnswer === opt && result?.is_correct === false
                                                    ? "border-red-400 bg-red-50 text-red-800"
                                                    : studentAnswer === opt
                                                    ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                                    : "border-slate-200 hover:border-indigo-300 text-slate-700"
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {q.type === "TRUE_FALSE" && (
                                <div className="flex gap-3">
                                    {["True", "False"].map((opt, oi) => {
                                        const isTFCorrect  = submitted && result?.correct_answer === opt
                                        const isTFWrong    = submitted && result?.is_correct === false && result?.student_answer === opt
                                        const isTFSelected = !submitted && studentAnswer === opt
                                        return (
                                            <button key={oi}
                                                onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                                                disabled={submitted}
                                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                                                    isTFCorrect  ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-bold" :
                                                    isTFWrong    ? "border-red-400 bg-red-50 text-red-700" :
                                                    isTFSelected ? "border-indigo-400 bg-indigo-50 text-indigo-700" :
                                                                   "border-slate-200 hover:border-indigo-300 text-slate-600"
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                            {q.type === "FILL_BLANK" && (
                                <input
                                    type="text"
                                    value={studentAnswer ?? ""}
                                    onChange={e => !submitted && setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                    disabled={submitted}
                                    placeholder="Type your answer here..."
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${
                                        submitted && result?.is_correct
                                            ? "border-emerald-400 bg-emerald-50"
                                            : submitted && result?.is_correct === false
                                            ? "border-red-400 bg-red-50"
                                            : "border-slate-200 focus:border-indigo-300"
                                    }`}
                                />
                            )}
                            {submitted && result?.is_correct === false && result?.correct_answer && (
                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-xs font-bold text-emerald-700 mb-0.5">Correct Answer</p>
                                    <p className="text-xs text-emerald-800">{result.correct_answer}</p>
                                </div>
                            )}
                            {submitted && q.explanation && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-xs font-bold text-blue-700 mb-0.5">Explanation</p>
                                    <p className="text-xs text-blue-800">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Submit button */}
            {!submitted && (
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                        : "Submit Quiz"
                    }
                </button>
            )}
        </div>
    )
}
