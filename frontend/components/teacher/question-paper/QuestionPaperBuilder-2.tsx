"use client";

import {useRef, useState} from "react";
import { PaperMode, PaperState } from "@/types/question-paper.types";
import { useQuestionPaperState } from "@/hooks/useQuestionPaperState";
import { usePaperExport } from "@/hooks/usePaperExport";
import StepperNav from "./stepper/StepperNav";
import PaperInfoStep from "./steps/PaperInfoStep";
import MCQStep from "./steps/MCQStep";
import CreativeStep from "./steps/CreativeStep";
import ReviewStep from "./steps/ReviewStep";
import PaperPreview from "./preview/PaperPreview";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShortStep from "@/components/teacher/question-paper/steps/ShortStep";
import PreviewZoomControl from "./preview/PreviewZoomControl";

interface QuestionPaperBuilderProps {
  mode: PaperMode;
  initialState?: Partial<PaperState>;
}

export default function QuestionPaperBuilder({
  mode,
  initialState,
}: QuestionPaperBuilderProps) {
  const actions = useQuestionPaperState({ mode, initialState });
  const { state, visibleSteps, goNext, goPrev, goToStep } = actions;
  const exportHandlers = usePaperExport(state);

  const isFirstStep = state.activeStep === 0;
  const isLastStep = state.activeStep === visibleSteps.length - 1;
  const [previewZoom, setPreviewZoom] = useState(0.72);
  const ZOOM_STEP = 0.08;

  // Determine which step content to show
  const currentStepId = visibleSteps[state.activeStep]?.id ?? 0;

  // Scroll left panel to top when step changes
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const handleStepChange = (index: number) => {
    goToStep(index);
    leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    goNext();
    leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    goPrev();
    leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleZoomIn = () => setPreviewZoom((z) => Math.min(z + ZOOM_STEP, 1.2));
  const handleZoomOut = () => setPreviewZoom((z) => Math.max(z - ZOOM_STEP, 0.4));
  const handleZoomReset = () => setPreviewZoom(0.72);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ---- Top bar: title + stepper ---- */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Page title */}
          <div className="shrink-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {mode === "edit" ? "প্রশ্নপত্র সম্পাদনা" : "নতুন প্রশ্নপত্র"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {state.info.subjectNameBn || "বিষয় নির্বাচন করুন"}
            </p>
          </div>

          {/* Stepper takes up remaining space */}
          <div className="flex-1">
            <StepperNav
              steps={visibleSteps}
              activeStep={state.activeStep}
              onStepClick={handleStepChange}
            />
          </div>
        </div>
      </header>

      {/* ---- Main body: left form panel + right preview panel ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - form */}
        <div
          ref={leftPanelRef}
          className="w-[420px] shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-y-auto"
        >
          {/* Step content */}
          <div className="flex-1 p-5">
            {currentStepId === 0 && (
              <PaperInfoStep
                info={state.info}
                onUpdate={actions.updateInfo}
                onExamTypeChange={actions.setExamType}
              />
            )}

            {currentStepId === 1 && (
              <MCQStep
                mcqSection={state.mcqSection}
                subjectCode={state.info.subjectCode}
                actions={actions}
              />
            )}

            {currentStepId === 2 && visibleSteps[state.activeStep]?.title === "Short Questions" && (
              <ShortStep
                  shortQuestions={state.shortQuestions}
                  subjectCode={state.info.subjectCode}
                  onAdd={actions.addShortQuestion}
                  onUpdate={actions.updateShortQuestion}
                  onRemove={actions.removeShortQuestion}
                  onAddFromDB={actions.addDBShortQuestions}
              />
            )}

            {currentStepId === 3 && (
              <CreativeStep
                creativeQuestions={state.creativeQuestions}
                subjectCode={state.info.subjectCode}
                actions={actions}
              />
            )}

            {currentStepId === 4 && (
              <ReviewStep
                state={state}
                onPrint={exportHandlers.handlePrint}
                onDownloadPDF={exportHandlers.handleDownloadPDF}
                onDownloadWord={exportHandlers.handleDownloadWord}
              />
            )}
          </div>

          {/* Navigation buttons - sticky at bottom of left panel */}
          <div className="shrink-0 sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
              আগে
            </button>

            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                পরে
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right panel - preview */}
          <div className="flex-1 overflow-y-auto bg-gray-100 relative">
              {/* Zoom control - floating top right */}
              <PreviewZoomControl
                  zoom={previewZoom}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onReset={handleZoomReset}
              />

              <div className="p-6 flex flex-col items-center">
                  <div
                      style={{
                          transform: `scale(${previewZoom})`,
                          transformOrigin: "top center",
                          // Dynamic margin compensation based on zoom level
                          marginBottom: `${(previewZoom - 1) * 100 * 3}px`,
                      }}
                  >
                      <PaperPreview state={{ ...state, shortQuestions: state.shortQuestions }} />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
