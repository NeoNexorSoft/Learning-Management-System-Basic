// app/dashboard/question-papers/[id]/edit/page.tsx
// Server component - fetches the paper, then passes data to builder as initialState

import { notFound } from "next/navigation";
import { PaperState } from "@/types/question-paper.types";
import QuestionPaperBuilder from "@/components/teacher/question-paper/QuestionPaperBuilder";

interface EditPageProps {
    params: { id: string };
}

async function fetchPaper(id: string): Promise<PaperState | null> {
    // Replace base URL with your actual API base
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/question-papers/${id}`,
        {
            // Disable caching so we always get the latest version
            cache: "no-store",
        }
    );

    if (!res.ok) return null;

    const data = await res.json();

    // Map the API response to PaperState shape
    // Adjust field names if your API returns differently
    const state: Partial<PaperState> = {
        info: data.info,
        mcqSection: data.mcqSection ?? { passages: [], questions: [] },
        creativeQuestions: data.creativeQuestions ?? [],
        existingPaperId: id,
    };

    return state as PaperState;
}

export default async function EditQuestionPaperPage({ params }: EditPageProps) {
    const paper = await fetchPaper(params.id);

    if (!paper) {
        notFound();
    }

    return <QuestionPaperBuilder mode="edit" initialState={paper} />;
}