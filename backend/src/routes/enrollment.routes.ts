import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { enrollmentController } from '../controllers/enrollment.controller';
import { reviewController } from '../controllers/review.controller';

// ─── /api/enrollments ─────────────────────────────────────────────────────────

export const enrollmentRouter = Router();
enrollmentRouter.use(authenticate);

// Static paths before /:id
enrollmentRouter.get('/my',  requireRole('STUDENT'), enrollmentController.getMyEnrollments);
enrollmentRouter.post('/',   requireRole('STUDENT'), enrollmentController.enrollStudent);
enrollmentRouter.get('/:id', enrollmentController.getEnrollmentDetail);

// ─── /api/lessons  (POST /:id/complete) ───────────────────────────────────────
// Mounted alongside existing lessonRouter — no method/path conflicts.

export const lessonProgressRouter = Router();
lessonProgressRouter.post(
  '/:id/complete',
  authenticate,
  requireRole('STUDENT'),
  enrollmentController.completeLesson,
);

// ─── /api/courses  (GET /:id/enrolled-students) ───────────────────────────────
// Mounted alongside existing courseRouter.
// /:id/enrolled-students has two segments so it won't collide with GET /:slug.

export const enrolledStudentsRouter = Router();
enrolledStudentsRouter.get(
  '/:id/enrolled-students',
  authenticate,
  requireRole('TEACHER', 'ADMIN'),
  enrollmentController.getEnrolledStudents,
);

// ─── /api/courses  (review sub-routes) ───────────────────────────────────────

export const reviewRouter = Router();
reviewRouter.post(
  '/:id/reviews',
  authenticate,
  requireRole('STUDENT'),
  reviewController.createReview,
);
reviewRouter.get('/:id/reviews', reviewController.getCourseReviews);
