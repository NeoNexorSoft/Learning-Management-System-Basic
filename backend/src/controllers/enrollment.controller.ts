import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollment.service';

export const enrollmentController = {
  async enrollStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { course_id } = req.body;
      if (!course_id) {
        res.status(400).json({ status: 'error', message: 'course_id is required' });
        return;
      }
      const enrollment = await enrollmentService.enrollStudent(req.user!.userId, course_id);
      res.status(201).json({ status: 'success', data: { enrollment } });
    } catch (err) {
      next(err);
    }
  },

  async getMyEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await enrollmentService.getMyEnrollments(req.user!.userId);
      res.json({ status: 'success', data: { enrollments } });
    } catch (err) {
      next(err);
    }
  },

  async getEnrollmentDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await enrollmentService.getEnrollmentDetail(
        req.params.id as string,
        req.user!.userId,
        req.user!.role,
      );
      res.json({ status: 'success', data: { enrollment } });
    } catch (err) {
      next(err);
    }
  },

  async completeLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await enrollmentService.completeLesson(
        req.user!.userId,
        req.params.id as string,
      );
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getEnrolledStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = req.query.page  as string | undefined;
      const limit = req.query.limit as string | undefined;

      const result = await enrollmentService.getEnrolledStudents(
        req.params.id as string,
        req.user!.userId,
        req.user!.role,
        {
          page:  page  ? parseInt(page, 10)  : 1,
          limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
        },
      );
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },
};
