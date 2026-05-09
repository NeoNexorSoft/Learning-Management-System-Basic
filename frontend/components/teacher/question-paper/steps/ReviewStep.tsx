"use client";

import { useState } from "react";
import {
  Printer,
  Download,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {PaperState, SavePaperPayload} from "@/types/question-paper.types";

interface ReviewStepProps {
  state: PaperState;
  onPrint: () => void;
  onDownloadPDF: () => Promise<void>;
  onDownloadWord: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function ReviewStep({
  state,
  onPrint,
  onDownloadPDF,
  onDownloadWord,
}: ReviewStepProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pdfLoading, setPDFLoading] = useState(false);

  const { info, mcqSection, creativeQuestions } = state;

  const hasMCQ = info.examType === "mcq" || info.examType === "both";
  const hasCreative = info.examType === "creative" || info.examType === "both";

  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError(null);

    const payload: SavePaperPayload = {
      info,
      mcqSection,
      creativeQuestions,
      paperId: state.existingPaperId,
    };

    try {
      const url =
        state.mode === "edit" && state.existingPaperId
          ? `/api/question-papers/${state.existingPaperId}`
          : "/api/question-papers";

      const method = state.mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "সংরক্ষণে সমস্যা হয়েছে");
      }

      setSaveStatus("success");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "অজানা ত্রুটি");
      setSaveStatus("error");
    }
  };

  const handleDownloadPDF = async () => {
    setPDFLoading(true);
    try {
      await onDownloadPDF();
    } finally {
      setPDFLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          প্রশ্নপত্রের সারসংক্ষেপ
        </h3>
        <div className="space-y-2">
          <SummaryRow label="বিষয়" value={info.subjectNameBn} />
          <SummaryRow label="বোর্ড" value={`${info.boardName}-${info.year}`} />
          <SummaryRow label="বিষয় কোড" value={info.subjectCode} />
          {hasMCQ && (
            <>
              <SummaryRow
                label="MCQ প্রশ্ন"
                value={`${mcqSection.questions.length} টি`}
              />
              <SummaryRow label="MCQ পূর্ণমান" value={String(info.mcqFullMarks)} />
              <SummaryRow label="MCQ সময়" value={info.mcqTime} />
            </>
          )}
          {hasCreative && (
            <>
              <SummaryRow
                label="সৃজনশীল প্রশ্ন"
                value={`${creativeQuestions.length} টি`}
              />
              <SummaryRow
                label="সৃজনশীল পূর্ণমান"
                value={String(info.creativeFullMarks)}
              />
              <SummaryRow label="সৃজনশীল সময়" value={info.creativeTime} />
            </>
          )}
        </div>
      </div>

      {/* Export actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          রপ্তানি করুন
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <ExportButton
            icon={<Printer size={16} />}
            label="প্রিন্ট করুন"
            description="ব্রাউজার প্রিন্ট ডায়ালগ খুলবে"
            onClick={onPrint}
            variant="default"
          />

          <ExportButton
            icon={
              pdfLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )
            }
            label="PDF ডাউনলোড"
            description="A4 সাইজে PDF ফাইল"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            variant="default"
          />

          <ExportButton
            icon={<FileText size={16} />}
            label="Word ডাউনলোড"
            description=".doc ফরম্যাটে ডাউনলোড"
            onClick={onDownloadWord}
            variant="default"
          />
        </div>
      </div>

      {/* Save to DB */}
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          সংরক্ষণ করুন
        </h3>

        {saveStatus === "success" ? (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3 text-sm">
            <CheckCircle2 size={16} />
            <span className="font-medium">সফলভাবে সংরক্ষণ হয়েছে</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save size={15} />
                {state.mode === "edit"
                  ? "পরিবর্তন সংরক্ষণ করুন"
                  : "প্রশ্নপত্র সংরক্ষণ করুন"}
              </>
            )}
          </button>
        )}

        {saveStatus === "error" && saveError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 text-sm mt-2">
            <AlertCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Local helpers
// ------------------------------------------------------------------

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value || "—"}</span>
    </div>
  );
}

interface ExportButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "default" | "primary";
}

function ExportButton({
  icon,
  label,
  description,
  onClick,
  disabled,
}: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group"
    >
      <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
    </button>
  );
}
