"use client";

import { useState, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import QuizOverview, { overviewIcons } from "../shared/QuizOverview";
import { SelectField, TextAreaField, CheckboxField, PageHeader } from "../shared/FormFields";

const COURSES = [
  { label: "Biology – Class 10", value: "biology-10" },
  { label: "Physics – Class 10", value: "physics-10" },
  { label: "Chemistry – Class 10", value: "chemistry-10" },
];

const TOPICS = [
  { label: "Life Processes in Plants", value: "life-plants" },
  { label: "Human Anatomy", value: "human-anatomy" },
  { label: "Newton's Laws of Motion", value: "newtons-laws" },
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
    text: "In the given image of a plant, which part labeled 'A' is responsible for photosynthesis?",
    difficulty: "Medium",
    options: [
      { key: "A", text: "Root (D)" },
      { key: "B", text: "Leaf (A)" },
      { key: "C", text: "Stem (B)" },
      { key: "D", text: "Flower (C)" },
    ],
    answer: "B",
    explanation: "The leaf (labeled A) is the primary site of photosynthesis where chlorophyll captures light energy.",
  },
  {
    id: 2,
    text: "In the given diagram of a flower, which part is the female reproductive organ?",
    difficulty: "Medium",
    options: [
      { key: "A", text: "A (Stamen)" },
      { key: "B", text: "B (Anther)" },
      { key: "C", text: "C (Pistil)" },
      { key: "D", text: "D (Petal)" },
    ],
    answer: "C",
    explanation: "The pistil (C) is the female reproductive organ of a flower, consisting of the stigma, style, and ovary.",
  },
];

export default function ImageBasedGenerator() {
  const [course, setCourse] = useState("biology-10");
  const [topic, setTopic] = useState("life-plants");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [language, setLanguage] = useState("en");
  const [instructions, setInstructions] = useState("");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [imageCaptionHint, setImageCaptionHint] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [openExplanation, setOpenExplanation] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const difficultyLabel = DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? "Medium";
  const langLabel = LANGUAGES.find((l) => l.value === language)?.label ?? "English";

  const overviewItems = [
    { icon: overviewIcons.questions, label: "Total Questions", value: questionCount },
    { icon: overviewIcons.time, label: "Estimated Time", value: `${parseInt(questionCount) * 1.5} min` },
    { icon: overviewIcons.difficulty, label: "Difficulty", value: difficultyLabel },
    { icon: overviewIcons.type, label: "Question Type", value: "Image Based" },
    { icon: overviewIcons.language, label: "Language", value: langLabel },
  ];

  return (
    <div>
      <PageHeader
        icon={<FileText className="w-5 h-5" />}
        title="Image Based Quiz Generator"
        subtitle="Generate AI-based image-based questions for your class."
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
              <TextAreaField label="Additional Instructions (Optional)" value={instructions} onChange={setInstructions} placeholder="E.g., Focus on concepts shown in the image, include application-based questions." />
            </div>

            {/* Image Upload */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Reference Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-300 transition-colors">
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Reference" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : null}
                <div
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer py-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 text-slate-400" />
                  <p className="text-sm text-slate-500">Drag & drop an image here, or click to upload</p>
                  <p className="text-xs text-slate-400">PNG, JPG, or WebP (Max 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-8">
              <CheckboxField label="Include answer key" description="Show correct answers" checked={includeAnswerKey} onChange={setIncludeAnswerKey} />
              <CheckboxField label="Explanation" description="Provide explanation for answers" checked={includeExplanation} onChange={setIncludeExplanation} />
              <CheckboxField label="Image caption hint" description="Add a short caption for the image" checked={imageCaptionHint} onChange={setImageCaptionHint} />
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
                  <div className="flex gap-4">
                    {/* Placeholder image */}
                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-300 text-xs text-center px-2">
                          <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                            {q.id}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 ml-8">
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
                              name={`img-${q.id}`}
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
                        <div className="ml-8 mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            Answer: <strong className="text-slate-700 ml-1">{q.answer}</strong>
                          </div>
                          {includeExplanation && (
                            <button
                              onClick={() => setOpenExplanation(openExplanation === q.id ? null : q.id)}
                              className="text-indigo-500 hover:text-indigo-700"
                            >
                              Explanation
                            </button>
                          )}
                        </div>
                      )}
                      {openExplanation === q.id && (
                        <div className="ml-8 mt-2 bg-indigo-50 rounded-lg px-3 py-2 text-xs text-indigo-700 leading-relaxed">
                          {q.explanation}
                        </div>
                      )}
                    </div>
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
          items={overviewItems}
          tip="Upload a clear, relevant image to help AI generate accurate and context-aware questions."
        />
      </div>
    </div>
  );
}