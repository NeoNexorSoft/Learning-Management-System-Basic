import { prisma } from "../../../../lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class QuestionController {
  parseJsonField(value: any, fallback: any = null) {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== "string") return value;
    try { return JSON.parse(value); } catch { return fallback; }
  }

  async storeQuestionsFromRAG(req: any, res: any) {
    try {
      const teacherId = req.user!.userId;
      const { success, data } = req.body;
      if (!success || !data || !Array.isArray(data)) {
        return res.status(400).json({ success: false, message: "Invalid API response format" });
      }
      const results: any = { inserted: [], failed: [], total: data.length };
      for (const question of data) {
        try {
          const questionData = this.prepareQuestionData({ ...question, teacherId });
          const insertedData = await this.insertQuestion(questionData);
          results.inserted.push({ id: insertedData?.id, question_text: question.question_text, type: question.type });
        } catch (error: any) {
          results.failed.push({ question_text: question.question_text, error: error.message });
        }
      }
      return res.status(200).json({ success: true, message: `Successfully inserted ${results.inserted.length} out of ${results.total} questions`, data: results });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Failed to store questions", error: error.message });
    }
  }

  async streamQuestions(req: any, res: any) {
    try {
      const { subject, topic, subtopic, exam, grade, type, difficulty, count, language } = req.body;
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
      send({ stage: "start", message: "Starting question generation..." });
      const langInstruction = language === "bn" ? "????? ?????? ??? ????? ??????? ??????" : "Write all questions and answers in English.";
      const marksMap: Record<string, number> = { mcq: 1, short: 3, broad: 10, creative: 10 };
      const optionsFormat = type === "mcq" ? `"options": {"a": "...", "b": "...", "c": "...", "d": "..."},` : "";
      const prompt = `You are an expert ${subject} teacher for ${exam} exam (Grade ${grade}).\n${langInstruction}\nTopic: ${topic}${subtopic ? `, Subtopic: ${subtopic}` : ""}\nDifficulty: ${difficulty}\n\nGenerate exactly ${count} ${type.toUpperCase()} questions.\n${type === "mcq" ? "Each MCQ must have exactly 4 options (a, b, c, d) and one correct answer." : ""}\n\nReturn ONLY a valid JSON array with no extra text, no markdown, no explanation.\nEach object must have these exact fields:\n{\n  "question_text": "the question here",\n  "type": "${type}",\n  "difficulty": "${difficulty}",\n  "subject": "${subject}",\n  "topic": "${topic}",\n  ${optionsFormat}\n  "answer": "correct answer here",\n  "explanation": "brief explanation here",\n  "marks": ${marksMap[type] || 1}\n}`;
      send({ stage: "generating", message: "AI is generating questions..." });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert question generator. Always respond with valid JSON arrays only. No markdown, no explanation." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      const text = completion.choices[0]?.message?.content || "";
      let questions: any[] = [];
      try {
        const cleaned = text.replace(/```json|```/g, "").trim();
        questions = JSON.parse(cleaned);
        if (!Array.isArray(questions)) throw new Error("Not an array");
      } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) { questions = JSON.parse(match[0]); }
        else { throw new Error("Failed to parse AI response"); }
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        send({ stage: "question_generated", current: i + 1, total: questions.length, question: { ...q, options: q.options ? JSON.stringify(q.options) : null } });
        await new Promise((r) => setTimeout(r, 80));
      }
      send({ stage: "done", questions, message: "Generation complete!" });
      res.end();
    } catch (error: any) {
      console.error("Groq generation error:", error);
      res.write(`data: ${JSON.stringify({ stage: "error", message: error.message || "Generation failed" })}\n\n`);
      res.end();
    }
  }

  prepareQuestionData(question: any) {
    const needEvaluation = ["short", "broad", "creative"].includes(question.type);
    let options = null;
    if (question.type === "mcq" && question.options) {
      options = typeof question.options === "string" ? question.options : JSON.stringify(question.options);
    }
    return { teacherId: question.teacherId, question_text: question.question_text, question_text_en: question.question_text_en || null, type: question.type, difficulty: question.difficulty || "medium", marks: question.marks || 1, options, answer: question.answer || null, answer_bn: question.answer_bn || null, explanation: question.explanation || null, explanation_bn: question.explanation_bn || null, subject: question.subject || null, topic: question.topic || null, subtopic: question.subtopic || null, hint: question.hint || null, source: "ai", source_reference: "groq-generated", need_evaluation: needEvaluation, status: "draft", is_published: false, has_figure: false, has_formula: false, bloom_level: question.bloom_level || null, metadata: JSON.stringify({}) };
  }

  async insertQuestion(question: any) {
    const created = await prisma.questionBank.create({
      data: { teacher_id: question.teacherId, questionText: question.question_text, questionTextEn: question.question_text_en || null, type: question.type, difficulty: question.difficulty || "medium", marks: question.marks || 1, options: question.options, answer: question.answer || null, answerBn: question.answer_bn || null, explanation: question.explanation || null, explanationBn: question.explanation_bn || null, subject: question.subject || null, topic: question.topic || null, subtopic: question.subtopic || null, hint: question.hint || null, source: "ai", sourceReference: question.source_reference || "groq-generated", needEvaluation: question.need_evaluation, status: "draft", isPublished: false, hasFigure: false, hasFormula: false, bloomLevel: question.bloom_level || null, metadata: JSON.stringify({}) },
    });
    return created;
  }
}

const questionController = new QuestionController();
export default questionController;
