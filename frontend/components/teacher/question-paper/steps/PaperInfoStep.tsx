"use client";


import {ExamType, PaperInfo} from "@/types/question-paper.types";
import {Check} from "lucide-react";
import {useState, useEffect} from "react";

interface PaperInfoStepProps {
  info: PaperInfo;
  onUpdate: (updates: Partial<PaperInfo>) => void;
  onExamTypeChange: (type: ExamType) => void;
}

export default function PaperInfoStep({
  info,
  onUpdate,
  onExamTypeChange,
}: PaperInfoStepProps) {
    const [isFullbook, setIsFullbook] = useState<boolean>(info.chapter === "ALL")
    const [totalMarks, setTotalMarks] = useState<number>(0)

    useEffect(() => {
        if (isFullbook) {
            onUpdate({ chapter: "ALL", topic: "ALL" })
        }
    }, [isFullbook]);

    const toggleFullbook = () => {
        setIsFullbook(!isFullbook)
        if (!isFullbook) onUpdate({ chapter: "ALL", topic: "ALL" })
        if (isFullbook) onUpdate({ chapter: "", topic: "" })
    }
  return (
    <div className="space-y-5">
      <SectionHeading title="পরীক্ষার ধরন" />

      {/* Exam type selector */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
              { value: "mcq", label: "শুধু MCQ", sub: "বহুনির্বাচনী" },
              { value: "short", label: "শুধু সংক্ষিপ্ত", sub: "সংক্ষিপ্ত-উত্তর" },
              { value: "creative", label: "শুধু সৃজনশীল", sub: "তত্ত্বীয়" },
              { value: "mcq_creative", label: "MCQ + সৃজনশীল", sub: "দুটো একসাথে" },
              { value: "short_creative", label: "সংক্ষিপ্ত + সৃজনশীল", sub: "দুটো একসাথে" },
              { value: "mcq_short_creative", label: "তিনটিই", sub: "MCQ + সংক্ষিপ্ত + সৃজনশীল" },
          ] as { value: ExamType; label: string; sub: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onExamTypeChange(opt.value)}
            className={[
              "flex flex-col items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all duration-150",
              info.examType === opt.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300",
            ].join(" ")}
          >
            <span className="font-semibold">{opt.label}</span>
            <span className="text-xs text-gray-400 mt-0.5">{opt.sub}</span>
          </button>
        ))}
      </div>

      <Divider />

      <SectionHeading title="বিষয় ও বোর্ড" />

      <div className="grid grid-cols-2 gap-3">
        <FormField label="বিষয়ের নাম (ইংরেজি)">
          <input
            type="text"
            value={info.subjectName}
            onChange={(e) => onUpdate({ subjectName: e.target.value })}
            placeholder="Physics"
            className={inputClass}
          />
        </FormField>

        <FormField label="বিষয়ের নাম (বাংলা)">
          <input
            type="text"
            value={info.subjectNameBn}
            onChange={(e) => onUpdate({ subjectNameBn: e.target.value })}
            placeholder="পদার্থবিজ্ঞান"
            className={inputClass}
          />
        </FormField>

        <FormField label="বোর্ডের নাম">
          <input
            type="text"
            value={info.boardName}
            onChange={(e) => onUpdate({ boardName: e.target.value })}
            placeholder="ঢাকা বোর্ড"
            className={inputClass}
          />
        </FormField>

        <FormField label="বিষয় কোড">
          <input
            type="text"
            value={info.subjectCode}
            onChange={(e) => onUpdate({ subjectCode: e.target.value })}
            placeholder="136"
            maxLength={4}
            className={inputClass}
          />
        </FormField>

        <FormField label="সাল">
          <input
            type="text"
            value={info.year}
            onChange={(e) => onUpdate({ year: e.target.value })}
            placeholder="2025"
            maxLength={4}
            className={inputClass}
          />
        </FormField>
      </div>

      {/*  বিষয়বস্তু নির্ধারণ  */}
      <Divider />

      <SectionHeading title="বিষয়বস্তু নির্ধারণ" />

      <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 cursor-pointer group col-span-2 bg-indigo-50 p-2 rounded-md">
              <div className="relative flex items-center">
                  <input
                      type="checkbox"
                      checked={isFullbook}
                      onChange={toggleFullbook}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-xs border border-slate-300 transition-all checked:bg-indigo-600 checked:border-indigo-600"
                  />
                  <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">সম্পূর্ণ বই হতে প্রশ্ন চাই</span>
          </label>

          {!isFullbook && (
              <>
                  <FormField label="অধ্যায়">
                      <input
                          type="text"
                          value={info.chapter}
                          onChange={(e) => onUpdate({ chapter: e.target.value })}
                          placeholder="গতি"
                          className={inputClass}
                      />
                  </FormField>

                  <FormField label="প্রসঙ্গ">
                      <input
                          type="text"
                          value={info.topic}
                          onChange={(e) => onUpdate({ topic: e.target.value })}
                          placeholder="বৃত্তাকার গতি"
                          className={inputClass}
                      />
                  </FormField>
              </>
          )}
      </div>

      {/* MCQ settings */}
      {["mcq", "mcq_short_creative", "mcq_creative"].includes(info.examType) && (
        <>
          <Divider />
          <SectionHeading title="MCQ সেটিং" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="সময়">
              <input
                type="text"
                value={info.mcqTime}
                onChange={(e) => onUpdate({ mcqTime: e.target.value })}
                placeholder="২৫ মিনিট"
                className={inputClass}
              />
            </FormField>
            <FormField label="পূর্ণমান">
              <input
                type="number"
                value={info.mcqFullMarks}
                onChange={(e) =>
                  onUpdate({ mcqFullMarks: parseInt(e.target.value) || 0 })
                }
                min={0}
                className={inputClass}
              />
            </FormField>
            <FormField label="বিশেষ নির্দেশনা" className="col-span-2">
              <textarea
                value={info.mcqInstruction}
                onChange={(e) => onUpdate({ mcqInstruction: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </FormField>
          </div>
        </>
      )}

      {/* Short settings */}
      {["short", "mcq_short_creative", "short_creative"].includes(info.examType) && (
        <>
            <Divider />
            <SectionHeading title="সংক্ষিপ্ত সেটিং" />
            <div className="grid grid-cols-2 gap-3">
                <FormField label="সময়">
                    <input type="text" value={info.shortTime} onChange={(e) => onUpdate({ shortTime: e.target.value })} placeholder="৩০ মিনিট" className={inputClass} />
                </FormField>
                <FormField label="পূর্ণমান">
                    <input type="number" value={info.shortFullMarks} onChange={(e) => onUpdate({ shortFullMarks: parseInt(e.target.value) || 0 })} className={inputClass} />
                </FormField>
                <FormField label="উত্তর দিতে হবে (কতটি)">
                    <input type="number" value={info.shortAnswerCount} onChange={(e) => onUpdate({ shortAnswerCount: parseInt(e.target.value) || 5 })} min={1} className={inputClass} />
                </FormField>
                <FormField label="নির্দেশনা" className="col-span-2">
                    <textarea value={info.shortInstruction} onChange={(e) => onUpdate({ shortInstruction: e.target.value })} rows={2} className={inputClass} />
                </FormField>
            </div>
        </>
      )}

      {/* Creative settings */}
      {["creative", "mcq_short_creative", "short_creative", "mcq_creative"].includes(info.examType) && (
        <>
          <Divider />
          <SectionHeading title="সৃজনশীল সেটিং" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="সময়">
              <input
                type="text"
                value={info.creativeTime}
                onChange={(e) => onUpdate({ creativeTime: e.target.value })}
                placeholder="২ ঘণ্টা ৩৫ মিনিট"
                className={inputClass}
              />
            </FormField>
            <FormField label="পূর্ণমান">
              <input
                type="number"
                value={info.creativeFullMarks}
                onChange={(e) =>
                  onUpdate({ creativeFullMarks: parseInt(e.target.value) || 0 })
                }
                min={0}
                className={inputClass}
              />
            </FormField>
            <FormField label="বিশেষ নির্দেশনা" className="col-span-2">
              <textarea
                value={info.creativeInstruction}
                onChange={(e) =>
                  onUpdate({ creativeInstruction: e.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </FormField>
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Small shared UI helpers (local to this file, not exported)
// ------------------------------------------------------------------

const inputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder:text-gray-300 bg-white";

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}
