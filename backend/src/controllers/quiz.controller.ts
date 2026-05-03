import { Request, Response } from 'express'
import { quizService } from '../services/quiz.service'

export const quizController = {
  async createQuiz(req: Request, res: Response) {
    try {
      const result = await quizService.createQuiz(
        req.params.lessonId as string,
        req.user!.userId,
        req.body,
      )
      res.status(201).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async addQuestion(req: Request, res: Response) {
    try {
      const result = await quizService.addQuestion(
        req.params.quizId as string,
        req.user!.userId,
        req.body,
      )
      res.status(201).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async deleteQuiz(req: Request, res: Response) {
    try {
      const result = await quizService.deleteQuiz(
        req.params.quizId as string,
        req.user!.userId,
      )
      res.status(200).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async getLessonQuizzes(req: Request, res: Response) {
    try {
      const result = await quizService.getLessonQuizzes(
        req.params.lessonId as string,
        req.user!.userId,
      )
      res.status(200).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async getQuizForStudent(req: Request, res: Response) {
    try {
      const result = await quizService.getQuizForStudent(
        req.params.quizId as string,
        req.user!.userId,
      )
      res.status(200).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async submitAttempt(req: Request, res: Response) {
    try {
      const result = await quizService.submitAttempt(
        req.params.quizId as string,
        req.user!.userId,
        req.body,
      )
      res.status(201).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async getAttempts(req: Request, res: Response) {
    try {
      const result = await quizService.getAttempts(
        req.params.quizId as string,
        req.user!.userId,
      )
      res.status(200).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async startAttempt(req: Request, res: Response) {
    try {
      const result = await quizService.startAttempt(req.params.quizId as string, req.user!.userId)
      res.status(201).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async getMyAttempt(req: Request, res: Response) {
    try {
      const result = await quizService.getMyAttempt(req.params.quizId as string, req.user!.userId)
      res.status(200).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },

  async gradeAttempt(req: Request, res: Response) {
    try {
      const result = await quizService.gradeAttempt(
        req.params.attemptId as string,
        req.user!.userId,
        req.body,
      )
      res.status(200).json({ success: true, data: result })
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message })
    }
  },
}
