"use client";

import { useState } from "react";
import { ClipboardList, MoreVertical } from "lucide-react";
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

const ASSIGNMENT_TYPES = [
  { label: "Homework", value: "homework" },
  { label: "Classwork", value: "classwork" },
  { label: "Project", value: "project" },
  { label: "Lab Report", value: "lab-report" },
];

const TASK_COUNTS = [3, 5, 7, 10].map((n) => ({ label: String(n), value: String(n) }));
const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Bangla", value: "bn" },
];

const SAMPLE_TASKS = [
  {
    id: 1,
    text: "Explain Newton's First Law of Motion with a real-life example. How does this law apply to everyday situations?",
    rubric: "Define the law accurately, provide a relevant example, and explain the application clearly.",
    marks: 10,
    type: "Essay",
    duration: "15 min",
  },
  {
    id: 2,
    text: "A hockey puck of mass 0.20 kg is initially at rest on a frictionless surface. It is struck with a force of 30 N for 2 seconds. Calculate the final velocity of the puck.",
    rubric: "Identify knowns, apply F = ma to find acceleration, then use v = u + at to calculate final velocity with correct units.",
    marks: 15,
    type: "Problem Solving",
    duration: "20 min",
  },
];

export default function AssignmentGenerator() {
  const [course, setCourse] = useState("physics-10");
  const [topic, setTopic] = useState("newtons-laws");
  const [difficulty, setDifficulty] = useState("medium");
  const [assignmentType, setAssignmentType] = useState("homework");
  const [taskCount, setTaskCount] = useState("5");
  const [language, setLanguage] = useState("en");
  const [dueDate, setDueDate] = useState("2025-05-30");
  const [totalMarks, setTotalMarks] = useState("50");
  const [instructions, setInstructions] = useState(
    "Focus on real-life examples and application-based questions. Encourage step-by-step solutions."
  );
  const [includeRubric, setIncludeRubric] = useState(true);
  const [modelAnswerGuide, setModelAnswerGuide] = useState(true);
  const [allowFileSubmission, setAllowFileSubmission] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsGenerating(false);
  };

  const difficultyLabel = DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? "Medium";
  const typeLabel = ASSIGNMENT_TYPES.find((t) => t.value === assignmentType)?.label ?? "Homework";
  const langLabel = LANGUAGES.find((l) => l.value === language)?.label ?? "English";
  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  const overviewItems = [
    { icon: overviewIcons.questions, label: "Total Tasks", value: taskCount },
    { icon: overviewIcons.time, label: "Estimated Duration", value: "60 min" },
    { icon: overviewIcons.difficulty, label: "Difficulty", value: difficultyLabel },
    { icon: overviewIcons.type, label: "Assignment Type", value: typeLabel },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: "Due Date",
      value: formattedDue,
    },
    { icon: overviewIcons.language, label: "Language", value: langLabel },
  ];

  return (
    <div>
      <PageHeader
        icon={<ClipboardList className="w-5 h-5" />}
        title="AI Assignment Generator"
        subtitle="Generate AI-based assignments for your class."
        onGenerate={handleGenerate}
        onSave={() => {}}
        saveLabel="Save as Assignment"
        isGenerating={isGenerating}
      />

      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Assignment Configuration</h2>
            <div className="grid grid-cols-3 gap-4">
              <SelectField label="Course" required value={course} onChange={setCourse} options={COURSES} />
              <SelectField label="Topic" required value={topic} onChange={setTopic} options={TOPICS} />
              <SelectField label="Assignment Type" required value={assignmentType} onChange={setAssignmentType} options={ASSIGNMENT_TYPES} />
              <SelectField label="Difficulty" required value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />

              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Due Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Total Marks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Total Marks <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  min="1"
                />
              </div>

              <SelectField label="Number of Questions / Tasks" required value={taskCount} onChange={setTaskCount} options={TASK_COUNTS} />
              <SelectField label="Language" required value={language} onChange={setLanguage} options={LANGUAGES} />
            </div>
            <div className="mt-4">
              <TextAreaField label="Additional Instructions (Optional)" value={instructions} onChange={setInstructions} placeholder="Focus on real-life examples and application-based questions..." />
            </div>
            <div className="mt-4 flex items-center gap-8">
              <CheckboxField label="Include grading rubric" description="Provide evaluation criteria" checked={includeRubric} onChange={setIncludeRubric} />
              <CheckboxField label="Model answer guide" description="Include model answers" checked={modelAnswerGuide} onChange={setModelAnswerGuide} />
              <CheckboxField label="Allow file submission" description="Students can upload files" checked={allowFileSubmission} onChange={setAllowFileSubmission} />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Preview (2 of {taskCount} Tasks)
            </h2>
            <div className="space-y-4">
              {SAMPLE_TASKS.map((task) => (
                <div key={task.id} className="border border-slate-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-semibold flex-shrink-0">
                      {task.id}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed flex-1 pr-4">{task.text}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-white bg-indigo-600 px-2.5 py-1 rounded-full">
                            {task.marks} Marks
                          </span>
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {includeRubric && (
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          <span className="font-medium text-slate-600">Rubric / Expected:</span> {task.rubric}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {task.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {task.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800">
              Show all {taskCount} tasks
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <QuizOverview
          title="Assignment Overview"
          items={overviewItems}
          tip="Use clear instructions and rubrics to help students understand expectations and submit quality work."
        />
      </div>
    </div>
  );
}