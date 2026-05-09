"use client";

import { PaperState } from "../../types/question-paper.types";
import MCQPreviewPage from "./MCQPreviewPage";
import CreativePreviewPage from "./CreativePreviewPage";
import PreviewPlaceholder from "./PreviewPlaceholder";

interface PaperPreviewProps {
  state: PaperState;
}

function hasEnoughContent(state: PaperState): boolean {
  const { info, mcqSection, creativeQuestions } = state;
  if (!info.subjectNameBn || !info.boardName) return false;

  const hasMCQType = ["mcq", "mcq_creative", "mcq_short_creative"].includes(info.examType);
  const hasCreativeType = ["creative", "mcq_creative", "mcq_short_creative", "short_creative"].includes(info.examType);

  if (hasMCQType && mcqSection.questions.length > 0) return true;
  if (hasCreativeType && creativeQuestions.length > 0) return true;
  return false;
}

export default function PaperPreview({ state }: PaperPreviewProps) {
  const { info, mcqSection, creativeQuestions } = state;
  const showPreview = hasEnoughContent(state);

  const hasMCQ = ["mcq", "mcq_creative", "mcq_short_creative"].includes(info.examType);
  const hasCreative = ["creative", "mcq_creative", "mcq_short_creative", "short_creative"].includes(info.examType);

  if (!showPreview) {
    return <PreviewPlaceholder />;
  }

  return (
    // paper-print-area: the capture root for html2canvas and print.
    // Inline styles only — no Tailwind classes here — so html2canvas
    // does not inherit any oklch/lab values from this wrapper.
    <div
      id="paper-print-area"
      data-paper-page="true"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        backgroundColor: "#f3f4f6", // neutral gray between pages
      }}
    >
      {hasMCQ && mcqSection.questions.length > 0 && (
        <div
          data-paper-page="true"
          style={{
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <MCQPreviewPage info={info} mcqSection={mcqSection} />
        </div>
      )}

      {hasCreative && creativeQuestions.length > 0 && (
        <div
          data-paper-page="true"
          style={{
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <CreativePreviewPage
            info={info}
            creativeQuestions={creativeQuestions}
          />
        </div>
      )}
    </div>
  );
}
