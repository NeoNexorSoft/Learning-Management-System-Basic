const axios = require("axios");
import { prisma } from "../../../../lib/prisma";


class QuestionController {
  parseJsonField(value:any, fallback = null) {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  serializeQuestion(row:any) {
    return {
      ...row,
      options: this.parseJsonField(row.options, row.options),
      //@ts-ignore
      metadata: this.parseJsonField(row.metadata, {}),
    };
  }

  /**
   * Store questions from RAG API response to database
   */
  async storeQuestionsFromRAG(req:any, res:any) {
    try {
      const teacherId = req.user!.userId;
      const { success, data } = req.body;

      if (!success || !data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          message: "Invalid API response format",
        });
      }

      const results:any = {
        inserted: [],
        failed: [],
        total: data.length,
      };

      // Process each question
      for (const question of data) {
        try {
          // Prepare question data (no longer needs IDs)
          const questionData = this.prepareQuestionData({...question,teacherId});

          // Insert question
          const insertedData = await this.insertQuestion(questionData);

          results.inserted.push({
            id: insertedData?.id,
            question_text: question.question_text,
            type: question.type,
          });
        } catch (error:any) {
          console.error(
            `Failed to insert question: ${question.question_text}`,
            error,
          );
          results.failed.push({
            question_text: question.question_text,
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully inserted ${results.inserted.length} out of ${results.total} questions`,
        data: results,
      });
    } catch (error:any) {
      console.error("Error storing questions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to store questions",
        error: error.message,
      });
    }
  }

  /**
   * Stream questions from RAG API and store them
   */
  async streamQuestions(req:any, res:any) {
    try {
      const {
        subject,
        topic,
        exam,
        grade,
        type,
        difficulty,
        count,
        language,
        focusOnBoardStyle,
      } = req.body;

      // SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Axios streaming request
      const response = await axios({
        method: "POST",
        url: `${process.env.RAG_API_URL}/api/generator/practice-questions/stream`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          subject,
          topic,
          exam,
          grade,
          type,
          difficulty,
          count,
          language,
          focusOnBoardStyle,
        },
        responseType: "stream", // 🔥 important
      });

      const stream = response.data;

      let buffer = "";

      stream.on("data", async (chunk:any) => {
        buffer += chunk.toString();

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            // Forward to client
            res.write(`data: ${data}\n\n`);

            // NOTE: Auto-storage disabled - questions are now stored explicitly via /questions/store-rag
            // This allows users to review questions before saving to database
            //
            // try {
            //   const parsed = JSON.parse(data);
            //   if (parsed.stage === "done" && parsed.questions) {
            //     await this.storeGeneratedQuestions(parsed.questions, {
            //       subject,
            //       topic,
            //       exam,
            //       grade,
            //       type,
            //       difficulty,
            //       language,
            //     });
            //   }
            // } catch (e) {
            //   // ignore non-json
            // }
          }
        }
      });

      stream.on("end", () => {
        if (buffer.startsWith("data: ")) {
          res.write(`${buffer}\n\n`);
        }
        res.end();
      });

      stream.on("error", (err:any) => {
        console.error("Stream error:", err);
        res.write(
          `data: ${JSON.stringify({
            stage: "error",
            message: err.message,
          })}\n\n`,
        );
        res.end();
      });
    } catch (error:any) {
      console.error("Error streaming questions:", error);

      res.write(
        `data: ${JSON.stringify({
          stage: "error",
          message: error.message,
        })}\n\n`,
      );
      res.end();
    }
  }



  /**
   * Prepare question data for insertion
   */
  prepareQuestionData(question:any) {
    // Determine if evaluation is needed based on question type
    const needEvaluation = ["short", "broad", "creative"].includes(
      question.type,
    );

    // Prepare options based on question type
    let options = null;
    if (question.type === "mcq" && question.options) {
      options = JSON.stringify(question.options);
    }

    const baseData = {
        teacherId:question.teacherId,
      question_text: question.question_text,
      question_text_en: question.question_text_en || null,
      type: question.type,
      difficulty: question.difficulty || "medium",
      marks: question.marks || 1,
      options: options,
      answer: question.answer || null,
      answer_bn: question.answer_bn || null,
      explanation: question.explanation || null,
      explanation_bn: question.explanation_bn || null,
      subject: question.subject || null,
      topic: question.topic || null,
      subtopic: question.subtopic || null,
      hint: question.hint || null,
      source: "ai", // Since coming from RAG
      source_reference: question.source || "rag-generated",
      need_evaluation: needEvaluation,
      status: "draft", // Default status, admin can publish later
      is_published: false,
      has_figure: question.has_figure || false,
      has_formula: question.hasFormula || false,
      bloom_level: question.bloom_level || null,
      metadata: JSON.stringify({}),
    };

    return baseData;
  }

  /**
   * Insert a single question into database
   */
  async insertQuestion(question:any) {




    const created = await prisma.questionBank.create({
      data: {
      teacher_id:question.teacherId,
      questionText: question.question_text,
      questionTextEn: question.question_text_en || null,
      type: question.type,
      difficulty: question.difficulty || "medium",
      marks: question.marks || 1,
      options: question.options,
      answer: question.answer || null,
      answerBn: question.answer_bn || null,
      explanation: question.explanation || null,
      explanationBn: question.explanation_bn || null,
      subject: question.subject || null,
      topic: question.topic || null,
      subtopic: question.subtopic || null,
      hint: question.hint || null,
      source: "ai", // Since coming from RAG
      sourceReference: question.source || "rag-generated",
      needEvaluation: question.need_evaluation,
      status: "draft", // Default status, admin can publish later
      isPublished: false,
      hasFigure: question.has_figure || false,
      hasFormula: question.hasFormula || false,
      bloomLevel: question.bloom_level || null,
      metadata: JSON.stringify({}),
      },
    });

   return created;
  }

 



}

/**
 * export const createQuestion = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { question, type, options, correct_answer, explanation, tags } =
      req.body;

    if (!question || !options || !correct_answer) {
      return res
        .status(400)
        .json({ status: "error", message: "question, options, correct_answer required" });
    }

    const created = await prisma.questionBank.create({
      data: {
        teacher_id: teacherId,
        question,
        type: type ?? "MCQ",
        options,
        correct_answer,
        explanation: explanation ?? null,
        tags: tags ?? [],
      },
    });

    res.status(201).json({ status: "success", data: created });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
 */

const questionController = new QuestionController();
export default questionController;