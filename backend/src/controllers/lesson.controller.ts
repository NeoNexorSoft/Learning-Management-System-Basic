import { Request, Response, NextFunction } from 'express';
import { LessonType } from '@prisma/client';
import { courseService } from '../services/course.service';

export const lessonController = {
  async createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, type, content, video_url, file_url, duration, order } = req.body;

      if (!title || !type) {
        res.status(400).json({ status: 'error', message: 'title and type are required' });
        return;
      }
      if (!Object.values(LessonType).includes(type)) {
        res.status(400).json({ status: 'error', message: 'Invalid lesson type' });
        return;
      }

      const lesson = await courseService.createLesson(
        req.params.sectionId as string,
        req.user!.userId,
        { title, type, content, video_url, file_url, duration, order },
      );
      res.status(201).json({ status: 'success', data: { lesson } });
    } catch (err) {
      next(err);
    }
  },

  async updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, type, content, video_url, file_url, duration, order } = req.body;

      if (type && !Object.values(LessonType).includes(type)) {
        res.status(400).json({ status: 'error', message: 'Invalid lesson type' });
        return;
      }

      const lesson = await courseService.updateLesson(
        req.params.id as string,
        req.user!.userId,
        { title, type, content, video_url, file_url, duration, order },
      );
      res.json({ status: 'success', data: { lesson } });
    } catch (err) {
      next(err);
    }
  },

  async deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await courseService.deleteLesson(req.params.id as string, req.user!.userId);
      res.json({ status: 'success', message: 'Lesson deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
