import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { verifyAccessToken } from '../utils/jwt';
import { courseController } from '../controllers/course.controller';
import { sectionController } from '../controllers/section.controller';
import { lessonController } from '../controllers/lesson.controller';

// Populates req.user if a valid Bearer token is present, but never blocks the request.
const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(authHeader.split(' ')[1]);
      req.user = { userId: payload.userId, role: payload.role as Role };
    } catch {}
  }
  next();
};

// ─── /api/courses ─────────────────────────────────────────────────────────────

export const courseRouter = Router();

// Public — static paths before /:slug
courseRouter.get('/', courseController.listPublicCourses);

// Teacher — static paths that could collide with /:slug must come first
courseRouter.post('/', authenticate, requireRole('TEACHER'), courseController.createCourse);

// /:id sub-routes — ordered by specificity before the bare /:slug
courseRouter.put('/:id',            authenticate, requireRole('TEACHER'), courseController.updateCourse);
courseRouter.post('/:id/submit',    authenticate, requireRole('TEACHER'), courseController.submitCourse);
courseRouter.post('/:id/objectives', authenticate, requireRole('TEACHER'), courseController.replaceObjectives);
courseRouter.post('/:courseId/sections', authenticate, requireRole('TEACHER'), sectionController.createSection);

// Public by-id lookup — must come before /:slug to avoid being swallowed
courseRouter.get('/by-id/:id', courseController.getCourseById);

// Student learn access
courseRouter.get('/learn/:courseId', authenticate, requireRole('STUDENT'), courseController.getLearnCourse);

// Public detail — must be last on this router to avoid swallowing the paths above
courseRouter.get('/:slug', optionalAuthenticate, courseController.getCourseBySlug);

// ─── /api/teacher ─────────────────────────────────────────────────────────────

export const teacherRouter = Router();
teacherRouter.use(authenticate, requireRole('TEACHER'));

teacherRouter.get('/courses', courseController.listTeacherCourses);
teacherRouter.get('/courses/:id', courseController.getTeacherCourseById);

// ─── /api/admin ───────────────────────────────────────────────────────────────

export const adminRouter = Router();
adminRouter.use(authenticate, requireRole('ADMIN'));

adminRouter.get('/courses',                    courseController.listAllCourses);
adminRouter.get('/courses/preview/:slug',      courseController.getCourseBySlugAdmin);
adminRouter.get('/courses/:id',                courseController.getAdminCourseById);
adminRouter.put('/courses/:id/approve',    courseController.approveCourse);
adminRouter.put('/courses/:id/reject',     courseController.rejectCourse);
adminRouter.put('/courses/:id/popular',    courseController.togglePopular);
adminRouter.delete('/courses/:id',         courseController.adminDeleteCourse);

// ─── /api/categories ──────────────────────────────────────────────────────────

export const categoryRouter = Router();

// Public
categoryRouter.get('/', courseController.listCategories);

// Admin only
categoryRouter.post('/',    authenticate, requireRole('ADMIN'), courseController.createCategory);
categoryRouter.put('/:id',  authenticate, requireRole('ADMIN'), courseController.updateCategory);
categoryRouter.delete('/:id', authenticate, requireRole('ADMIN'), courseController.deleteCategory);

// ─── /api/sections ────────────────────────────────────────────────────────────

export const sectionRouter = Router();
sectionRouter.use(authenticate, requireRole('TEACHER'));

sectionRouter.put('/:id',                  sectionController.updateSection);
sectionRouter.delete('/:id',               sectionController.deleteSection);
sectionRouter.post('/:sectionId/lessons',  lessonController.createLesson);

// ─── /api/lessons ─────────────────────────────────────────────────────────────

export const lessonRouter = Router();
lessonRouter.use(authenticate, requireRole('TEACHER'));

lessonRouter.put('/:id',    lessonController.updateLesson);
lessonRouter.delete('/:id', lessonController.deleteLesson);
