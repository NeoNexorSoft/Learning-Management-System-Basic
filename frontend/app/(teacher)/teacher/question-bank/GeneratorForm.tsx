import { useState, useEffect } from "react";
import api from "@/lib/axios"

export default function GenerateForm({ onGenerate, generating }:any) {
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

  // Fetch subjects (now returns array of strings)
  useEffect(() => {
    api.get("/api/taxonomy/subjects")
      .then((res) => setSubjects(res.data.data.subjects || []))
      .catch(() => setSubjects([]));
  }, []);

  // Fetch topics when subject changes (using subject name, not ID)
  useEffect(() => {
    if (!selectedSubject) return;
    setSelectedTopic("");
    setSelectedSubtopic("");
    setSubtopics([]);

    api
      .post("/api/taxonomy/subjects/topics",{subject:selectedSubject})
      .then((res) => setTopics(res.data.data.topics || []))
      .catch(() => setTopics([]));
  }, [selectedSubject]);

  // Fetch subtopics when topic changes (using topic name)
  useEffect(() => {
    if (!selectedSubject || !selectedTopic) return;
    setSelectedSubtopic("");

    api
      .post("/api/taxonomy/subjects/subtopics",{subject:selectedSubject, topic:selectedTopic})
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

  const selectClass =
    "w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors appearance-none cursor-pointer";
  const inputClass =
    "w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors";
  const labelClass = "block text-xs text-text-secondary mb-1.5 font-mono";

  return (
    <div className='bg-bg-secondary border border-bg-tertiary rounded-xl p-6'>
      <h2 className='text-sm font-mono uppercase tracking-widest text-accent-primary mb-4'>
        Generate Questions
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Subject */}
        <div>
          <label className={labelClass}>Subject *</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={selectClass}
            disabled={generating}>
            <option value=''>Select subject…</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div>
          <label className={labelClass}>Topic *</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedSubject || generating}
            className={`${selectClass} disabled:opacity-40`}>
            <option value=''>Select topic…</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Subtopic */}
        <div>
          <label className={labelClass}>Subtopic</label>
          <select
            value={selectedSubtopic}
            onChange={(e) => setSelectedSubtopic(e.target.value)}
            disabled={!selectedTopic || generating}
            className={`${selectClass} disabled:opacity-40`}>
            <option value=''>Select subtopic…</option>
            {subtopics.map((subtopic) => (
              <option key={subtopic} value={subtopic}>
                {subtopic}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Type */}
        <div>
          <label className={labelClass}>Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className={selectClass}
            disabled={generating}>
            <option value='SSC'>SSC</option>
            <option value='HSC'>HSC</option>
            <option value='Admission'>Admission</option>
            <option value='General'>General</option>
          </select>
        </div>

        {/* Grade */}
        <div>
          <label className={labelClass}>Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={selectClass}
            disabled={generating}>
            <option value='9'>Class 9</option>
            <option value='10'>Class 10 (SSC)</option>
            <option value='11'>Class 11</option>
            <option value='12'>Class 12 (HSC)</option>
          </select>
        </div>

        {/* Question Type */}
        <div>
          <label className={labelClass}>Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className={selectClass}
            disabled={generating}>
            <option value='mcq'>MCQ</option>
            <option value='short'>Short Answer</option>
            <option value='broad'>Broad Question</option>
            <option value='creative'>Creative</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className={labelClass}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={selectClass}
            disabled={generating}>
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </select>
        </div>

        {/* Count */}
        <div>
          <label className={labelClass}>Count</label>
          <input
            type='number'
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))
            }
            min='1'
            max='8'
            className={inputClass}
            disabled={generating}
          />
        </div>

        {/* Language */}
        <div>
          <label className={labelClass}>Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={selectClass}
            disabled={generating}>
            <option value='bn'>বাংলা (Bengali)</option>
            <option value='en'>English</option>
          </select>
        </div>
      </div>

      <div className='flex justify-end mt-4'>
        <button
          onClick={handleSubmit}
          disabled={!selectedSubject || !selectedTopic || generating}
          className='px-6 py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'>
          {generating ? (
            <>
              <span className='animate-spin inline-block w-3.5 h-3.5 border-2 border-bg-primary border-t-transparent rounded-full' />
              Generating…
            </>
          ) : (
            "⚡ Generate Questions"
          )}
        </button>
      </div>
    </div>
  );
}
