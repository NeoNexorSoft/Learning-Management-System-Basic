"use client"

import { useEffect, useState, useRef } from "react"
import { Upload, Loader2, AlertCircle, FileText, CheckCircle2 } from "lucide-react"
import Modal from "@/components/admin/Modal"
import api from "@/lib/axios"

interface Course {
  id: string
  title: string
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateAssignmentModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle]             = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget]           = useState<"COURSE" | "ALL_ENROLLED">("COURSE")
  const [courseId, setCourseId]       = useState("")
  const [dueDate, setDueDate]         = useState("")
  const [totalMarks, setTotalMarks]   = useState(100)
  const [file, setFile]               = useState<File | null>(null)
  const [fileUrl, setFileUrl]         = useState("")
  const [uploading, setUploading]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState("")
  const [courses, setCourses]         = useState<Course[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    api
      .get("/api/courses/my-courses")
      .then(({ data }) => {
        setCourses(data.data?.courses ?? data.data?.data ?? [])
      })
      .catch(() => {})
  }, [open])

  function reset() {
    setTitle("")
    setDescription("")
    setTarget("COURSE")
    setCourseId("")
    setDueDate("")
    setTotalMarks(100)
    setFile(null)
    setFileUrl("")
    setError("")
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.append("file", f)
      const { data } = await api.post("/api/upload/cloudinary", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setFileUrl(data.url ?? data.data?.url ?? "")
    } catch (err: any) {
      setError(err.response?.data?.message ?? "File upload failed")
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required."); return }
    if (!dueDate)       { setError("Due date is required."); return }
    if (target === "COURSE" && !courseId) { setError("Please select a course."); return }

    setError("")
    setSubmitting(true)
    try {
      await api.post("/api/assignments/create", {
        title:       title.trim(),
        description: description.trim() || undefined,
        target,
        course_id:   target === "COURSE" ? courseId : undefined,
        due_date:    new Date(dueDate).toISOString(),
        total_marks: totalMarks,
        ...(fileUrl && { file_url: fileUrl }),
      })
      onCreated()
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to create assignment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Create Assignment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Week 3 Essay"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Instructions or details for students…"
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Target + Course */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target</label>
            <select
              value={target}
              onChange={e => {
                setTarget(e.target.value as "COURSE" | "ALL_ENROLLED")
                setCourseId("")
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="COURSE">Specific Course</option>
              <option value="ALL_ENROLLED">All Enrolled</option>
            </select>
          </div>

          {target === "COURSE" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select course…</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Due Date + Total Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Marks</label>
            <input
              type="number"
              value={totalMarks}
              min={1}
              onChange={e => setTotalMarks(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Attachment{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </>
            ) : file ? (
              <>
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="truncate max-w-xs text-slate-700 font-medium">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Click to upload file
              </>
            )}
          </button>
          {fileUrl && !uploading && (
            <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              File uploaded successfully
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Assignment"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
