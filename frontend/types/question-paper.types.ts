// All shared types for the question paper builder system

export type ExamType = "mcq" | "short" | "creative" | "mcq_creative" | "mcq_short_creative" | "short_creative";
export type QuestionSource = "manual" | "database";
export type PaperMode = "new" | "edit";

// ------------------------------------------------------------------
// Paper header / metadata
// ------------------------------------------------------------------

export interface PaperInfo {
  subjectName: string;
  subjectNameBn: string; // Bangla name e.g. "পদার্থবিজ্ঞান"
  chapter: string; // Bangla name e.g. "পদার্থবিজ্ঞান"
  topic: string; // Bangla name e.g. "পদার্থবিজ্ঞান"
  boardName: string; // e.g. "ঢাকা বোর্ড-২০২৫"
  subjectCode: string; // e.g. "136"
  examType: ExamType;
  // MCQ specific
  mcqTime: string; // e.g. "25 মিনিট"
  mcqFullMarks: number;
  mcqInstruction: string;
  // Creative specific
  creativeTime: string; // e.g. "২ ঘণ্টা ৩৫ মিনিট"
  creativeFullMarks: number;
  creativeInstruction: string;
  year: string;
  // Short specific
  shortTime: string;
  shortFullMarks: number;
  shortInstruction: string;
  shortAnswerCount: number;
}

// ------------------------------------------------------------------
// MCQ
// ------------------------------------------------------------------

export interface MCQOption {
  id: string; // "ka" | "kha" | "ga" | "gha"
  label: string; // "ক" | "খ" | "গ" | "ঘ"
  text: string;
}

export interface MCQQuestion {
  id: string;
  serial: number;
  text: string;
  options: MCQOption[];
  correctOption: string; // option id
  source: QuestionSource;
  dbQuestionId?: string; // if pulled from DB
  passageId?: string; // links to a passage group
}

export interface MCQPassage {
  id: string;
  text: string; // the stimulus/উদ্দীপক text
  questionIds: string[]; // which questions belong to this passage
}

export interface MCQSection {
  passages: MCQPassage[];
  questions: MCQQuestion[];
}

// ------------------------------------------------------------------
// Creative (সৃজনশীল)
// ------------------------------------------------------------------

export interface CreativeSubQuestion {
  label: "ka" | "kha" | "ga" | "gha"; // ক খ গ ঘ
  text: string;
  marks: 1 | 2 | 3 | 4;
}

export interface CreativeQuestion {
  id: string;
  serial: number;
  stimulus: string; // উদ্দীপক text
  stimulusImageUrl?: string;
  subQuestions: CreativeSubQuestion[];
  source: QuestionSource;
  dbQuestionId?: string;
}

// ------------------------------------------------------------------
// Short question
// ------------------------------------------------------------------
export interface ShortQuestion {
    id: string;
    serial: number;
    text: string;
    marks: number;
    source: QuestionSource;
    dbQuestionId?: string;
}

// ------------------------------------------------------------------
// Overall paper state (local, not yet saved)
// ------------------------------------------------------------------

export interface PaperState {
  info: PaperInfo;
  mcqSection: MCQSection;
  shortQuestions: ShortQuestion[];
  creativeQuestions: CreativeQuestion[];
  activeStep: number;
  mode: PaperMode;
  existingPaperId?: string; // populated when editing
}

// ------------------------------------------------------------------
// DB API response shapes (adjust to match your actual API)
// ------------------------------------------------------------------

export interface DBQuestion {
  id: string;
  text: string;
  type: "mcq" | "creative";
  subject: string;
  options?: { label: string; text: string }[];
  correctOption?: string;
  subQuestions?: { label: string; text: string; marks: number }[];
}

export interface SavePaperPayload {
  info: PaperInfo;
  mcqSection: MCQSection;
  shortQuestions: ShortQuestion[];
  creativeQuestions: CreativeQuestion[];
  paperId?: string; // present on edit
}

export interface SavePaperResponse {
  paperId: string;
  success: boolean;
}

// ------------------------------------------------------------------
// Step definitions
// ------------------------------------------------------------------

export interface StepDefinition {
  id: number;
  title: string;
  titleBn: string;
  description: string;
  applicableTo: ExamType[]; // which exam types show this step
}

export const STEPS: StepDefinition[] = [
    {
        id: 0,
        title: "Paper Info",
        titleBn: "তথ্য",
        description: "বিষয়, বোর্ড, সময় ও নম্বর",
        applicableTo: ["mcq", "short", "creative", "mcq_creative", "mcq_short_creative", "short_creative"],
    },
    {
        id: 1,
        title: "MCQ Questions",
        titleBn: "বহুনির্বাচনী",
        description: "MCQ প্রশ্ন যোগ করুন",
        applicableTo: ["mcq", "mcq_creative", "mcq_short_creative"],
    },
    {
        id: 2,
        title: "Short Questions",
        titleBn: "সংক্ষিপ্ত",
        description: "সংক্ষিপ্ত প্রশ্ন যোগ করুন",
        applicableTo: ["short", "mcq_short_creative", "short_creative"],
    },
    {
        id: 3,
        title: "Creative Questions",
        titleBn: "সৃজনশীল",
        description: "সৃজনশীল প্রশ্ন যোগ করুন",
        applicableTo: ["creative", "mcq_creative", "mcq_short_creative", "short_creative"],
    },
    {
        id: 4,
        title: "Review & Export",
        titleBn: "রিভিউ ও সংরক্ষণ",
        description: "প্রিভিউ দেখুন ও সংরক্ষণ করুন",
        applicableTo: ["mcq", "short", "creative", "mcq_creative", "mcq_short_creative", "short_creative"],
    },
];

// Bangla labels for sub-questions
export const CREATIVE_LABELS: Record<CreativeSubQuestion["label"], string> = {
  ka: "ক",
  kha: "খ",
  ga: "গ",
  gha: "ঘ",
};

export const MCQ_OPTION_LABELS = [
  { id: "ka", label: "ক" },
  { id: "kha", label: "খ" },
  { id: "ga", label: "গ" },
  { id: "gha", label: "ঘ" },
];
