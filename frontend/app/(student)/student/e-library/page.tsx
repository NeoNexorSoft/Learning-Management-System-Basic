"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"

import PageHeader from "@/components/shared/PageHeader"
import CourseFilter from "@/components/shared/CourseFilter"
import api from "@/lib/axios"

interface CourseItem {
    id: string
    title: string
    teacher: string
    progress: number
    category: string
    status: "in-progress" | "completed"
    thumbnail: string
    totalLessons: number
    completedLessons: number
    _raw?: any
}

const gradients: Record<string, string> = {
    "Web Development": "from-blue-400 to-indigo-600",
    Programming: "from-blue-400 to-indigo-600",
    Design: "from-pink-400 to-rose-600",
    CS: "from-purple-400 to-violet-600",
    Business: "from-amber-400 to-orange-600",
    "Data Science": "from-cyan-400 to-blue-600",
}
const emojis: Record<string, string> = {
    "Web Development": "💻", Programming: "💻", Design: "🎨", CS: "🔬", Business: "📊", "Data Science": "📈",
}

function CourseCard({ course }: { course: CourseItem }) {
    const gradient  = gradients[course.category] ?? "from-slate-400 to-slate-600"
    const emoji     = emojis[course.category]    ?? "📚"
    const completed = course.status === "completed"

    return (
        <Link href={`/student/courses/${course.id}/learn`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group block cursor-pointer">
            {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="h-32 w-full object-cover" />
            ) : (
                <div className={`bg-gradient-to-br ${gradient} h-32 flex items-center justify-center`}>
                    <span className="text-5xl">{emoji}</span>
                </div>
            )}
            <div className="p-5">
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
            completed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
        }`}>
          {completed ? "Completed" : "In Progress"}
        </span>
                <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                </h4>
                <p className="text-xs text-slate-500 mb-4">by {course.teacher} · {course.category}</p>
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className="text-xs font-bold text-indigo-600">{course.progress ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${course.progress ?? 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}

function StudentCoursesPage() {
    const searchParams = useSearchParams()
    const search = (searchParams.get("search") ?? "").toLowerCase()

    const [courses, setCourses] = useState<CourseItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState<string | null>(null)
    const [page,    setPage]    = useState(1)
    const [filters, setFilters] = useState({
        categoryId:    searchParams.get("categoryId")    ?? "",
        subcategoryId: searchParams.get("subcategoryId") ?? "",
        sort:          searchParams.get("sort")          ?? "oldest",
    })

    function handleFilter(params: { categoryId: string; subcategoryId: string; sort: string }) {
        setFilters(params)
        setPage(1)
    }

    useEffect(() => {
        setLoading(true)
        api.get("/api/enrollments/my", { params: { ...filters, page, limit: 20 } })
            .then(({ data }) => {
                const enrollments: any[] = data.data.enrollments ?? []
                const mapped: CourseItem[] = enrollments.map((e: any) => ({
                    id:               e.course.id,
                    title:            e.course?.title        ?? "Untitled",
                    teacher:          e.course?.teacher?.name ?? "Unknown",
                    progress:         Number(e.progress      ?? 0),
                    category:         e.course?.category?.name ?? "General",
                    status:           e.status === "COMPLETED" ? "completed" : "in-progress",
                    thumbnail:        e.course?.thumbnail    ?? "",
                    totalLessons:     0,
                    completedLessons: 0,
                    _raw:             e,
                }))
                setCourses(mapped)
            })
            .catch(() => setError("Failed to load courses."))
            .finally(() => setLoading(false))
    }, [filters, page])

    const inProgress = courses.filter((c) => c.status !== "completed").length
    const completed  = courses.filter((c) => c.status === "completed").length

    const filtered = search
        ? courses.filter((c) =>
            c.title.toLowerCase().includes(search)   ||
            c.teacher.toLowerCase().includes(search) ||
            c.category.toLowerCase().includes(search)
        )
        : courses

    const grouped = useMemo(() => {
        const classMap = new Map<string, { id: string; name: string; order: number; subjects: Map<string, { id: string; name: string; order: number; courses: CourseItem[] }> }>()
        filtered.forEach(course => {
            const rawCategory  = (course as any)._raw?.course?.category
            const subject      = rawCategory?.name ?? course.category ?? "General"
            const className    = rawCategory?.parent?.name ?? subject
            const classId      = rawCategory?.parent?.id ?? rawCategory?.id ?? "general"
            const subjectId    = rawCategory?.id ?? "general"
            const classOrder   = rawCategory?.parent?.order ?? rawCategory?.order ?? 999
            const subjectOrder = rawCategory?.order ?? 999
            if (!classMap.has(classId)) {
                classMap.set(classId, { id: classId, name: className, order: classOrder, subjects: new Map() })
            }
            const classGroup = classMap.get(classId)!
            if (!classGroup.subjects.has(subjectId)) {
                classGroup.subjects.set(subjectId, { id: subjectId, name: subject, order: subjectOrder, courses: [] })
            }
            classGroup.subjects.get(subjectId)!.courses.push(course)
        })
        return Array.from(classMap.values())
            .sort((a, b) => a.order - b.order)
            .map(c => ({
                ...c,
                subjects: Array.from(c.subjects.values()).sort((a, b) => a.order - b.order)
            }))
    }, [filtered])

    // FIX: No early return when loading.
    // CourseFilter must ALWAYS stay mounted so its state is never reset.
    // Show spinner inside the layout instead of replacing the whole page.
    return (
        <div className="flex flex-col flex-1">
            <main className="flex-1 p-6 overflow-y-auto">
                <PageHeader
                    title={"A digital library with all available courses"}
                   /* subtitle={"A digital library with all available courses"}*/
                />

                {/* CourseFilter is always rendered — never unmounts */}
                <div className="mb-6">
                    <CourseFilter onFilter={handleFilter} />
                </div>

                {/* Spinner shown inline, below filter — not as a full page replacement */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
                        {search ? (
                            <p className="text-slate-500 font-medium">No courses match "{searchParams.get("search")}".</p>
                        ) : (
                            <>
                                <p className="text-slate-500 font-medium">No courses yet.</p>
                                <p className="text-slate-400 text-sm mt-1">Browse the course catalogue to get started.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {grouped.map(classGroup => (
                            <div key={classGroup.id} style={{ marginBottom: "2.5rem" }}>
                                {/* Class heading */}
                                <div style={{ borderLeft: "4px solid #6366f1", paddingLeft: "12px", marginBottom: "1.25rem" }}>
                                    <div className="flex items-center gap-2">
                                        <span style={{ fontSize: "18px", fontWeight: 500 }} className="text-slate-800">{classGroup.name}</span>
                                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {classGroup.subjects.reduce((acc, s) => acc + s.courses.length, 0)} courses
                                        </span>
                                    </div>
                                </div>

                                {classGroup.subjects.map(subjectGroup => (
                                    <div key={subjectGroup.id} style={{ marginBottom: "1.5rem", paddingLeft: "16px", borderLeft: "2px solid #e2e8f0" }}>
                                        {/* Subject heading */}
                                        <p className="text-sm font-medium text-slate-400 mb-4">{subjectGroup.name}</p>

                                        {/* Courses grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {subjectGroup.courses.map((course) => (
                                                <CourseCard key={course.id} course={course} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </>
                )}
            </main>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense>
            <StudentCoursesPage />
        </Suspense>
    )
}