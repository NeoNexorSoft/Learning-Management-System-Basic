"use client"

import { useEffect, useState , Suspense } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Eye, Search, Star, BookOpen, PlayCircle, HelpCircle, Users } from "lucide-react"
import api from "@/lib/axios"

type Course = {
  id: string
  title: string
  slug: string
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  price: number
  discount_price?: number
  is_popular: boolean
  teacher: { name: string; email: string }
  category?: { name: string; parent?: { name: string } }
  totalSections?: number
  totalLessons?: number
  totalQuizzes?: number
  totalStudents?: number
  created_at: string
  submitted_at?: string
}

type CoursePage = { data: Course[]; total: number; page: number; totalPages: number }

const STATUS_STYLES = {
  DRAFT:    "bg-slate-100 text-slate-600",
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
}

function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses]      = useState<CoursePage>({ data: [], total: 0, page: 1, totalPages: 0 })
  const [loading, setLoading]      = useState(true)
  const [search, setSearch]        = useState("")
  const [statusFilter, setStatus]  = useState("")
  const [rejectId, setRejectId]    = useState<string | null>(null)
  const [rejectReason, setReason]  = useState("")
  const [actionLoading, setAction] = useState(false)
  const [error, setError]          = useState("")

  async function load() {
    setLoading(true)
    try {
      const params: Record<string, string> = { limit: "50" }
      if (statusFilter) params.status = statusFilter
      if (search)       params.search = search
      const { data } = await api.get("/api/admin/courses", { params })
      setCourses(Array.isArray(data.data) ? { data: data.data, total: data.total, page: data.page, totalPages: data.totalPages } : { data: [], total: 0, page: 1, totalPages: 0 })
    } catch { setCourses({ data: [], total: 0, page: 1, totalPages: 0 }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter, search]) // eslint-disable-line

  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    api.get("/api/admin/courses?status=PENDING&limit=1")
      .then(({ data }) => setPendingCount(data.total ?? 0))
      .catch(() => {})
  }, []) // eslint-disable-line

  async function approve(id: string) {
    setAction(true)
    try {
      await api.put(`/api/admin/courses/${id}/approve`)
      setCourses(cs => ({ ...cs, data: cs.data.map(c => c.id === id ? { ...c, status: "APPROVED" as const } : c) }))
      setPendingCount(prev => Math.max(0, prev - 1))
      window.dispatchEvent(new CustomEvent("pendingCountChanged"))
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed to approve") }
    finally { setAction(false) }
  }

  async function reject() {
    if (!rejectId || !rejectReason.trim()) return
    setAction(true)
    try {
      await api.put(`/api/admin/courses/${rejectId}/reject`, { reason: rejectReason })
      setCourses(cs => ({ ...cs, data: cs.data.map(c => c.id === rejectId ? { ...c, status: "REJECTED" as const } : c) }))
      setPendingCount(prev => Math.max(0, prev - 1))
      window.dispatchEvent(new CustomEvent("pendingCountChanged"))
      setRejectId(null)
      setReason("")
    } catch (e: any) { setError(e.response?.data?.message ?? "Failed to reject") }
    finally { setAction(false) }
  }

  async function handleTogglePopular(id: string, current: boolean) {
    try {
      await api.put(`/api/admin/courses/${id}/popular`, { is_popular: !current })
      setCourses(cs => ({
        ...cs,
        data: cs.data.map(c => c.id === id ? { ...c, is_popular: !c.is_popular } : c),
      }))
    } catch (err: any) { alert(err.response?.data?.message ?? "Failed to update.") }
  }

  return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Course Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve submitted courses</p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {error}
              <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
            </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search courses or teachers…"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-300"
            />
          </div>
          <div className="flex items-center gap-2">
            {["", "PENDING", "APPROVED", "REJECTED", "DRAFT"].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            statusFilter === s
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}>
                  {s || "All"}
                </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
          ) : courses.data.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">No courses found</div>
          ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Course", "Teacher", "Category", "Subcategory", "Price", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.data.map(c => {
                    const price         = Number(c.price ?? 0)
                    const discountPrice = Number(c.discount_price ?? 0)
                    const hasDiscount   = discountPrice > 0 && discountPrice < price
                    const finalPrice    = hasDiscount ? discountPrice : price
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                              {c.totalSections ?? 0} sections
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <PlayCircle className="w-3.5 h-3.5 text-teal-400" />
                              {c.totalLessons ?? 0} lessons
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                              {c.totalQuizzes ?? 0} quizzes
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Users className="w-3.5 h-3.5 text-emerald-400" />
                              {c.totalStudents ?? 0} students
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{c.teacher.name}</p>
                          <p className="text-xs text-slate-400">{c.teacher.email}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{c.category?.parent?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{c.category?.name ?? "—"}</td>
                        <td className="px-4 py-3">
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
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleTogglePopular(c.id, c.is_popular)}
                                    className="p-1.5 rounded-lg transition-colors">
                              <Star className={`w-4 h-4 ${c.is_popular ? "fill-yellow-400 text-yellow-500" : "text-slate-300 hover:text-yellow-400"}`} />
                            </button>
                            <button onClick={() => router.push(`/admin/courses/preview/${c.slug}`)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Preview">
                              <Eye className="w-4 h-4" />
                            </button>
                            {c.status === "PENDING" && (
                              <>
                                <button onClick={() => approve(c.id)} disabled={actionLoading}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button onClick={() => { setRejectId(c.id); setReason("") }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
          )}
        </div>

        {/* Reject Modal */}
        {rejectId && (
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
                  <button onClick={() => setRejectId(null)}
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

export default function Page() {
  return (
    <Suspense>
      <AdminCoursesPage />
    </Suspense>
  )
}
