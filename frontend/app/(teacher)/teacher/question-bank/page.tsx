"use client"

import { useEffect, useState, Suspense, type ReactNode } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {Sparkles, Plus, Trash2, Pencil, X, Check, Loader2, Database, Search, Filter, SlidersHorizontal } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"
import DataTable, { Column } from "@/components/admin/DataTable"
import Pagination from "@/components/admin/Pagination"
import Badge from "@/components/admin/Badge"
import Modal from "@/components/admin/Modal"
import QuestionGenerator from "./QuestionGenerationView"
import { CheckBengal } from "@/lib/utils"

type Question = {
  source: ReactNode
  id: string
  questionText: string
  questionTextEn?: string
  type: string
  difficulty: string
  marks: number
  options: string | string[] // Can be JSON string or array
  answer: string
  answerBn?: string
  explanation?: string
  explanationBn?: string
  subject?: string
  topic?: string
  subtopic?: string
  hint?: string
  bloomLevel?: string
  status: string
  isPublished: boolean
  hasFigure: boolean
  hasFormula: boolean
  needEvaluation: boolean
  createdAt: string
}

const emptyForm = {
  questionText: "",
  questionTextEn: "",
  type: "MCQ",
  options: ["", "", "", ""],
  answer: "",
  answerBn: "",
  explanation: "",
  explanationBn: "",
  difficulty: "medium",
  marks: 1,
  subject: "",
  topic: "",
  subtopic: "",
  hint: "",
  bloomLevel: "",
  status: "draft",
  isPublished: false,
  hasFigure: false,
  hasFormula: false,
  needEvaluation: false,
}

function QuestionBankPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get("search") ?? ""
  const currentPage = Number(searchParams.get("page") ?? "1")
  const typeFilter = searchParams.get("type") ?? ""
  const sourceFilter = searchParams.get("source") ?? ""
  const statusFilter = searchParams.get("status") ?? ""

  const [questions, setQuestions] = useState<Question[]>([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showSheet, setShowSheet] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadQuestions() {
    setLoading(true)
    try {
      const res = await api.get("/api/question-bank", {
        params: {
          search,
          page: currentPage,
          limit: 10,
          type: typeFilter,
          source: sourceFilter,
          status: statusFilter,
        }
      })
      setQuestions(res.data.data ?? [])
      setPagination({
        total: res.data.pagination?.total ?? 0,
        totalPages: res.data.pagination?.totalPages ?? 0
      })
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [search, currentPage, typeFilter, sourceFilter, statusFilter])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1") // Reset to first page on filter change
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/teacher/question-bank")
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setShowSheet(true)
  }

  function openEdit(q: Question) {
    let parsedOptions = ["", "", "", ""]
    if (q.options) {
      try {
        const opts = typeof q.options === "string" ? JSON.parse(q.options) : q.options
        if (Array.isArray(opts)) {
          parsedOptions = [...opts, "", "", "", ""].slice(0, 4)
        }
      } catch (e) {
        console.error("Error parsing options", e)
      }
    }

    setEditId(q.id)
    setForm({
      questionText: q.questionText,
      questionTextEn: q.questionTextEn ?? "",
      type: q.type,
      options: parsedOptions,
      answer: q.answer,
      answerBn: q.answerBn ?? "",
      explanation: q.explanation ?? "",
      explanationBn: q.explanationBn ?? "",
      difficulty: q.difficulty,
      marks: q.marks,
      subject: q.subject ?? "",
      topic: q.topic ?? "",
      subtopic: q.subtopic ?? "",
      hint: q.hint ?? "",
      bloomLevel: q.bloomLevel ?? "",
      status: q.status,
      isPublished: q.isPublished,
      hasFigure: q.hasFigure,
      hasFormula: q.hasFormula,
      needEvaluation: q.needEvaluation,
    })
    setShowSheet(true)
  }

  async function handleSave() {
    if (!form.questionText.trim() || !form.answer.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        options: form.type === "MCQ" ? form.options.filter(o => o.trim() !== "") : [],
      }
      
      if (editId) {
        await api.put(`/api/question-bank/${editId}`, payload)
      } else {
        await api.post("/api/question-bank", payload)
      }
      setShowSheet(false)
      setEditId(null)
      setForm(emptyForm)
      await loadQuestions()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return
    setDeletingId(id)
    try {
      await api.delete(`/api/question-bank/${id}`)
      await loadQuestions()
    } catch {
    } finally {
      setDeletingId(null)
    }
  }

  const columns: Column<Question>[] = [
    {
      header: "Question & Context",
      className: "max-w-md",
      render: (q) => (
        <div className="py-2">
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 font-bold text-indigo-600 text-[10px] uppercase">
               {q.type.substring(0, 2)}
             </div>
             <div>
                <p className="font-bold text-slate-800 leading-tight line-clamp-2 mb-1">{q.questionText}</p>
                {q.questionTextEn && <p className="text-xs text-slate-400 line-clamp-1 italic">{q.questionTextEn}</p>}
             </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2.5 pl-11">
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">{q.type}</span>
            {q.subject && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">{q.subject}</span>}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${q.source === 'ai' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
              Source: {q.source}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Difficulty",
      render: (q) => <Badge label={q.difficulty} />
    },
    {
      header: "Marks",
      render: (q) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-slate-700">{q.marks}</span>
          <span className="text-[10px] text-slate-400 font-medium">Points</span>
        </div>
      )
    },
    {
      header: "Status",
      render: (q) => (
        <div className="flex flex-col gap-1">
           <Badge label={q.status} />
           {q.isPublished && <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Visible</span>}
        </div>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (q) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(q)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(q.id)}
            disabled={deletingId === q.id}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {deletingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <TopBar placeholder="Search questions…" />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Question Bank</h1>
              <p className="text-slate-500 mt-1">
                Manage and generate questions for your courses
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                AI Questions
              </button>
              <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
              </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
             <div className="flex-1 min-w-50 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter by question text..."
                  value={search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                />
             </div>

             <select 
               value={typeFilter} 
               onChange={(e) => handleFilterChange("type", e.target.value)}
               className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
             >
                <option value="">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT">Short Answer</option>
             </select>

             <select 
               value={sourceFilter} 
               onChange={(e) => handleFilterChange("source", e.target.value)}
               className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
             >
                <option value="">All Sources</option>
                <option value="manual">Manual</option>
                <option value="ai">AI Generated</option>
             </select>

             <select 
               value={statusFilter} 
               onChange={(e) => handleFilterChange("status", e.target.value)}
               className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
             >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
             </select>

             {(search || typeFilter || sourceFilter || statusFilter) && (
               <button 
                 onClick={clearFilters}
                 className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-2"
               >
                 RESET
               </button>
             )}

             <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block" />
             <p className="text-xs font-bold text-slate-400 px-2">
               {pagination.total} TOTAL
             </p>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <DataTable
              columns={columns}
              data={questions}
              loading={loading}
              keyFn={(q) => q.id}
              emptyMessage={search ? "No questions match your search filters." : "Your question bank is empty."}
            />
            
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-50 flex items-center justify-center">
                <Pagination
                  page={currentPage}
                  totalPages={pagination.totalPages}
                  onChange={(p) => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("page", p.toString())
                    router.push(`?${params.toString()}`)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Side Panel (Sheet) */}
      {showSheet && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-60 transition-opacity animate-in fade-in"
            onClick={() => !saving && setShowSheet(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-70 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Sheet Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editId ? "Edit Question" : "New Question"}
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  {editId ? "Update existing entry" : "Add to question bank"}
                </p>
              </div>
              <button 
                onClick={() => !saving && setShowSheet(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sheet Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Question Text Sections */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Content</h3>
                <div className="space-y-4">
                  {!!CheckBengal(form.questionText) &&<div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question Text (BN)</label>
                    <textarea
                      rows={3}
                      value={form.questionText}
                      onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all resize-none"
                      placeholder="বাংলায় প্রশ্নটি লিখুন..."
                    />
                  </div>}
                  {!CheckBengal(form.questionText) &&<div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question Text (EN)</label>
                    <textarea
                      rows={3}
                      value={form.questionTextEn}
                      onChange={e => setForm(f => ({ ...f, questionTextEn: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all resize-none"
                      placeholder="Write the question in English..."
                    />
                  </div>}
                </div>
              </div>

              {/* Basic Config */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all appearance-none bg-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SHORT">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all appearance-none bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marks</label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={e => setForm(f => ({ ...f, marks: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all appearance-none bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Options (MCQ only) */}
              {form.type.toLowerCase().includes("mcq") && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Options</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input
                          value={opt}
                          onChange={e => {
                            const opts = [...form.options]
                            opts[i] = e.target.value
                            setForm(f => ({ ...f, options: opts }))
                          }}
                          className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Correct Answer & Explanation</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correct Answer</label>
                    <input
                      value={form.answer}
                      onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                      className="uppercase w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all"
                      placeholder="e.g. A or the exact text"
                    />
                  </div>
                  {!!CheckBengal(form.answer) &&<div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Explanation (BN)</label>
                    <textarea
                      rows={2}
                      value={form.explanationBn}
                      onChange={e => setForm(f => ({ ...f, explanationBn: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all resize-none"
                      placeholder="ব্যাখ্যা লিখুন..."
                    />
                  </div>}
                  {!CheckBengal(form.answer) &&<div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Explanation (EN)</label>
                    <textarea
                      rows={2}
                      value={form.explanation}
                      onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all resize-none"
                      placeholder="Write explanation in English..."
                    />
                  </div>}
                </div>
              </div>

              {/* Categorization */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Classification</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Topic</label>
                    <input
                      value={form.topic}
                      onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Subtopic</label>
                    <input
                      value={form.subtopic}
                      onChange={e => setForm(f => ({ ...f, subtopic: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {[
                  { key: "isPublished", label: "Publicly Visible" },
                  { key: "hasFigure", label: "Has Figure/Image" },
                  { key: "hasFormula", label: "Has Formula" },
                  { key: "needEvaluation", label: "Need Evaluation" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={(form as any)[item.key]}
                        onChange={e => setForm(f => ({ ...f, [item.key]: e.target.checked }))}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:bg-indigo-600 checked:border-indigo-600"
                      />
                      <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button
                onClick={() => !saving && setShowSheet(false)}
                disabled={saving}
                className="flex-1 bg-white border border-slate-200 text-slate-600 text-sm font-bold py-3 rounded-xl hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.questionText.trim() || !form.answer.trim()}
                className="flex-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {editId ? "Update Question" : "Save Question"}
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={showAIModal}
        onClose={() => {
          setShowAIModal(false)
          loadQuestions()
        }}
        title="AI Question Generator"
        size="xl"
      >
        <div className="max-h-[85vh] overflow-y-auto pr-2">
          <QuestionGenerator />
        </div>
      </Modal>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <QuestionBankPage />
    </Suspense>
  )
}
