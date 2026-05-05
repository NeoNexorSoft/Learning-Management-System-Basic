import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { quizController } from '../controllers/quiz.controller'

const router = Router()

const teacher = [authenticate, requireRole('TEACHER')] as const
const student = [authenticate, requireRole('STUDENT')] as const

// Teacher routes
router.post('/lessons/:lessonId/quizzes',   ...teacher, quizController.createQuiz)
router.post('/quizzes/:quizId/questions',   ...teacher, quizController.addQuestion)
router.delete('/quizzes/:quizId',           ...teacher, quizController.deleteQuiz)
router.get('/quizzes/:quizId/attempts',     ...teacher, quizController.getAttempts)
router.patch('/attempts/:attemptId/grade',  ...teacher, quizController.gradeAttempt)

// Student routes
router.get('/lessons/:lessonId/quizzes',    ...student, quizController.getLessonQuizzes)
router.get('/quizzes/:quizId/take',         ...student, quizController.getQuizForStudent)
router.post('/quizzes/:quizId/start',       ...student, quizController.startAttempt)
router.get('/quizzes/:quizId/my-attempt',   ...student, quizController.getMyAttempt)
router.post('/quizzes/:quizId/attempt',     ...student, quizController.submitAttempt)

export default router
