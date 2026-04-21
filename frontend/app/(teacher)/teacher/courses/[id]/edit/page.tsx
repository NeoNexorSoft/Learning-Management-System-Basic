"use client"

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Save, CheckCircle2, Loader2, AlertCircle,
  Upload, Send, Plus, Trash2,
} from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]

interface Category { id: string; name: string }

interface CourseForm {
  title: string
  description: string
  price: string
  level: string
  categoryId: string
  categoryName: string
  objectives: string[]
  thumbnail: string | null
  thumbnailFile: File | null
  status: string
  slug: string
}

const empty: CourseForm = {
  title: "", description: "", price: "", level: "BEGINNER",
  categoryId: "", categoryName: "", objectives: [""],
  thumbnail: null, thumbnailFile: null, status: "DRAFT", slug: "",
}

export default function EditCoursePage() {
  const { id }     = useParams<{ id: string }>()
  const router     = useRouter()
  const fileRef    = useRef<HTMLInputElement>(null)

  const [form, setForm]           = useState<CourseForm>(empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState("")
  const [submitting, setSubmitting] = useState(false)

  const set = useCallback((patch: Partial<CourseForm>) => setForm(f => ({ ...f, ...patch })), [])

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get("/api/categories"),
      api.get("/api/teacher/courses"),
    ]).then(([catRes, coursesRes]) => {
      const cats: any[] = catRes.data.data?.categories ?? catRes.data.data ?? []
      const allCourses: any[] = coursesRes.data.data?.data ?? []
      const course = allCourses.find((c: any) => c.id === id)

      setCategories(cats.filter((c: any) => !c.parent_id).map((c: any) => ({ id: c.id, name: c.name })))

      if (!course) return

      const base: CourseForm = {
        title:        course.title ?? "",
        description:  "",
        price:        String(course.price ?? ""),
        level:        course.level ?? "BEGINNER",
        categoryId:   course.category?.id   ?? "",
        categoryName: course.category?.name ?? "",
        objectives:   [""],
        thumbnail:    course.thumbnail ?? null,
        thumbnailFile: null,
        status:       course.status ?? "DRAFT",
        slug:         course.slug   ?? "",
      }
      set(base)

      // If approved, also fetch full details for description + objectives
      if (course.slug && course.status === "APPROVED") {
        api.get(`/api/courses/${course.slug}`)
          .then(({ data }) => {
            const full = data.data.course
            set({
              description: full.description ?? "",
              objectives:  full.objectives?.map((o: any) => o.text ?? o.content ?? "") ?? [""],
            })
          })
          .catch(() => {})
      }
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [id, set])

  function handleThumbnailChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    set({ thumbnail: URL.createObjectURL(file), thumbnailFile: file })
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return }
    setError("")
    setSaving(true)
    try {
      // Upload thumbnail if changed
      if (form.thumbnailFile) {
        const fd = new FormData()
        fd.append("thumbnail", form.thumbnailFile)
        const { data: upData } = await api.post("/api/upload/thumbnail", fd, { headers: { "Content-Type": "multipart/form-data" } })
        if (upData.data?.url) set({ thumbnailFile: null })
        await api.put(`/api/courses/${id}`, { thumbnail: upData.data?.url })
      }

      await api.put(`/api/courses/${id}`, {
        title:       form.title.trim(),
        description: form.description || undefined,
        price:       form.price ? Number(form.price) : undefined,
        level:       form.level,
        category_id: form.categoryId || undefined,
      })

      const validObjectives = form.objectives.filter(Boolean)
      if (validObjectives.length > 0) {
        await api.post(`/api/courses/${id}/objectives`, {
          objectives: validObjectives.map((text, order) => ({ text, order })),
        })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save changes.")
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitForReview() {
    setError("")
    setSubmitting(true)
    try {
      await handleSave()
      await api.post(`/api/courses/${id}/submit`)
      set({ status: "PENDING" })
      setSaved(true)
      setTimeout(() => { setSaved(false); router.push("/teacher/courses") }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to submit for review.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search…" />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/teacher/courses" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Edit Course</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Status:{" "}
                <span className={`font-semibold ${form.status === "APPROVED" ? "text-emerald-600" : form.status === "PENDING" ? "text-amber-600" : "text-slate-600"}`}>
                  {form.status.charAt(0) + form.status.slice(1).toLowerCase()}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {form.status === "DRAFT" && (
              <button
                onClick={handleSubmitForReview}
                disabled={submitting || saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm shadow-indigo-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </div>

        <div className="max-w-3xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Basic Information</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Title *</label>
              <input
                type="text" value={form.title}
                onChange={e => set({ title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => {
                    const cat = categories.find(c => c.id === e.target.value)
                    set({ categoryId: e.target.value, categoryName: cat?.name ?? "" })
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 outline-none transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level</label>
                <select
                  value={form.level}
                  onChange={e => set({ level: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 outline-none transition-all"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (BDT)</label>
                <input
                  type="number" min={0} value={form.price}
                  onChange={e => set({ price: e.target.value })}
                  placeholder="0 = free"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set({ description: e.target.value })}
                rows={5}
                placeholder="Describe what students will learn in this course…"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Learning Objectives</h2>
            <div className="space-y-2.5">
              {form.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text" value={obj}
                    onChange={e => {
                      const next = [...form.objectives]; next[i] = e.target.value; set({ objectives: next })
                    }}
                    placeholder={`Objective ${i + 1}`}
                    className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                  {form.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => set({ objectives: form.objectives.filter((_, idx) => idx !== i) })}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set({ objectives: [...form.objectives, ""] })}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Objective
            </button>
          </div>

          {/* Thumbnail */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Course Thumbnail</h2>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-44 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors"
            >
              {form.thumbnail ? (
                <img src={form.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload thumbnail</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            <p className="text-xs text-slate-400 mt-1.5">Recommended: 1280×720px (16:9), JPG or PNG, max 2MB</p>
          </div>
        </div>
      </main>
    </div>
  )
}
