"use client";

import { PaperState } from "@/types/question-paper.types";
import MCQPreviewPage from "./MCQPreviewPage";
import ShortCreativePreviewPage from "./ShortCreativePreviewPage";
import PreviewPlaceholder from "./PreviewPlaceholder";

interface PaperPreviewProps {
    state: PaperState;
}

function getSectionFlags(examType: string) {
    return {
        hasMCQ: ["mcq", "mcq_creative", "mcq_short_creative"].includes(examType),
        hasShort: ["short", "short_creative", "mcq_short_creative"].includes(examType),
        hasCreative: ["creative", "mcq_creative", "short_creative", "mcq_short_creative"].includes(examType),
    };
}

function hasEnoughContent(state: PaperState): boolean {
    const { info, mcqSection, creativeQuestions, shortQuestions } = state;
    if (!info.subjectNameBn || !info.boardName) return false;
    const { hasMCQ, hasShort, hasCreative } = getSectionFlags(info.examType);
    if (hasMCQ && mcqSection.questions.length > 0) return true;
    if (hasShort && shortQuestions.length > 0) return true;
    if (hasCreative && creativeQuestions.length > 0) return true;
    return false;
}

export default function PaperPreview({ state }: PaperPreviewProps) {
    const { info, mcqSection, creativeQuestions, shortQuestions } = state;
    const { hasMCQ, hasShort, hasCreative } = getSectionFlags(info.examType);

    if (!hasEnoughContent(state)) {
        return <PreviewPlaceholder />;
    }

    // Short + Creative একই page এ আছে কিনা
    const hasShortCreativePage =
        (hasShort && shortQuestions.length > 0) ||
        (hasCreative && creativeQuestions.length > 0);

    return (
        <div
            id="paper-print-area"
            data-paper-page="true"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                backgroundColor: "#f3f4f6",
            }}
        >
            {/* Page 1: MCQ */}
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

            {/* Page 2: Short (top) + Creative (bottom) — combined */}
            {hasShortCreativePage && (
                <div
                    data-paper-page="true"
                    style={{
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <ShortCreativePreviewPage
                        info={info}
                        shortQuestions={hasShort ? shortQuestions : []}
                        creativeQuestions={hasCreative ? creativeQuestions : []}
                    />
                </div>
            )}
        </div>
    );
}