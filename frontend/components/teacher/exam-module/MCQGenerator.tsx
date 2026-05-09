"use client";

import { useState } from "react";
import { FileText, Clock, BarChart2, Target, Globe } from "lucide-react";
import QuizOverview, { overviewIcons } from "../shared/QuizOverview";
import { SelectField, TextAreaField, CheckboxField, PageHeader } from "../shared/FormFields";

const COURSES = [
  { label: "Physics – Class 10", value: "physics-10" },
  { label: "Biology – Class 10", value: "biology-10" },
  { label: "Chemistry – Class 10", value: "chemistry-10" },
  { label: "Math – Class 10", value: "math-10" },
];

const TOPICS = [
  { label: "Newton's Laws of Motion", value: "newtons-laws" },
  { label: "Thermodynamics", value: "thermodynamics" },
  { label: "Optics", value: "optics" },
  { label: "Electricity", value: "electricity" },
];

const DIFFICULTIES = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30].map((n) => ({
  label: String(n),
  value: String(n),
}));

const BLOOMS = [
  { label: "Remember", value: "remember" },
  { label: "Understand", value: "understand" },
  { label: "Apply", value: "apply" },
  { label: "Analyze", value: "analyze" },
  { label: "Evaluate", value: "evaluate" },
  { label: "Create", value: "create" },
];

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Bangla", value: "bn" },
];

// Sample preview questions
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "According to Newton's First Law of Motion, an object will remain at rest or in uniform motion in a straight line unless acted upon by?",
    difficulty: "Medium",
    options: [
      { key: "A", text: "A balanced force" },
      { key: "B", text: "An unbalanced external force" },
      { key: "C", text: "Gravitational force" },
      { key: "D", text: "Frictional force" },
    ],
    answer: "B",
    explanation: "Newton's First Law (Law of Inertia) states that an object stays at rest or in uniform motion unless acted upon by an unbalanced external force.",
  },
  {
    id: 2,
    text: "If a net external force acts on an object, the object will?",
    difficulty: "Medium",
    options: [
      { key: "A", text: "Move with constant velocity" },
      { key: "B", text: "Change its velocity" },
      { key: "C", text: "Remain at rest" },
      { key: "D", text: "Move in a circular path" },
    ],
    answer: "B",
    explanation: "According to Newton's Second Law, a net force causes acceleration, meaning the object's velocity will change.",
  },
];

export default function MCQGenerator() {
  const [course, setCourse] = useState("physics-10");
  const [topic, setTopic] = useState("newtons-laws");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [bloomsLevel, setBloomsLevel] = useState("apply");
  const [language, setLanguage] = useState("en");
  const [instructions, setInstructions] = useState("");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [openExplanation, setOpenExplanation] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsGenerating(false);
  };

  const difficultyLabel = DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? "Medium";
  const bloomsLabel = BLOOMS.find((b) => b.value === bloomsLevel)?.label ?? "Apply";
  const langLabel = LANGUAGES.find((l) => l.value === language)?.label ?? "English";
  const estimatedTime = parseInt(questionCount) * 1.5;

  const overviewItems = [
    { icon: overviewIcons.questions, label: "Total Questions", value: questionCount },
    { icon: overviewIcons.time, label: "Estimated Time", value: `${estimatedTime} min` },
    { icon: overviewIcons.difficulty, label: "Difficulty", value: difficultyLabel },
    { icon: overviewIcons.bloom, label: "Bloom's Level", value: bloomsLabel },
    { icon: overviewIcons.language, label: "Language", value: langLabel },
  ];

  return (
    <div>
      <PageHeader
        icon={<FileText className="w-5 h-5" />}
        title="MCQ Quiz Generator"
        subtitle="Generate AI-based multiple choice quizzes for your class."
        onGenerate={handleGenerate}
        onSave={() => {}}
        isGenerating={isGenerating}
      />

      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Left: Config */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Quiz Configuration</h2>

            <div className="grid grid-cols-3 gap-4">
              <SelectField label="Course" required value={course} onChange={setCourse} options={COURSES} />
              <SelectField label="Topic" required value={topic} onChange={setTopic} options={TOPICS} />
              <SelectField label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
              <SelectField label="Number of Questions" required value={questionCount} onChange={setQuestionCount} options={QUESTION_COUNTS} />
              <SelectField label="Bloom's Level" value={bloomsLevel} onChange={setBloomsLevel} options={BLOOMS} />
              <SelectField label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
            </div>

            <div className="mt-4">
              <TextAreaField
                label="Additional Instructions (Optional)"
                value={instructions}
                onChange={setInstructions}
                placeholder="E.g., Focus on real-life examples, avoid tricky wording, include numerical problems if possible..."
              />
            </div>

            <div className="mt-4 flex items-center gap-8">
              <CheckboxField label="Include answer key" description="Show correct answers" checked={includeAnswerKey} onChange={setIncludeAnswerKey} />
              <CheckboxField label="Shuffle options" description="Randomize option order" checked={shuffleOptions} onChange={setShuffleOptions} />
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

                  <div className="grid grid-cols-4 gap-2 ml-9">
                    {q.options.map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                          selectedAnswers[q.id] === opt.key
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.key}
                          checked={selectedAnswers[q.id] === opt.key}
                          onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                          className="accent-indigo-600"
                        />
                        <span className="font-medium">{opt.key}</span>
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>

                  {includeAnswerKey && (
                    <div className="ml-9 mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Answer: <strong className="text-slate-700">{q.answer}</strong>
                      </div>
                      {includeExplanation && (
                        <button
                          onClick={() => setOpenExplanation(openExplanation === q.id ? null : q.id)}
                          className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 transition-colors"
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

            <button
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Show all {questionCount} questions
              <svg className={`w-4 h-4 transition-transform ${showAllQuestions ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Overview */}
        <QuizOverview
          items={overviewItems}
          tip="Use specific topics and instructions to get more accurate and relevant questions."
        />
      </div>
    </div>
  );
}