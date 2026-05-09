import { motion } from "framer-motion";

const parseOptions = (options) => {
  if (!options) return [];
  try {
    let parsed = options;
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "object") return Object.entries(parsed).map(([k, v]) => `${k}. ${v}`);
    return [];
  } catch {
    return [];
  }
};

export default function GeneratedQuestionCard({ question, language = "bn", onSave, onRemove, onEdit }) {
  const getLocalText = (field) => {
    if (!question) return "";
    if (language === "bn" && question[`${field}_bn`]) return question[`${field}_bn`];
    if (language === "en" && question[`${field}_en`]) return question[`${field}_en`];
    return question[field] || "";
  };

  if (!question) return null;

  const questionText = question.question_text || "";
  const explanation = question.explanation || "";
  const isMCQ = question.type === "mcq";

  const getStatusBadge = () => {
    if (question.error) return <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">Error</span>;
    if (question.saving) return <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-full">Saving...</span>;
    if (question.saved) return <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full">Saved</span>;
    return <span className="px-2 py-1 text-xs font-semibold bg-slate-700 text-slate-400 rounded-full">Unsaved</span>;
  };

  const getTypeColor = () => {
    switch (question.type) {
      case "mcq": return "bg-indigo-500/20 text-indigo-400";
      case "short": return "bg-violet-500/20 text-violet-400";
      case "broad": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-slate-700 text-slate-400";
    }
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case "easy": return "bg-green-500/20 text-green-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "hard": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-700 text-slate-400";
    }
  };

  const options = parseOptions(question.options);
  const correctAnswer = language === "bn" ? question.answer_bn : question.answer;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor()}`}>{question.type?.toUpperCase() || "QUESTION"}</span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor()}`}>{question.difficulty || "Medium"}</span>
          {getStatusBadge()}
        </div>

        <p className="text-slate-100 font-medium leading-relaxed">{questionText}</p>

        {isMCQ && options.length > 0 && (
          <div className="space-y-2 mt-3">
            {options.map((option, idx) => {
              const isCorrect = option === correctAnswer || option.includes(correctAnswer) || String(correctAnswer).toLowerCase() === String.fromCharCode(97 + idx);
              return (
                <div key={idx} className={`p-2 rounded-lg text-sm ${isCorrect ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-slate-900 border border-slate-700 text-slate-400"}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </div>
              );
            })}
          </div>
        )}

        {explanation && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">Explanation</p>
            <p className="text-xs text-slate-400">{explanation}</p>
          </div>
        )}

        {question.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-red-400">{question.error}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={() => onEdit(question)} className="flex-1 px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">Edit</button>
          <button onClick={() => onSave(question)} disabled={question.saved || question.saving} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${question.saved ? "bg-green-500/20 text-green-400 cursor-not-allowed" : question.saving ? "bg-yellow-500/20 text-yellow-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
            {question.saved ? "Saved" : question.saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => onRemove(question.id)} disabled={question.saving} className="px-3 py-2 text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50">Del</button>
        </div>
      </div>
    </motion.div>
  );
}
