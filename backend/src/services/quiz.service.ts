import { prisma } from '../config/db'
import { v4 as uuidv4 } from 'uuid'

async function requireTeacherOwnsLesson(lessonId: string, teacherId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } },
  })
  if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 })
  if (lesson.section.course.teacher_id !== teacherId) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
  }
  return lesson
}

async function requireTeacherOwnsQuiz(quizId: string, teacherId: string) {
  const quiz = await prisma.lessonQuiz.findUnique({
    where: { id: quizId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  })
  if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 })
  if (quiz.lesson.section.course.teacher_id !== teacherId) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
  }
  return quiz
}

export const quizService = {
  async createQuiz(
    lessonId: string,
    teacherId: string,
    body: { title?: string; timer_seconds?: number; deadline?: string },
  ) {
    await requireTeacherOwnsLesson(lessonId, teacherId)
    const count = await prisma.lessonQuiz.count({ where: { lesson_id: lessonId } })
    const quiz = await prisma.lessonQuiz.create({
      data: {
        id: uuidv4(),
        lesson_id: lessonId,
        title: body.title ?? 'Quiz',
        order: count + 1,
        timer_seconds: body.timer_seconds,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    })
    return { quiz }
  },

  async addQuestion(quizId: string, teacherId: string, body: any) {
    await requireTeacherOwnsQuiz(quizId, teacherId)
    const count = await prisma.lessonQuizQuestion.count({ where: { quiz_id: quizId } })
    const question = await prisma.lessonQuizQuestion.create({
      data: {
        id: uuidv4(),
        quiz_id: quizId,
        type: body.type ?? 'MCQ',
        question: body.question,
        options: body.options,
        correct_answer: body.correct_answer,
        order: count + 1,
      },
    })
    return { question }
  },

  async deleteQuiz(quizId: string, teacherId: string) {
    await requireTeacherOwnsQuiz(quizId, teacherId)
    await prisma.lessonQuiz.delete({ where: { id: quizId } })
    return { deleted: true }
  },

  async getLessonQuizzes(lessonId: string, _studentId: string) {
    const quizzes = await prisma.lessonQuiz.findMany({
      where: { lesson_id: lessonId },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: { id: true, type: true, question: true, options: true, order: true },
        },
      },
    })
    return { quizzes }
  },

  async getQuizForStudent(quizId: string, _studentId: string) {
    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: { id: true, type: true, question: true, options: true, order: true },
        },
      },
    })
    if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 })
    return { quiz }
  },

  async startAttempt(quizId: string, studentId: string) {
    const quiz = await prisma.lessonQuiz.findUnique({ where: { id: quizId } })
    if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 })

    const existing = await prisma.quizAttempt.findUnique({
      where: { quiz_id_student_id: { quiz_id: quizId, student_id: studentId } },
    })
    if (existing) {
      throw Object.assign(new Error('You have already attempted this quiz'), { statusCode: 400 })
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        id: uuidv4(),
        quiz_id: quizId,
        student_id: studentId,
        answers: {},
        submitted: false,
        started_at: new Date(),
      },
    })
    return { attempt }
  },

  async submitAttempt(quizId: string, studentId: string, body: { answers?: Record<string, string> }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { quiz_id_student_id: { quiz_id: quizId, student_id: studentId } },
    })
    if (!attempt) {
      throw Object.assign(new Error('You must start the quiz before submitting'), { statusCode: 400 })
    }
    if (attempt.submitted) {
      throw Object.assign(new Error('You have already submitted this quiz'), { statusCode: 400 })
    }

    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })
    if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 })

    let is_late = false
    if (quiz.timer_seconds && attempt.started_at) {
      is_late = new Date() > new Date(attempt.started_at.getTime() + quiz.timer_seconds * 1000 + 10000)
    }

    const answers = body.answers ?? {}
    let correct = 0
    const result = quiz.questions.map((q) => {
      const student_answer = answers[q.id] ?? null
      const is_correct = student_answer === q.correct_answer
      if (is_correct) correct++
      return {
        question_id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        student_answer,
        is_correct,
      }
    })

    const total = quiz.questions.length
    const score = total > 0 ? (correct / total) * 100 : 0
    const time_taken_seconds = attempt.started_at
      ? Math.floor((new Date().getTime() - attempt.started_at.getTime()) / 1000)
      : null

    await prisma.quizAttempt.update({
      where: { quiz_id_student_id: { quiz_id: quizId, student_id: studentId } },
      data: { answers, score, graded: true, submitted: true, is_late, time_taken_seconds },
    })

    return { score, correct, total, is_late, time_taken_seconds, result }
  },

  async getMyAttempt(quizId: string, studentId: string) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { quiz_id_student_id: { quiz_id: quizId, student_id: studentId } },
    })
    if (!attempt) throw Object.assign(new Error('No attempt found'), { statusCode: 404 })

    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })
    if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 })

    const answers = (attempt.answers ?? {}) as Record<string, string>
    let correct = 0
    const result = quiz.questions.map((q) => {
      const student_answer = answers[q.id] ?? null
      const is_correct = student_answer === q.correct_answer
      if (is_correct) correct++
      return {
        question_id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        student_answer,
        is_correct,
      }
    })

    const total = quiz.questions.length
    const score = total > 0 ? (correct / total) * 100 : 0

    return { attempt, score, correct, total, result }
  },

  async getAttempts(quizId: string, teacherId: string) {
    await requireTeacherOwnsQuiz(quizId, teacherId)
    const attempts = await prisma.quizAttempt.findMany({
      where: { quiz_id: quizId },
      orderBy: { submitted_at: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })
    return { attempts }
  },

  async gradeAttempt(attemptId: string, teacherId: string, body: { score?: number; feedback?: string }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: { include: { lesson: { include: { section: { include: { course: true } } } } } },
      },
    })
    if (!attempt) throw Object.assign(new Error('Attempt not found'), { statusCode: 404 })
    if (attempt.quiz.lesson.section.course.teacher_id !== teacherId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
    }
    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        ...(body.score !== undefined && { score: body.score }),
        ...(body.feedback !== undefined && { feedback: body.feedback }),
        graded: true,
      },
    })
    return { attempt: updated }
  },
}
