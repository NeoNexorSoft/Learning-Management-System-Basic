import { useState, useEffect } from "react";
import api from "@/lib/axios";
import CustomSelect from "@/components/ui/CustomSelect";

export default function GenerateForm({ onGenerate, generating }: any) {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [examType, setExamType] = useState("HSC");
  const [grade, setGrade] = useState("12");
  const [questionType, setQuestionType] = useState("mcq");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [language, setLanguage] = useState("bn");

  // Fetch subjects on mount
  useEffect(() => {
    api.get("/api/taxonomy/subjects")
      .then((res) => setSubjects(res.data.data.subjects || []))
      .catch(() => setSubjects([]));
  }, []);

  // Fetch topics when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    setSelectedTopic("");
    setSelectedSubtopic("");
    setSubtopics([]);

    api
      .post("/api/taxonomy/subjects/topics", { subject: selectedSubject })
      .then((res) => setTopics(res.data.data.topics || []))
      .catch(() => setTopics([]));
  }, [selectedSubject]);

  // Fetch subtopics when topic changes
  useEffect(() => {
    if (!selectedSubject || !selectedTopic) return;
    setSelectedSubtopic("");

    api
      .post("/api/taxonomy/subjects/subtopics", { subject: selectedSubject, topic: selectedTopic })
      .then((res) => setSubtopics(res.data.data.subtopics || []))
      .catch(() => setSubtopics([]));
  }, [selectedSubject, selectedTopic]);

  const handleSubmit = () => {
    if (!selectedSubject || !selectedTopic) return;

    onGenerate({
      subject: selectedSubject,
      topic: selectedTopic,
      subtopic: selectedSubtopic || undefined,
      exam: examType,
      grade,
      type: questionType,
      difficulty,
      count,
      language,
    });
  };

  const labelClass = "block text-slate-400 text-xs font-medium tracking-wide uppercase mb-1.5";
  const inputClass =
    "w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all duration-200";

  return (
    <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">

      {/* Ambient glow blobs — decorative only */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AI Question Generator
        </h2>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        <span className="text-indigo-400 tracking-widest text-xs font-semibold uppercase">
          Generate Questions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Subject */}
        <div>
          <label className={labelClass}>
            Subject <span className="text-indigo-400">*</span>
          </label>
          <CustomSelect
            placeholder="Select subject…"
            value={selectedSubject}
            onChange={setSelectedSubject}
            disabled={generating}
            options={subjects.map((s) => ({ value: s, label: s }))}
          />
        </div>

        {/* Topic — bangla font enabled */}
        <div>
          <label className={labelClass}>
            Topic <span className="text-indigo-400">*</span>
          </label>
          <CustomSelect
            placeholder="Select topic…"
            value={selectedTopic}
            onChange={setSelectedTopic}
            disabled={!selectedSubject || generating}
            bangla={true}
            options={topics.map((t) => ({ value: t, label: t }))}
          />
        </div>

        {/* Subtopic — bangla font enabled */}
        <div>
          <label className={labelClass}>Subtopic</label>
          <CustomSelect
            placeholder="Select subtopic…"
            value={selectedSubtopic}
            onChange={setSelectedSubtopic}
            disabled={!selectedTopic || generating}
            bangla={true}
            options={subtopics.map((s) => ({ value: s, label: s }))}
          />
        </div>

        {/* Exam Type */}
        <div>
          <label className={labelClass}>Exam Type</label>
          <CustomSelect
            value={examType}
            onChange={setExamType}
            disabled={generating}
            options={[
              { value: "SSC", label: "SSC" },
              { value: "HSC", label: "HSC" },
              { value: "Admission", label: "Admission" },
              { value: "General", label: "General" },
            ]}
          />
        </div>

        {/* Grade */}
        <div>
          <label className={labelClass}>Grade</label>
          <CustomSelect
            value={grade}
            onChange={setGrade}
            disabled={generating}
            options={[
              { value: "9", label: "Class 9" },
              { value: "10", label: "Class 10 (SSC)" },
              { value: "11", label: "Class 11" },
              { value: "12", label: "Class 12 (HSC)" },
            ]}
          />
        </div>

        {/* Question Type */}
        <div>
          <label className={labelClass}>Question Type</label>
          <CustomSelect
            value={questionType}
            onChange={setQuestionType}
            disabled={generating}
            options={[
              { value: "mcq", label: "MCQ" },
              { value: "short", label: "Short Answer" },
              { value: "broad", label: "Broad Question" },
              { value: "creative", label: "Creative" },
            ]}
          />
        </div>

        {/* Difficulty — colored options */}
        <div>
          <label className={labelClass}>Difficulty</label>
          <CustomSelect
            value={difficulty}
            onChange={setDifficulty}
            disabled={generating}
            options={[
              { value: "easy",   label: "Easy",   color: "text-emerald-400" },
              { value: "medium", label: "Medium", color: "text-amber-400" },
              { value: "hard",   label: "Hard",   color: "text-rose-400" },
            ]}
          />
        </div>

        {/* Count — clamped between 1 and 8 */}
        <div>
          <label className={labelClass}>Count</label>
          <input
            type="number"
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))
            }
            min="1"
            max="8"
            className={inputClass}
            disabled={generating}
          />
        </div>

        {/* Language */}
        <div>
          <label className={labelClass}>Language</label>
          <CustomSelect
            value={language}
            onChange={setLanguage}
            disabled={generating}
            options={[
              { value: "bn", label: "বাংলা (Bengali)" },
              { value: "en", label: "English" },
            ]}
          />
        </div>

      </div>

      {/* Submit button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={!selectedSubject || !selectedTopic || generating}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <>
              {/* Loading spinner */}
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating…
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>GENERATE QUESTIONS</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}