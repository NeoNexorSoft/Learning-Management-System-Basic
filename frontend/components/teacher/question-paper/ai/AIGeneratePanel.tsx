"use client";

import { useCallback, useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
  Check,
  BookOpen,
  X,
} from "lucide-react";
import {
  AIDifficulty,
  AIExam,
  AIGenerateParams,
  AIQuestionType,
  GeneratedCreative,
  GeneratedMCQ,
  GeneratedShort,
  useAIGenerate,
} from "@/hooks/useAIGenerate";
import {
  CREATIVE_LABELS,
  CreativeQuestion,
  MCQQuestion,
  ShortQuestion,
} from "@/types/question-paper.types";

// ------------------------------------------------------------------
// Shared config
// ------------------------------------------------------------------

const DIFFICULTY_OPTIONS: { value: AIDifficulty; label: string }[] = [
  { value: "easy", label: "সহজ" },
  { value: "medium", label: "মধ্যম" },
  { value: "hard", label: "কঠিন" },
];

const EXAM_OPTIONS: { value: AIExam; label: string }[] = [
  { value: "SSC", label: "SSC" },
  { value: "HSC", label: "HSC" },
  { value: "JSC", label: "JSC" },
  { value: "PSC", label: "PSC" },
  { value: "Other", label: "অন্যান্য" },
];

// ------------------------------------------------------------------
// Shared form state shape
// ------------------------------------------------------------------
interface FormState {
  topic: string;
  subtopic: string;
  difficulty: AIDifficulty;
  exam: AIExam;
}

const defaultForm: FormState = {
  topic: "",
  subtopic: "",
  difficulty: "easy",
  exam: "SSC",
};

// ------------------------------------------------------------------
// MCQ Panel
// ------------------------------------------------------------------

interface MCQAIPanelProps {
  subject: string;
  count: number; // how many to generate (from mcqFullMarks)
  onAdd: (questions: MCQQuestion[]) => void;
}

export function MCQAIPanel({ subject, count, onAdd }: MCQAIPanelProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const ai = useAIGenerate();

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    const params: AIGenerateParams = {
      subject,
      topic: form.topic,
      subtopic: form.subtopic,
      difficulty: form.difficulty,
      type: "mcq",
      exam: form.exam,
      count,
    };
    setSelected(new Set());
    await ai.generate(params);
    // Auto-select all after generation
    // We do this after the state updates via useEffect-like trick
  };

  const handleAddSelected = () => {
    const toAdd = ai.generatedMCQs.filter((q) => selected.has(q.id));
    onAdd(toAdd);
    ai.clearResults();
    setSelected(new Set());
    setOpen(false);
  };

  const selectAll = () =>
    setSelected(new Set(ai.generatedMCQs.map((q) => q.id)));
  const clearSelection = () => setSelected(new Set());

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <AIPanel
      open={open}
      onToggle={() => setOpen((v) => !v)}
      label="AI দিয়ে MCQ তৈরি করুন"
    >
      <GenerateForm
        form={form}
        onChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
        onGenerate={handleGenerate}
        loading={ai.loading}
        topicRequired
      />

      {ai.error && <ErrorBox message={ai.error} />}

      {ai.generatedMCQs.length > 0 && (
        <>
          <SelectionBar
            total={ai.generatedMCQs.length}
            selected={selected.size}
            onSelectAll={selectAll}
            onClear={clearSelection}
            onRegenerate={handleGenerate}
            loading={ai.loading}
          />

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {ai.generatedMCQs.map((q) => (
              <MCQGeneratedCard
                key={q.id}
                question={q}
                selected={selected.has(q.id)}
                onToggle={() => toggleSelect(q.id)}
                onUpdate={(updated) => {
                  // Allow inline edit — we mutate the generated list
                  ai.generatedMCQs.splice(
                    ai.generatedMCQs.findIndex((x) => x.id === q.id),
                    1,
                    updated
                  );
                }}
              />
            ))}
          </div>

          <AddButton
            count={selected.size}
            onClick={handleAddSelected}
            disabled={selected.size === 0}
          />
        </>
      )}
    </AIPanel>
  );
}

// ------------------------------------------------------------------
// Short Panel
// ------------------------------------------------------------------

interface ShortAIPanelProps {
  subject: string;
  count: number;
  onAdd: (questions: ShortQuestion[]) => void;
}

export function ShortAIPanel({ subject, count, onAdd }: ShortAIPanelProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const ai = useAIGenerate();

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setSelected(new Set());
    await ai.generate({
      subject,
      topic: form.topic,
      subtopic: form.subtopic,
      difficulty: form.difficulty,
      type: "short",
      exam: form.exam,
      count,
    });
  };

  const handleAddSelected = () => {
    const toAdd = ai.generatedShorts.filter((q) => selected.has(q.id));
    onAdd(toAdd);
    ai.clearResults();
    setSelected(new Set());
    setOpen(false);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <AIPanel
      open={open}
      onToggle={() => setOpen((v) => !v)}
      label="AI দিয়ে সংক্ষিপ্ত প্রশ্ন তৈরি করুন"
    >
      <GenerateForm
        form={form}
        onChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
        onGenerate={handleGenerate}
        loading={ai.loading}
        topicRequired
      />

      {ai.error && <ErrorBox message={ai.error} />}

      {ai.generatedShorts.length > 0 && (
        <>
          <SelectionBar
            total={ai.generatedShorts.length}
            selected={selected.size}
            onSelectAll={() =>
              setSelected(new Set(ai.generatedShorts.map((q) => q.id)))
            }
            onClear={() => setSelected(new Set())}
            onRegenerate={handleGenerate}
            loading={ai.loading}
          />

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {ai.generatedShorts.map((q) => (
              <ShortGeneratedCard
                key={q.id}
                question={q}
                selected={selected.has(q.id)}
                onToggle={() => toggleSelect(q.id)}
              />
            ))}
          </div>

          <AddButton
            count={selected.size}
            onClick={handleAddSelected}
            disabled={selected.size === 0}
          />
        </>
      )}
    </AIPanel>
  );
}

// ------------------------------------------------------------------
// Creative Panel
// ------------------------------------------------------------------

interface CreativeAIPanelProps {
  subject: string;
  count: number;
  onAdd: (questions: CreativeQuestion[]) => void;
}

export function CreativeAIPanel({
  subject,
  count,
  onAdd,
}: CreativeAIPanelProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const ai = useAIGenerate();

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setSelected(new Set());
    await ai.generate({
      subject,
      topic: form.topic,
      subtopic: form.subtopic,
      difficulty: form.difficulty,
      type: "creative",
      exam: form.exam,
      count,
    });
  };

  const handleAddSelected = () => {
    const toAdd = ai.generatedCreatives.filter((q) => selected.has(q.id));
    onAdd(toAdd);
    ai.clearResults();
    setSelected(new Set());
    setOpen(false);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <AIPanel
      open={open}
      onToggle={() => setOpen((v) => !v)}
      label="AI দিয়ে সৃজনশীল প্রশ্ন তৈরি করুন"
    >
      <GenerateForm
        form={form}
        onChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
        onGenerate={handleGenerate}
        loading={ai.loading}
        topicRequired
      />

      {ai.error && <ErrorBox message={ai.error} />}

      {ai.generatedCreatives.length > 0 && (
        <>
          <SelectionBar
            total={ai.generatedCreatives.length}
            selected={selected.size}
            onSelectAll={() =>
              setSelected(new Set(ai.generatedCreatives.map((q) => q.id)))
            }
            onClear={() => setSelected(new Set())}
            onRegenerate={handleGenerate}
            loading={ai.loading}
          />

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {ai.generatedCreatives.map((q) => (
              <CreativeGeneratedCard
                key={q.id}
                question={q}
                selected={selected.has(q.id)}
                onToggle={() => toggleSelect(q.id)}
              />
            ))}
          </div>

          <AddButton
            count={selected.size}
            onClick={handleAddSelected}
            disabled={selected.size === 0}
          />
        </>
      )}
    </AIPanel>
  );
}

// ------------------------------------------------------------------
// Shared sub-components
// ------------------------------------------------------------------

// Collapsible wrapper
function AIPanel({
  open,
  onToggle,
  label,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-violet-200 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-violet-800">{label}</span>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-violet-500" />
        ) : (
          <ChevronDown size={15} className="text-violet-500" />
        )}
      </button>

      {/* Panel body */}
      {open && (
        <div className="p-4 space-y-4 bg-white border-t border-violet-100">
          {children}
        </div>
      )}
    </div>
  );
}

// Generate form
function GenerateForm({
  form,
  onChange,
  onGenerate,
  loading,
  topicRequired,
}: {
  form: FormState;
  onChange: (updates: Partial<FormState>) => void;
  onGenerate: () => void;
  loading: boolean;
  topicRequired: boolean;
}) {
  const canGenerate = !loading && (!topicRequired || form.topic.trim() !== "");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            টপিক <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder="যেমন: Motion"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            সাব-টপিক
          </label>
          <input
            type="text"
            value={form.subtopic}
            onChange={(e) => onChange({ subtopic: e.target.value })}
            placeholder="যেমন: Velocity"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Difficulty */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            কঠিনতা
          </label>
          <div className="flex gap-1">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ difficulty: opt.value })}
                className={[
                  "flex-1 py-1.5 text-xs font-medium rounded border transition-all",
                  form.difficulty === opt.value
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exam */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            পরীক্ষা
          </label>
          <select
            value={form.exam}
            onChange={(e) => onChange({ exam: e.target.value as AIExam })}
            className={inputClass}
          >
            {EXAM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            AI প্রশ্ন তৈরি হচ্ছে...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            প্রশ্ন তৈরি করুন
          </>
        )}
      </button>
    </div>
  );
}

// Selection action bar
function SelectionBar({
  total,
  selected,
  onSelectAll,
  onClear,
  onRegenerate,
  loading,
}: {
  total: number;
  selected: number;
  onSelectAll: () => void;
  onClear: () => void;
  onRegenerate: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-3 text-gray-500">
        <span>
          <span className="font-semibold text-gray-700">{total}</span> টি প্রশ্ন তৈরি হয়েছে
        </span>
        <button
          type="button"
          onClick={selected === total ? onClear : onSelectAll}
          className="text-violet-600 hover:text-violet-800 font-medium transition-colors"
        >
          {selected === total ? "সব বাদ দিন" : "সব বেছে নিন"}
        </button>
      </div>

      <button
        type="button"
        onClick={onRegenerate}
        disabled={loading}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
      >
        <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        আবার তৈরি করুন
      </button>
    </div>
  );
}

// Add to paper button
function AddButton({
  count,
  onClick,
  disabled,
}: {
  count: number;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <Plus size={15} />
      {count > 0 ? `${count} টি প্রশ্ন যোগ করুন` : "প্রশ্ন বেছে নিন"}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
      <AlertCircle size={15} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ------------------------------------------------------------------
// Generated question cards (editable before adding)
// ------------------------------------------------------------------

function SelectCheckbox({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
        selected
          ? "bg-violet-600 border-violet-600"
          : "border-gray-300 hover:border-violet-400",
      ].join(" ")}
    >
      {selected && <Check size={11} className="text-white" strokeWidth={3} />}
    </button>
  );
}

function MCQGeneratedCard({
  question,
  selected,
  onToggle,
  onUpdate,
}: {
  question: GeneratedMCQ;
  selected: boolean;
  onToggle: () => void;
  onUpdate: (updated: GeneratedMCQ) => void;
}) {
  return (
    <div
      className={[
        "border rounded-lg p-3 space-y-2 transition-all",
        selected ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <SelectCheckbox selected={selected} onToggle={onToggle} />
        <textarea
          value={question.text}
          onChange={(e) =>
            onUpdate({ ...question, text: e.target.value })
          }
          rows={2}
          className="flex-1 text-sm text-gray-800 bg-transparent border-none outline-none resize-none leading-snug"
        />
      </div>

      {/* Options — editable */}
      <div className="grid grid-cols-2 gap-1.5 pl-7">
        {question.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-500 w-3">{opt.label}.</span>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => {
                const newOptions = question.options.map((o, oi) =>
                  oi === i ? { ...o, text: e.target.value } : o
                );
                onUpdate({ ...question, options: newOptions });
              }}
              className="flex-1 text-xs border-b border-gray-200 focus:border-violet-400 outline-none bg-transparent py-0.5"
            />
          </div>
        ))}
      </div>

      {/* Explanation (read-only, collapsible) */}
      {question.explanation && (
        <ExplanationRow text={question.explanation} />
      )}
    </div>
  );
}

function ShortGeneratedCard({
  question,
  selected,
  onToggle,
}: {
  question: GeneratedShort;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={[
        "border rounded-lg p-3 transition-all",
        selected ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <SelectCheckbox selected={selected} onToggle={onToggle} />
        <div className="flex-1 space-y-1.5">
          <p className="text-sm text-gray-800 leading-snug">{question.text}</p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">নম্বর:</span>
            <span className="text-xs font-bold text-gray-600">{question.marks}</span>
          </div>
          {question.explanation && (
            <ExplanationRow text={question.explanation} />
          )}
        </div>
      </div>
    </div>
  );
}

function CreativeGeneratedCard({
  question,
  selected,
  onToggle,
}: {
  question: GeneratedCreative;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={[
        "border rounded-lg p-3 space-y-2 transition-all",
        selected ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <SelectCheckbox selected={selected} onToggle={onToggle} />
        <div className="flex-1 space-y-2">
          {/* Stimulus */}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              উদ্দীপক
            </span>
            <p className="text-sm text-gray-800 leading-snug mt-0.5">
              {question.stimulus || (
                <span className="italic text-gray-400">উদ্দীপক পাওয়া যায়নি</span>
              )}
            </p>
          </div>

          {/* Sub-questions */}
          <div className="space-y-1 pl-1">
            {question.subQuestions.map((sq) => (
              <div key={sq.label} className="flex items-start gap-1.5 text-sm">
                <span className="font-bold text-gray-600 shrink-0 w-4">
                  {CREATIVE_LABELS[sq.label]}.
                </span>
                <span className="text-gray-700 leading-snug">
                  {sq.text || (
                    <span className="italic text-gray-300">—</span>
                  )}
                </span>
                <span className="ml-auto font-bold text-gray-500 shrink-0 text-xs">
                  {sq.marks}
                </span>
              </div>
            ))}
          </div>

          {question.explanation && (
            <ExplanationRow text={question.explanation} />
          )}
        </div>
      </div>
    </div>
  );
}

// Collapsible explanation row
function ExplanationRow({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 transition-colors"
      >
        <BookOpen size={11} />
        {show ? "ব্যাখ্যা লুকান" : "ব্যাখ্যা দেখুন"}
      </button>
      {show && (
        <p className="mt-1 text-xs text-gray-500 leading-relaxed bg-violet-50 rounded p-2">
          {text}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all placeholder:text-gray-300 bg-white";
