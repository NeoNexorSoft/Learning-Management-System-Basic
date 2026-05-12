"use client";

import {
  CreativeQuestion,
  PaperInfo,
  ShortQuestion,
} from "@/types/question-paper.types";
import { CREATIVE_LABELS } from "@/types/question-paper.types";

interface ShortCreativePreviewPageProps {
  info: PaperInfo;
  shortQuestions: ShortQuestion[];
  creativeQuestions: CreativeQuestion[];
}

const font = "'Noto Serif Bengali', 'Noto Serif', Georgia, serif";
const black = "#000000";
const white = "#ffffff";

function SubjectCodeBoxes({ code }: { code: string }) {
  return (
    <span style={{ fontSize: "8.5pt" }}>
      বিষয় কোড{" "}
      {code.split("").map((d, i) => (
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
  );
}

// ------------------------------------------------------------------
// Root component
// ------------------------------------------------------------------
export default function ShortCreativePreviewPage({
  info,
  shortQuestions,
  creativeQuestions,
}: ShortCreativePreviewPageProps) {
  const hasShort = shortQuestions.length > 0;
  const hasCreative = creativeQuestions.length > 0;

  const shortMid = Math.ceil(shortQuestions.length / 2);
  const shortLeft = shortQuestions.slice(0, shortMid);
  const shortRight = shortQuestions.slice(shortMid);

  const creativeMid = Math.ceil(creativeQuestions.length / 2);
  const creativeLeft = creativeQuestions.slice(0, creativeMid);
  const creativeRight = creativeQuestions.slice(creativeMid);

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
      {/* ================================================================
          SHARED PAGE HEADER
          ================================================================ */}
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

      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "15pt",
          marginBottom: "8px",
          color: black,
        }}
      >
        {info.boardName}-{info.year}
      </div>

      {/* ================================================================
          SECTION 1: SHORT QUESTIONS
          ================================================================ */}
      {hasShort && (
        <div style={{ marginBottom: "20px" }}>
          {/* Section header row */}
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
              {info.subjectNameBn} (সংক্ষিপ্ত-উত্তর)
            </span>
            <SubjectCodeBoxes code={info.subjectCode} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              fontSize: "8.5pt",
              color: black,
            }}
          >
            <span>সময় : {info.shortTime}</span>
            <span>পূর্ণমান : {info.shortFullMarks}</span>
          </div>

          <div
            style={{
              borderTop: `1px solid ${black}`,
              borderBottom: `1px solid ${black}`,
              padding: "3px 0",
              fontSize: "7.5pt",
              marginBottom: "8px",
              color: black,
              backgroundColor: white,
            }}
          >
            <span style={{ fontWeight: "bold" }}>[দ্রষ্টব্য : </span>
            {info.shortInstruction}
            <span style={{ fontWeight: "bold" }}>
              {" "}যেকোনো {info.shortAnswerCount}টি প্রশ্নের উত্তর দিতে হবে।]
            </span>
          </div>

          {/* 2-column short questions */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                paddingRight: "8px",
              }}
            >
              {shortLeft.map((q) => (
                <ShortQItem key={q.id} question={q} />
              ))}
            </div>

            <div
              style={{
                width: "1px",
                backgroundColor: "#999999",
                flexShrink: 0,
              }}
            />

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                paddingLeft: "8px",
              }}
            >
              {shortRight.map((q) => (
                <ShortQItem key={q.id} question={q} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          SECTION DIVIDER (only when both sections present)
          ================================================================ */}
      {hasShort && hasCreative && (
        <div
          style={{
            borderTop: `2px solid ${black}`,
            marginBottom: "14px",
          }}
        />
      )}

      {/* ================================================================
          SECTION 2: CREATIVE QUESTIONS
          ================================================================ */}
      {hasCreative && (
        <div>
          {/* Section header row */}
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
            {/*<SubjectCodeBoxes code={info.subjectCode} />*/}
          </div>

          {/*<div*/}
          {/*  style={{*/}
          {/*    display: "flex",*/}
          {/*    justifyContent: "space-between",*/}
          {/*    marginBottom: "5px",*/}
          {/*    fontSize: "8.5pt",*/}
          {/*    color: black,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <span>সময় : {info.creativeTime}</span>*/}
          {/*  <span>পূর্ণমান : {info.creativeFullMarks}</span>*/}
          {/*</div>*/}

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
            <span style={{ fontWeight: "bold" }}>
              {" "}যেকোনো পাঁচটি প্রশ্নের উত্তর দিতে হবে।]
            </span>
          </div>

          {/* 2-column creative questions */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                paddingRight: "8px",
              }}
            >
              {creativeLeft.map((q) => (
                <CreativeBlock key={q.id} question={q} />
              ))}
            </div>

            <div
              style={{
                width: "1px",
                backgroundColor: "#999999",
                flexShrink: 0,
              }}
            />

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                paddingLeft: "8px",
              }}
            >
              {creativeRight.map((q) => (
                <CreativeBlock key={q.id} question={q} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Short question row
// ------------------------------------------------------------------
function ShortQItem({ question }: { question: ShortQuestion }) {
  return (
    <div
      style={{
        fontSize: "8.5pt",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        color: "#000000",
      }}
    >
      <div style={{ flex: 1, lineHeight: "1.45" }}>
        <span style={{ fontWeight: "bold" }}>{question.serial}. </span>
        {question.text || (
          <span style={{ color: "#aaaaaa", fontStyle: "italic" }}>
            প্রশ্ন লিখুন...
          </span>
        )}
      </div>
      <span
        style={{
          fontWeight: "bold",
          marginLeft: "6px",
          flexShrink: 0,
          color: "#000000",
        }}
      >
        {question.marks}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------
// Creative question block
// ------------------------------------------------------------------
function CreativeBlock({ question }: { question: CreativeQuestion }) {
  return (
    <div>
      <div
        style={{
          fontSize: "8.5pt",
          marginBottom: "4px",
          color: "#000000",
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

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "8pt",
          color: "#000000",
          paddingLeft: "8px",
        }}
      >
        <tbody>
          {question.subQuestions.map((sq) => (
            <tr key={sq.label}>
              <td
                style={{
                  width: "14px",
                  verticalAlign: "top",
                  fontWeight: "600",
                  paddingBottom: "2px",
                  color: "#000000",
                  whiteSpace: "nowrap",
                }}
              >
                {CREATIVE_LABELS[sq.label]}.
              </td>
              <td
                style={{
                  verticalAlign: "top",
                  paddingBottom: "2px",
                  color: "#000000",
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
                  color: "#000000",
                  whiteSpace: "nowrap",
                }}
              >
                {sq.marks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
