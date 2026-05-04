import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

export const assignmentRouter = Router();

assignmentRouter.use(authenticate);

// ─── Student ─────────────────────────────────────────────────────────────────
assignmentRouter.get('/count',         requireRole('STUDENT'), assignmentController.getUnreadAssignmentCount);
assignmentRouter.get('/my',            requireRole('STUDENT'), assignmentController.getStudentAssignments);
assignmentRouter.get('/score-history', requireRole('STUDENT'), assignmentController.getStudentScoreHistory);

// ─── Teacher ─────────────────────────────────────────────────────────────────
assignmentRouter.get('/teacher',       requireRole('TEACHER'), assignmentController.getTeacherAssignments);
assignmentRouter.post('/create',       requireRole('TEACHER'), assignmentController.createAssignment);
assignmentRouter.put('/teacher/:id',   requireRole('TEACHER'), assignmentController.editTeacherAssignment);

// ─── Admin ───────────────────────────────────────────────────────────────────
assignmentRouter.get('/admin',             requireRole('ADMIN'), assignmentController.getAdminAssignments);
assignmentRouter.put('/admin/:id',         requireRole('ADMIN'), assignmentController.editAssignment);
assignmentRouter.patch('/admin/:id/approve', requireRole('ADMIN'), assignmentController.approveAssignment);
assignmentRouter.patch('/admin/:id/reject',  requireRole('ADMIN'), assignmentController.rejectAssignment);
assignmentRouter.delete('/admin/:id',      requireRole('ADMIN'), assignmentController.softDeleteAssignment);

// ─── Parameterised (teacher + student) ───────────────────────────────────────
assignmentRouter.get('/:id/submissions',    requireRole('TEACHER'), assignmentController.getAssignmentSubmissions);
assignmentRouter.patch('/:id/release-scores', requireRole('TEACHER'), assignmentController.releaseScores);
assignmentRouter.post('/submissions/:submissionId/grade', requireRole('TEACHER'), assignmentController.gradeSubmission);

assignmentRouter.post('/:id/submit',      requireRole('STUDENT'), assignmentController.submitAssignment);
assignmentRouter.delete('/:id/submission', requireRole('STUDENT'), assignmentController.deleteSubmission);

// Placeholder routers expected by app.ts — routes to be added when those features are built
export const submissionRouter = Router();
export const lessonAssignmentRouter = Router();
