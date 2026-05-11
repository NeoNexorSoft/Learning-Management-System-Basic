"use client";

import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import {
    CreativeQuestion,
    CreativeSubQuestion,
    ExamType,
    MCQOption,
    MCQPassage,
    MCQQuestion,
    MCQSection,
    MCQ_OPTION_LABELS,
    PaperInfo,
    PaperMode,
    PaperState,
    STEPS,
    StepDefinition, ShortQuestion,
} from "@/types/question-paper.types";

// ------------------------------------------------------------------
// Default values
// ------------------------------------------------------------------

const defaultInfo: PaperInfo = {
  subjectName: "Physics",
  subjectNameBn: "পদার্থবিজ্ঞান",
  chapter: "ALL",
  topic: "ALL",
  boardName: "ঢাকা বোর্ড",
  subjectCode: "136",
  examType: "mcq_short_creative",
  mcqTime: "২৫ মিনিট",
  mcqFullMarks: 25,
  mcqInstruction:
    "সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসংবলিত বৃত্তসমূহ হতে সঠিক উত্তরের বৃত্তি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট করো।",
  shortTime: "৩০ মিনিট",
  shortFullMarks: 10,
  shortInstruction: "সংক্ষিপ্ত প্রশ্নের উত্তর দাও।",
  shortAnswerCount: 5,
  creativeTime: "২ ঘণ্টা ৩৫ মিনিট",
  creativeFullMarks: 50,
  creativeInstruction:
    "ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। প্রদত্ত উদ্দীপকগুলো মনোযোগসহকারে পড়ো এবং সংশ্লিষ্ট প্রশ্নগুলোর যথাযথ উত্তর দাও।",
  year: new Date().getFullYear().toString(),
};

const makeEmptyMCQQuestion = (serial: number): MCQQuestion => ({
  id: uuid(),
  serial,
  text: "",
  options: MCQ_OPTION_LABELS.map((o) => ({ id: o.id, label: o.label, text: "" })),
  correctOption: "ka",
  source: "manual",
});

const makeEmptyCreativeQuestion = (serial: number): CreativeQuestion => ({
  id: uuid(),
  serial,
  stimulus: "",
  subQuestions: [
    { label: "ka", text: "", marks: 1 },
    { label: "kha", text: "", marks: 2 },
    { label: "ga", text: "", marks: 3 },
    { label: "gha", text: "", marks: 4 },
  ],
  source: "manual",
});

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

interface UseQuestionPaperStateProps {
  mode: PaperMode;
  initialState?: Partial<PaperState>;
}

export function useQuestionPaperState({
  mode,
  initialState,
}: UseQuestionPaperStateProps) {
  const [state, setState] = useState<PaperState>({
    info: initialState?.info ?? defaultInfo,
    mcqSection: initialState?.mcqSection ?? { passages: [], questions: [] },
    shortQuestions: initialState?.shortQuestions ?? [],
    creativeQuestions: initialState?.creativeQuestions ?? [],
    activeStep: 0,
    mode,
    existingPaperId: initialState?.existingPaperId,
  });

  // Compute which steps are visible based on exam type
  const visibleSteps: StepDefinition[] = STEPS.filter((s) =>
    s.applicableTo.includes(state.info.examType)
  );

  const currentStep = visibleSteps[state.activeStep] ?? visibleSteps[0];

  // ------------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------------

  const goNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeStep: Math.min(prev.activeStep + 1, visibleSteps.length - 1),
    }));
  }, [visibleSteps.length]);

  const goPrev = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeStep: Math.max(prev.activeStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((index: number) => {
    setState((prev) => ({ ...prev, activeStep: index }));
  }, []);

  // ------------------------------------------------------------------
  // Paper info
  // ------------------------------------------------------------------

  const updateInfo = useCallback((updates: Partial<PaperInfo>) => {
    setState((prev) => ({
      ...prev,
      info: { ...prev.info, ...updates },
    }));
  }, []);

  const setExamType = useCallback((examType: ExamType) => {
    setState((prev) => ({
      ...prev,
      activeStep: 0,
      info: { ...prev.info, examType },
    }));
  }, []);

  // ------------------------------------------------------------------
  // MCQ questions
  // ------------------------------------------------------------------

  const addMCQQuestion = useCallback(() => {
    setState((prev) => {
      const nextSerial = prev.mcqSection.questions.length + 1;
      return {
        ...prev,
        mcqSection: {
          ...prev.mcqSection,
          questions: [
            ...prev.mcqSection.questions,
            makeEmptyMCQQuestion(nextSerial),
          ],
        },
      };
    });
  }, []);

  const updateMCQQuestion = useCallback(
    (questionId: string, updates: Partial<MCQQuestion>) => {
      setState((prev) => ({
        ...prev,
        mcqSection: {
          ...prev.mcqSection,
          questions: prev.mcqSection.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        },
      }));
    },
    []
  );

  const updateMCQOption = useCallback(
    (questionId: string, optionId: string, text: string) => {
      setState((prev) => ({
        ...prev,
        mcqSection: {
          ...prev.mcqSection,
          questions: prev.mcqSection.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  options: q.options.map((o) =>
                    o.id === optionId ? { ...o, text } : o
                  ),
                }
              : q
          ),
        },
      }));
    },
    []
  );

  const removeMCQQuestion = useCallback((questionId: string) => {
    setState((prev) => {
      const filtered = prev.mcqSection.questions
        .filter((q) => q.id !== questionId)
        .map((q, i) => ({ ...q, serial: i + 1 }));
      return {
        ...prev,
        mcqSection: { ...prev.mcqSection, questions: filtered },
      };
    });
  }, []);

  const addDBMCQQuestions = useCallback((questions: MCQQuestion[]) => {
    setState((prev) => {
      const startSerial = prev.mcqSection.questions.length + 1;
      const numbered = questions.map((q, i) => ({
        ...q,
        serial: startSerial + i,
      }));
      return {
        ...prev,
        mcqSection: {
          ...prev.mcqSection,
          questions: [...prev.mcqSection.questions, ...numbered],
        },
      };
    });
  }, []);

  // Passages
  const addPassage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mcqSection: {
        ...prev.mcqSection,
        passages: [
          ...prev.mcqSection.passages,
          { id: uuid(), text: "", questionIds: [] },
        ],
      },
    }));
  }, []);

  const updatePassage = useCallback(
    (passageId: string, text: string) => {
      setState((prev) => ({
        ...prev,
        mcqSection: {
          ...prev.mcqSection,
          passages: prev.mcqSection.passages.map((p) =>
            p.id === passageId ? { ...p, text } : p
          ),
        },
      }));
    },
    []
  );

  const removePassage = useCallback((passageId: string) => {
    setState((prev) => ({
      ...prev,
      mcqSection: {
        ...prev.mcqSection,
        passages: prev.mcqSection.passages.filter((p) => p.id !== passageId),
        questions: prev.mcqSection.questions.map((q) =>
          q.passageId === passageId ? { ...q, passageId: undefined } : q
        ),
      },
    }));
  }, []);

  const assignQuestionToPassage = useCallback(
    (questionId: string, passageId: string | undefined) => {
      setState((prev) => {
        const updatedQuestions = prev.mcqSection.questions.map((q) =>
          q.id === questionId ? { ...q, passageId } : q
        );
        const updatedPassages = prev.mcqSection.passages.map((p) => ({
          ...p,
          questionIds: passageId === p.id
            ? [...new Set([...p.questionIds, questionId])]
            : p.questionIds.filter((id) => id !== questionId),
        }));
        return {
          ...prev,
          mcqSection: { passages: updatedPassages, questions: updatedQuestions },
        };
      });
    },
    []
  );

  // ------------------------------------------------------------------
  // Creative questions
  // ------------------------------------------------------------------

  const addCreativeQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      creativeQuestions: [
        ...prev.creativeQuestions,
        makeEmptyCreativeQuestion(prev.creativeQuestions.length + 1),
      ],
    }));
  }, []);

  const updateCreativeQuestion = useCallback(
    (questionId: string, updates: Partial<CreativeQuestion>) => {
      setState((prev) => ({
        ...prev,
        creativeQuestions: prev.creativeQuestions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      }));
    },
    []
  );

  const updateCreativeSubQuestion = useCallback(
    (
      questionId: string,
      label: CreativeSubQuestion["label"],
      text: string
    ) => {
      setState((prev) => ({
        ...prev,
        creativeQuestions: prev.creativeQuestions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                subQuestions: q.subQuestions.map((sq) =>
                  sq.label === label ? { ...sq, text } : sq
                ),
              }
            : q
        ),
      }));
    },
    []
  );

  const removeCreativeQuestion = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      creativeQuestions: prev.creativeQuestions
        .filter((q) => q.id !== questionId)
        .map((q, i) => ({ ...q, serial: i + 1 })),
    }));
  }, []);

  const addDBCreativeQuestions = useCallback(
    (questions: CreativeQuestion[]) => {
      setState((prev) => {
        const startSerial = prev.creativeQuestions.length + 1;
        const numbered = questions.map((q, i) => ({
          ...q,
          serial: startSerial + i,
        }));
        return {
          ...prev,
          creativeQuestions: [...prev.creativeQuestions, ...numbered],
        };
      });
    },
    []
  );

  // ------------------------------------------------------------------
  // Reorder (drag-and-drop ready)
  // ------------------------------------------------------------------

  const reorderMCQQuestions = useCallback((questions: MCQQuestion[]) => {
    setState((prev) => ({
      ...prev,
      mcqSection: {
        ...prev.mcqSection,
        questions: questions.map((q, i) => ({ ...q, serial: i + 1 })),
      },
    }));
  }, []);

  const reorderCreativeQuestions = useCallback(
    (questions: CreativeQuestion[]) => {
      setState((prev) => ({
        ...prev,
        creativeQuestions: questions.map((q, i) => ({ ...q, serial: i + 1 })),
      }));
    },
    []
  );

    const makeEmptyShortQuestion = (serial: number): ShortQuestion => ({
        id: uuid(),
        serial,
        text: "",
        marks: 2,
        source: "manual",
    });

    const addShortQuestion = useCallback(() => {
        setState((prev) => ({
            ...prev,
            shortQuestions: [
                ...prev.shortQuestions,
                makeEmptyShortQuestion(prev.shortQuestions.length + 1),
            ],
        }));
    }, []);

    const updateShortQuestion = useCallback((id: string, updates: Partial<ShortQuestion>) => {
        setState((prev) => ({
            ...prev,
            shortQuestions: prev.shortQuestions.map((q) =>
                q.id === id ? { ...q, ...updates } : q
            ),
        }));
    }, []);

    const removeShortQuestion = useCallback((id: string) => {
        setState((prev) => ({
            ...prev,
            shortQuestions: prev.shortQuestions
                .filter((q) => q.id !== id)
                .map((q, i) => ({ ...q, serial: i + 1 })),
        }));
    }, []);

    const addDBShortQuestions = useCallback((questions: ShortQuestion[]) => {
        setState((prev) => {
            const start = prev.shortQuestions.length + 1;
            return {
                ...prev,
                shortQuestions: [
                    ...prev.shortQuestions,
                    ...questions.map((q, i) => ({ ...q, serial: start + i })),
                ],
            };
        });
    }, []);

  return {
    state,
    visibleSteps,
    currentStep,
    // navigation
    goNext,
    goPrev,
    goToStep,
    // info
    updateInfo,
    setExamType,
    // mcq
    addMCQQuestion,
    updateMCQQuestion,
    updateMCQOption,
    removeMCQQuestion,
    addDBMCQQuestions,
    addPassage,
    updatePassage,
    removePassage,
    assignQuestionToPassage,
    reorderMCQQuestions,
    // short
    addShortQuestion,
    updateShortQuestion,
    removeShortQuestion,
    addDBShortQuestions,
    // creative
    addCreativeQuestion,
    updateCreativeQuestion,
    updateCreativeSubQuestion,
    removeCreativeQuestion,
    addDBCreativeQuestions,
    reorderCreativeQuestions,
  };
}

export type QuestionPaperActions = ReturnType<typeof useQuestionPaperState>;
