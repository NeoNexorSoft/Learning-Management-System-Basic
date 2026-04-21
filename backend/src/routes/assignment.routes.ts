import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { assignmentController } from '../controllers/assignment.controller';

// ─── /api/assignments ─────────────────────────────────────────────────────────

export const assignmentRouter = Router();
assignmentRouter.use(authenticate);

// Static path before /:id
assignmentRouter.get('/my', requireRole('STUDENT'), assignmentController.getMyAssignments);

assignmentRouter.post('/:id/submit',      requireRole('STUDENT'), assignmentController.submitAssignment);
assignmentRouter.get('/:id/submissions',  requireRole('TEACHER'), assignmentController.getAssignmentSubmissions);

// ─── /api/submissions ─────────────────────────────────────────────────────────

export const submissionRouter = Router();
submissionRouter.put(
  '/:id/grade',
  authenticate,
  requireRole('TEACHER'),
  assignmentController.gradeSubmission,
);

// ─── /api/lessons  (POST /:lessonId/assignments) ──────────────────────────────
// Mounted alongside existing lessonRouter and lessonProgressRouter.
// POST /:lessonId/assignments has two segments; no conflict with PUT /:id or POST /:id/complete.

export const lessonAssignmentRouter = Router();
lessonAssignmentRouter.post(
  '/:lessonId/assignments',
  authenticate,
  requireRole('TEACHER'),
  assignmentController.createAssignment,
);
