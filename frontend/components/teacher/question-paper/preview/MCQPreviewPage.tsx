"use client";

import { MCQQuestion, MCQSection, PaperInfo } from "@/types/question-paper.types";

interface MCQPreviewPageProps {
  info: PaperInfo;
  mcqSection: MCQSection;
}

// ------------------------------------------------------------------
// ALL styles are plain hex/rgb inline — zero Tailwind classes.
// This ensures html2canvas can capture without oklch/lab parse errors.
// Width is fixed in px (794px = 210mm @ 96dpi) so the capture
// matches A4 exactly when scale:2 is used in jsPDF export.
// ------------------------------------------------------------------

const font = "'Noto Serif Bengali', 'Noto Serif', Georgia, serif";
const black = "#000000";
const white = "#ffffff";

// Shared td style for answer grid cells
const gridCellBase: React.CSSProperties = {
  border: `1px solid ${black}`,
  fontSize: "7pt",
  textAlign: "center",
  color: black,
  backgroundColor: white,
  padding: "1px 4px",
};

// ------------------------------------------------------------------
// Passage first-question map:
// Returns { questionId -> passageText } only for the first question
// in each passage group so we render the box once above that question.
// ------------------------------------------------------------------
function buildPassageFirstMap(mcqSection: MCQSection): Record<string, string> {
  const result: Record<string, string> = {};
  for (const passage of mcqSection.passages) {
    const grouped = mcqSection.questions.filter((q) =>
      passage.questionIds.includes(q.id)
    );
    if (grouped.length === 0) continue;
    const firstSerial = Math.min(...grouped.map((q) => q.serial));
    const firstQ = grouped.find((q) => q.serial === firstSerial);
    if (firstQ) result[firstQ.id] = passage.text;
  }
  return result;
}

// ------------------------------------------------------------------
// Root component
// ------------------------------------------------------------------
export default function MCQPreviewPage({ info, mcqSection }: MCQPreviewPageProps) {
  const passageFirstMap = buildPassageFirstMap(mcqSection);
  const leftQuestions = mcqSection.questions.filter((_, i) => i % 2 === 0);
  const rightQuestions = mcqSection.questions.filter((_, i) => i % 2 === 1);

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "45px 53px",
        boxSizing: "border-box",
        backgroundColor: white,
        color: black,
        fontFamily: font,
        fontSize: "9pt",
        lineHeight: "1.5",
      }}
    >
      {/* ---- Top bar: logo + subject name ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1a1a2e",
            color: white,
            width: "56px",
            height: "56px",
            fontSize: "6.5pt",
            padding: "4px",
            borderRadius: "2px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontWeight: "bold",
            lineHeight: "1.3",
          }}
        >
          বোর্ড প্রশ্ন ও উত্তরমালা {info.year}
        </div>

        <div
          style={{
            fontSize: "30pt",
            fontWeight: "bold",
            letterSpacing: "-0.5px",
            color: black,
          }}
        >
          {info.subjectNameBn}
        </div>
      </div>

      {/* ---- Board name centered ---- */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "15pt",
          marginBottom: "5px",
          color: black,
        }}
      >
        {info.boardName}-{info.year}
      </div>

      {/* ---- Subject label + subject code ---- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "2px",
          fontSize: "9pt",
          color: black,
        }}
      >
        <span style={{ fontWeight: "600" }}>
          {info.subjectNameBn} (বহুনির্বাচনি অভীক্ষা)
        </span>
        <span style={{ fontSize: "8.5pt" }}>
          বিষয় কোড{" "}
          {info.subjectCode.split("").map((d, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                border: `1px solid ${black}`,
                width: "13px",
                textAlign: "center",
                marginLeft: "1px",
                lineHeight: "1.4",
                backgroundColor: white,
                color: black,
              }}
            >
              {d}
            </span>
          ))}
        </span>
      </div>

      {/* ---- Time + marks ---- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "8.5pt",
          color: black,
        }}
      >
        <span>সময় : {info.mcqTime}</span>
        <span>পূর্ণমান : {info.mcqFullMarks}</span>
      </div>

      {/* ---- Instruction box ---- */}
      <div
        style={{
          fontSize: "7.5pt",
          border: `1px solid ${black}`,
          padding: "3px 5px",
          marginBottom: "5px",
          color: black,
          backgroundColor: white,
        }}
      >
        <span style={{ fontWeight: "bold" }}>[বিশেষ দ্রষ্টব্য : </span>
        {info.mcqInstruction}
        <span style={{ fontWeight: "bold" }}> প্রতিটি প্রশ্নের মান ১]</span>
      </div>

      {/* ---- No-mark note ---- */}
      <div
        style={{
          textAlign: "center",
          fontSize: "7.5pt",
          marginBottom: "8px",
          color: black,
        }}
      >
        প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেওয়া যাবে না।
      </div>

      {/* ---- 2-column question layout ---- */}
      <div style={{ display: "flex" }}>

        {/* Left column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingRight: "8px",
          }}
        >
          {leftQuestions.map((q) => (
            <div key={q.id}>
              {passageFirstMap[q.id] && (
                <PassageBox text={passageFirstMap[q.id]} />
              )}
              <QuestionItem question={q} />
            </div>
          ))}
        </div>

        {/* Column divider */}
        <div
          style={{
            width: "1px",
            backgroundColor: "#999999",
            flexShrink: 0,
          }}
        />

        {/* Right column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingLeft: "8px",
          }}
        >
          {rightQuestions.map((q) => (
            <div key={q.id}>
              {passageFirstMap[q.id] && (
                <PassageBox text={passageFirstMap[q.id]} />
              )}
              <QuestionItem question={q} />
            </div>
          ))}
        </div>
      </div>

      {/* ---- Answer grid ---- */}
      {mcqSection.questions.length > 0 && (
        <AnswerGrid count={mcqSection.questions.length} />
      )}

      {/* ---- Footer subject label ---- */}
      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontWeight: "bold",
          fontSize: "10pt",
          color: black,
        }}
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
      style={{
        border: `1px solid ${black}`,
        padding: "3px 6px",
        fontSize: "7.5pt",
        backgroundColor: "#f5f5f5",
        color: black,
        marginBottom: "5px",
        lineHeight: "1.5",
      }}
    >
      <span style={{ fontWeight: "bold" }}>
        নিচের উদ্দীপকের আলোকে প্রশ্নের উত্তর দাও :
      </span>
      <div style={{ marginTop: "2px" }}>{text}</div>
    </div>
  );
}

function QuestionItem({ question }: { question: MCQQuestion }) {
  return (
    <div>
      {/* Question stem */}
      <div
        style={{
          fontSize: "8pt",
          color: black,
          marginBottom: "2px",
          lineHeight: "1.45",
        }}
      >
        <span style={{ fontWeight: "600" }}>{question.serial}.</span>{" "}
        {question.text || (
          <span style={{ color: "#aaaaaa", fontStyle: "italic" }}>
            প্রশ্ন লিখুন...
          </span>
        )}
      </div>

      {/* Options — 2x2 grid via table for reliable html2canvas rendering */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          paddingLeft: "10px",
          fontSize: "7.5pt",
          color: black,
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: "50%", paddingBottom: "1px", verticalAlign: "top" }}>
              <span style={{ fontWeight: "600" }}>{question.options[0]?.label}.</span>{" "}
              {question.options[0]?.text || <span style={{ color: "#cccccc" }}>—</span>}
            </td>
            <td style={{ width: "50%", paddingBottom: "1px", verticalAlign: "top" }}>
              <span style={{ fontWeight: "600" }}>{question.options[1]?.label}.</span>{" "}
              {question.options[1]?.text || <span style={{ color: "#cccccc" }}>—</span>}
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              <span style={{ fontWeight: "600" }}>{question.options[2]?.label}.</span>{" "}
              {question.options[2]?.text || <span style={{ color: "#cccccc" }}>—</span>}
            </td>
            <td style={{ verticalAlign: "top" }}>
              <span style={{ fontWeight: "600" }}>{question.options[3]?.label}.</span>{" "}
              {question.options[3]?.text || <span style={{ color: "#cccccc" }}>—</span>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AnswerGrid({ count }: { count: number }) {
  const first13 = Array.from({ length: Math.min(13, count) }, (_, i) => i + 1);
  const rest = Array.from({ length: Math.max(0, count - 13) }, (_, i) => i + 14);

  return (
    <div style={{ marginTop: "14px" }}>
      <div
        style={{
          fontSize: "7pt",
          fontWeight: "bold",
          marginBottom: "4px",
          color: black,
        }}
      >
        খালি ঘরগুলোতে পেনসিল দিয়ে উত্তরগুলো লেখো। এরপর প্রদত্ত উত্তরমালার সাথে মিলিয়ে দেখো তোমার উত্তরগুলো সঠিক কি না।
      </div>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <GridRow labels={first13} isSerial />
          <GridRow labels={first13} isSerial={false} />
          {rest.length > 0 && (
            <>
              <GridRow labels={rest} isSerial />
              <GridRow labels={rest} isSerial={false} />
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function GridRow({
  labels,
  isSerial,
}: {
  labels: number[];
  isSerial: boolean;
}) {
  return (
    <tr>
      <td
        style={{
          ...gridCellBase,
          fontWeight: "bold",
          whiteSpace: "nowrap",
          width: "30px",
          padding: "1px 4px",
        }}
      >
        {isSerial ? "নং" : "উত্তর"}
      </td>
      {labels.map((n) => (
        <td
          key={n}
          style={{
            ...gridCellBase,
            height: isSerial ? "auto" : "16px",
            minWidth: "18px",
            padding: isSerial ? "1px 2px" : "0",
          }}
        >
          {isSerial ? n : ""}
        </td>
      ))}
    </tr>
  );
}
