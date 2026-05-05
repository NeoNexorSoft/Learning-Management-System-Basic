"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, ChevronRight, Plus, Trash2, GripVertical,
  ChevronUp, ChevronDown, BookOpen, FileText, HelpCircle,
  Upload, Eye, Send, Check, Bold, Italic, Underline,
  List, ListOrdered, ImageIcon, X, Loader2, AlertCircle,
  Video, FileIcon, AlignLeft, PlayCircle,
} from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

// ─── Types ────────────────────────────────────────────────────────────────────

type LectureType = "video" | "text" | "document"

type QOption = [string, string, string, string]
type QItem   = { id: string; question: string; options: QOption; correctIndex: number }
type Quiz    = { id: string; title: string; timer_seconds: number | ""; questions: QItem[] }

type Lecture = {
  id: string
  title: string
  type: LectureType
  duration: string
  file_urls?: string[]
  text_content?: string
  quizzes: Quiz[]
}

type Section = { id: string; title: string; outcome: string; lectures: Lecture[]; collapsed: boolean }
type Category = { id: string; name: string; children?: { id: string; name: string }[] }
type DiscountType = "PERCENTAGE" | "FIXED" | ""

type Wizard = {
  step: number
  title: string; slug: string
  objectives: string[]; requirements: string[]; audience: string[]
  sections: Section[]
  subtitle: string; description: string; language: string
  level: string        // "" = not selected (optional)
  category: string; categoryId: string
  subcategory: string; subcategoryId: string
  duration: string
  thumbnail: string | null; thumbnailFile: File | null
  introVideo: string | null; introVideoFile: File | null
  price: string
  discountType: DiscountType; discountValue: string; discountEndsAt: string
  welcomeMessage: string; congratsMessage: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid     = () => Math.random().toString(36).slice(2, 9)
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const LANGUAGES   = ["English", "Bengali", "Hindi", "Arabic", "Spanish"]
const LEVELS      = ["Beginner", "Intermediate", "Advanced"]
const STEP_LABELS = ["Content", "Learners", "Curriculum", "Pricing", "Messages"]

const initWizard: Wizard = {
  step: 0,
  title: "", slug: "",
  objectives: [""], requirements: [""], audience: [""],
  sections: [],
  subtitle: "", description: "", language: "English", level: "",
  category: "", categoryId: "", subcategory: "", subcategoryId: "",
  duration: "",
  thumbnail: null, thumbnailFile: null,
  introVideo: null, introVideoFile: null,
  price: "",
  discountType: "", discountValue: "", discountEndsAt: "",
  welcomeMessage: "", congratsMessage: "",
}

function calcFinalPrice(price: string, type: DiscountType, value: string): number | null {
  const p = parseFloat(price), d = parseFloat(value)
  if (isNaN(p) || p <= 0) return null
  if (!type || isNaN(d) || d <= 0) return p
  if (type === "PERCENTAGE") return Math.max(0, p - (p * Math.min(d, 100)) / 100)
  if (type === "FIXED")      return Math.max(0, p - d)
  return p
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
        {children}
        {optional && <span className="ml-1.5 text-[10px] font-normal text-slate-400 normal-case">(optional)</span>}
      </label>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
      <input {...props} className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${props.className ?? ""}`} />
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl p-6 ${className}`}>{children}</div>
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
      <select {...props} className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${props.className ?? ""}`}>
        {children}
      </select>
  )
}

// ─── Dynamic List ─────────────────────────────────────────────────────────────

function DynamicList({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string
}) {
  const update = (i: number, val: string) => { const n = [...items]; n[i] = val; onChange(n) }
  const add    = () => onChange([...items, ""])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
      <div>
        <Label>{label}</Label>
        <div className="space-y-2.5">
          {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <Input value={item} onChange={e => update(i, e.target.value)} placeholder={placeholder ?? `Item ${i + 1}`} />
                {items.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                )}
              </div>
          ))}
        </div>
        <button type="button" onClick={add} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          <Plus className="w-4 h-4" /> Add More
        </button>
      </div>
  )
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function RichTextEditor({ initialValue = "", onBlur }: { initialValue?: string; onBlur: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.innerHTML = initialValue }, []) // eslint-disable-line

  const exec = (cmd: string) => { ref.current?.focus(); document.execCommand(cmd, false) }

  return (
      <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
          {([["bold", Bold], ["italic", Italic], ["underline", Underline]] as const).map(([cmd, Icon]) => (
              <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); exec(cmd) }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded text-slate-600">
                <Icon className="w-4 h-4" />
              </button>
          ))}
          <div className="w-px h-5 bg-slate-300 mx-1" />
          <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList") }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded text-slate-600"><List className="w-4 h-4" /></button>
          <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList") }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded text-slate-600"><ListOrdered className="w-4 h-4" /></button>
        </div>
        <div ref={ref} contentEditable suppressContentEditableWarning
             onBlur={() => ref.current && onBlur(ref.current.innerHTML)}
             className="min-h-[180px] p-4 text-sm text-slate-800 outline-none [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ol]:list-decimal [&_ol]:ml-5 [&_ul]:list-disc [&_ul]:ml-5"
        />
      </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
      <div className="flex items-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < current ? "bg-indigo-600 text-white" : i === current ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-slate-100 text-slate-400"}`}>
                  {i < current ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold whitespace-nowrap hidden sm:block ${i === current ? "text-indigo-600" : i < current ? "text-slate-600" : "text-slate-400"}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < current ? "bg-indigo-600" : "bg-slate-200"}`} />}
            </div>
        ))}
      </div>
  )
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ w, onClose }: { w: Wizard; onClose: () => void }) {
  const finalPrice = calcFinalPrice(w.price, w.discountType, w.discountValue)
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-base font-bold text-slate-900">Course Preview</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex gap-2 mb-3 flex-wrap">
                {w.level    && <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full">{w.level}</span>}
                {w.category && <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full">{w.category}</span>}
              </div>
              <h1 className="text-2xl font-extrabold mb-2">{w.title || "Course Title"}</h1>
              <p className="text-white/80 text-sm">{w.subtitle || "Course subtitle"}</p>
              {w.price && (
                  <div className="mt-4 flex items-baseline gap-3">
                    {finalPrice !== null && finalPrice < parseFloat(w.price)
                        ? <><span className="text-2xl font-extrabold">৳{Math.round(finalPrice).toLocaleString()}</span><span className="line-through text-white/60">৳{parseInt(w.price).toLocaleString()}</span></>
                        : <span className="text-2xl font-extrabold">৳{parseInt(w.price).toLocaleString()} BDT</span>
                    }
                  </div>
              )}
            </div>
            {w.objectives.filter(Boolean).length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">What You&apos;ll Learn</h3>
                  <ul className="space-y-2">
                    {w.objectives.filter(Boolean).map((o, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{o}</li>
                    ))}
                  </ul>
                </div>
            )}
            {w.sections.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Curriculum ({w.sections.length} sections)</h3>
                  <div className="space-y-2">
                    {w.sections.map(s => (
                        <div key={s.id} className="border border-slate-200 rounded-xl p-3">
                          <p className="text-sm font-semibold text-slate-800">{s.title || "Untitled Section"}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.lectures.length} lectures · {s.lectures.reduce((n, l) => n + l.quizzes.length, 0)} quizzes</p>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ w, set }: { w: Wizard; set: (p: Partial<Wizard>) => void }) {
  return (
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-6">Intended Learners</h2>
        <div className="space-y-8">
          <DynamicList label="Learning Objectives" items={w.objectives} onChange={v => set({ objectives: v })} placeholder="e.g. Build full-stack web apps" />
          <DynamicList label="Requirements / Prerequisites" items={w.requirements} onChange={v => set({ requirements: v })} placeholder="e.g. Basic HTML knowledge" />
          <DynamicList label="Who Is This Course For?" items={w.audience} onChange={v => set({ audience: v })} placeholder="e.g. Beginner developers" />
        </div>
      </Card>
  )
}

// ─── Step 2: Curriculum ───────────────────────────────────────────────────────

function LectureForm({ lecture, onChange, onDelete, uploadConfig }: {
  lecture: Lecture; onChange: (l: Lecture) => void; onDelete: () => void; uploadConfig?: any
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState("")

  const isVideo = lecture.type === "video"
  const isDoc   = lecture.type === "document"
  const isText  = lecture.type === "text"

  const accept    = isVideo ? "video/*" : "*/*"
  const endpoint  = isVideo ? "/api/upload/video" : "/api/upload/document"
  const fieldName = isVideo ? "video" : "document"

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError("")
    try {
      const fd = new FormData()
      fd.append(fieldName, file)
      const { data } = await api.post(endpoint, fd, { headers: { "Content-Type": "multipart/form-data" } })
      onChange({ ...lecture, file_urls: [...(lecture.file_urls ?? []), data.data.url] })
    } catch (err: any) {
      setUploadError(err.response?.data?.message ?? "Upload failed.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const addQuiz = () => onChange({
    ...lecture,
    quizzes: [...lecture.quizzes, { id: uid(), title: "", timer_seconds: "", questions: [{ id: uid(), question: "", options: ["", "", "", ""], correctIndex: 0 }] }],
  })
  const updQuiz = (qi: number, q: Quiz) => { const qs = [...lecture.quizzes]; qs[qi] = q; onChange({ ...lecture, quizzes: qs }) }
  const delQuiz = (qi: number) => onChange({ ...lecture, quizzes: lecture.quizzes.filter((_, i) => i !== qi) })

  const typeIcon = { video: <Video className="w-4 h-4 text-indigo-500" />, text: <AlignLeft className="w-4 h-4 text-teal-500" />, document: <FileIcon className="w-4 h-4 text-orange-500" /> }

  function FilePreview({ url }: { url: string }) {
    const ext = url.split(".").pop()?.toLowerCase() ?? ""
    const remove = () => onChange({ ...lecture, file_urls: lecture.file_urls?.filter(u => u !== url) })
    if (["mp4","webm","mkv","avi","mov","flv","wmv","m4v"].includes(ext)) {
      return (
        <div className="relative">
          <video src={url} controls preload="metadata" className="w-full max-h-52 rounded-xl border border-slate-200 bg-black" />
          <button type="button" onClick={remove} className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
        </div>
      )
    }
    if (ext === "pdf") {
      return (
        <div className="relative">
          <iframe src={url} className="w-full h-48 rounded-xl border border-slate-200" />
          <button type="button" onClick={remove} className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
        </div>
      )
    }
    if (["jpg","jpeg","png","webp"].includes(ext)) {
      return (
        <div className="relative">
          <img src={url} className="w-full max-h-48 object-contain rounded-xl border border-slate-200" />
          <button type="button" onClick={remove} className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
        </div>
      )
    }
    const filename = url.split("/").pop() ?? url
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-100 border border-slate-200 rounded-xl">
        <FileIcon className="w-8 h-8 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{filename}</p>
          <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{ext}</span>
        </div>
        <button type="button" onClick={remove} className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0">Remove</button>
      </div>
    )
  }

  return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">{typeIcon[lecture.type]}<span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Lecture</span></div>
          <button type="button" onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>

        <Input value={lecture.title} onChange={e => onChange({ ...lecture, title: e.target.value })} placeholder="Lecture title" />

        <div className={`grid gap-3 ${isVideo ? "grid-cols-2" : "grid-cols-1"}`}>
          <select
              value={lecture.type}
              onChange={e => {
                const t = e.target.value as LectureType
                onChange({ ...lecture, type: t, file_urls: [], text_content: undefined, ...(t !== "video" ? { duration: "" } : {}) })
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 outline-none"
          >
            <option value="video">🎬 Video</option>
            <option value="text">📝 Text / Article</option>
            <option value="document">📄 Document</option>
          </select>
          {isVideo && <Input value={lecture.duration} onChange={e => onChange({ ...lecture, duration: e.target.value })} placeholder="Duration (e.g. 12 min)" />}
        </div>

        {/* TEXT type: plain textarea */}
        {isText && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Article / Lesson Text</label>
              <textarea
                  value={lecture.text_content ?? ""}
                  onChange={e => onChange({ ...lecture, text_content: e.target.value })}
                  rows={6}
                  placeholder="Write the full lesson text here. Students will read this directly."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none resize-y transition-all"
              />
            </div>
        )}

        {/* VIDEO or DOCUMENT: file previews + always-visible upload button */}
        {(isVideo || isDoc) && (
            <div className="space-y-2">
              {(lecture.file_urls ?? []).map(url => <FilePreview key={url} url={url} />)}
              <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
              <button
                  type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
              >
                {uploading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                    : isVideo
                        ? <><Upload className="w-3.5 h-3.5" /> Upload Video ({uploadConfig?.video?.allowedFormats?.join(", ") ?? "mp4, webm, mkv"} · max {uploadConfig?.video?.maxSizeMB ?? 500}MB)</>
                        : <><Upload className="w-3.5 h-3.5" /> Upload Document ({uploadConfig?.document?.allowedFormats?.join(", ") ?? "any format"} · max {uploadConfig?.document?.maxSizeMB ?? 50}MB) — click to add more</>
                }
              </button>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            </div>
        )}

        {/* Quiz section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Quizzes ({lecture.quizzes.length})</span>
            <button type="button" onClick={addQuiz} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">
              <Plus className="w-3.5 h-3.5" /> Add Quiz
            </button>
          </div>
          {lecture.quizzes.map((q, qi) => (
              <QuizForm key={q.id} quiz={q} onChange={u => updQuiz(qi, u)} onDelete={() => delQuiz(qi)} />
          ))}
        </div>
      </div>
  )
}

function QuizForm({ quiz, onChange, onDelete }: { quiz: Quiz; onChange: (q: Quiz) => void; onDelete: () => void }) {
  const addQ = () => onChange({ ...quiz, questions: [...quiz.questions, { id: uid(), question: "", options: ["", "", "", ""], correctIndex: 0 }] })
  const updQ = (qi: number, q: QItem) => { const qs = [...quiz.questions]; qs[qi] = q; onChange({ ...quiz, questions: qs }) }
  const delQ = (qi: number) => onChange({ ...quiz, questions: quiz.questions.filter((_, i) => i !== qi) })

  return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-amber-600" /><span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Quiz</span></div>
          <button type="button" onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
        <Input value={quiz.title} onChange={e => onChange({ ...quiz, title: e.target.value })} placeholder="Quiz title" className="bg-white" />
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Timer (minutes)</label>
            <span className="text-[10px] text-slate-400 font-medium">optional</span>
          </div>
          <Input
            type="number"
            min={1}
            value={quiz.timer_seconds}
            onChange={e => onChange({ ...quiz, timer_seconds: e.target.value === "" ? "" : Number(e.target.value) })}
            placeholder="e.g. 5 (leave empty for no timer)"
            className="bg-white"
          />
        </div>
        {quiz.questions.map((q, qi) => (
            <div key={q.id} className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Question {qi + 1}</span>
                {quiz.questions.length > 1 && <button type="button" onClick={() => delQ(qi)} className="p-1 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <Input value={q.question} onChange={e => updQ(qi, { ...q, question: e.target.value })} placeholder="Enter question" />
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === oi} onChange={() => updQ(qi, { ...q, correctIndex: oi })} className="accent-indigo-600" />
                      <Input
                          value={opt}
                          onChange={e => { const opts = [...q.options] as QOption; opts[oi] = e.target.value; updQ(qi, { ...q, options: opts }) }}
                          placeholder={`Option ${oi + 1}${oi === q.correctIndex ? " (correct)" : ""}`}
                          className={oi === q.correctIndex ? "border-emerald-300 bg-emerald-50" : ""}
                      />
                    </div>
                ))}
              </div>
            </div>
        ))}
        <button type="button" onClick={addQ} className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-900"><Plus className="w-4 h-4" /> Add Question</button>
      </div>
  )
}

function SectionCard({ section, index, total, onChange, onDelete, onMove, uploadConfig }: {
  section: Section; index: number; total: number
  onChange: (s: Section) => void; onDelete: () => void; onMove: (dir: "up" | "down") => void; uploadConfig?: any
}) {
  const addLecture = () => onChange({ ...section, lectures: [...section.lectures, { id: uid(), title: "", type: "video", duration: "", quizzes: [], file_urls: [] }] })
  const updL = (i: number, l: Lecture) => { const ls = [...section.lectures]; ls[i] = l; onChange({ ...section, lectures: ls }) }
  const delL = (i: number) => onChange({ ...section, lectures: section.lectures.filter((_, idx) => idx !== i) })

  return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
          <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <div className="flex items-center gap-1 flex-shrink-0">
            <button type="button" onClick={() => onMove("up")} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
            <button type="button" onClick={() => onMove("down")} disabled={index === total - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full flex-shrink-0">Section {index + 1}</span>
          <input value={section.title} onChange={e => onChange({ ...section, title: e.target.value })} placeholder="Section title" className="flex-1 min-w-0 text-sm font-semibold text-slate-800 bg-transparent outline-none placeholder-slate-400" />
          <div className="flex items-center gap-1 flex-shrink-0">
            <button type="button" onClick={() => onChange({ ...section, collapsed: !section.collapsed })} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg">
              {section.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {!section.collapsed && (
            <div className="p-5 space-y-4">
          <textarea
              value={section.outcome}
              onChange={e => onChange({ ...section, outcome: e.target.value })}
              rows={2} placeholder="Section outcome / description"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
          />
              {section.lectures.map((l, li) => <LectureForm key={l.id} lecture={l} onChange={u => updL(li, u)} onDelete={() => delL(li)} uploadConfig={uploadConfig} />)}
              <div className="flex items-center gap-3 pt-1">
                <button type="button" onClick={addLecture} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100"><FileText className="w-3.5 h-3.5" /> Add Lecture</button>
              </div>
            </div>
        )}
      </div>
  )
}

function Step2({ w, set, uploadConfig }: { w: Wizard; set: (p: Partial<Wizard>) => void; uploadConfig?: any }) {
  const addSection  = () => set({ sections: [...w.sections, { id: uid(), title: "", outcome: "", lectures: [], collapsed: false }] })
  const updSection  = (i: number, s: Section) => { const ss = [...w.sections]; ss[i] = s; set({ sections: ss }) }
  const delSection  = (i: number) => set({ sections: w.sections.filter((_, idx) => idx !== i) })
  const moveSection = (i: number, dir: "up" | "down") => {
    const ss = [...w.sections], j = dir === "up" ? i - 1 : i + 1
    ;[ss[i], ss[j]] = [ss[j], ss[i]]; set({ sections: ss })
  }

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Course Curriculum</h2>
            <p className="text-sm text-slate-500 mt-0.5">{w.sections.length} section{w.sections.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {w.sections.length === 0 ? (
            <Card className="text-center py-10">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium mb-4">No sections yet.</p>
              <button type="button" onClick={addSection} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Add First Section
              </button>
            </Card>
        ) : (
            <>
              <div className="space-y-3">
                {w.sections.map((s, i) => (
                    <SectionCard key={s.id} section={s} index={i} total={w.sections.length}
                                 onChange={u => updSection(i, u)} onDelete={() => delSection(i)} onMove={dir => moveSection(i, dir)} uploadConfig={uploadConfig} />
                ))}
              </div>
              <button type="button" onClick={addSection} className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </>
        )}
      </div>
  )
}

// ─── Step 3: Course Content (with thumbnail + intro video upload) ─────────────

function Step3({ w, set, categories, uploadConfig }: { w: Wizard; set: (p: Partial<Wizard>) => void; categories: Category[]; uploadConfig?: any }) {
  const thumbRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const [thumbUploading, setThumbUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [thumbError, setThumbError]         = useState("")
  const [videoError, setVideoError]         = useState("")

  async function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setThumbUploading(true); setThumbError("")
    // preview immediately
    set({ thumbnail: URL.createObjectURL(file), thumbnailFile: file })
    try {
      const fd = new FormData(); fd.append("thumbnail", file)
      const { data } = await api.post("/api/upload/thumbnail", fd, { headers: { "Content-Type": "multipart/form-data" } })
      set({ thumbnail: data.data.url, thumbnailFile: null })
    } catch (err: any) {
      setThumbError(err.response?.data?.message ?? "Thumbnail upload failed.")
      set({ thumbnail: null, thumbnailFile: null })
    } finally {
      setThumbUploading(false)
      if (thumbRef.current) thumbRef.current.value = ""
    }
  }

  async function handleIntroVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setVideoUploading(true); setVideoError("")
    try {
      const fd = new FormData(); fd.append("intro_video", file)
      const { data } = await api.post("/api/upload/intro-video", fd, { headers: { "Content-Type": "multipart/form-data" } })
      set({ introVideo: data.data.url })
    } catch (err: any) {
      setVideoError(err.response?.data?.message ?? "Intro video upload failed.")
    } finally {
      setVideoUploading(false)
      if (videoRef.current) videoRef.current.value = ""
    }
  }

  return (
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-6">Course Content</h2>
        <div className="space-y-5">

          {/* Title */}
          <div>
            <Label>Course Title *</Label>
            <Input value={w.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Complete Web Development Bootcamp" />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Course URL Slug *</Label>
              <button type="button" onClick={() => set({ slug: slugify(w.title) })} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                ↺ Auto-generate from title
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 whitespace-nowrap">/courses/</span>
              <Input value={w.slug} onChange={e => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="web-development-bootcamp" />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <Label>Course Subtitle *</Label>
            <Input value={w.subtitle} onChange={e => set({ subtitle: e.target.value })} placeholder="e.g. Build 10 real-world projects" />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <select value={w.categoryId} onChange={e => { const cat = categories.find(c => c.id === e.target.value); set({ categoryId: e.target.value, category: cat?.name ?? "", subcategoryId: "", subcategory: "" }) }}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Subcategory *</Label>
              <select value={w.subcategoryId} disabled={!w.categoryId}
                      onChange={e => { const subs = categories.find(c => c.id === w.categoryId)?.children ?? []; const sub = subs.find(s => s.id === e.target.value); set({ subcategoryId: e.target.value, subcategory: sub?.name ?? "" }) }}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 outline-none disabled:opacity-50">
                <option value="">{w.categoryId ? "Select subcategory" : "Select a category first"}</option>
                {(categories.find(c => c.id === w.categoryId)?.children ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Level (OPTIONAL) */}
          <div>
            <Label optional>Level</Label>
            <select value={w.level} onChange={e => set({ level: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:border-indigo-300 outline-none">
              <option value="">All levels / Not specified</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <Label>Course Description *</Label>
            <RichTextEditor initialValue={w.description} onBlur={description => set({ description })} />
          </div>

          {/* Thumbnail upload */}
          <div>
            <Label>Course Thumbnail *</Label>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
            <div
                onClick={() => !thumbUploading && thumbRef.current?.click()}
                className="relative h-44 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors"
            >
              {w.thumbnail ? (
                  <>
                    <img src={w.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change thumbnail</span>
                    </div>
                  </>
              ) : (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                    {thumbUploading
                        ? <><Loader2 className="w-7 h-7 text-indigo-400 animate-spin" /><span className="text-sm text-slate-500">Uploading…</span></>
                        : <><ImageIcon className="w-7 h-7 text-slate-300" /><span className="text-sm text-slate-400 font-medium">Click to upload thumbnail</span><span className="text-xs text-slate-400">1280×720px recommended · max {uploadConfig?.thumbnail?.maxSizeMB ?? 5}MB · {uploadConfig?.thumbnail?.allowedFormats?.join(", ") ?? "jpg, jpeg, png, webp, gif"}</span></>
                    }
                  </div>
              )}
            </div>
            {thumbError && <p className="text-xs text-red-500 mt-1.5">{thumbError}</p>}
            {w.thumbnail && !thumbUploading && (
                <button type="button" onClick={() => set({ thumbnail: null, thumbnailFile: null })} className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium">Remove thumbnail</button>
            )}
          </div>

          {/* Intro video upload */}
          <div>
            <Label optional>Course Intro Video</Label>
            <input ref={videoRef} type="file" accept="video/mp4,video/webm,.mkv" className="hidden" onChange={handleIntroVideo} />
            {w.introVideo ? (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <PlayCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm text-indigo-700 font-medium flex-1 truncate">Intro video uploaded ✓</span>
                  <button type="button" onClick={() => set({ introVideo: null })} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <button
                    type="button" onClick={() => !videoUploading && videoRef.current?.click()} disabled={videoUploading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                >
                  {videoUploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading intro video…</>
                      : <><PlayCircle className="w-4 h-4" /> Upload Intro Video ({uploadConfig?.introVideo?.allowedFormats?.map((f: string) => "." + f).join(" ") ?? ".mp4 .webm .mkv"} · max {uploadConfig?.introVideo?.maxSizeMB ?? 200}MB)</>
                  }
                </button>
            )}
            {videoError && <p className="text-xs text-red-500 mt-1.5">{videoError}</p>}
          </div>

        </div>
      </Card>
  )
}

// ─── Step 4: Pricing ─────────────────────────────────────────────────────────

function Step4({ w, set }: { w: Wizard; set: (p: Partial<Wizard>) => void }) {
  const finalPrice = calcFinalPrice(w.price, w.discountType, w.discountValue)
  const hasDiscount = finalPrice !== null && w.price && finalPrice < parseFloat(w.price)
  const savedAmount = hasDiscount ? parseFloat(w.price) - finalPrice! : 0

  return (
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-6">Pricing</h2>
        <div className="space-y-5">

          {/* Regular Price */}
          <div>
            <Label>Regular Price (BDT) *</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">৳</span>
              <Input type="number" min={0} value={w.price} onChange={e => set({ price: e.target.value })} placeholder="e.g. 1500" className="pl-8" />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Set 0 for a free course.</p>
          </div>

          {/* Discount Type */}
          <div>
            <Label optional>Discount Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {([["", "No Discount"], ["PERCENTAGE", "Percentage (%)"], ["FIXED", "Fixed Amount (৳"]] as [DiscountType, string][]).map(([val, lbl]) => (
                  <button
                      key={val} type="button"
                      onClick={() => set({ discountType: val, discountValue: "", discountEndsAt: "" })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${w.discountType === val ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    {lbl}
                  </button>
              ))}
            </div>
          </div>

          {/* Discount Value + End Date */}
          {w.discountType && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <Label>{w.discountType === "PERCENTAGE" ? "Discount %" : "Discount Amount (৳)"}</Label>
                  <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {w.discountType === "PERCENTAGE" ? "%" : "৳"}
                </span>
                    <Input
                        type="number" min={0} max={w.discountType === "PERCENTAGE" ? 100 : undefined}
                        value={w.discountValue} onChange={e => set({ discountValue: e.target.value })}
                        placeholder={w.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 200"}
                        className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label optional>Discount Ends At</Label>
                  <Input type="datetime-local" value={w.discountEndsAt} onChange={e => set({ discountEndsAt: e.target.value })} />
                </div>
              </div>
          )}

          {/* After-discount preview */}
          {w.price && parseFloat(w.price) > 0 && (
              <div className={`rounded-xl p-4 border ${hasDiscount ? "bg-emerald-50 border-emerald-200" : "bg-indigo-50 border-indigo-200"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${hasDiscount ? "text-emerald-700" : "text-indigo-700"}`}>
                  {hasDiscount ? "Price After Discount" : "Pricing Summary"}
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Regular price</span>
                    <span className="font-semibold text-slate-800">৳{parseInt(w.price).toLocaleString()}</span>
                  </div>
                  {hasDiscount && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Discount</span>
                          <span className="font-semibold text-red-600">
                      − ৳{Math.round(savedAmount).toLocaleString()}
                            {w.discountType === "PERCENTAGE" && ` (${w.discountValue}%)`}
                    </span>
                        </div>
                        <div className="h-px bg-slate-200 my-1" />
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-800">Final price</span>
                          <span className="font-extrabold text-emerald-700 text-base">৳{Math.round(finalPrice!).toLocaleString()}</span>
                        </div>
                      </>
                  )}
                  {w.discountEndsAt && hasDiscount && (
                      <p className="text-xs text-slate-400 mt-1">
                        Discount expires: {new Date(w.discountEndsAt).toLocaleDateString("en-BD", { dateStyle: "long" })}
                      </p>
                  )}
                </div>
              </div>
          )}

          {/* Note about coupons */}
          <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Coupons</strong> are managed by the admin and applied by students at checkout — no action needed here.
            </p>
          </div>

        </div>
      </Card>
  )
}

// ─── Step 5: Messages ─────────────────────────────────────────────────────────

function Step5({ w, set }: { w: Wizard; set: (p: Partial<Wizard>) => void }) {
  const MAX = 1000
  return (
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-6">Course Messages</h2>
        <div className="space-y-6">
          {[
            { key: "welcomeMessage" as const,  label: "Welcome Message",        hint: "Auto-sent when a student enrolls" },
            { key: "congratsMessage" as const, label: "Congratulations Message", hint: "Auto-sent when a student completes the course" },
          ].map(({ key, label, hint }) => (
              <div key={key}>
                <Label>{label}</Label>
                <textarea
                    value={w[key]}
                    onChange={e => set({ [key]: e.target.value.slice(0, MAX) } as any)}
                    rows={6} placeholder={`Write your ${label.toLowerCase()}…`}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-slate-400">{hint}</p>
                  <span className={`text-xs font-medium ${w[key].length >= MAX ? "text-red-500" : "text-slate-400"}`}>{w[key].length}/{MAX}</span>
                </div>
              </div>
          ))}
        </div>
      </Card>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const router = useRouter()
  const [w, setW]                     = useState<Wizard>(initWizard)
  const [preview, setPreview]         = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [categories, setCategories]   = useState<Category[]>([])
  const [uploadConfig, setUploadConfig] = useState<any>(null)

  useEffect(() => {
    api.get("/api/categories").then(({ data }) => {
      const cats: any[] = data.data?.categories ?? data.data ?? []
      setCategories(cats.map((c: any) => ({ id: c.id, name: c.name, children: (c.children ?? []).map((ch: any) => ({ id: ch.id, name: ch.name })) })))
    }).catch(() => {})
    api.get("/api/upload/config").then(({ data }) => setUploadConfig(data.data)).catch(() => {})
  }, [])

  const set = useCallback((patch: Partial<Wizard>) => setW(prev => ({ ...prev, ...patch })), [])

  function next() {
    setSubmitError("")
    if (w.step === 0) {
      if (!w.title.trim())        { setSubmitError("Title is required."); return }
      if (!w.slug.trim())         { setSubmitError("Slug is required."); return }
      if (!w.subtitle.trim())     { setSubmitError("Course subtitle is required."); return }
      if (!w.categoryId)          { setSubmitError("Please select a category."); return }
      if (!w.subcategoryId)       { setSubmitError("Please select a subcategory."); return }
      if (!w.description?.trim()) { setSubmitError("Course description is required."); return }
      if (!w.thumbnail)           { setSubmitError("Course thumbnail is required."); return }
    }
    if (w.step === 1) {
      if (!w.objectives.some(o => o.trim()))   { setSubmitError("Add at least one learning objective."); return }
      if (!w.requirements.some(r => r.trim())) { setSubmitError("Add at least one requirement."); return }
      if (!w.audience.some(a => a.trim()))     { setSubmitError("Add at least one target audience."); return }
    }
    if (w.step === 2) {
      if (w.sections.length === 0)                                               { setSubmitError("Add at least one section."); return }
      if (w.sections.some(s => !s.title.trim()))                                 { setSubmitError("All sections must have a title."); return }
      if (w.sections.some(s => s.lectures.length === 0))                         { setSubmitError("Each section must have at least one lecture."); return }
      if (w.sections.some(s => s.lectures.some(l => !l.title.trim())))           { setSubmitError("All lectures must have a title."); return }
    }
    if (w.step === 3) {
      if (!w.price && w.price !== "0") { setSubmitError("Please set a course price."); return }
    }
    if (w.step < 4) set({ step: w.step + 1 })
  }
  const back = () => { if (w.step > 0) set({ step: w.step - 1 }) }

  async function submitForReview() {
    if (!w.title.trim())      { setSubmitError("Course title is required."); return }
    if (!w.categoryId)        { setSubmitError("Please select a category."); return }
    if (!w.subcategoryId)     { setSubmitError("Please select a subcategory."); return }
    if (!w.description.trim()) { setSubmitError("Course description is required."); return }
    if (!w.thumbnail)         { setSubmitError("Course thumbnail is required."); return }
    setSubmitError(""); setSubmitting(true)

    try {
      // 1. Create course (level is optional — only send if set)
      const createPayload: any = {
        title:       w.title.trim(),
        category_id: w.subcategoryId || w.categoryId,
      }
      if (w.level) createPayload.level = w.level.toUpperCase()

      const { data: createData } = await api.post("/api/courses", createPayload)
      const courseId = createData.data.course.id

      // 2. Update all other fields
      const updatePayload: any = {}
      if (w.subtitle)         updatePayload.subtitle         = w.subtitle
      if (w.description)      updatePayload.description      = w.description
      if (w.price)            updatePayload.price            = Number(w.price)
      if (w.welcomeMessage)   updatePayload.welcome_message  = w.welcomeMessage
      if (w.congratsMessage)  updatePayload.congrats_message = w.congratsMessage
      if (w.thumbnail)        updatePayload.thumbnail        = w.thumbnail
      if (w.introVideo)       updatePayload.intro_video      = w.introVideo
      if (w.discountType)     updatePayload.discount_type    = w.discountType
      if (w.discountEndsAt)   updatePayload.discount_ends_at = new Date(w.discountEndsAt).toISOString()
      if (w.discountType && w.discountValue) {
        const base = parseFloat(w.price) || 0
        const disc = parseFloat(w.discountValue) || 0
        const final = w.discountType === "PERCENTAGE"
            ? Math.max(0, base - (base * Math.min(disc, 100)) / 100)
            : Math.max(0, base - disc)
        updatePayload.discount_price = final
      }
      await api.put(`/api/courses/${courseId}`, updatePayload)

      // 3. Objectives (filter empty)
      const allObjectives = [
        ...w.objectives.filter(Boolean).map((content, order) => ({ type: "OBJECTIVE",        content, order })),
        ...w.requirements.filter(Boolean).map((content, order) => ({ type: "REQUIREMENT",     content, order })),
        ...w.audience.filter(Boolean).map((content, order)     => ({ type: "TARGET_AUDIENCE", content, order })),
      ]
      if (allObjectives.length > 0) {
        await api.post(`/api/courses/${courseId}/objectives`, { objectives: allObjectives })
      }

      // 4. Sections + lessons
      for (let si = 0; si < w.sections.length; si++) {
        const sec = w.sections[si]
        if (!sec.title.trim()) continue
        const { data: secData } = await api.post(`/api/courses/${courseId}/sections`, { title: sec.title, order: si + 1 })
        const sectionId = secData.data.section.id

        for (let li = 0; li < sec.lectures.length; li++) {
          const lec = sec.lectures[li]
          if (!lec.title.trim()) continue
          const lessonPayload: any = {
            title:   lec.title,
            type:    lec.type.toUpperCase(),
            order:   li + 1,
          }
          if (lec.duration) lessonPayload.duration = parseInt(lec.duration) || 0
          if (lec.type === "video")    lessonPayload.video_urls = lec.file_urls ?? []
          if (lec.type === "document") lessonPayload.file_urls  = lec.file_urls ?? []
          if (lec.type === "text" && lec.text_content) lessonPayload.content = lec.text_content
          const { data: lessonData } = await api.post(`/api/sections/${sectionId}/lessons`, lessonPayload)
          const lessonId = lessonData.data.lesson.id

          for (const quiz of lec.quizzes ?? []) {
            try {
              const { data: qd } = await api.post(`/api/lessons/${lessonId}/quizzes`, {
                title: quiz.title,
                ...(quiz.timer_seconds ? { timer_seconds: Number(quiz.timer_seconds) * 60 } : {}),
              })
              for (const q of quiz.questions ?? []) {
                try {
                  await api.post(`/api/quizzes/${qd.data.quiz.id}/questions`, {
                    type: "MCQ",
                    question: q.question,
                    options: q.options,
                    correct_answer: q.options[q.correctIndex],
                  })
                } catch {}
              }
            } catch {}
          }
        }
      }

      // 5. Submit for admin review
      await api.post(`/api/courses/${courseId}/submit`)
      setSubmitted(true)
      setTimeout(() => router.push("/teacher/courses"), 2500)
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? "Failed to submit. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const stepProps = { w, set }

  return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search…" />
        <main className="flex-1">

          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/teacher/courses" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">Create New Course</h1>
                <p className="text-xs text-slate-500">Step {w.step + 1} of {STEP_LABELS.length} — {STEP_LABELS[w.step]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPreview(true)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button type="button" onClick={submitForReview} disabled={submitted || submitting}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 transition-colors">
                {submitted ? <><Check className="w-4 h-4" /> Submitted!</> : submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit for Review</>}
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 py-8">
            <StepIndicator current={w.step} />

            {w.step === 0 && <Step3 {...stepProps} categories={categories} uploadConfig={uploadConfig} />}
            {w.step === 1 && <Step1 {...stepProps} />}
            {w.step === 2 && <Step2 {...stepProps} uploadConfig={uploadConfig} />}
            {w.step === 3 && <Step4 {...stepProps} />}
            {w.step === 4 && <Step5 {...stepProps} />}

            {submitError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <button type="button" onClick={back} disabled={w.step === 0}
                      className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {w.step < 4 ? (
                  <button type="button" onClick={next}
                          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20">
                    Save & Continue <ChevronRight className="w-4 h-4" />
                  </button>
              ) : (
                  <button type="button" onClick={submitForReview} disabled={submitted || submitting}
                          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 transition-colors">
                    {submitted ? <><Check className="w-4 h-4" /> Submitted!</> : submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit for Review</>}
                  </button>
              )}
            </div>
          </div>
        </main>

        {preview && <PreviewModal w={w} onClose={() => setPreview(false)} />}

        {submitted && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">Submitted for Review!</h3>
                <p className="text-sm text-slate-500">Admin will review and approve your course. Redirecting…</p>
              </div>
            </div>
        )}
      </div>
  )
}