"use client"
import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp, Lock } from "lucide-react"

export default function QuizPreview({
  quiz,
  accessLevel = "full",
}: {
  quiz: any
  accessLevel?: "full" | "locked"
}) {
  const [open, setOpen] = useState(false)

  if (accessLevel === "locked") {
    const questionCount = quiz._count?.questions ?? quiz.questions?.length ?? 0
    return (
      <div className="flex items-center gap-3 px-4 py-3 mt-1 bg-amber-50 border border-amber-100 rounded-xl">
        <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-amber-700">{quiz.title}</p>
          <p className="text-[10px] text-amber-500">
            {questionCount} question{questionCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Lock className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
      </div>
    )
  }

  const total = quiz.questions?.length ?? 0

  return (
    <div className="mt-2 border border-amber-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-800">{quiz.title}</span>
          <p className="text-[10px] text-amber-600">
            {total} question{total !== 1 ? "s" : ""}
          </p>
        </div>
        {open
          ? <ChevronUp   className="w-3.5 h-3.5 text-amber-500" />
          : <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
        }
      </button>

      {open && (
        <div className="divide-y divide-amber-100">
          {(quiz.questions ?? []).map((q: any, qi: number) => (
            <div key={q.id ?? qi} className="p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                Q{qi + 1} of {total}. {q.question}
              </p>

              {(q.type === "MCQ" || q.type === "IMAGE_MCQ") && (
                <div className="space-y-1.5">
                  {(q.options ?? []).map((opt: string, oi: number) => (
                    <div key={oi} className={`px-3 py-2 rounded-lg text-xs border ${
                      opt === q.correct_answer
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>{opt === q.correct_answer ? "✓ " : ""}{opt}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "TRUE_FALSE" && (
                <div className="flex gap-2">
                  {["True", "False"].map(opt => (
                    <div key={opt} className={`flex-1 text-center px-3 py-2 rounded-lg text-xs border font-semibold ${
                      opt === q.correct_answer
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                      {opt === q.correct_answer ? "✓ " : ""}{opt}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "FILL_BLANK" && (
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-700">Answer: {q.correct_answer}</p>
                </div>
              )}

              {q.explanation && (
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-[10px] font-bold text-blue-700 mb-0.5">Explanation</p>
                  <p className="text-xs text-blue-800">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
