"use client";

import { MCQSection, PaperInfo } from "@/types/question-paper.types";

interface MCQPreviewPageProps {
  info: PaperInfo;
  mcqSection: MCQSection;
  scale?: number;
}

// Maps question serial to passage text, used to render passage boxes inline
function buildPassageMap(mcqSection: MCQSection) {
  const map: Record<string, string> = {};
  for (const passage of mcqSection.passages) {
    for (const qId of passage.questionIds) {
      const q = mcqSection.questions.find((x) => x.id === qId);
      if (q) map[qId] = passage.text;
    }
  }
  return map;
}

export default function MCQPreviewPage({
  info,
  mcqSection,
}: MCQPreviewPageProps) {
  const passageMap = buildPassageMap(mcqSection);

  // Group questions for 2-column layout: odd serials left, even serials right
  const leftQuestions = mcqSection.questions.filter((_, i) => i % 2 === 0);
  const rightQuestions = mcqSection.questions.filter((_, i) => i % 2 === 1);

  return (
    <div
      className="bg-white text-black font-serif"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 14mm",
        fontSize: "9pt",
        lineHeight: "1.5",
        fontFamily: "'Noto Serif Bengali', 'Noto Serif', Georgia, serif",
        boxSizing: "border-box",
      }}
    >
      {/* ---- Top bar ---- */}
      <div className="flex items-start justify-between mb-1">
        {/* Logo box */}
        <div
          className="flex items-center justify-center text-white font-bold text-center leading-tight"
          style={{
            backgroundColor: "#1a1a2e",
            width: "52px",
            height: "52px",
            fontSize: "7pt",
            padding: "4px",
            borderRadius: "2px",
            flexShrink: 0,
          }}
        >
          <span>বোর্ড প্রশ্ন ও উত্তরমালা {info.year}</span>
        </div>

        {/* Subject name - large, right-aligned */}
        <div
          className="font-bold"
          style={{ fontSize: "28pt", letterSpacing: "-0.5px" }}
        >
          {info.subjectNameBn}
        </div>
      </div>

      {/* ---- Board name ---- */}
      <div className="text-center font-bold mb-1" style={{ fontSize: "14pt" }}>
        {info.boardName}-{info.year}
      </div>

      {/* ---- Sub-header row ---- */}
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="font-semibold" style={{ fontSize: "9pt" }}>
          {info.subjectNameBn} (বহুনির্বাচনি অভীক্ষা)
        </span>
        <span style={{ fontSize: "8.5pt" }}>
          বিষয় কোড{" "}
          <span className="font-bold" style={{ letterSpacing: "2px" }}>
            {info.subjectCode
              .split("")
              .map((d, i) => (
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
        </span>
      </div>

      {/* ---- Time and marks row ---- */}
      <div className="flex justify-between mb-1" style={{ fontSize: "8.5pt" }}>
        <span>সময় : {info.mcqTime}</span>
        <span>পূর্ণমান : {info.mcqFullMarks}</span>
      </div>

      {/* ---- Instruction box ---- */}
      <div
        className="mb-2"
        style={{
          fontSize: "7.5pt",
          border: "1px solid #000",
          padding: "3px 5px",
        }}
      >
        <span className="font-bold">[বিশেষ দ্রষ্টব্য : </span>
        {info.mcqInstruction}
        <span className="font-bold">] প্রতিটি প্রশ্নের মান ১</span>
      </div>

      <div className="text-center mb-1" style={{ fontSize: "7.5pt" }}>
        প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেওয়া যাবে না।
      </div>

      {/* ---- 2-column question layout ---- */}
      <div className="flex gap-3">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-1.5">
          {leftQuestions.map((q) => (
            <div key={q.id}>
              {/* Passage box if this question starts a passage */}
              {q.passageId && passageMap[q.id] && q.serial === Math.min(
                ...mcqSection.questions
                  .filter((x) => x.passageId === q.passageId)
                  .map((x) => x.serial)
              ) && (
                <PassageBox text={passageMap[q.id]} />
              )}
              <MCQQuestionItem question={q} />
            </div>
          ))}
        </div>

        {/* Vertical divider */}
        <div style={{ width: "1px", backgroundColor: "#999", flexShrink: 0 }} />

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-1.5">
          {rightQuestions.map((q) => (
            <div key={q.id}>
              {q.passageId && passageMap[q.id] && q.serial === Math.min(
                ...mcqSection.questions
                  .filter((x) => x.passageId === q.passageId)
                  .map((x) => x.serial)
              ) && (
                <PassageBox text={passageMap[q.id]} />
              )}
              <MCQQuestionItem question={q} />
            </div>
          ))}
        </div>
      </div>

      {/* ---- Answer grid footer ---- */}
      {mcqSection.questions.length > 0 && (
        <AnswerGrid count={mcqSection.questions.length} />
      )}

      {/* ---- Subject label bottom ---- */}
      <div
        className="text-center mt-2 font-bold"
        style={{ fontSize: "10pt" }}
      >
        {info.subjectNameBn}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

function PassageBox({ text }: { text: string }) {
  return (
    <div
      className="mb-1"
      style={{
        border: "1px solid #000",
        padding: "3px 5px",
        fontSize: "7.5pt",
        backgroundColor: "#f9f9f9",
      }}
    >
      <span className="font-bold">নিচের উদ্দীপকের আলোকে প্রশ্নের উত্তর দাও :</span>
      <div className="mt-0.5">{text}</div>
    </div>
  );
}

function MCQQuestionItem({
  question,
}: {
  question: import("../../../../types/question-paper.types").MCQQuestion;
}) {
  return (
    <div style={{ fontSize: "8pt" }}>
      <div className="font-medium">
        {question.serial}. {question.text || <span className="text-gray-400 italic">প্রশ্ন লিখুন...</span>}
      </div>
      {/* 2x2 option grid */}
      <div className="grid grid-cols-2 gap-x-2 mt-0.5 pl-2">
        {question.options.map((opt) => (
          <div key={opt.id} style={{ fontSize: "7.5pt" }}>
            <span className="font-medium">{opt.label}.</span>{" "}
            {opt.text || <span className="text-gray-300">—</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnswerGrid({ count }: { count: number }) {
  const firstRow = Array.from({ length: Math.min(13, count) }, (_, i) => i + 1);
  const secondRow = Array.from(
    { length: Math.max(0, count - 13) },
    (_, i) => i + 14
  );

  return (
    <div className="mt-3" style={{ fontSize: "7pt" }}>
      <div className="font-bold mb-1">
        খালি ঘরগুলোতে পেনসিল দিয়ে উত্তরগুলো লেখো।
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          <AnswerGridRow labels={firstRow} />
          {secondRow.length > 0 && <AnswerGridRow labels={secondRow} />}
        </tbody>
      </table>
    </div>
  );
}

function AnswerGridRow({ labels }: { labels: number[] }) {
  return (
    <>
      <tr>
        <td
          style={{
            border: "1px solid #000",
            padding: "1px 3px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          নং
        </td>
        {labels.map((n) => (
          <td
            key={n}
            style={{
              border: "1px solid #000",
              padding: "1px 4px",
              textAlign: "center",
              minWidth: "16px",
            }}
          >
            {n}
          </td>
        ))}
      </tr>
      <tr>
        <td style={{ border: "1px solid #000", padding: "1px 3px" }}>উত্তর</td>
        {labels.map((n) => (
          <td
            key={n}
            style={{
              border: "1px solid #000",
              padding: "1px 4px",
              height: "14px",
            }}
          />
        ))}
      </tr>
    </>
  );
}
