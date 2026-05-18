import { Router } from 'express';
import { Role } from '@prisma/client';
import { routineTrackerController } from '../controllers/routineTracker.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// ─── Student self-service routes ─────────────────────────────────────────────
router.get('/my/overview', requireRole(Role.STUDENT), routineTrackerController.getMyOverview);
router.get('/my/plans', requireRole(Role.STUDENT), routineTrackerController.getMyRoutinePlans);
router.post('/my/plans', requireRole(Role.STUDENT), routineTrackerController.createMyRoutinePlan);
router.get('/my/routine', requireRole(Role.STUDENT), routineTrackerController.getMyRoutineTasks);
router.post('/my/routine/tasks', requireRole(Role.STUDENT), routineTrackerController.createMyRoutineTask);
router.patch('/my/routine/tasks/:taskId', requireRole(Role.STUDENT), routineTrackerController.updateMyRoutineTask);
router.patch('/my/routine/tasks/:taskId/complete', requireRole(Role.STUDENT), routineTrackerController.completeMyRoutineTask);
router.delete('/my/routine/tasks/:taskId', requireRole(Role.STUDENT), routineTrackerController.deleteMyRoutineTask);
router.get('/my/weaknesses', requireRole(Role.STUDENT), routineTrackerController.getMyWeaknesses);
router.get('/my/recommendations', requireRole(Role.STUDENT), routineTrackerController.getMyRecommendations);
router.get('/my/performance', requireRole(Role.STUDENT), routineTrackerController.getMyPerformance);

// ─── Teacher routes ──────────────────────────────────────────────────────────
router.get('/teacher/students', requireRole(Role.TEACHER), routineTrackerController.getTeacherStudents);
router.get('/teacher/students/:studentId/overview', requireRole(Role.TEACHER), routineTrackerController.getTeacherStudentOverview);
router.get('/teacher/students/:studentId/routine', requireRole(Role.TEACHER), routineTrackerController.getTeacherStudentRoutine);
router.get('/teacher/students/:studentId/weaknesses', requireRole(Role.TEACHER), routineTrackerController.getTeacherStudentWeaknesses);
router.post('/teacher/students/:studentId/routine/tasks', requireRole(Role.TEACHER), routineTrackerController.createTeacherStudentTask);
router.post('/teacher/students/:studentId/weaknesses', requireRole(Role.TEACHER), routineTrackerController.upsertTeacherStudentWeakness);
router.post('/teacher/students/:studentId/recommendations', requireRole(Role.TEACHER), routineTrackerController.createTeacherStudentRecommendation);
router.post('/teacher/students/:studentId/feedback', requireRole(Role.TEACHER), routineTrackerController.createTeacherStudentFeedback);
router.post('/teacher/students/:studentId/recalculate-weaknesses', requireRole(Role.TEACHER), routineTrackerController.recalculateStudentWeaknesses);

// ─── Admin routes ────────────────────────────────────────────────────────────
router.get('/admin/overview', requireRole(Role.ADMIN), routineTrackerController.getAdminOverview);
router.get('/admin/students', requireRole(Role.ADMIN), routineTrackerController.getAdminStudents);
router.get('/admin/students/:studentId/overview', requireRole(Role.ADMIN), routineTrackerController.getAdminStudentOverview);
router.post('/admin/students/:studentId/recalculate-weaknesses', requireRole(Role.ADMIN), routineTrackerController.recalculateStudentWeaknesses);
router.get('/admin/categories', requireRole(Role.ADMIN), routineTrackerController.listCategories);
router.post('/admin/categories', requireRole(Role.ADMIN), routineTrackerController.createCategory);
router.patch('/admin/categories/:categoryId', requireRole(Role.ADMIN), routineTrackerController.updateCategory);
router.delete('/admin/categories/:categoryId', requireRole(Role.ADMIN), routineTrackerController.deleteCategory);

export default router;
