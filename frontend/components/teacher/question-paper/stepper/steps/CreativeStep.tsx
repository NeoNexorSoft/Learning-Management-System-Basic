"use client";

import { useState } from "react";
import { Plus, Trash2, Database, PenLine, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuid } from "uuid";
import {
    CreativeQuestion,
    CreativeSubQuestion,
    CREATIVE_LABELS,
    DBQuestion,
} from "@/types/question-paper.types";
import {QuestionPaperActions} from "@/hooks/useQuestionPaperState";
import DBQuestionPicker from "@/components/teacher/question-paper/shared/DBQuestionPicker";

interface CreativeStepProps {
    creativeQuestions: CreativeQuestion[];
    subjectCode: string;
    actions: Pick<
        QuestionPaperActions,
        | "addCreativeQuestion"
        | "updateCreativeQuestion"
        | "updateCreativeSubQuestion"
        | "removeCreativeQuestion"
        | "addDBCreativeQuestions"
    >;
}

export default function CreativeStep({
                                         creativeQuestions,
                                         subjectCode,
                                         actions,
                                     }: CreativeStepProps) {
    const [showDBPicker, setShowDBPicker] = useState(false);

    const handleDBSelect = (dbQuestions: DBQuestion[]) => {
        const converted: CreativeQuestion[] = dbQuestions.map((dbQ) => ({
            id: uuid(),
            serial: 0,
            stimulus: dbQ.text,
            subQuestions: (dbQ.subQuestions ?? []).map((sq) => ({
                label: sq.label as CreativeSubQuestion["label"],
                text: sq.text,
                marks: sq.marks as 1 | 2 | 3 | 4,
            })),
            source: "database" as const,
            dbQuestionId: dbQ.id,
        }));
        actions.addDBCreativeQuestions(converted);
    };

    return (
        <div className="space-y-4">
            {/* Action bar */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={actions.addCreativeQuestion}
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

            {/* Summary */}
            {creativeQuestions.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-medium text-gray-700">
            {creativeQuestions.length} টি সৃজনশীল প্রশ্ন
          </span>
                    <span>যোগ করা হয়েছে</span>
                </div>
            )}

            {/* Question list */}
            <div className="space-y-3">
                {creativeQuestions.map((q) => (
                    <CreativeQuestionCard
                        key={q.id}
                        question={q}
                        onUpdate={(updates) => actions.updateCreativeQuestion(q.id, updates)}
                        onUpdateSubQuestion={(label, text) =>
                            actions.updateCreativeSubQuestion(q.id, label, text)
                        }
                        onRemove={() => actions.removeCreativeQuestion(q.id)}
                    />
                ))}
            </div>

            {creativeQuestions.length === 0 && (
                <div className="text-center py-10 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    কোনো সৃজনশীল প্রশ্ন যোগ করা হয়নি
                </div>
            )}

            {showDBPicker && (
                <DBQuestionPicker
                    type="creative"
                    subjectCode={subjectCode}
                    onSelect={handleDBSelect}
                    onClose={() => setShowDBPicker(false)}
                />
            )}
        </div>
    );
}

// ------------------------------------------------------------------
// Single creative question card
// ------------------------------------------------------------------

const SUB_MARKS: Record<CreativeSubQuestion["label"], 1 | 2 | 3 | 4> = {
    ka: 1,
    kha: 2,
    ga: 3,
    gha: 4,
};

interface CreativeQuestionCardProps {
    question: CreativeQuestion;
    onUpdate: (updates: Partial<CreativeQuestion>) => void;
    onUpdateSubQuestion: (label: CreativeSubQuestion["label"], text: string) => void;
    onRemove: () => void;
}

function CreativeQuestionCard({
                                  question,
                                  onUpdate,
                                  onUpdateSubQuestion,
                                  onRemove,
                              }: CreativeQuestionCardProps) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-bold text-purple-600 bg-purple-100 rounded px-1.5 py-0.5 shrink-0">
          {question.serial}
        </span>

                {question.source === "database" && (
                    <span className="text-xs text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5 shrink-0">
            DB
          </span>
                )}

                <span className="text-xs text-gray-600 truncate flex-1">
          {question.stimulus.slice(0, 60) || "নতুন সৃজনশীল প্রশ্ন"}
                    {question.stimulus.length > 60 && "..."}
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

            {/* Card body */}
            {expanded && (
                <div className="p-3 space-y-3">
                    {/* Stimulus */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            উদ্দীপক (stimulus)
                        </label>
                        <textarea
                            value={question.stimulus}
                            onChange={(e) => onUpdate({ stimulus: e.target.value })}
                            placeholder="উদ্দীপকের টেক্সট লিখুন..."
                            rows={3}
                            className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none placeholder:text-gray-300"
                        />
                    </div>

                    {/* Sub-questions ক খ গ ঘ */}
                    <div className="space-y-2">
                        {question.subQuestions.map((sq) => (
                            <div key={sq.label} className="flex items-start gap-2">
                                {/* Label + marks badge */}
                                <div className="flex items-center gap-1 shrink-0 mt-2">
                  <span className="text-sm font-bold text-gray-700 w-4">
                    {CREATIVE_LABELS[sq.label]}.
                  </span>
                                    <span className="text-xs font-bold text-white bg-gray-400 rounded px-1 py-0.5 leading-none">
                    {sq.marks}
                  </span>
                                </div>
                                <input
                                    type="text"
                                    value={sq.text}
                                    onChange={(e) => onUpdateSubQuestion(sq.label, e.target.value)}
                                    placeholder={`${CREATIVE_LABELS[sq.label]} অংশের প্রশ্ন...`}
                                    className="flex-1 rounded border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}