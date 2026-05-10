import { useState } from "react";
import { api } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import QuestionEditForm from "./QuestionEditForm";
import SlideOutSheet from "./SlideOutSheet";

export default function QuestionCard({
  question,
  onUpdate,
  onPublish,
  onReject,
}) {
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { language } = useLanguage();

  const handleSave = async (updatedData) => {
    setSaving(true);
    setError(null);
    try {
      await api.updateQuestion(question.id, updatedData);
      setShowEditSheet(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError("Failed to save changes. Please try again.");
      console.error("Error updating question:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.updateQuestion(question.id, {
        status: "published",
        is_published: true,
      });
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError("Failed to publish question. Please try again.");
      console.error("Error publishing question:", err);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this question?")) return;
    try {
      await api.updateQuestion(question.id, {
        status: "rejected",
        is_published: false,
      });
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError("Failed to reject question. Please try again.");
      console.error("Error rejecting question:", err);
    }
  };

  // Get localized text
  const getLocalText = (item, field) => {
    const isBengaliExist = /[\u0980-\u09FF]/.test(item[field] || "");
    return !!item[field] && isBengaliExist
      ? item[field]
      : item[`${field}_en`] || "";
  };

  const questionText = getLocalText("question_text");
  const explanation = getLocalText("explanation");
  const isDraft = question.status === "draft";
  const isMCQ = question.type === "mcq";

  const typeColor = isMCQ
    ? "text-info bg-info/20"
    : "text-accent-secondary bg-accent-secondary/20";
  const statusColor =
    {
      draft: "text-warning bg-warning/20",
      published: "text-success bg-success/20",
      rejected: "text-error bg-error/20",
    }[question.status] || "text-text-secondary bg-bg-tertiary/50";

  // Parse options if MCQ
  const options =
    isMCQ && question.options
      ? typeof question.options === "string"
        ? JSON.parse(question.options)
        : question.options
      : [];

  return (
    <div className='bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden hover:border-text-tertiary transition-colors'>
      {/* Card Header */}
      <div
        className='flex items-center gap-3 px-5 py-4 cursor-pointer'
        onClick={() => setExpanded(!expanded)}>
        <span
          className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${typeColor}`}>
          {isMCQ ? "MCQ" : question.type}
        </span>
        <span
          className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${statusColor}`}>
          {question.status}
        </span>

        <p className='flex-1 text-sm text-text-primary truncate ml-2'>
          {questionText}
        </p>

        <div className='flex items-center gap-2 text-xs text-text-secondary font-mono shrink-0'>
          <span>{question.marks} marks</span>
          {question.difficulty && (
            <>
              <span>·</span>
              <span>{question.difficulty}</span>
            </>
          )}
          <span className='ml-2 text-accent-primary'>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className='px-5 pb-5 border-t border-bg-tertiary'>
          <div className='mt-4 space-y-3'>
            <p className='text-sm text-text-primary leading-relaxed'>
              {questionText}
            </p>

            {isMCQ && options.length > 0 && (
              <ul className='space-y-1.5'>
                {options.map((opt, i) => {
                  const isCorrect =
                    opt.startsWith(question.answer) || opt === question.answer;
                  return (
                    <li
                      key={i}
                      className={`text-xs px-3 py-2 rounded-lg font-mono ${
                        isCorrect
                          ? "bg-success/20 border border-success/40 text-success"
                          : "bg-bg-primary border border-bg-tertiary text-text-secondary"
                      }`}>
                      {opt}
                      {isCorrect && (
                        <span className='ml-2 text-success'>✓ correct</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {question.answer && !isMCQ && (
              <div className='bg-bg-primary border border-bg-tertiary rounded-lg p-3'>
                <p className='text-[10px] font-mono uppercase text-text-tertiary mb-1'>
                  Answer
                </p>
                <p className='text-xs text-text-secondary'>{question.answer}</p>
              </div>
            )}

            {explanation && (
              <div className='bg-bg-primary border border-bg-tertiary rounded-lg p-3'>
                <p className='text-[10px] font-mono uppercase text-text-tertiary mb-1'>
                  Explanation
                </p>
                <p className='text-xs text-text-secondary'>{explanation}</p>
              </div>
            )}

            {question.topic && (
              <div className='flex items-center gap-2 text-xs text-text-secondary'>
                <span className='font-mono'>{question.topic}</span>
                {question.subtopic && (
                  <>
                    <span>→</span>
                    <span className='font-mono'>{question.subtopic}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isDraft && (
            <div className='flex gap-2 mt-5 pt-4 border-t border-bg-tertiary'>
              <button
                onClick={handlePublish}
                className='px-4 py-1.5 bg-success text-bg-primary rounded text-xs font-bold hover:bg-success/80 transition-colors'>
                ✓ Publish
              </button>
              <button
                onClick={() => setShowEditSheet(true)}
                className='px-4 py-1.5 border border-bg-tertiary text-text-secondary rounded text-xs hover:border-accent-primary/50 hover:text-text-primary transition-colors'>
                ✎ Edit
              </button>
              <button
                onClick={handleReject}
                className='px-4 py-1.5 border border-error/30 text-error rounded text-xs hover:border-error/60 transition-colors'>
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      )}

      {/* Slide-Out Edit Sheet */}
      <SlideOutSheet
        isOpen={showEditSheet}
        onClose={() => {
          setShowEditSheet(false);
          setError(null);
        }}
        title='Edit Question'>
        {error && (
          <div className='mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm'>
            {error}
          </div>
        )}
        <QuestionEditForm
          question={question}
          onSave={handleSave}
          onCancel={() => {
            setShowEditSheet(false);
            setError(null);
          }}
          saving={saving}
        />
      </SlideOutSheet>
    </div>
  );
}
