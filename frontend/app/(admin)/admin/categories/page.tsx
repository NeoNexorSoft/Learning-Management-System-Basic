"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, FolderOpen, FolderTree, Check, AlertCircle } from "lucide-react"
import api from "@/lib/axios"
import type { Category } from "@/types/admin"
import Modal from "@/components/admin/Modal"
import ConfirmDialog from "@/components/admin/ConfirmDialog"

type Toast = { type: "success" | "error"; message: string } | null

function CategoryForm({
  initial,
  parents,
  onSubmit,
  loading,
  isParent,
}: {
  initial?: Partial<Category>
  parents: Category[]
  onSubmit: (data: { name: string; slug: string; parent_id?: string }) => void
  loading: boolean
  isParent: boolean
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [parentId, setParentId] = useState(initial?.parent_id ?? "")

  function autoSlug(n: string) {
    return n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name: name.trim(), slug: slug.trim(), ...(!isParent && parentId ? { parent_id: parentId } : {}) })
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
        <input
          type="text" required value={name}
          onChange={(e) => { setName(e.target.value); if (!initial?.slug) setSlug(autoSlug(e.target.value)) }}
          placeholder="e.g. Web Development"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slug</label>
        <input
          type="text" required value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. web-development"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono"
        />
      </div>
      {!isParent && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parent Category</label>
          <select
            required value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          >
            <option value="">Select parent…</option>
            {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {initial?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  )
}

export default function AdminCategoriesPage() {
  const [categories,  setCategories]  = useState<Category[]>([])
  const [loading,     setLoading]     = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState<Category | null>(null)
  const [isParentForm, setIsParentForm] = useState(true)

  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [toast,        setToast]        = useState<Toast>(null)

  const parents = categories.filter((c) => !c.parent_id)
  const subs    = categories.filter((c) => !!c.parent_id)

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchCategories() {
    setLoading(true)
    try {
      const { data } = await api.get("/api/categories")
      // Response shape: { status: 'success', data: { categories: [...] } }
      const raw: any[] = data.data?.categories ?? (Array.isArray(data.data) ? data.data : [])
      const all: Category[] = []
      for (const parent of raw) {
        all.push({ id: parent.id, name: parent.name, slug: parent.slug, parent_id: null })
        for (const child of (parent.children ?? [])) {
          all.push({ id: child.id, name: child.name, slug: child.slug, parent_id: parent.id })
        }
      }
      setCategories(all)
    } catch (err: any) {
      console.error("[Categories] fetch failed:", err?.response?.status, err?.message, err)
      const msg = err?.response?.data?.message
        ?? (err?.code === "ERR_NETWORK" ? "Cannot reach the backend — make sure the server is running on port 5000" : "Failed to load categories")
      setCategories([])
      showToast("error", msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  function openAdd(isParent: boolean) {
    setEditTarget(null)
    setIsParentForm(isParent)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditTarget(cat)
    setIsParentForm(!cat.parent_id)
    setModalOpen(true)
  }

  async function handleSubmit(data: { name: string; slug: string; parent_id?: string }) {
    setFormLoading(true)
    try {
      if (editTarget) {
        await api.put(`/api/categories/${editTarget.id}`, data)
        showToast("success", `"${data.name}" updated successfully`)
      } else {
        await api.post("/api/categories", data)
        showToast("success", `"${data.name}" created successfully`)
      }
      await fetchCategories()
      setModalOpen(false)
    } catch (err: any) {
      showToast("error", err.response?.data?.message ?? "Failed to save category")
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/categories/${deleteTarget.id}`)
      showToast("success", `"${deleteTarget.name}" deleted successfully`)
      await fetchCategories()
    } catch (err: any) {
      showToast("error", err.response?.data?.message ?? "Failed to delete category")
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  function CategoryCard({ cat, isParent }: { cat: Category; isParent: boolean }) {
    const childCount = subs.filter((s) => s.parent_id === cat.id).length
    const parentName = isParent ? null : parents.find((p) => p.id === cat.parent_id)?.name

    return (
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isParent ? "bg-indigo-50" : "bg-slate-100"}`}>
            {isParent ? <FolderOpen className="w-4 h-4 text-indigo-600" /> : <FolderTree className="w-4 h-4 text-slate-500" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{cat.name}</p>
            <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
            {parentName && <p className="text-xs text-indigo-500 mt-0.5">Under: {parentName}</p>}
            {isParent && childCount > 0 && <p className="text-xs text-slate-400 mt-0.5">{childCount} subcategories</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => openEdit(cat)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setDeleteTarget(cat); setDeleteOpen(true) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  function Section({ title, items, onAdd, isParent }: { title: string; items: Category[]; onAdd: () => void; isParent: boolean }) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{items.length} {isParent ? "categories" : "subcategories"}</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-slate-400">No {isParent ? "categories" : "subcategories"} yet.</p>
              <button
                onClick={fetchCategories}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 underline transition-colors"
              >
                Retry loading
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((cat) => <CategoryCard key={cat.id} cat={cat} isParent={isParent} />)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">Manage course categories and subcategories</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Parent Categories" items={parents} onAdd={() => openAdd(true)}  isParent={true}  />
        <Section title="Subcategories"     items={subs}    onAdd={() => openAdd(false)} isParent={false} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? `Edit "${editTarget.name}"` : isParentForm ? "Add Parent Category" : "Add Subcategory"}
      >
        <CategoryForm
          initial={editTarget ?? undefined}
          parents={parents}
          onSubmit={handleSubmit}
          loading={formLoading}
          isParent={isParentForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Category?"
        message={`Delete "${deleteTarget?.name}"? All courses under this category may be affected.`}
        confirmLabel="Yes, Delete"
        danger
      />
    </main>
  )
}
