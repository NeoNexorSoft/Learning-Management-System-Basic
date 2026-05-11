"use client"

import { useState, useEffect , Suspense } from "react"
import {
  Search, Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight,
  Check, AlertCircle, Percent, DollarSign,
} from "lucide-react"
import api from "@/lib/axios"
import Modal from "@/components/admin/Modal"
import ConfirmDialog from "@/components/admin/ConfirmDialog"

type DiscountType = "PERCENTAGE" | "FIXED"

type Coupon = {
  id: string
  name: string
  code: string
  discount_type: DiscountType
  value: number
  is_active: boolean
  expires_at: string
  created_at: string
  updated_at: string
}

type Toast = { type: "success" | "error"; message: string } | null

function CouponForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: Partial<Coupon>
  onSubmit: (data: {
    name: string
    code: string
    discountType: DiscountType
    discountValue: number
    expiresAt: string
    status: boolean
  }) => void
  loading: boolean
}) {
  const [name,         setName]         = useState(initial?.name ?? "")
  const [code,         setCode]         = useState(initial?.code ?? "")
  const [discountType, setDiscountType] = useState<DiscountType>(initial?.discount_type ?? "PERCENTAGE")
  const [discountValue,setDiscountValue]= useState(initial?.value?.toString() ?? "")
  const [expiresAt,    setExpiresAt]    = useState(
    initial?.expires_at ? initial.expires_at.split("T")[0] : ""
  )
  const [status,       setStatus]       = useState(initial?.is_active ?? true)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          name: name.trim(),
          code: code.trim(),
          discountType,
          discountValue: Number(discountValue),
          expiresAt,
          status,
        })
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Coupon Name</label>
        <input
          type="text" required value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Summer Sale"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Coupon Code</label>
        <input
          type="text" required value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. SUMMER20"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono tracking-wider"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Type</label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Value {discountType === "PERCENTAGE" ? "(%)" : "(BDT)"}
          </label>
          <input
            type="number" required min={1} max={discountType === "PERCENTAGE" ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 500"}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date</label>
        <input
          type="date" required value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-sm font-semibold text-slate-700">Active Status</span>
        <button
          type="button"
          onClick={() => setStatus(!status)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            status ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
          }`}
        >
          {status ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {status ? "Active" : "Inactive"}
        </button>
      </div>

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

function AdminCouponsPage() {
  const [coupons,       setCoupons]       = useState<Coupon[]>([])
  const [loading,       setLoading]       = useState(true)
  const [formLoading,   setFormLoading]   = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [search,        setSearch]        = useState("")

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState<Coupon | null>(null)

  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [toast,        setToast]        = useState<Toast>(null)

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchCoupons() {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/admin/coupons${search ? `?search=${search}` : ""}`)
      setCoupons(data.data ?? [])
    } catch (err: any) {
      showToast("error", err?.response?.data?.message ?? "Failed to load coupons")
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => fetchCoupons(), 400)
    return () => clearTimeout(timer)
  }, [search])

  function openAdd() {
    setEditTarget(null)
    setModalOpen(true)
  }

  function openEdit(coupon: Coupon) {
    setEditTarget(coupon)
    setModalOpen(true)
  }

  async function handleSubmit(formData: {
    name: string
    code: string
    discountType: DiscountType
    discountValue: number
    expiresAt: string
    status: boolean
  }) {
    setFormLoading(true)
    try {
      if (editTarget) {
        await api.put(`/api/admin/coupons/${editTarget.id}`, formData)
        showToast("success", `"${formData.name}" updated successfully`)
      } else {
        await api.post("/api/admin/coupons", formData)
        showToast("success", `"${formData.name}" created successfully`)
      }
      await fetchCoupons()
      setModalOpen(false)
    } catch (err: any) {
      showToast("error", err?.response?.data?.message ?? "Failed to save coupon")
    } finally {
      setFormLoading(false)
    }
  }

  async function handleToggle(coupon: Coupon) {
    setToggleLoading(coupon.id)
    try {
      await api.patch(`/api/admin/coupons/${coupon.id}/toggle`)
      showToast("success", `"${coupon.name}" ${coupon.is_active ? "disabled" : "enabled"}`)
      await fetchCoupons()
    } catch (err: any) {
      showToast("error", err?.response?.data?.message ?? "Failed to toggle coupon")
    } finally {
      setToggleLoading(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/api/admin/coupons/${deleteTarget.id}`)
      showToast("success", `"${deleteTarget.name}" deleted successfully`)
      await fetchCoupons()
    } catch (err: any) {
      showToast("error", err?.response?.data?.message ?? "Failed to delete coupon")
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) <= new Date()
  }

  const filtered = coupons

  return (
    <main className="flex-1 p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">Manage discount coupons for courses</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-xs text-slate-400">
            {loading ? "Loading…" : `${filtered.length} coupon${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {search ? `No results for "${search}"` : "No coupons yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((coupon) => {
                  const expired = isExpired(coupon.expires_at)
                  return (
                    <tr
                      key={coupon.id}
                      className={`transition-colors hover:bg-slate-50 ${expired ? "opacity-50" : ""}`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">{coupon.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg tracking-wider">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${coupon.discount_type === "PERCENTAGE" ? "bg-indigo-50" : "bg-emerald-50"}`}>
                            {coupon.discount_type === "PERCENTAGE"
                              ? <Percent className="w-3 h-3 text-indigo-600" />
                              : <DollarSign className="w-3 h-3 text-emerald-600" />}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {coupon.discount_type === "PERCENTAGE" ? `${coupon.value}%` : `৳${coupon.value}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {expired
                          ? <span className="text-red-500 font-semibold">Expired</span>
                          : new Date(coupon.expires_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(coupon)}
                          disabled={toggleLoading === coupon.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            coupon.is_active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {toggleLoading === coupon.id
                            ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            : coupon.is_active
                              ? <ToggleRight className="w-3.5 h-3.5" />
                              : <ToggleLeft className="w-3.5 h-3.5" />}
                          {coupon.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(coupon); setDeleteOpen(true) }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? `Edit "${editTarget.name}"` : "Add Coupon"}
      >
        <CouponForm
          initial={editTarget ?? undefined}
          onSubmit={handleSubmit}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Coupon?"
        message={`Delete "${deleteTarget?.name}" (${deleteTarget?.code})? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        danger
      />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense>
      <AdminCouponsPage />
    </Suspense>
  )
}
