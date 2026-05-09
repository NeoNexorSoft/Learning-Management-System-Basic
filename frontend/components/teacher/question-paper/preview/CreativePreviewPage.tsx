"use client";

import { CreativeQuestion, CreativeSubQuestion, PaperInfo } from "@/types/question-paper.types";
import { CREATIVE_LABELS } from "@/types/question-paper.types";

interface CreativePreviewPageProps {
  info: PaperInfo;
  creativeQuestions: CreativeQuestion[];
}

// ------------------------------------------------------------------
// ALL styles are plain hex/rgb inline — zero Tailwind classes.
// Width fixed at 794px (210mm @ 96dpi) for consistent PDF capture.
// ------------------------------------------------------------------

const font = "'Noto Serif Bengali', 'Noto Serif', Georgia, serif";
const black = "#000000";
const white = "#ffffff";

// ------------------------------------------------------------------
// Root component
// ------------------------------------------------------------------
export default function CreativePreviewPage({
  info,
  creativeQuestions,
}: CreativePreviewPageProps) {
  const mid = Math.ceil(creativeQuestions.length / 2);
  const leftQuestions = creativeQuestions.slice(0, mid);
  const rightQuestions = creativeQuestions.slice(mid);

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
        lineHeight: "1.6",
      }}
    >
      {/* ---- Top utility row (page label + board) ---- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3px",
          fontSize: "8pt",
          color: black,
        }}
      >
        <span>বোর্ড প্রশ্নবলির উত্তরমালা</span>
        <span style={{ fontWeight: "bold" }}>{info.boardName}</span>
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
          {info.subjectNameBn} (তত্ত্বীয়-সৃজনশীল)
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
          marginBottom: "5px",
          fontSize: "8.5pt",
          color: black,
        }}
      >
        <span>সময় : {info.creativeTime}</span>
        <span>পূর্ণমান : {info.creativeFullMarks}</span>
      </div>

      {/* ---- Instruction box (top + bottom border only, like PDF) ---- */}
      <div
        style={{
          borderTop: `1px solid ${black}`,
          borderBottom: `1px solid ${black}`,
          padding: "3px 0",
          fontSize: "7.5pt",
          marginBottom: "10px",
          color: black,
          backgroundColor: white,
        }}
      >
        <span style={{ fontWeight: "bold" }}>[দ্রষ্টব্য : </span>
        {info.creativeInstruction}
        <span style={{ fontWeight: "bold" }}> যেকোনো পাঁচটি প্রশ্নের উত্তর দিতে হবে।]</span>
      </div>

      {/* ---- 2-column question layout ---- */}
      <div style={{ display: "flex" }}>

        {/* Left column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            paddingRight: "8px",
          }}
        >
          {leftQuestions.map((q) => (
            <CreativeBlock key={q.id} question={q} />
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
            gap: "14px",
            paddingLeft: "8px",
          }}
        >
          {rightQuestions.map((q) => (
            <CreativeBlock key={q.id} question={q} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Single creative question block
// ------------------------------------------------------------------
function CreativeBlock({ question }: { question: CreativeQuestion }) {
  const black = "#000000";
  const white = "#ffffff";

  return (
    <div>
      {/* Serial + stimulus */}
      <div
        style={{
          fontSize: "8.5pt",
          marginBottom: "4px",
          color: black,
          lineHeight: "1.5",
        }}
      >
        <span style={{ fontWeight: "bold" }}>{question.serial}|</span>{" "}
        {question.stimulus || (
          <span style={{ color: "#aaaaaa", fontStyle: "italic" }}>
            উদ্দীপক লিখুন...
          </span>
        )}
      </div>

      {/* Sub-questions ক খ গ ঘ — table for reliable layout in html2canvas */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "8pt",
          color: black,
          paddingLeft: "8px",
        }}
      >
        <tbody>
          {question.subQuestions.map((sq) => (
            <SubQuestionRow key={sq.label} sq={sq} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubQuestionRow({ sq }: { sq: CreativeSubQuestion }) {
  const black = "#000000";
  return (
    <tr>
      <td
        style={{
          width: "14px",
          verticalAlign: "top",
          fontWeight: "600",
          paddingBottom: "2px",
          color: black,
          whiteSpace: "nowrap",
        }}
      >
        {CREATIVE_LABELS[sq.label]}.
      </td>
      <td
        style={{
          verticalAlign: "top",
          paddingBottom: "2px",
          color: black,
          lineHeight: "1.45",
        }}
      >
        {sq.text || (
          <span style={{ color: "#cccccc", fontStyle: "italic" }}>
            প্রশ্ন লিখুন...
          </span>
        )}
      </td>
      <td
        style={{
          width: "18px",
          textAlign: "right",
          verticalAlign: "top",
          fontWeight: "bold",
          paddingBottom: "2px",
          color: black,
          whiteSpace: "nowrap",
        }}
      >
        {sq.marks}
      </td>
    </tr>
  );
}
