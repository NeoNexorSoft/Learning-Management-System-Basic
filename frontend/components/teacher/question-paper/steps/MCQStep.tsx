"use client";

import { useState } from "react";
import { Plus, Trash2, Database, PenLine, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuid } from "uuid";
import {
  MCQQuestion,
  MCQSection,
  MCQ_OPTION_LABELS,
  DBQuestion,
} from "@/types/question-paper.types";
import DBQuestionPicker from "../shared/DBQuestionPicker";
import { QuestionPaperActions } from "@/hooks/useQuestionPaperState";
import { MCQAIPanel } from "../ai/AIGeneratePanel";

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

interface MCQStepProps {
  mcqSection: MCQSection;
  subjectCode: string;
  subjectName: string;    // English subject name for AI payload e.g. "Physics"
  mcqFullMarks: number;   // drives AI question count
  actions: Pick<
    QuestionPaperActions,
    | "addMCQQuestion"
    | "updateMCQQuestion"
    | "updateMCQOption"
    | "removeMCQQuestion"
    | "addDBMCQQuestions"
    | "addPassage"
    | "updatePassage"
    | "removePassage"
    | "assignQuestionToPassage"
  >;
}

// ------------------------------------------------------------------
// Step component
// ------------------------------------------------------------------

export default function MCQStep({
  mcqSection,
  subjectCode,
  subjectName,
  mcqFullMarks,
  actions,
}: MCQStepProps) {
  // MCQ: 1 mark per question, so count = full marks
  const aiCount = Math.max(1, mcqFullMarks);
  const [showDBPicker, setShowDBPicker] = useState(false);

  const handleDBSelect = (dbQuestions: DBQuestion[]) => {
    const converted: MCQQuestion[] = dbQuestions.map((dbQ) => ({
      id: uuid(),
      serial: 0,
      text: dbQ.text,
      options: (
        dbQ.options ?? [
          { label: "ক", text: "" },
          { label: "খ", text: "" },
          { label: "গ", text: "" },
          { label: "ঘ", text: "" },
        ]
      ).map((o, i) => ({
        id: MCQ_OPTION_LABELS[i]?.id ?? uuid(),
        label: MCQ_OPTION_LABELS[i]?.label ?? o.label,
        text: o.text,
      })),
      correctOption: dbQ.correctOption ?? "ka",
      source: "database" as const,
      dbQuestionId: dbQ.id,
    }));
    actions.addDBMCQQuestions(converted);
  };

  return (
    <div className="space-y-4">

      {/* Manual action bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={actions.addMCQQuestion}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PenLine size={14} />
          নিজে লিখুন
        </button>

        <button
          type="button"
          onClick={() => setShowDBPicker(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Database size={14} />
          প্রশ্ন ব্যাংক
        </button>

        <button
          type="button"
          onClick={actions.addPassage}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          উদ্দীপক যোগ করুন
        </button>
      </div>

      {/* AI generation panel */}
      <MCQAIPanel
        subject={subjectName}
        count={aiCount}
        onAdd={(questions) => actions.addDBMCQQuestions(questions)}
      />

      {/* Passage blocks */}
      {mcqSection.passages.map((passage, pi) => (
        <div
          key={passage.id}
          className="border border-amber-200 rounded-lg bg-amber-50 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">
              উদ্দীপক {pi + 1}
            </span>
            <button
              type="button"
              onClick={() => actions.removePassage(passage.id)}
              className="text-amber-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <textarea
            value={passage.text}
            onChange={(e) => actions.updatePassage(passage.id, e.target.value)}
            placeholder="উদ্দীপকের টেক্সট লিখুন..."
            rows={3}
            className="w-full text-sm border border-amber-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white resize-none"
          />
        </div>
      ))}

      {/* Question count badge */}
      {mcqSection.questions.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-medium text-gray-700">
            {mcqSection.questions.length} টি MCQ
          </span>
          <span>যোগ করা হয়েছে</span>
        </div>
      )}

      {/* Question cards */}
      <div className="space-y-3">
        {mcqSection.questions.map((q) => (
          <MCQQuestionCard
            key={q.id}
            question={q}
            passages={mcqSection.passages}
            onUpdate={(updates) => actions.updateMCQQuestion(q.id, updates)}
            onUpdateOption={(optId, text) =>
              actions.updateMCQOption(q.id, optId, text)
            }
            onRemove={() => actions.removeMCQQuestion(q.id)}
            onAssignPassage={(passageId) =>
              actions.assignQuestionToPassage(q.id, passageId)
            }
          />
        ))}
      </div>

      {mcqSection.questions.length === 0 && (
        <EmptyState message="কোনো MCQ প্রশ্ন যোগ করা হয়নি" />
      )}

      {showDBPicker && (
        <DBQuestionPicker
          type="mcq"
          subjectCode={subjectCode}
          onSelect={handleDBSelect}
          onClose={() => setShowDBPicker(false)}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Single MCQ question card
// ------------------------------------------------------------------

interface MCQQuestionCardProps {
  question: MCQQuestion;
  passages: MCQSection["passages"];
  onUpdate: (updates: Partial<MCQQuestion>) => void;
  onUpdateOption: (optionId: string, text: string) => void;
  onRemove: () => void;
  onAssignPassage: (passageId: string | undefined) => void;
}

function MCQQuestionCard({
  question,
  passages,
  onUpdate,
  onUpdateOption,
  onRemove,
  onAssignPassage,
}: MCQQuestionCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-bold text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 shrink-0">
          {question.serial}
        </span>

        {question.source === "database" && (
          <span className="text-xs text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5 shrink-0">
            DB
          </span>
        )}

        <span className="text-xs text-gray-600 truncate flex-1">
          {question.text || "নতুন প্রশ্ন"}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-3 space-y-3">
          <textarea
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="প্রশ্নের টেক্সট লিখুন..."
            rows={2}
            className={textareaClass}
          />

          <div className="grid grid-cols-2 gap-2">
            {question.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-500 w-4 shrink-0">
                  {opt.label}.
                </span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => onUpdateOption(opt.id, e.target.value)}
                  placeholder={`অপশন ${opt.label}`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">সঠিক উত্তর:</span>
              <div className="flex gap-1">
                {MCQ_OPTION_LABELS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => onUpdate({ correctOption: o.id })}
                    className={[
                      "w-7 h-7 text-xs font-bold rounded-full border transition-all",
                      question.correctOption === o.id
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-400",
                    ].join(" ")}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {passages.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">উদ্দীপক:</span>
                <select
                  value={question.passageId ?? ""}
                  onChange={(e) =>
                    onAssignPassage(e.target.value || undefined)
                  }
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                >
                  <option value="">নেই</option>
                  {passages.map((p, i) => (
                    <option key={p.id} value={p.id}>
                      উদ্দীপক {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
      {message}
    </div>
  );
}

const inputClass =
  "flex-1 min-w-0 rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300";

const textareaClass =
  "w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none placeholder:text-gray-300";
