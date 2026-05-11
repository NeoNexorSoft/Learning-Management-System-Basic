"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
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

const TIME_LIMITS = [
  { label: "10 min", value: "10" },
  { label: "15 min", value: "15" },
  { label: "20 min", value: "20" },
  { label: "30 min", value: "30" },
  { label: "45 min", value: "45" },
  { label: "60 min", value: "60" },
];

const QUESTION_MIXES = [
  { label: "MCQ Only", value: "mcq" },
  { label: "MCQ + True/False", value: "mcq-tf" },
  { label: "MCQ + Fill in the Blanks", value: "mcq-fitb" },
  { label: "All Types", value: "all" },
];

const ATTEMPT_MODES = [
  { label: "Practice (Self-paced)", value: "practice" },
  { label: "Timed Exam", value: "timed" },
];

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "According to Newton's First Law of Motion, an object will remain at rest or in uniform motion in a straight line unless acted upon by?",
    difficulty: "Medium",
    type: "mcq",
    options: [
      { key: "A", text: "A balanced force" },
      { key: "B", text: "An unbalanced external force" },
      { key: "C", text: "Gravitational force" },
      { key: "D", text: "Frictional force" },
    ],
    answer: "B",
    status: "correct",
  },
  {
    id: 2,
    text: "If a net external force acts on an object, the object will?",
    difficulty: "Medium",
    type: "mcq",
    options: [
      { key: "A", text: "Move with constant velocity" },
      { key: "B", text: "Change its velocity" },
      { key: "C", text: "Remain at rest" },
      { key: "D", text: "Move in a circular path" },
    ],
    answer: "B",
    status: "correct",
  },
  {
    id: 3,
    text: "Which of the following is the SI unit of force?",
    difficulty: "Easy",
    type: "mcq",
    options: [
      { key: "A", text: "Joule" },
      { key: "B", text: "Newton" },
      { key: "C", text: "Watt" },
      { key: "D", text: "Pascal" },
    ],
    answer: "B",
    status: "feedback",
  },
];

export default function SelfTestGenerator() {
  const [course, setCourse] = useState("physics-10");
  const [topic, setTopic] = useState("newtons-laws");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [timeLimit, setTimeLimit] = useState("15");
  const [language, setLanguage] = useState("en");
  const [questionMix, setQuestionMix] = useState("mcq-tf");
  const [attemptMode, setAttemptMode] = useState("practice");
  const [instructions, setInstructions] = useState(
    "Focus on application-based problems and conceptual understanding."
  );
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [showScoreAtEnd, setShowScoreAtEnd] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsGenerating(false);
  };

  const difficultyLabel = DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? "Medium";
  const mixLabel = QUESTION_MIXES.find((m) => m.value === questionMix)?.label ?? "MCQ + True/False";
  const modeLabel = ATTEMPT_MODES.find((m) => m.value === attemptMode)?.label ?? "Practice (Self-paced)";
  const langLabel = LANGUAGES.find((l) => l.value === language)?.label ?? "English";

  const overviewItems = [
    { icon: overviewIcons.questions, label: "Total Questions", value: questionCount },
    { icon: overviewIcons.time, label: "Estimated Time", value: `${timeLimit} min` },
    { icon: overviewIcons.difficulty, label: "Difficulty", value: difficultyLabel },
    { icon: overviewIcons.type, label: "Question Mix", value: mixLabel },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      label: "Attempt Mode",
      value: modeLabel,
    },
    { icon: overviewIcons.language, label: "Language", value: langLabel },
  ];

  return (
    <div>
      <PageHeader
        icon={<FlaskConical className="w-5 h-5" />}
        title="AI Self Test Generator"
        subtitle="Create AI-powered self tests for practice and revision."
        onGenerate={handleGenerate}
        onSave={() => {}}
        saveLabel="Start Self Test"
        isGenerating={isGenerating}
      />

      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Self Test Configuration</h2>
            <div className="grid grid-cols-3 gap-4">
              <SelectField label="Course" required value={course} onChange={setCourse} options={COURSES} />
              <SelectField label="Topic" required value={topic} onChange={setTopic} options={TOPICS} />
              <SelectField label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
              <SelectField label="Number of Questions" required value={questionCount} onChange={setQuestionCount} options={QUESTION_COUNTS} />
              <SelectField label="Time Limit" required value={timeLimit} onChange={setTimeLimit} options={TIME_LIMITS} />
              <SelectField label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
              <SelectField label="Question Mix" required value={questionMix} onChange={setQuestionMix} options={QUESTION_MIXES} />
            </div>
            <div className="mt-4">
              <TextAreaField label="Additional Instructions (Optional)" value={instructions} onChange={setInstructions} placeholder="Focus on application-based problems..." />
            </div>
            <div className="mt-4 flex items-center gap-8">
              <CheckboxField label="Instant feedback" description="Get feedback after each question" checked={instantFeedback} onChange={setInstantFeedback} />
              <CheckboxField label="Show score at the end" description="View total score and performance" checked={showScoreAtEnd} onChange={setShowScoreAtEnd} />
              <CheckboxField label="Shuffle questions" description="Randomize question order" checked={shuffleQuestions} onChange={setShuffleQuestions} />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Preview (3 of {questionCount} Questions)
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        q.difficulty === "Medium" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {q.difficulty}
                      </span>
                      {instantFeedback && (
                        q.status === "correct" ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Correct Answer
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Feedback
                          </span>
                        )
                      )}
                    </div>
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
                          name={`st-${q.id}`}
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
                </div>
              ))}
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800">
              Show all {questionCount} questions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <QuizOverview
          title="Self Test Overview"
          items={overviewItems}
          tip="Self tests are great for exam preparation. You can review your answers and explanations anytime."
        />
      </div>
    </div>
  );
}