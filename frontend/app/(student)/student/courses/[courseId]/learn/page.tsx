"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
    Loader2, PlayCircle, FileIcon, AlignLeft,
    BookOpen, ChevronDown, ChevronUp,
    ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, X,
    Users, Award
} from "lucide-react"
import api from "@/lib/axios"
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
                                                return (
                                                    <div
                                                        key={quiz.id}
                                                        onClick={() => {
                                                            if (!attempted) {
                                                                setActiveQuiz(quiz)
                                                                setActiveLesson(null)
                                                                document.getElementById("lesson-content")
                                                                    ?.scrollIntoView({ behavior: "smooth" })
                                                            }
                                                        }}
                                                        className={`flex items-center gap-3 pl-8 pr-5 py-3 border-t border-amber-50 transition-colors ${
                                                            attempted
                                                                ? "bg-emerald-50 cursor-default"
                                                                : activeQuiz?.id === quiz.id
                                                                ? "bg-amber-50 border-l-2 border-l-amber-500 cursor-pointer"
                                                                : "hover:bg-amber-50/50 cursor-pointer"
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
                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                                                {attempt.score}/{attempt.total} ✓
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
                                {activeLesson.type === "VIDEO" && activeLesson.video_url && (
                                    <FilePreview url={activeLesson.video_url} type="VIDEO" />
                                )}
                                {activeLesson.type === "TEXT" && activeLesson.content && (
                                    <div
                                        className="prose max-w-none text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                                    />
                                )}
                                {activeLesson.type === "DOCUMENT" && activeLesson.file_url && (
                                    <FilePreview url={activeLesson.file_url} type="DOCUMENT" />
                                )}
                            </>
                        )}
                        {activeQuiz && !activeLesson && (
                            <QuizExaminer
                                quiz={activeQuiz}
                                onComplete={(score, total) => {
                                    setCourse((prev: any) => ({
                                        ...prev,
                                        sections: prev.sections.map((s: any) => ({
                                            ...s,
                                            lessons: s.lessons.map((l: any) => ({
                                                ...l,
                                                lessonQuizzes: l.lessonQuizzes.map((q: any) =>
                                                    q.id === activeQuiz.id
                                                        ? { ...q, attempts: [{ score, total }] }
                                                        : q
                                                )
                                            }))
                                        }))
                                    }))
                                    setActiveQuiz(null)
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function QuizExaminer({
    quiz,
    onComplete,
}: {
    quiz: any
    onComplete: (score: number, total: number) => void
}) {
    const [answers, setAnswers]       = useState<Record<string, string>>({})
    const [submitted, setSubmitted]   = useState(false)
    const [results, setResults]       = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit() {
        if (Object.keys(answers).length < quiz.questions?.length) {
            alert("Please answer all questions before submitting.")
            return
        }
        setSubmitting(true)
        try {
            const { data } = await api.post(
                `/api/quizzes/${quiz.id}/attempt`,
                { answers }
            )
            setResults(data.data)
            setSubmitted(true)
            onComplete(data.data.score, data.data.total)
        } catch (err: any) {
            alert(err.response?.data?.message ?? "Submission failed.")
        } finally {
            setSubmitting(false)
        }
    }

    const passed = results
        ? (results.score / results.total) >= 0.6
        : false

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Quiz</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{quiz.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{quiz.questions?.length ?? 0} questions</p>
            </div>

            {/* Results */}
            {submitted && results && (
                <div className={`rounded-2xl p-6 border text-center ${
                    passed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                }`}>
                    <div className={`text-4xl font-extrabold mb-2 ${
                        passed ? "text-emerald-600" : "text-red-600"
                    }`}>
                        {results.score}/{results.total}
                    </div>
                    <p className="font-bold text-slate-900 mb-1">
                        {passed ? "🎉 Passed! Great job!" : "❌ Failed. Please retake."}
                    </p>
                    <p className="text-sm text-slate-500">
                        {Math.round((results.score / results.total) * 100)}% · Passing: 60%
                    </p>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
                {quiz.questions?.map((q: any, qi: number) => {
                    const studentAnswer = answers[q.id]
                    const result = results?.results?.find(
                        (r: any) => r.questionId === q.id
                    )
                    return (
                        <div key={q.id}
                            className={`rounded-2xl border p-5 ${
                                submitted && result?.correct === true  ? "border-emerald-200 bg-emerald-50/30" :
                                submitted && result?.correct === false ? "border-red-200 bg-red-50/30" :
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
                                                submitted && result?.correctAnswer === opt
                                                    ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold"
                                                    : submitted && studentAnswer === opt && result?.correct === false
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
                                    {["True", "False"].map((opt, oi) => (
                                        <button key={oi}
                                            onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                                            disabled={submitted}
                                            className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                                                submitted && result?.correctAnswer === opt
                                                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                                    : submitted && studentAnswer === opt && result?.correct === false
                                                    ? "border-red-400 bg-red-50 text-red-700"
                                                    : studentAnswer === opt
                                                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                                    : "border-slate-200 hover:border-indigo-300 text-slate-600"
                                            }`}
                                        >
                                            {opt === "True" ? "✓ True" : "✗ False"}
                                        </button>
                                    ))}
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
                                        submitted && result?.correct
                                            ? "border-emerald-400 bg-emerald-50"
                                            : submitted && !result?.correct
                                            ? "border-red-400 bg-red-50"
                                            : "border-slate-200 focus:border-indigo-300"
                                    }`}
                                />
                            )}
                            {submitted && result?.correct === false && result?.correctAnswer && (
                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-xs font-bold text-emerald-700 mb-0.5">Correct Answer</p>
                                    <p className="text-xs text-emerald-800">{result.correctAnswer}</p>
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
