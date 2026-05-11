import { motion } from "framer-motion";

export default function GeneratedQuestionCard({
  question,
  language = "bn",
  onSave,
  onRemove,
  onEdit,
}) {
  // Get localized text
  const getLocalText = (field) => {
    if (!question) return "";
    if (language === "bn" && question[`${field}_bn`]) {
      return question[`${field}_bn`];
    }
    if (language === "en" && question[`${field}_en`]) {
      return question[`${field}_en`];
    }
    return question[field] || "";
  };

  if (!question) return null;

  const questionText = getLocalText("question_text");
  const explanation = getLocalText("explanation");
  const isMCQ = question.type === "mcq";

  // Status badge styling
  const getStatusBadge = () => {
    if (question.error) {
      return (
        <span className='px-2 py-1 text-xs font-semibold bg-error/20 text-error rounded-full'>
          Error
        </span>
      );
    }
    if (question.saving) {
      return (
        <span className='px-2 py-1 text-xs font-semibold bg-warning/20 text-warning rounded-full flex items-center gap-1'>
          <svg className='animate-spin h-3 w-3' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
              fill='none'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          Saving
        </span>
      );
    }
    if (question.saved) {
      return (
        <span className='px-2 py-1 text-xs font-semibold bg-success/20 text-success rounded-full'>
          ✓ Saved
        </span>
      );
    }
    return (
      <span className='px-2 py-1 text-xs font-semibold bg-bg-tertiary text-text-secondary rounded-full'>
        Unsaved
      </span>
    );
  };

  // Type badge styling
  const getTypeColor = () => {
    switch (question.type) {
      case "mcq":
        return "bg-accent-primary/20 text-accent-primary";
      case "short":
        return "bg-accent-secondary/20 text-accent-secondary";
      case "written":
        return "bg-warning/20 text-warning";
      default:
        return "bg-bg-tertiary text-text-secondary";
    }
  };

  // Difficulty badge styling
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case "easy":
        return "bg-success/20 text-success";
      case "medium":
        return "bg-warning/20 text-warning";
      case "hard":
        return "bg-error/20 text-error";
      default:
        return "bg-bg-tertiary text-text-secondary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='p-4 space-y-3'>
        {/* Badges Row */}
        <div className='flex items-center gap-2 flex-wrap'>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor()}`}>
            {question.type?.toUpperCase() || "QUESTION"}
          </span>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor()}`}>
            {question.difficulty || "Medium"}
          </span>
          {getStatusBadge()}
        </div>

        {/* Question Text */}
        <p className='text-text-primary font-medium leading-relaxed'>
          {questionText}
        </p>

        {/* MCQ Options */}
        {isMCQ && question.options && (
          <div className='space-y-2 mt-3'>
            {(Array.isArray(question.options)
              ? question.options
              : JSON.parse(question.options || "[]")
            ).map((option, idx) => {
              const correctAnswer =
                language === "bn" ? question.answer_bn : question.answer;
              const isCorrect =
                option.startsWith(correctAnswer) || option === correctAnswer;

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg text-sm ${
                    isCorrect
                      ? "bg-success/10 border border-success/30 text-success"
                      : "bg-bg-primary border border-bg-tertiary text-text-secondary"
                  }`}>
                  <span className='font-medium mr-2'>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </div>
              );
            })}
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className='bg-bg-primary border border-bg-tertiary rounded-lg p-3'>
            <p className='text-[10px] font-mono uppercase text-text-tertiary mb-1'>
              Explanation
            </p>
            <p className='text-xs text-text-secondary'>{explanation}</p>
          </div>
        )}

        {/* Error Message */}
        {question.error && (
          <div className='bg-error/10 border border-error/30 rounded-lg p-3'>
            <p className='text-xs text-error'>{question.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex gap-2 pt-2'>
          <button
            onClick={() => onEdit(question)}
            className='flex-1 px-3 py-2 text-sm font-medium bg-bg-tertiary hover:bg-bg-primary text-text-secondary rounded-lg transition-colors'>
            ✏️ Edit
          </button>
          <button
            onClick={() => onSave(question)}
            disabled={question.saved || question.saving}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              question.saved
                ? "bg-success/20 text-success cursor-not-allowed"
                : question.saving
                  ? "bg-warning/20 text-warning cursor-not-allowed"
                  : "bg-accent-primary hover:bg-accent-hover text-bg-primary"
            }`}>
            {question.saved
              ? "✓ Saved"
              : question.saving
                ? "Saving..."
                : "💾 Save"}
          </button>
          <button
            onClick={() => onRemove(question.id)}
            disabled={question.saving}
            className='px-3 py-2 text-sm font-medium bg-error/20 hover:bg-error/30 text-error rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );
}
