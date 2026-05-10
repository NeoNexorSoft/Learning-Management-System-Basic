"use client"

import { useState, useRef, useEffect, type ChangeEvent , Suspense } from "react"
import { Camera, Save, CheckCircle2, Loader2, AlertCircle, Lock } from "lucide-react"

import api from "@/lib/axios"
import { setUser } from "@/lib/auth"
import { useAuth } from "@/hooks/useAuth"

function StudentSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", mobile: "", bio: "" })
  const [preview, setPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  const [pwForm, setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [pwSaved, setPwSaved] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState("")

  useEffect(() => {
    api.get("/api/auth/me")
      .then(({ data }) => {
        const u = data.data.user
        const parts = (u.name ?? "").split(" ")
        setForm({
          firstName: parts[0] ?? "",
          lastName:  parts.slice(1).join(" ") ?? "",
          email:     u.email ?? "",
          mobile:    u.mobile ?? "",
          bio:       u.bio ?? "",
        })
        if (u.avatar) setPreview(u.avatar)
      })
      .catch(() => {
        if (user) {
          const parts = (user.name ?? "").split(" ")
          setForm({ firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") ?? "", email: user.email ?? "", mobile: user.mobile ?? "", bio: user.bio ?? "" })
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      let avatarUrl: string | undefined
      if (avatarFile) {
        const fd = new FormData()
        fd.append("avatar", avatarFile)
        const { data: upData } = await api.post("/api/upload/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } })
        if (upData.data?.url) {
          avatarUrl = upData.data.url
          setPreview(avatarUrl ?? null)
        }
      }
      const name = `${form.firstName} ${form.lastName}`.trim()
      const { data } = await api.put("/api/users/profile", {
        name,
        mobile: form.mobile || undefined,
        bio:    form.bio    || undefined,
      })
      const updated = { ...data.data.user, ...(avatarUrl ? { avatar: avatarUrl } : {}) }
      setUser(updated)
      window.dispatchEvent(new Event("storage"))
      await refreshUser()
      setAvatarFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save changes.")
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSave() {
    setPwError("")
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Passwords do not match."); return }
    if (pwForm.newPassword.length < 6) { setPwError("New password must be at least 6 characters."); return }
    setPwSaving(true)
    try {
      await api.put("/api/users/password", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      })
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err: any) {
      setPwError(err.response?.data?.message ?? "Failed to update password.")
    } finally {
      setPwSaving(false)
    }
  }

  const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase()

  if (loading) {
    return (
      <div className="flex flex-col flex-1">

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile and account information.</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-6">Profile Information</h2>

            <div className="flex items-start gap-6 mb-6 pb-6 border-b border-slate-100">
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  {preview ? (
                    <img src={preview} alt="Profile photo" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials || "?"}</span>
                  )}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  <Camera className="w-3.5 h-3.5" /> Change Photo
                </button>
                <p className="text-xs text-slate-400 text-center leading-tight">JPG, JPEG or PNG<br />Square (1:1)</p>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-semibold text-slate-900 mb-1">{form.firstName} {form.lastName}</p>
                <p className="text-sm text-slate-500 mb-3">{form.email}</p>
                <p className="text-xs text-slate-400">Upload a square profile photo in JPG, JPEG, or PNG format for the best display across the platform.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} disabled className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50 outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                  <input type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20 disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Changes saved!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
                <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="Enter current password" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                  <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Min. 6 characters" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Repeat new password" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                </div>
              </div>

              {pwError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handlePasswordSave} disabled={pwSaving} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-70">
                  {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
                {pwSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Password updated!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <StudentSettingsPage />
    </Suspense>
  )
}
