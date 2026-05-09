"use client";

import { Check } from "lucide-react";
import { StepDefinition } from "@/types/question-paper.types";

interface StepperNavProps {
  steps: StepDefinition[];
  activeStep: number;
  onStepClick: (index: number) => void;
}

export default function StepperNav({
  steps,
  activeStep,
  onStepClick,
}: StepperNavProps) {
  return (
    <nav aria-label="প্রশ্নপত্র তৈরির ধাপসমূহ" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;
          const isClickable = index <= activeStep; // can revisit completed steps

          return (
            <li
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={[
                  "flex items-center gap-2 group transition-all duration-200",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                ].join(" ")}
              >
                {/* Circle indicator */}
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200",
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-200"
                      : "bg-gray-100 text-gray-400 border border-gray-200",
                  ].join(" ")}
                >
                  {isDone ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className={[
                      "text-xs font-semibold leading-tight",
                      isCurrent
                        ? "text-blue-600"
                        : isDone
                        ? "text-emerald-600"
                        : "text-gray-400",
                    ].join(" ")}
                  >
                    {step.titleBn}
                  </span>
                  <span className="text-xs text-gray-400 leading-tight">
                    {step.description}
                  </span>
                </div>
              </button>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    "flex-1 h-px mx-2 transition-all duration-300",
                    index < activeStep ? "bg-emerald-400" : "bg-gray-200",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
