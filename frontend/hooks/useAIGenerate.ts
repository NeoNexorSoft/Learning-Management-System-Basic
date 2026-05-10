"use client";

import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  CreativeQuestion,
  CreativeSubQuestion,
  MCQQuestion,
  MCQ_OPTION_LABELS,
  ShortQuestion,
} from "@/types/question-paper.types";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type AIQuestionType = "mcq" | "short" | "creative";
export type AIDifficulty = "easy" | "medium" | "hard";
export type AIExam = "SSC" | "HSC" | "JSC" | "PSC" | "Other";

export interface AIGenerateParams {
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: AIDifficulty;
  type: AIQuestionType;
  exam: AIExam;
  count: number;
}

// Raw shape from the API
interface RawAIQuestion {
  question_text: string;
  question_text_en: string;
  type: string;
  difficulty: string;
  marks: number;
  options: string[];
  topic: string;
  has_figure: boolean;
  explanation: string;
  subtopic: string;
}

// What we hand back to the caller after parsing
export interface GeneratedMCQ extends MCQQuestion {
  explanation: string;
}

export interface GeneratedShort extends ShortQuestion {
  explanation: string;
}

export interface GeneratedCreative extends CreativeQuestion {
  explanation: string;
}

export type GeneratedQuestion =
  | GeneratedMCQ
  | GeneratedShort
  | GeneratedCreative;

export interface UseAIGenerateResult {
  loading: boolean;
  error: string | null;
  generatedMCQs: GeneratedMCQ[];
  generatedShorts: GeneratedShort[];
  generatedCreatives: GeneratedCreative[];
  generate: (params: AIGenerateParams) => Promise<void>;
  clearResults: () => void;
}

const AI_ENDPOINT =
  "https://neo-lms-ai-production.up.railway.app/api/generate/questions";

// ------------------------------------------------------------------
// Parsers
// ------------------------------------------------------------------

// Strip "a) " / "b) " prefix and return plain text
function stripOptionPrefix(raw: string): string {
  return raw.replace(/^[a-dA-Dক-ঘ]\)\s*/, "").trim();
}

function parseMCQ(raw: RawAIQuestion, serial: number): GeneratedMCQ {
  // Map up to 4 options onto ক খ গ ঘ
  const options = MCQ_OPTION_LABELS.map((label, i) => ({
    id: label.id,
    label: label.label,
    text: raw.options[i] ? stripOptionPrefix(raw.options[i]) : "",
  }));

  return {
    id: uuid(),
    serial,
    text: raw.question_text,
    options,
    correctOption: "ka", // API does not return correct answer; teacher picks
    source: "database" as const,
    explanation: raw.explanation,
  };
}

function parseShort(raw: RawAIQuestion, serial: number): GeneratedShort {
  return {
    id: uuid(),
    serial,
    text: raw.question_text,
    marks: raw.marks,
    source: "database" as const,
    explanation: raw.explanation,
  };
}

// Creative: the entire question including ক) খ) গ) ঘ) is in question_text.
// We split on Bengali sub-question markers.
function parseCreative(raw: RawAIQuestion, serial: number): GeneratedCreative {
  const text = raw.question_text;

  // Match ক) খ) গ) ঘ) markers — also handle ka) kha) etc. just in case
  const markerRegex = /(?:ক\)|খ\)|গ\)|ঘ\))/g;
  const markers = [...text.matchAll(markerRegex)];

  let stimulus = text;
  const subQuestions: CreativeSubQuestion[] = [];

  const labelMap: Record<string, CreativeSubQuestion["label"]> = {
    "ক)": "ka",
    "খ)": "kha",
    "গ)": "ga",
    "ঘ)": "gha",
  };

  const marksMap: Record<CreativeSubQuestion["label"], 1 | 2 | 3 | 4> = {
    ka: 1,
    kha: 2,
    ga: 3,
    gha: 4,
  };

  if (markers.length > 0) {
    // Everything before the first marker is the stimulus
    stimulus = text.slice(0, markers[0].index).trim();

    markers.forEach((match, i) => {
      const markerStr = match[0];
      const start = (match.index ?? 0) + markerStr.length;
      const end = markers[i + 1]?.index ?? text.length;
      const subText = text.slice(start, end).trim();
      const label = labelMap[markerStr] ?? "ka";

      subQuestions.push({
        label,
        text: subText,
        marks: marksMap[label],
      });
    });
  }

  // Ensure all 4 sub-questions exist (fill missing ones with empty)
  const allLabels: CreativeSubQuestion["label"][] = ["ka", "kha", "ga", "gha"];
  const filledSubs: CreativeSubQuestion[] = allLabels.map((label) => {
    const found = subQuestions.find((sq) => sq.label === label);
    return found ?? { label, text: "", marks: marksMap[label] };
  });

  return {
    id: uuid(),
    serial,
    stimulus,
    subQuestions: filledSubs,
    source: "database" as const,
    explanation: raw.explanation,
  };
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

export function useAIGenerate(): UseAIGenerateResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedMCQs, setGeneratedMCQs] = useState<GeneratedMCQ[]>([]);
  const [generatedShorts, setGeneratedShorts] = useState<GeneratedShort[]>([]);
  const [generatedCreatives, setGeneratedCreatives] = useState<
    GeneratedCreative[]
  >([]);

  const clearResults = useCallback(() => {
    setGeneratedMCQs([]);
    setGeneratedShorts([]);
    setGeneratedCreatives([]);
    setError(null);
  }, []);

  const generate = useCallback(async (params: AIGenerateParams) => {
    setLoading(true);
    setError(null);
    clearResults();

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          text || `Server returned ${res.status}`
        );
      }

      const json = await res.json();

      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("API থেকে অবৈধ response এসেছে");
      }

      const raw: RawAIQuestion[] = json.data;

      if (params.type === "mcq") {
        setGeneratedMCQs(raw.map((q, i) => parseMCQ(q, i + 1)));
      } else if (params.type === "short") {
        setGeneratedShorts(raw.map((q, i) => parseShort(q, i + 1)));
      } else if (params.type === "creative" || params.type === "broad") {
        setGeneratedCreatives(raw.map((q, i) => parseCreative(q, i + 1)));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI প্রশ্ন তৈরিতে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }, [clearResults]);

  return {
    loading,
    error,
    generatedMCQs,
    generatedShorts,
    generatedCreatives,
    generate,
    clearResults,
  };
}
