"use client"

import { useState } from "react"
import { ExternalLink, ChevronDown, ChevronUp, Pencil, Trash2, Plus, X } from "lucide-react"
import PageHeader from "@/components/shared/PageHeader"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import { POST_CADET_DATA, type PrepCard, type Resource } from "@/lib/post-cadet-college-prep"

// Full class names so Tailwind's JIT does not purge them
const COLOR_STYLES: Record<string, { badge: string; bar: string }> = {
  indigo:  { badge: "bg-indigo-100 text-indigo-700",   bar: "bg-indigo-500"  },
  blue:    { badge: "bg-blue-100 text-blue-700",       bar: "bg-blue-500"    },
  emerald: { badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
  rose:    { badge: "bg-rose-100 text-rose-700",       bar: "bg-rose-500"    },
}

// ── Card ─────────────────────────────────────────────────────────────────────

function CardView({
  card,
  canEdit,
  onEdit,
  onDelete,
}: {
  card: PrepCard
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded,      setExpanded]      = useState(false)
  const [tipsOpen,      setTipsOpen]      = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const styles = COLOR_STYLES[card.color] ?? COLOR_STYLES.indigo

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Content row: color bar + body */}
      <div className="flex flex-1">
        {/* Accent bar */}
        <div className={`w-1 shrink-0 ${styles.bar}`} />

        {/* Body */}
        <div className="flex-1 flex flex-col gap-3 p-5">
          {/* Type badge */}
          <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
            {card.type}
          </span>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 leading-snug">{card.title}</h3>

          {/* Description — clamped with Read more */}
          <div>
            <p className={`text-sm text-slate-600 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {card.description}
            </p>
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          </div>

          {/* Tips — collapsible */}
          <div>
            <button
              onClick={() => setTipsOpen(o => !o)}
              className="w-full flex items-center justify-between py-2 border-t border-slate-100 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <span>Tips ({card.tips.length})</span>
              {tipsOpen
                ? <ChevronUp   className="w-4 h-4 opacity-70" />
                : <ChevronDown className="w-4 h-4 opacity-70" />}
            </button>
            {tipsOpen && (
              <ol className="mt-2 space-y-1.5 list-decimal list-inside">
                {card.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed">{tip}</li>
                ))}
              </ol>
            )}
          </div>

          {/* Resources — collapsible */}
          <div>
            <button
              onClick={() => setResourcesOpen(o => !o)}
              className="w-full flex items-center justify-between py-2 border-t border-slate-100 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <span>Resources ({card.resources.length})</span>
              {resourcesOpen
                ? <ChevronUp   className="w-4 h-4 opacity-70" />
                : <ChevronDown className="w-4 h-4 opacity-70" />}
            </button>
            {resourcesOpen && (
              <ul className="mt-2 space-y-1.5">
                {card.resources.map((res, i) => (
                  <li key={i}>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {res.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Admin / Teacher action footer */}
      {canEdit && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({
  card,
  onClose,
  onSave,
}: {
  card: PrepCard
  onClose: () => void
  onSave: (updated: PrepCard) => void
}) {
  const [title,       setTitle]       = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [tipsText,    setTipsText]    = useState(card.tips.join("\n"))
  const [resources,   setResources]   = useState<Resource[]>(card.resources.map(r => ({ ...r })))

  function addResource() {
    setResources(prev => [...prev, { title: "", url: "" }])
  }

  function removeResource(idx: number) {
    setResources(prev => prev.filter((_, i) => i !== idx))
  }

  function updateResource(idx: number, field: keyof Resource, value: string) {
    setResources(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function handleSave() {
    onSave({
      ...card,
      title:       title.trim(),
      description: description.trim(),
      tips:        tipsText.split("\n").map(t => t.trim()).filter(Boolean),
      resources:   resources.filter(r => r.title.trim() || r.url.trim()),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Edit Card</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tips */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tips
              <span className="ml-1 font-normal text-slate-400">(one per line)</span>
            </label>
            <textarea
              value={tipsText}
              onChange={e => setTipsText(e.target.value)}
              rows={7}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
            />
          </div>

          {/* Resources */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Resources</label>
            <div className="space-y-2">
              {resources.map((res, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    placeholder="Title"
                    value={res.title}
                    onChange={e => updateResource(i, "title", e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-0"
                  />
                  <input
                    placeholder="URL"
                    value={res.url}
                    onChange={e => updateResource(i, "url", e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-0"
                  />
                  <button
                    onClick={() => removeResource(i)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addResource}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add resource
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page component ────────────────────────────────────────────────────────────

export default function PostCadetPrep({ canEdit }: { canEdit: boolean }) {
  const [cards,       setCards]       = useState<PrepCard[]>(POST_CADET_DATA)
  const [editingCard, setEditingCard] = useState<PrepCard | null>(null)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)

  function handleSave(updated: PrepCard) {
    setCards(cs => cs.map(c => c.id === updated.id ? updated : c))
    setEditingCard(null)
  }

  function handleDelete() {
    setCards(cs => cs.filter(c => c.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Post Cadet College Preparation"
        subtitle={`${cards.length} preparation guide${cards.length !== 1 ? "s" : ""} for life after Cadet College`}
      />

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500 font-medium">No preparation guides available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map(card => (
            <CardView
              key={card.id}
              card={card}
              canEdit={canEdit}
              onEdit={() => setEditingCard(card)}
              onDelete={() => setDeleteId(card.id)}
            />
          ))}
        </div>
      )}

      {editingCard && (
        <EditModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete preparation guide?"
        message="This will remove the card from the list. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
