import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/question-bank — teacher এর সব questions
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    let { subject, type, search, difficulty, status, source, page, limit } = req.query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 10);
    const skip = (p - 1) * l;
    const take = l;

    const where: Prisma.QuestionBankWhereInput = {
      AND: [
        {
          OR: [
            { teacher_id: teacherId },
            { userId: teacherId }
          ]
        },
        ...(type ? [{ type: { equals: String(type), mode: "insensitive" as Prisma.QueryMode } }] : []),
        ...(status ? [{ status: { equals: String(status), mode: "insensitive" as Prisma.QueryMode } }] : []),
        ...(source ? [{ source: { equals: String(source), mode: "insensitive" as Prisma.QueryMode } }] : []),
        ...(search
          ? [
              {
                OR: [
                  { questionText: { contains: String(search), mode: "insensitive" as Prisma.QueryMode } },
                  { questionTextEn: { contains: String(search), mode: "insensitive" as Prisma.QueryMode } },
                ],
              },
            ]
          : []),
      ],
    };

    const [questions, total] = await Promise.all([
      prisma.questionBank.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.questionBank.count({ where }),
    ]);

    res.json({
      status: "success",
      data: questions,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /api/question-bank — নতুন question তৈরি
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const {
      questionText,
      questionTextEn,
      type,
      options,
      answer,
      answerBn,
      explanation,
      explanationBn,
      difficulty,
      marks,
      subject,
      topic,
      subtopic,
      hint,
      bloomLevel,
      status,
      isPublished,
      hasFigure,
      hasFormula,
      needEvaluation,
      metadata,
      source,
      sourceReference,
    } = req.body;

    if (!questionText || !answer) {
      return res
        .status(400)
        .json({ status: "error", message: "questionText and answer are required" });
    }

    const created = await prisma.questionBank.create({
      data: {
        teacher_id: teacherId,
        userId: teacherId,
        questionText,
        questionTextEn,
        type: type ?? "MCQ",
        options: typeof options === "object" ? JSON.stringify(options) : options,
        answer,
        answerBn,
        explanation,
        explanationBn,
        difficulty: difficulty ?? "medium",
        marks: marks ? Number(marks) : 1,
        subject,
        topic,
        subtopic,
        hint,
        bloomLevel,
        status: status ?? "draft",
        isPublished: isPublished === true || isPublished === "true",
        hasFigure: hasFigure === true || hasFigure === "true",
        hasFormula: hasFormula === true || hasFormula === "true",
        needEvaluation: needEvaluation === true || needEvaluation === "true",
        metadata: typeof metadata === "object" ? JSON.stringify(metadata) : metadata,
        source: source ?? "manual",
        sourceReference,
      },
    });

    res.status(201).json({ status: "success", data: created });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// PUT /api/question-bank/:id — question update
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const id = String(req.params.id);
    const {
      questionText,
      questionTextEn,
      type,
      options,
      answer,
      answerBn,
      explanation,
      explanationBn,
      difficulty,
      marks,
      subject,
      topic,
      subtopic,
      hint,
      bloomLevel,
      status,
      isPublished,
      hasFigure,
      hasFormula,
      needEvaluation,
      metadata,
      source,
      sourceReference,
    } = req.body;

    const existing = await prisma.questionBank.findFirst({
      where: { id, teacher_id: teacherId },
    });

    if (!existing) {
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    const updated = await prisma.questionBank.update({
      where: { id },
      data: {
        ...(questionText !== undefined ? { questionText } : {}),
        ...(questionTextEn !== undefined ? { questionTextEn } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(options !== undefined
          ? { options: typeof options === "object" ? JSON.stringify(options) : options }
          : {}),
        ...(answer !== undefined ? { answer } : {}),
        ...(answerBn !== undefined ? { answerBn } : {}),
        ...(explanation !== undefined ? { explanation } : {}),
        ...(explanationBn !== undefined ? { explanationBn } : {}),
        ...(difficulty !== undefined ? { difficulty } : {}),
        ...(marks !== undefined ? { marks: Number(marks) } : {}),
        ...(subject !== undefined ? { subject } : {}),
        ...(topic !== undefined ? { topic } : {}),
        ...(subtopic !== undefined ? { subtopic } : {}),
        ...(hint !== undefined ? { hint } : {}),
        ...(bloomLevel !== undefined ? { bloomLevel } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(isPublished !== undefined
          ? { isPublished: isPublished === true || isPublished === "true" }
          : {}),
        ...(hasFigure !== undefined
          ? { hasFigure: hasFigure === true || hasFigure === "true" }
          : {}),
        ...(hasFormula !== undefined
          ? { hasFormula: hasFormula === true || hasFormula === "true" }
          : {}),
        ...(needEvaluation !== undefined
          ? { needEvaluation: needEvaluation === true || needEvaluation === "true" }
          : {}),
        ...(metadata !== undefined
          ? { metadata: typeof metadata === "object" ? JSON.stringify(metadata) : metadata }
          : {}),
        ...(source !== undefined ? { source } : {}),
        ...(sourceReference !== undefined ? { sourceReference } : {}),
      },
    });

    res.json({ status: "success", data: updated });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// DELETE /api/question-bank/:id — question delete
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const id = String(req.params.id);

    const existing = await prisma.questionBank.findFirst({
      where: { id, teacher_id: teacherId },
    });

    if (!existing) {
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    await prisma.questionBank.delete({ where: { id } });

    res.json({ status: "success", message: "Question deleted" });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
