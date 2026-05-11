import { useState, useEffect } from 'react';
import api from "@/lib/axios";
import {API_BASE_URL} from "@/lib/axios";
import { getToken } from "@/lib/auth";
import GenerateForm from './GeneratorForm';
import SlideOutSheet from './SlideOutSheet';
import GeneratedQuestionsPanel from './GeneratedQuestionsPanel';

const streamQuestions = (data: any) => {
  const token = getToken();
  return fetch(`${API_BASE_URL}/api/question-bank/questions/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });
};


export default function QuestionGenerator() {
  const [loading, setLoading] = useState(true);

  // New state for generation flow
  const [generationMode, setGenerationMode] = useState('idle'); // 'idle' | 'generating' | 'review'
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // Temporary questions (not in DB yet)
  const [streamProgress, setStreamProgress] = useState({ current: 0, total: 0, message: '', error: false });
  const [stageMessages, setStageMessages] = useState([]); // Track stage history for display
  const [sheetOpen, setSheetOpen] = useState(false); // Controls slide-out sheet visibility

  const [filter, setFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('bn');



  const handleGenerate = async (params:any) => {
    setGenerationMode('generating');
    setSheetOpen(true); // Open sheet immediately
    setSelectedLanguage(params.language || 'bn');

    // Clear all previous generation state
    setStageMessages([]);
    setGeneratedQuestions([]);
    setStreamProgress({ current: 0, total: 0, message: 'Initializing...', error: false });

    try {
      const response = await streamQuestions(params);
      //@ts-ignore
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        //@ts-ignore
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.stage === 'start') {
                setStreamProgress(prev => ({ ...prev, message: data.message || 'Starting generation...' }));
                //@ts-ignore
                setStageMessages(prev => [...prev, { stage: 'start', message: data.message || 'Starting generation...' }]);
              }

              if (data.stage === 'textbook_search') {
      
                setStreamProgress(prev => ({ ...prev, message: data.message }));
                //@ts-ignore
                setStageMessages(prev => [...prev, { stage: 'textbook_search', message: data.message }]);
              }

              if (data.stage === 'board_search') {
          
                setStreamProgress(prev => ({ ...prev, message: data.message }));
                //@ts-ignore
                setStageMessages(prev => [...prev, { stage: 'board_search', message: data.message, found: data.found }]);
              }

              if (data.stage === 'generating' && data.partial) {

                setStreamProgress(prev => ({ ...prev, message: data.message }));
                //@ts-ignore
                setStageMessages(prev => [...prev, { stage: 'generating', message: data.message }]);
              }

              if (data.stage === 'progress') {
                setStreamProgress({
                  current: data.current || 0,
                  total: data.total || 0,
                  message: `Generating question ${data.current || 0} of ${data.total || 0}...`,
                  error: false
                });
              }

              // CRITICAL: Handle individual questions arriving one by one
              if (data.stage === 'question_generated') {
                const newQuestion = {
                  ...data.question,
                  id: `temp-${Date.now()}-${data.current}`,
                  saved: false,
                  saving: false,
                  error: null
                };

                // Add question immediately (real-time appearance)
                //@ts-ignore
                setGeneratedQuestions(prev => [...prev, newQuestion]);

                // Update progress counter
                setStreamProgress({
                  current: data.current,
                  total: data.total,
                  message: `Generated question ${data.current} of ${data.total}...`,
                  error: false
                });
              }

              if (data.stage === 'done' && data.questions) {
                // Only add if no questions were added via question_generated (fallback)
                if (generatedQuestions.length === 0) {
                    //@ts-ignore
                  const questionsWithTempIds = data.questions.map((q, idx) => ({
                    ...q,
                    id: `temp-${Date.now()}-${idx}`,
                    saved: false,
                    saving: false,
                    error: null
                  }));

                  setGeneratedQuestions(questionsWithTempIds);
                }
                setGenerationMode('review');
              }

              if (data.stage === 'error') {
                setStreamProgress({
                  current: 0,
                  total: 0,
                  message: data.message || 'Generation failed',
                  error: true
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error:any) {
      console.error('Failed to generate questions:', error);
      setStreamProgress({
        current: 0,
        total: 0,
        message: error.message || 'Failed to generate questions',
        error: true
      });
    }
  };

  // Save individual question
  const handleSaveQuestion = async (question:any) => {
    //@ts-ignore
    setGeneratedQuestions(prev => prev.map((q:any) =>
      q.id === question.id
        ? { ...q, saving: true, error: null }
        : q
    ));

    try {
      const response = await api.post("/api/question-bank/store-generated-questions",{
         success: true,
    data: [question]
      });

      if (response.data.success && response.data.data.inserted.length > 0) {
        const savedId = response.data.data.inserted[0]?.id;

        setGeneratedQuestions((prev:any) => prev.map((q:any) =>
          q.id === question.id
            ? { ...q, id: savedId, saved: true, saving: false }
            : q
        ));
      } else {
        throw new Error('Failed to save question');
      }
    } catch (error:any) {
      setGeneratedQuestions((prev:any) => prev.map((q:any)=>
        q.id === question.id
          ? { ...q, saving: false, error: error.message || 'Failed to save' }
          : q
      ));
    }
  };

  // Remove question from temporary list
  const handleRemoveQuestion = (questionId:any) => {
    if (confirm('Remove this question from the list?')) {
      setGeneratedQuestions(prev => prev.filter((q:any) => q.id !== questionId));
    }
  };

  // Edit question (placeholder for now)
  const handleEditQuestion = (question:any) => {
    console.log('Edit question:', question);
    // TODO: Open edit modal/sheet
    alert('Edit functionality coming soon!');
  };

  // Save all unsaved questions
  const handleSaveAll = async () => {
    const unsaved = generatedQuestions.filter((q:any) => !q.saved);

    if (unsaved.length === 0) return;

    // Mark all as saving
    //@ts-ignore
    setGeneratedQuestions(prev => prev.map((q:any) =>
      !q.saved ? { ...q, saving: true, error: null } : q
    ));

    try {
      const response = await api.post("/api/question-bank/store-generated-questions",{
         success: true,
    data: unsaved
      }); 

      if (response.data.success) {
        // Create map of temp IDs to real IDs
        const insertedMap = {};
        response.data.data.inserted.forEach((item:any, idx:number) => {
          if (unsaved[idx]) {
            //@ts-ignore
            insertedMap[unsaved[idx].id] = item.id;
          }
        });

        setGeneratedQuestions((prev:any) => prev.map((q:any) =>
        //@ts-ignore
          insertedMap[q.id]
          //@ts-ignore
            ? { ...q, id: insertedMap[q.id], saved: true, saving: false }
            : q
        ));
      } else {
        throw new Error('Failed to save questions');
      }
    } catch (error:any) {
      setGeneratedQuestions((prev:any) => prev.map((q:any) =>
        !q.saved ? { ...q, saving: false, error: error.message || 'Failed to save' } : q
      ));
    }
  };

  // Discard all generated questions
  const handleDiscardAll = () => {
    if (confirm('Discard all generated questions?')) {
      setGeneratedQuestions([]);
      setGenerationMode('idle');
      setStageMessages([]);
      setStreamProgress({ current: 0, total: 0, message: '', error: false });
    }
  };

  // Close panel and refresh questions list
  const handleClosePanel = async () => {
    const unsavedCount = generatedQuestions.filter((q:any) => !q.saved).length;

    if (unsavedCount > 0) {
      if (!confirm(`You have ${unsavedCount} unsaved questions. Close anyway?`)) {
        return;
      }
    }

    setSheetOpen(false); // Close sheet
    setGeneratedQuestions([]);
    setGenerationMode('idle');
    setStageMessages([]);
    setStreamProgress({ current: 0, total: 0, message: '', error: false });


  };



  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Generate Form */}
      <GenerateForm onGenerate={handleGenerate} generating={generationMode === 'generating'} />

      {/* Slide-out Sheet for Question Generation */}
      <SlideOutSheet
        isOpen={sheetOpen}
        onClose={handleClosePanel}
        title={generationMode === 'generating' ? 'Generating Questions...' : 'Review Generated Questions'}
        width="700px"
      >
        <GeneratedQuestionsPanel
          mode={generationMode}
          questions={generatedQuestions}
          language={selectedLanguage}
          streamProgress={streamProgress}
          stageHistory={stageMessages}
          onSaveQuestion={handleSaveQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onEditQuestion={handleEditQuestion}
          onSaveAll={handleSaveAll}
          onDiscardAll={handleDiscardAll}
          onClose={handleClosePanel}
          hideHeader={true}
        />
      </SlideOutSheet>
    </div>
  );
}
