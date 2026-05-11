"use client";

import { ShortQuestion, PaperInfo } from "@/types/question-paper.types";

interface ShortPreviewPageProps {
    info: PaperInfo;
    shortQuestions: ShortQuestion[];
}

export default function ShortPreviewPage({ info, shortQuestions }: ShortPreviewPageProps) {
    const mid = Math.ceil(shortQuestions.length / 2);
    const left = shortQuestions.slice(0, mid);
    const right = shortQuestions.slice(mid);

    return (
        <div
            className="bg-white text-black"
            style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "12mm 14mm",
                fontSize: "9pt",
                lineHeight: "1.6",
                fontFamily: "'Noto Serif Bengali', 'Noto Serif', Georgia, serif",
                boxSizing: "border-box",
                color: "#000000",
                backgroundColor: "#ffffff",
            }}
        >
            {/* Header - same pattern */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <div style={{ backgroundColor: "#1a1a2e", color: "white", width: "52px", height: "52px", fontSize: "7pt", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", flexShrink: 0 }}>
                    বোর্ড প্রশ্ন ও উত্তরমালা {info.year}
                </div>
                <div style={{ fontSize: "28pt", fontWeight: "bold" }}>{info.subjectNameBn}</div>
            </div>

            <div style={{ textAlign: "center", fontSize: "14pt", fontWeight: "bold", marginBottom: "4px" }}>
                {info.boardName}-{info.year}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5pt", marginBottom: "2px" }}>
                <span style={{ fontWeight: "600" }}>{info.subjectNameBn} (সংক্ষিপ্ত-উত্তর)</span>
                <span>বিষয় কোড {info.subjectCode}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5pt", marginBottom: "6px" }}>
                <span>সময় : {info.shortTime}</span>
                <span>পূর্ণমান : {info.shortFullMarks}</span>
            </div>

            <div style={{ borderTop: "1px solid black", borderBottom: "1px solid black", padding: "3px 0", fontSize: "7.5pt", marginBottom: "8px" }}>
                <b>[দ্রষ্টব্য : </b>{info.shortInstruction}<b> যেকোনো {info.shortAnswerCount}টি প্রশ্নের উত্তর দিতে হবে।]</b>
            </div>

            {/* 2-column layout */}
            <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {left.map((q) => (
                        <ShortQItem key={q.id} question={q} />
                    ))}
                </div>
                <div style={{ width: "1px", backgroundColor: "#999", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {right.map((q) => (
                        <ShortQItem key={q.id} question={q} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ShortQItem({ question }: { question: ShortQuestion }) {
    return (
        <div style={{ fontSize: "8.5pt", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
                <span style={{ fontWeight: "bold" }}>{question.serial}. </span>
                {question.text || <span style={{ color: "#aaa", fontStyle: "italic" }}>প্রশ্ন লিখুন...</span>}
            </div>
            <span style={{ fontWeight: "bold", marginLeft: "6px", flexShrink: 0 }}>{question.marks}</span>
        </div>
    );
}