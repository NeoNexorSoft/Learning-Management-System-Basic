"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, Loader2, Plus, Check } from "lucide-react";
import { DBQuestion } from "@/types/question-paper.types";

interface DBQuestionPickerProps {
  type: "mcq" | "creative";
  subjectCode: string;
  onSelect: (questions: DBQuestion[]) => void;
  onClose: () => void;
}

export default function DBQuestionPicker({
  type,
  subjectCode,
  onSelect,
  onClose,
}: DBQuestionPickerProps) {
  const [query, setQuery] = useState("");
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchQuestions = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type,
        subject: subjectCode,
        search,
      });
      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error("প্রশ্ন লোড করতে সমস্যা হয়েছে");
      const data: DBQuestion[] = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "অজানা ত্রুটি");
    } finally {
      setLoading(false);
    }
  }, [type, subjectCode]);

  // Initial load
  useEffect(() => {
    fetchQuestions("");
    searchRef.current?.focus();
  }, [fetchQuestions]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchQuestions(query), 400);
    return () => clearTimeout(timer);
  }, [query, fetchQuestions]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const chosen = questions.filter((q) => selected.has(q.id));
    onSelect(chosen);
    onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              প্রশ্ন ব্যাংক থেকে বেছে নিন
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {type === "mcq" ? "বহুনির্বাচনী" : "সৃজনশীল"} প্রশ্ন
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="প্রশ্ন খুঁজুন..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">লোড হচ্ছে...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-sm text-red-500 text-center py-6">{error}</div>
          )}

          {!loading && !error && questions.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-6">
              কোনো প্রশ্ন পাওয়া যায়নি
            </div>
          )}

          {!loading &&
            questions.map((q) => {
              const isSelected = selected.has(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggleSelect(q.id)}
                  className={[
                    "w-full text-left p-3 rounded-lg border text-sm transition-all duration-150",
                    isSelected
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={[
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300",
                      ].join(" ")}
                    >
                      {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-gray-700 leading-snug">{q.text}</span>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <span className="text-xs text-gray-500">
            {selected.size} টি বেছে নেওয়া হয়েছে
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              বাতিল
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={14} />
              যোগ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
