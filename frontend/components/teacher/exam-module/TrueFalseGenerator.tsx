"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import QuizOverview, { overviewIcons } from "../shared/QuizOverview";
import { SelectField, TextAreaField, CheckboxField, PageHeader } from "../shared/FormFields";

const COURSES = [
  { label: "Physics – Class 10", value: "physics-10" },
  { label: "Biology – Class 10", value: "biology-10" },
  { label: "Chemistry – Class 10", value: "chemistry-10" },
];

const TOPICS = [
  { label: "Newton's Laws of Motion", value: "newtons-laws" },
  { label: "Thermodynamics", value: "thermodynamics" },
  { label: "Optics", value: "optics" },
];

const DIFFICULTIES = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const QUESTION_COUNTS = [5, 10, 15, 20].map((n) => ({ label: String(n), value: String(n) }));
const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Bangla", value: "bn" },
];

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "According to Newton's First Law of Motion, an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.",
    difficulty: "Medium",
    answer: true,
    explanation: "This is a direct statement of Newton's First Law of Motion, also known as the Law of Inertia.",
  },
  {
    id: 2,
    text: "If the net external force on an object is zero, the object will change its velocity.",
    difficulty: "Medium",
    answer: false,
    explanation: "If net force is zero, the object remains at rest or moves with constant velocity (no change in velocity).",
  },
];

export default function TrueFalseGenerator() {
  const [course, setCourse] = useState("physics-10");
  const [topic, setTopic] = useState("newtons-laws");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [language, setLanguage] = useState("en");
  const [instructions, setInstructions] = useState("");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [shuffleStatements, setShuffleStatements] = useState(true);
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, boolean | null>>({});
  const [openExplanation, setOpenExplanation] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsGenerating(false);
  };

  const difficultyLabel = DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? "Medium";
  const langLabel = LANGUAGES.find((l) => l.value === language)?.label ?? "English";

  const overviewItems = [
    { icon: overviewIcons.questions, label: "Total Questions", value: questionCount },
    { icon: overviewIcons.time, label: "Estimated Time", value: `${parseInt(questionCount) * 1.5} min` },
    { icon: overviewIcons.difficulty, label: "Difficulty", value: difficultyLabel },
    { icon: overviewIcons.type, label: "Question Type", value: "True / False" },
    { icon: overviewIcons.language, label: "Language", value: langLabel },
  ];

  return (
    <div>
      <PageHeader
        icon={<FileText className="w-5 h-5" />}
        title="True / False Quiz Generator"
        subtitle="Generate AI-based true or false quizzes for your class."
        onGenerate={handleGenerate}
        onSave={() => {}}
        isGenerating={isGenerating}
      />

      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Quiz Configuration</h2>
            <div className="grid grid-cols-3 gap-4">
              <SelectField label="Course" required value={course} onChange={setCourse} options={COURSES} />
              <SelectField label="Topic" required value={topic} onChange={setTopic} options={TOPICS} />
              <SelectField label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
              <SelectField label="Number of Questions" required value={questionCount} onChange={setQuestionCount} options={QUESTION_COUNTS} />
              <SelectField label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
            </div>
            <div className="mt-4">
              <TextAreaField label="Additional Instructions (Optional)" value={instructions} onChange={setInstructions} placeholder="E.g., Focus on real-life examples, avoid tricky wording..." />
            </div>
            <div className="mt-4 flex items-center gap-8">
              <CheckboxField label="Include answer key" description="Show correct answers" checked={includeAnswerKey} onChange={setIncludeAnswerKey} />
              <CheckboxField label="Shuffle statements" description="Randomize question order" checked={shuffleStatements} onChange={setShuffleStatements} />
              <CheckboxField label="Explanation" description="Provide explanation for answers" checked={includeExplanation} onChange={setIncludeExplanation} />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Preview (2 of {questionCount} Questions)
            </h2>
            <div className="space-y-5">
              {SAMPLE_QUESTIONS.map((q) => (
                <div key={q.id} className="border border-slate-100 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                        {q.id}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex gap-3 ml-9">
                    {[true, false].map((val) => (
                      <label
                        key={String(val)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium ${
                          selectedAnswers[q.id] === val
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`tf-${q.id}`}
                          checked={selectedAnswers[q.id] === val}
                          onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: val }))}
                          className="accent-indigo-600"
                        />
                        {val ? "True" : "False"}
                      </label>
                    ))}
                  </div>

                  {includeAnswerKey && (
                    <div className="ml-9 mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Answer: <strong className={q.answer ? "text-emerald-600" : "text-red-500"}>{q.answer ? "True" : "False"}</strong>
                      </div>
                      {includeExplanation && (
                        <button
                          onClick={() => setOpenExplanation(openExplanation === q.id ? null : q.id)}
                          className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Explanation
                        </button>
                      )}
                    </div>
                  )}
                  {openExplanation === q.id && (
                    <div className="ml-9 mt-2 bg-indigo-50 rounded-lg px-3 py-2 text-xs text-indigo-700 leading-relaxed">
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              Show all {questionCount} questions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <QuizOverview items={overviewItems} tip="Use specific topics and instructions to get more accurate and relevant questions." />
      </div>
    </div>
  );
}