import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/course.service';

export const sectionController = {
  async createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, order } = req.body;
      if (!title) {
        res.status(400).json({ status: 'error', message: 'title is required' });
        return;
      }
      const section = await courseService.createSection(
        req.params.courseId as string,
        req.user!.userId,
        { title, order },
      );
      res.status(201).json({ status: 'success', data: { section } });
    } catch (err) {
      next(err);
    }
  },

  async updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, order } = req.body;
      const section = await courseService.updateSection(
        req.params.id as string,
        req.user!.userId,
        { title, order },
      );
      res.json({ status: 'success', data: { section } });
    } catch (err) {
      next(err);
    }
  },

  async deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await courseService.deleteSection(req.params.id as string, req.user!.userId);
      res.json({ status: 'success', message: 'Section deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
