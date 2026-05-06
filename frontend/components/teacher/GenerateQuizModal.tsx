"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

type QOption = [string, string, string, string];
type QItem = { id: string; question: string; options: QOption; correctIndex: number };
type Quiz = { id: string; title: string; timer_seconds: number | ""; questions: QItem[] };

interface GenerateQuizModalProps {
    onClose: () => void;
    onGenerated: (quiz: Quiz) => void;
}

const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const LANGUAGES = ["bn", "en", "mixed"] as const;
const TYPES = ["mcq"] as const;

const ANSWER_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

// Maps the flat API question list into our Quiz shape
function buildQuiz(questions: any[], title: string): Quiz {
    const items: QItem[] = questions.map((q) => {
        // options from API can be plain strings or "a) text" prefixed strings
        const rawOptions: string[] = q.options ?? [];
        const cleanedOptions = rawOptions.map((opt: string) =>
            opt.replace(/^[a-d]\)\s*/i, "").trim()
        ) as unknown as QOption;

        // pad to exactly 4 options if API returns fewer
        while (cleanedOptions.length < 4) cleanedOptions.push("");

        const correctIndex = ANSWER_MAP[q.answer?.toLowerCase()] ?? 0;

        return {
            id: crypto.randomUUID(),
            question: q.question_text ?? q.question_text_en ?? "",
            options: cleanedOptions.slice(0, 4) as QOption,
            correctIndex,
        };
    });

    return {
        id: crypto.randomUUID(),
        title,
        timer_seconds: "",
        questions: items,
    };
}

export function GenerateQuizModal({ onClose, onGenerated }: GenerateQuizModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        subject: "",
        topic: "",
        exam: "",
        grade: "",
        type: "mcq",
        difficulty: "medium",
        count: 5,
        language: "mixed",
        focusOnBoardStyle: true,
        additionalNote: "",
    });

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleGenerate() {
        if (!form.subject.trim() || !form.topic.trim()) {
            setError("Subject and topic are required.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const { data } = await api.post(
                "https://neo-lms-ai-production.up.railway.app/api/generator/practice-questions",
                {
                    ...form,
                    count: Number(form.count),
                }
            );

            const questions: any[] = data.data ?? [];

            if (!questions.length) {
                setError("No questions were returned. Try adjusting your inputs.");
                return;
            }

            const quiz = buildQuiz(questions, `${form.topic} — Auto Quiz`);
            onGenerated(quiz);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to generate questions. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        // backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-slate-800">Generate Quiz with AI</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-5 space-y-4">
                    {/* Row: Subject + Topic */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Subject" required>
                            <Input
                                value={form.subject}
                                onChange={(e) => set("subject", e.target.value)}
                                placeholder="e.g. Physics"
                            />
                        </Field>
                        <Field label="Topic" required>
                            <Input
                                value={form.topic}
                                onChange={(e) => set("topic", e.target.value)}
                                placeholder="e.g. Newton's Laws"
                            />
                        </Field>
                    </div>

                    {/* Row: Exam + Grade */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Exam">
                            <Input
                                value={form.exam}
                                onChange={(e) => set("exam", e.target.value)}
                                placeholder="e.g. SSC, HSC"
                            />
                        </Field>
                        <Field label="Grade">
                            <Input
                                value={form.grade}
                                onChange={(e) => set("grade", e.target.value)}
                                placeholder="e.g. 10"
                            />
                        </Field>
                    </div>

                    {/* Row: Difficulty + Language + Count */}
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Difficulty">
                            <select
                                value={form.difficulty}
                                onChange={(e) => set("difficulty", e.target.value)}
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                {DIFFICULTIES.map((d) => (
                                    <option key={d} value={d}>
                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Language">
                            <select
                                value={form.language}
                                onChange={(e) => set("language", e.target.value)}
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                {LANGUAGES.map((l) => (
                                    <option key={l} value={l}>
                                        {l === "bn" ? "Bengali" : l === "en" ? "English" : "Mixed"}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Questions">
                            <Input
                                type="number"
                                min={1}
                                max={20}
                                value={form.count}
                                onChange={(e) => set("count", Number(e.target.value))}
                            />
                        </Field>
                    </div>

                    {/* Additional note */}
                    <Field label="Additional Note">
                        <textarea
                            value={form.additionalNote}
                            onChange={(e) => set("additionalNote", e.target.value)}
                            placeholder="e.g. Focus on numerical problems"
                            rows={2}
                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                    </Field>

                    {/* Board style toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.focusOnBoardStyle}
                            onClick={() => set("focusOnBoardStyle", !form.focusOnBoardStyle)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                form.focusOnBoardStyle ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${
                                    form.focusOnBoardStyle ? "translate-x-4" : "translate-x-1"
                                }`}
                            />
                        </button>
                        <span className="text-sm text-slate-600 font-medium">
                            Focus on board exam style
                        </span>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Generate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({
                   label,
                   required,
                   children,
               }: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}