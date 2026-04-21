import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollment.service';

export const assignmentController = {
  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, due_date, total_marks } = req.body;
      if (!title) {
        res.status(400).json({ status: 'error', message: 'title is required' });
        return;
      }
      const assignment = await enrollmentService.createAssignment(
        req.params.lessonId as string,
        req.user!.userId,
        {
          title,
          description,
          due_date:    due_date    ? new Date(due_date) : undefined,
          total_marks: total_marks ? Number(total_marks) : undefined,
        },
      );
      res.status(201).json({ status: 'success', data: { assignment } });
    } catch (err) {
      next(err);
    }
  },

  async getMyAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await enrollmentService.getMyAssignments(req.user!.userId);
      res.json({ status: 'success', data: { assignments } });
    } catch (err) {
      next(err);
    }
  },

  async submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, file_url } = req.body;
      if (!content && !file_url) {
        res.status(400).json({ status: 'error', message: 'content or file_url is required' });
        return;
      }
      const submission = await enrollmentService.submitAssignment(
        req.user!.userId,
        req.params.id as string,
        { content, file_url },
      );
      res.status(201).json({ status: 'success', data: { submission } });
    } catch (err) {
      next(err);
    }
  },

  async getAssignmentSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissions = await enrollmentService.getAssignmentSubmissions(
        req.params.id as string,
        req.user!.userId,
      );
      res.json({ status: 'success', data: { submissions } });
    } catch (err) {
      next(err);
    }
  },

  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { grade, feedback } = req.body;
      if (grade === undefined || grade === null) {
        res.status(400).json({ status: 'error', message: 'grade is required' });
        return;
      }
      const submission = await enrollmentService.gradeSubmission(
        req.params.id as string,
        req.user!.userId,
        { grade: Number(grade), feedback },
      );
      res.json({ status: 'success', data: { submission } });
    } catch (err) {
      next(err);
    }
  },
};
