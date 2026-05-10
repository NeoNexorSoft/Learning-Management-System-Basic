"use client";

import { useRef } from "react";
import { PaperMode, PaperState } from "@/types/question-paper.types";
import { useQuestionPaperState } from "@/hooks/useQuestionPaperState";
import { usePaperExport } from "@/hooks/usePaperExport";
import StepperNav from "./stepper/StepperNav";
import PaperInfoStep from "./steps/PaperInfoStep";
import MCQStep from "./steps/MCQStep";
import CreativeStep from "./steps/CreativeStep";
import ReviewStep from "./steps/ReviewStep";
import PaperPreview from "./preview/PaperPreview";
import {
  PreviewControls,
  FullscreenPreview,
  usePreviewControls,
} from "./preview/PreviewControls";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShortStep from "@/components/teacher/question-paper/steps/ShortStep";

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
  const preview = usePreviewControls();

  const isFirstStep = state.activeStep === 0;
  const isLastStep = state.activeStep === visibleSteps.length - 1;
  const currentStepId = visibleSteps[state.activeStep]?.id ?? 0;

  const leftPanelRef = useRef<HTMLDivElement>(null);

  const scrollLeftToTop = () =>
    leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const handleStepChange = (index: number) => {
    goToStep(index);
    scrollLeftToTop();
  };

  const handleNext = () => {
    goNext();
    scrollLeftToTop();
  };

  const handlePrev = () => {
    goPrev();
    scrollLeftToTop();
  };

  // The preview content is shared between inline panel and fullscreen modal
  const previewContent = <PaperPreview state={state} />;

  // Dynamic bottom margin to prevent content clipping after CSS scale
  // When scale < 1 the element collapses upward, so we compensate with
  // a negative margin equal to the height lost.
  const scaledMarginBottom = `${(preview.zoom - 1) * 1123}px`;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ---- Top bar: title + stepper ---- */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {mode === "edit" ? "প্রশ্নপত্র সম্পাদনা" : "নতুন প্রশ্নপত্র"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {state.info.subjectNameBn || "বিষয় নির্বাচন করুন"}
            </p>
          </div>

          <div className="flex-1">
            <StepperNav
              steps={visibleSteps}
              activeStep={state.activeStep}
              onStepClick={handleStepChange}
            />
          </div>
        </div>
      </header>

      {/* ---- Main body ---- */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel - step forms */}
        <div
          ref={leftPanelRef}
          className="w-[420px] shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-y-auto"
        >
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
                subjectName={state.info.subjectName}
                mcqFullMarks={state.info.mcqFullMarks}
                actions={actions}
              />
            )}

              {currentStepId === 2 && visibleSteps[state.activeStep]?.title === "Short Questions" && (
                  <ShortStep
                      shortQuestions={state.shortQuestions}
                      subjectCode={state.info.subjectCode}
                      subjectName={state.info.subjectName}
                      shortFullMarks={state.info.shortFullMarks}
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
                subjectName={state.info.subjectName}
                creativeFullMarks={state.info.creativeFullMarks}
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

          {/* Bottom navigation */}
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

        {/* Right panel - live preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 relative">

          {/* Floating controls: zoom + fullscreen */}
          <PreviewControls
            zoom={preview.zoom}
            onZoomIn={preview.zoomIn}
            onZoomOut={preview.zoomOut}
            onReset={preview.resetZoom}
            onFullscreen={preview.openFullscreen}
          />

          {/* Preview area with CSS scale */}
          <div className="p-6 flex flex-col items-center">
            <div
              style={{
                transform: `scale(${preview.zoom})`,
                transformOrigin: "top center",
                marginBottom: scaledMarginBottom,
              }}
            >
              {previewContent}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      <FullscreenPreview
        isOpen={preview.fullscreen}
        onClose={preview.closeFullscreen}
      >
        {previewContent}
      </FullscreenPreview>
    </div>
  );
}
