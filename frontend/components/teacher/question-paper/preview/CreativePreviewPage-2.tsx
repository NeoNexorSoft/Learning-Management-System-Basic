"use client";

import { CreativeQuestion, PaperInfo } from "@/types/question-paper.types";
import { CREATIVE_LABELS } from "@/types/question-paper.types";

interface CreativePreviewPageProps {
  info: PaperInfo;
  creativeQuestions: CreativeQuestion[];
}

export default function CreativePreviewPage({
  info,
  creativeQuestions,
}: CreativePreviewPageProps) {
  // Split into two columns: first half left, second half right
  const mid = Math.ceil(creativeQuestions.length / 2);
  const leftQuestions = creativeQuestions.slice(0, mid);
  const rightQuestions = creativeQuestions.slice(mid);

  return (
    <div
      className="bg-white text-black font-serif"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 14mm",
        fontSize: "9pt",
        lineHeight: "1.6",
        fontFamily: "'Noto Serif Bengali', 'Noto Serif', Georgia, serif",
        boxSizing: "border-box",
      }}
    >
      {/* ---- Page label top right ---- */}
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: "8pt" }}>বোর্ড প্রশ্নবলির উত্তরমালা</span>
        <span className="font-bold" style={{ fontSize: "9pt" }}>
          {info.boardName}
        </span>
      </div>

      {/* ---- Board name centered ---- */}
      <div className="text-center font-bold mb-1" style={{ fontSize: "14pt" }}>
        {info.boardName}-{info.year}
      </div>

      {/* ---- Sub-header row ---- */}
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="font-semibold" style={{ fontSize: "9pt" }}>
          {info.subjectNameBn} (তত্ত্বীয়-সৃজনশীল)
        </span>
        <span style={{ fontSize: "8.5pt" }}>
          বিষয় কোড{" "}
          {info.subjectCode.split("").map((d, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                border: "1px solid #000",
                width: "12px",
                textAlign: "center",
                marginLeft: "1px",
              }}
            >
              {d}
            </span>
          ))}
        </span>
      </div>

      {/* ---- Time and marks ---- */}
      <div className="flex justify-between mb-1" style={{ fontSize: "8.5pt" }}>
        <span>সময় : {info.creativeTime}</span>
        <span>পূর্ণমান : {info.creativeFullMarks}</span>
      </div>

      {/* ---- Instruction box ---- */}
      <div
        className="mb-2"
        style={{
          fontSize: "7.5pt",
          borderTop: "1px solid #000",
          borderBottom: "1px solid #000",
          padding: "3px 0",
        }}
      >
        <span className="font-bold">[দ্রষ্টব্য : </span>
        {info.creativeInstruction}
        <span className="font-bold"> যেকোনো পাঁচটি প্রশ্নের উত্তর দিতে হবে।]</span>
      </div>

      {/* ---- 2-column question layout ---- */}
      <div className="flex gap-3">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-3">
          {leftQuestions.map((q) => (
            <CreativeQuestionBlock key={q.id} question={q} />
          ))}
        </div>

        {/* Vertical divider */}
        <div style={{ width: "1px", backgroundColor: "#999", flexShrink: 0 }} />

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-3">
          {rightQuestions.map((q) => (
            <CreativeQuestionBlock key={q.id} question={q} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Single creative question block
// ------------------------------------------------------------------

function CreativeQuestionBlock({ question }: { question: CreativeQuestion }) {
  return (
    <div>
      {/* Question serial and stimulus */}
      <div className="mb-1" style={{ fontSize: "8.5pt" }}>
        <span className="font-bold">{question.serial}|</span>{" "}
        {question.stimulus || (
          <span className="text-gray-400 italic">উদ্দীপক লিখুন...</span>
        )}
      </div>

      {/* Sub-questions ক খ গ ঘ */}
      <div className="flex flex-col gap-0.5 pl-2">
        {question.subQuestions.map((sq) => (
          <div key={sq.label} className="flex justify-between" style={{ fontSize: "8pt" }}>
            <div className="flex gap-1 flex-1">
              <span className="font-semibold shrink-0">
                {CREATIVE_LABELS[sq.label]}.
              </span>
              <span>
                {sq.text || (
                  <span className="text-gray-300 italic">প্রশ্ন লিখুন...</span>
                )}
              </span>
            </div>
            <span className="font-bold shrink-0 ml-1">{sq.marks}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
