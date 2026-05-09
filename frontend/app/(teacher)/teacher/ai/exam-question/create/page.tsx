import QuestionPaperBuilder from "@/components/teacher/question-paper/QuestionPaperBuilder";

export const metadata = {
    title: "নতুন প্রশ্নপত্র তৈরি করুন",
};

export default function NewQuestionPaperPage() {
    return <QuestionPaperBuilder mode="new" />;
}