import { motion, AnimatePresence } from 'framer-motion';
import StreamingProgress from './StreamingProgress';
import GeneratedQuestionCard from './GeneratedQuestionCard';

export default function GeneratedQuestionsPanel({
  mode = 'idle', // 'idle' | 'generating' | 'review'
  questions = [],
  streamProgress = { current: 0, total: 0, message: '' },
  stageHistory = [],
  onSaveQuestion,
  onRemoveQuestion,
  onEditQuestion,
  onSaveAll,
  onDiscardAll,
  onClose,
  language,
  hideHeader = false // NEW: Hide header when used in SlideOutSheet
}) {
  // Don't render if idle
  if (mode === 'idle') return null;

  const unsavedCount = questions.filter(q => !q.saved).length;
  const savedCount = questions.filter(q => q.saved).length;
  const hasUnsavedChanges = unsavedCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={` border-2 border-accent-primary/30 rounded-xl overflow-hidden ${hideHeader ? '' : 'mb-6'}`}
    >
      {/* Header - Only show if not hidden */}
      {!hideHeader && (
        <div className="px-6 py-4 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {mode === 'generating' ? 'Generating Questions...' : 'Generated Questions'}
                </h3>
                {mode === 'review' && (
                  <p className="text-sm text-text-secondary">
                    {savedCount > 0 && `${savedCount} saved, `}
                    {unsavedCount} unsaved
                  </p>
                )}
              </div>
            </div>

            {/* Close Button */}
            {mode === 'review' && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-bg-primary rounded-lg transition-colors text-text-secondary hover:text-text-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={hideHeader ? '' : 'p-6'}>
        {/* Generating Mode: Show Streaming Progress + Questions appearing in real-time */}
        {mode === 'generating' && (
          <>
            <StreamingProgress
              current={streamProgress.current}
              total={streamProgress.total}
              message={streamProgress.message}
              error={streamProgress.error}
              stageHistory={stageHistory}
            />

            {/* Show questions as they arrive (Claude-like real-time appearance) */}
            {questions.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-text-secondary">
                    Questions arriving...
                  </h4>
                  <span className="text-xs text-text-tertiary">
                    {questions.length} of {streamProgress.total || '?'}
                  </span>
                </div>
                <AnimatePresence>
                  {questions.map((question) => (
                    <GeneratedQuestionCard
                      key={question.id}
                      question={question}
                      onSave={onSaveQuestion}
                      onRemove={onRemoveQuestion}
                      onEdit={onEditQuestion}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Review Mode: Show Questions */}
        {mode === 'review' && (
          <AnimatePresence>
            {questions.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg mb-2">No questions generated</p>
                <p className="text-sm">Try adjusting your generation parameters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <GeneratedQuestionCard
                    key={question.id}
                    question={question}
                    onSave={onSaveQuestion}
                    onRemove={onRemoveQuestion}
                    onEdit={onEditQuestion}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer - Bulk Actions */}
      {mode === 'review' && questions.length > 0 && (
        <div className="bg-bg-tertiary px-6 py-4 border-t border-bg-tertiary">
          <div className="flex gap-3">
            {/* Save All Button */}
            <button
              onClick={onSaveAll}
              disabled={unsavedCount === 0}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                unsavedCount === 0
                  ? 'bg-bg-primary text-text-tertiary cursor-not-allowed'
                  : 'bg-accent-primary hover:bg-accent-hover text-bg-primary'
              }`}
            >
              {unsavedCount === 0
                ? `✓ All ${savedCount} Saved`
                : `💾 Save All (${unsavedCount})`
              }
            </button>

            {/* Discard All Button */}
            <button
              onClick={onDiscardAll}
              className="px-4 py-2.5 rounded-lg font-medium bg-error/20 hover:bg-error/30 text-error transition-colors"
            >
              🗑️ Discard All
            </button>
          </div>

          {/* Close Panel Button */}
          {savedCount > 0 && unsavedCount === 0 && (
            <button
              onClick={onClose}
              className="w-full mt-3 px-4 py-2.5 rounded-lg font-medium bg-bg-primary hover:bg-bg-tertiary text-text-secondary transition-colors"
            >
              Close Panel & Refresh List
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
