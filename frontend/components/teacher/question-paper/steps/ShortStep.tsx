"use client";

import { useState } from "react";
import { PenLine, Database, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuid } from "uuid";
import { ShortQuestion, DBQuestion } from "@/types/question-paper.types";
import DBQuestionPicker from "../shared/DBQuestionPicker";
import { ShortAIPanel } from "../ai/AIGeneratePanel";

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

interface ShortStepProps {
    shortQuestions: ShortQuestion[];
    subjectCode: string;
    subjectName: string;     // English subject name for AI payload
    shortFullMarks: number;  // drives AI count: count = fullMarks / 2
    onAdd: () => void;
    onUpdate: (id: string, updates: Partial<ShortQuestion>) => void;
    onRemove: (id: string) => void;
    onAddFromDB: (questions: ShortQuestion[]) => void;
}

// ------------------------------------------------------------------
// Step component
// ------------------------------------------------------------------

export default function ShortStep({
                                      shortQuestions,
                                      subjectCode,
                                      subjectName,
                                      shortFullMarks,
                                      onAdd,
                                      onUpdate,
                                      onRemove,
                                      onAddFromDB,
                                  }: ShortStepProps) {
    // Short: each question = 2 marks, so count = fullMarks / 2
    const aiCount = Math.max(1, Math.round(shortFullMarks / 2));
    const [showDBPicker, setShowDBPicker] = useState(false);

    const handleDBSelect = (dbQuestions: DBQuestion[]) => {
        const converted: ShortQuestion[] = dbQuestions.map((dbQ) => ({
            id: uuid(),
            serial: 0, // recalculated inside the state hook
            text: dbQ.text,
            marks: 2,
            source: "database" as const,
            dbQuestionId: dbQ.id,
        }));
        onAddFromDB(converted);
    };

    return (
        <div className="space-y-4">

            {/* Manual action bar */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onAdd}
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
            </div>

            {/* AI generation panel */}
            <ShortAIPanel
                subject={subjectName}
                count={aiCount}
                onAdd={onAddFromDB}
            />

            {/* Question count badge */}
            {shortQuestions.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-medium text-gray-700">
            {shortQuestions.length} টি সংক্ষিপ্ত প্রশ্ন
          </span>
                    <span>যোগ করা হয়েছে</span>
                </div>
            )}

            {/* Question cards */}
            <div className="space-y-2">
                {shortQuestions.map((q) => (
                    <ShortQuestionCard
                        key={q.id}
                        question={q}
                        onUpdate={(updates) => onUpdate(q.id, updates)}
                        onRemove={() => onRemove(q.id)}
                    />
                ))}
            </div>

            {shortQuestions.length === 0 && (
                <div className="text-center py-10 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    কোনো সংক্ষিপ্ত প্রশ্ন যোগ করা হয়নি
                </div>
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
// Single short question card
// ------------------------------------------------------------------

function ShortQuestionCard({
                               question,
                               onUpdate,
                               onRemove,
                           }: {
    question: ShortQuestion;
    onUpdate: (updates: Partial<ShortQuestion>) => void;
    onRemove: () => void;
}) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-bold text-orange-600 bg-orange-100 rounded px-1.5 py-0.5 shrink-0">
          {question.serial}
        </span>

                {question.source === "database" && (
                    <span className="text-xs text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5 shrink-0">
            DB
          </span>
                )}

                <span className="text-xs text-gray-600 truncate flex-1">
          {question.text.slice(0, 60) || "নতুন সংক্ষিপ্ত প্রশ্ন"}
                    {question.text.length > 60 && "..."}
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
              placeholder="সংক্ষিপ্ত প্রশ্নের টেক্সট লিখুন..."
              rows={2}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none placeholder:text-gray-300"
          />
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">নম্বর:</span>
                        <input
                            type="number"
                            value={question.marks}
                            onChange={(e) =>
                                onUpdate({ marks: parseInt(e.target.value) || 2 })
                            }
                            min={1}
                            max={10}
                            className="w-16 rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}