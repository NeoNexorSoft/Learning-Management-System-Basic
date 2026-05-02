"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
    Loader2, PlayCircle, FileIcon, AlignLeft,
    BookOpen, ChevronDown, ChevronUp,
    ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, X
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
        }
        api.get(`/api/courses/learn/${courseId}`)
            .then(({ data }) => {
                const c = data.data.course
                console.log(data)
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

    // ── NEW HELPERS ────────────────────────────────────────────
    function canAccessLesson(lesson: any) {
        const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
        const index = allLessons.findIndex((l: any) => l.id === lesson.id)
        if (index === 0) return true
        const prev = allLessons[index - 1]
        return completedLessons.has(prev?.id)
    }

    function markLessonComplete(lessonId: string) {
        setCompletedLessons(prev => {
            const next = new Set(prev)
            next.add(lessonId)
            const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
            setProgress(Math.round((next.size / allLessons.length) * 100))
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

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

            {/* LEFT SIDEBAR */}
            <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">

                {/* Course title header */}
                <div className="p-4 border-b border-slate-200 bg-indigo-600">
                    <h2 className="text-sm font-bold text-white line-clamp-2">
                        {course.title}
                    </h2>
                    <p className="text-xs text-indigo-200 mt-1">
                        {course.totalLessons ?? 0} lessons · {course.totalQuizzes ?? 0} quizzes
                    </p>
                </div>

                {/* Progress bar */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600">Progress</span>
                        <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Sections + Lessons + Quizzes */}
                {course.sections?.map((section: any) => (
                    <div key={section.id}>
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 text-left hover:bg-slate-100 transition-colors"
                        >
                            <div>
                <span className="text-xs font-bold text-slate-700 line-clamp-1">
                  {section.title}
                </span>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    {section.lessons?.length ?? 0} lessons
                                </p>
                            </div>
                            {openSections.has(section.id)
                                ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            }
                        </button>

                        {openSections.has(section.id) && section.lessons?.map((lesson: any) => (
                            <div key={lesson.id}>

                                {/* Lesson button */}
                                <button
                                    onClick={() => {
                                        if (canAccessLesson(lesson)) setActiveLesson(lesson)
                                    }}
                                    disabled={!canAccessLesson(lesson)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 text-left transition-colors ${
                                        activeLesson?.id === lesson.id
                                            ? "bg-indigo-50 border-l-2 border-l-indigo-600"
                                            : canAccessLesson(lesson)
                                                ? "hover:bg-slate-50"
                                                : "opacity-50 cursor-not-allowed"
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
                    <span className="text-xs text-slate-700 line-clamp-1 font-medium">
                      {lesson.title}
                    </span>
                                        {lesson.duration ? (
                                            <p className="text-[10px] text-slate-400">{lesson.duration}m</p>
                                        ) : null}
                                    </div>
                                </button>

                                {/* Quizzes under lesson */}
                                {openSections.has(section.id) && lesson.lessonQuizzes?.map((quiz: any) => (
                                    <button
                                        key={quiz.id}
                                        onClick={() => setActiveQuiz(quiz)}
                                        className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 border-b border-amber-50 text-left transition-colors ${
                                            activeQuiz?.id === quiz.id
                                                ? "bg-amber-50 border-l-2 border-l-amber-500"
                                                : "hover:bg-amber-50/50"
                                        }`}
                                    >
                                        <HelpCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                        <span className="text-xs text-amber-700 line-clamp-1">
                      {quiz.title}
                    </span>
                                        {completedQuizzes.has(quiz.id) && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />
                                        )}
                                    </button>
                                ))}

                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 overflow-y-auto">

                {successMsg && (
                    <div className="m-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {successMsg}
                    </div>
                )}

                {/* No lesson selected */}
                {!activeLesson && !activeQuiz && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            Ready to Learn?
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Select a lesson from the sidebar to start learning
                        </p>
                        <button
                            onClick={() => {
                                const first = course.sections?.[0]?.lessons?.[0]
                                if (first) setActiveLesson(first)
                            }}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
                        >
                            Start First Lesson →
                        </button>
                    </div>
                )}

                {/* Quiz Examiner */}
                {activeQuiz && !activeLesson && (
                    <QuizExaminer
                        quiz={activeQuiz}
                        onComplete={(passed) => {
                            setCompletedQuizzes(prev => new Set([...prev, activeQuiz.id]))
                            if (passed) setActiveQuiz(null)
                        }}
                        onClose={() => setActiveQuiz(null)}
                    />
                )}

                {/* Active lesson content */}
                {activeLesson && !activeQuiz && (
                    <div className="max-w-4xl mx-auto p-6 space-y-6">

                        {/* Lesson header */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {activeLesson.type === "VIDEO"
                                        ? <PlayCircle className="w-4 h-4 text-indigo-500" />
                                        : activeLesson.type === "TEXT"
                                            ? <AlignLeft className="w-4 h-4 text-teal-500" />
                                            : <FileIcon className="w-4 h-4 text-orange-500" />
                                    }
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {activeLesson.type}
                  </span>
                                </div>
                                <h1 className="text-2xl font-extrabold text-slate-900">
                                    {activeLesson.title}
                                </h1>
                            </div>
                            {!completedLessons.has(activeLesson.id) ? (
                                <button
                                    onClick={() => markLessonComplete(activeLesson.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex-shrink-0"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Mark Complete
                                </button>
                            ) : (
                                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold">
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

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <button
                                onClick={goPrevLesson}
                                disabled={!prevLesson}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Previous
                            </button>
                            <button
                                onClick={goNextLesson}
                                disabled={!nextLesson || !completedLessons.has(activeLesson.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}

function QuizExaminer({
                          quiz, onComplete, onClose
                      }: {
    quiz: any
    onComplete: (passed: boolean) => void
    onClose: () => void
}) {
    const [questions, setQuestions]   = useState<any[]>([])
    const [answers, setAnswers]       = useState<Record<string, string>>({})
    const [submitted, setSubmitted]   = useState(false)
    const [results, setResults]       = useState<any>(null)
    const [loading, setLoading]       = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [retaking, setRetaking]     = useState(false)

    useEffect(() => {
        api.get(`/api/quizzes/${quiz.id}/take`)
            .then(({ data }) => {
                setQuestions(data.data.quiz.questions ?? [])
                setSubmitted(data.data.hasAttempted ?? false)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [quiz.id, retaking])

    async function handleSubmit() {
        if (Object.keys(answers).length < questions.length) {
            alert("Please answer all questions before submitting.")
            return
        }
        setSubmitting(true)
        try {
            const { data } = await api.post(`/api/quizzes/${quiz.id}/attempt`, { answers })
            setResults(data.data)
            setSubmitted(true)
            const passed = (data.data.score / data.data.total) >= 0.6
            onComplete(passed)
        } catch (err: any) {
            alert(err.response?.data?.message ?? "Submission failed.")
        } finally {
            setSubmitting(false)
        }
    }

    function handleRetake() {
        setAnswers({})
        setSubmitted(false)
        setResults(null)
        setRetaking(r => !r)
    }

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Quiz</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900">{quiz.title}</h1>
                    <p className="text-sm text-slate-500 mt-1">{questions.length} questions</p>
                </div>
                <button onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Results */}
            {submitted && results && (
                <div className={`rounded-2xl p-6 border text-center ${
                    (results.score / results.total) >= 0.6
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                }`}>
                    <div className={`text-4xl font-extrabold mb-2 ${
                        (results.score / results.total) >= 0.6
                            ? "text-emerald-600" : "text-red-600"
                    }`}>
                        {results.score}/{results.total}
                    </div>
                    <p className="font-bold text-slate-900 mb-1">
                        {(results.score / results.total) >= 0.6
                            ? "🎉 Passed! Great job!"
                            : "❌ Failed. Please retake."}
                    </p>
                    <p className="text-sm text-slate-500">
                        {Math.round((results.score / results.total) * 100)}% score
                        · Passing score: 60%
                    </p>
                    <button onClick={handleRetake}
                            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                        Retake Quiz
                    </button>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-5">
                {questions.map((q: any, qi: number) => {
                    const studentAnswer = answers[q.id]
                    const isCorrect = submitted && results
                        ? results.results?.find((r: any) => r.questionId === q.id)?.correct
                        : null

                    return (
                        <div key={q.id}
                             className={`bg-white rounded-2xl border p-5 shadow-sm ${
                                 submitted && isCorrect === true  ? "border-emerald-200" :
                                     submitted && isCorrect === false ? "border-red-200" :
                                         "border-slate-200"
                             }`}
                        >
                            <p className="text-sm font-bold text-slate-900 mb-3">
                                {qi + 1}. {q.question}
                            </p>

                            {/* IMAGE MCQ */}
                            {q.type === "IMAGE_MCQ" && q.image_url && (
                                <img src={q.image_url}
                                     className="w-full max-h-48 object-contain rounded-xl border border-slate-200 mb-3" />
                            )}

                            {/* MCQ / IMAGE_MCQ options */}
                            {(q.type === "MCQ" || q.type === "IMAGE_MCQ") && (
                                <div className="space-y-2">
                                    {(q.options ?? []).map((opt: string, oi: number) => {
                                        const isSelected = studentAnswer === opt
                                        const isCorrectAnswer = submitted && q.correct_answer === opt
                                        return (
                                            <button key={oi}
                                                    onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                                                    disabled={submitted}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                                        isCorrectAnswer && submitted
                                                            ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold"
                                                            : isSelected && submitted && !isCorrectAnswer
                                                                ? "border-red-400 bg-red-50 text-red-800"
                                                                : isSelected
                                                                    ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                                                    : "border-slate-200 hover:border-indigo-300 text-slate-700"
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* TRUE/FALSE */}
                            {q.type === "TRUE_FALSE" && (
                                <div className="flex gap-3">
                                    {["True", "False"].map(opt => {
                                        const isSelected = studentAnswer === opt
                                        const isCorrectAnswer = submitted && q.correct_answer === opt
                                        return (
                                            <button key={opt}
                                                    onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                                                    disabled={submitted}
                                                    className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                                                        isCorrectAnswer && submitted
                                                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                                            : isSelected && submitted && !isCorrectAnswer
                                                                ? "border-red-400 bg-red-50 text-red-700"
                                                                : isSelected
                                                                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                                                    : "border-slate-200 hover:border-indigo-300 text-slate-600"
                                                    }`}
                                            >
                                                {opt === "True" ? "✓ True" : "✗ False"}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* FILL BLANK */}
                            {q.type === "FILL_BLANK" && (
                                <input
                                    type="text"
                                    value={studentAnswer ?? ""}
                                    onChange={e => !submitted && setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                    disabled={submitted}
                                    placeholder="Type your answer here..."
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                                        submitted && isCorrect
                                            ? "border-emerald-400 bg-emerald-50"
                                            : submitted && !isCorrect
                                                ? "border-red-400 bg-red-50"
                                                : "border-slate-200 focus:border-indigo-300"
                                    }`}
                                />
                            )}

                            {/* Explanation after submit */}
                            {submitted && q.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-xs font-bold text-blue-700 mb-1">Explanation</p>
                                    <p className="text-xs text-blue-800">{q.explanation}</p>
                                </div>
                            )}

                            {/* Correct answer reveal */}
                            {submitted && isCorrect === false && (
                                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-xs font-bold text-emerald-700 mb-1">Correct Answer</p>
                                    <p className="text-xs text-emerald-800">{q.correct_answer}</p>
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
