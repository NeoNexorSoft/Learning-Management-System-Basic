import { Request, Response, NextFunction } from 'express';
import { CourseLevel, CourseStatus, ObjectiveType } from '@prisma/client';
import { courseService } from '../services/course.service';

interface IdParam       { id: string }
interface SlugParam     { slug: string }
interface CourseIdParam { courseId: string }

// ─────────────────────────────────────────────
// Pagination Helpers
// ─────────────────────────────────────────────
const parsePage  = (val: string | undefined, def = 1):  number => { const n = parseInt(val ?? '', 10); return Number.isInteger(n) && n > 0 ? n : def; };
const parseLimit = (val: string | undefined, def = 12, max = 100): number => { const n = parseInt(val ?? '', 10); return Number.isInteger(n) && n > 0 ? Math.min(n, max) : def; };

export const courseController = {

  // ─── Public ─────────────────────────────────────────────────────────────────

  // No params used here — plain Request is fine
  async listPublicCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const level      = req.query.level      as string | undefined;
      const search     = req.query.search     as string | undefined;
      const sort       = req.query.sort       as string | undefined;
      const category   = req.query.category   as string | undefined;
      const page       = req.query.page       as string | undefined;
      const limit      = req.query.limit      as string | undefined;
      const price_min  = req.query.price_min  as string | undefined;
      const price_max  = req.query.price_max  as string | undefined;
      const is_popular = req.query.is_popular === 'true' ? true : undefined;

      if (level && !Object.values(CourseLevel).includes(level as CourseLevel)) {
        res.status(400).json({ status: 'error', message: 'Invalid level value' });
        return;
      }

      const result = await courseService.listPublicCourses({
        category,
        level:     level as CourseLevel | undefined,
        price_min: price_min ? parseFloat(price_min) : undefined,
        price_max: price_max ? parseFloat(price_max) : undefined,
        search,
        sort,
        page:  parsePage(page),
        limit: parseLimit(limit, 12),
        is_popular,
      });

      res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  },

  // Request<SlugParam> — tells TS that req.params.slug is a guaranteed string
  async getCourseBySlug(req: Request<SlugParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getCourseBySlug(
        req.params.slug,
        req.user?.userId,
        req.user?.role,
      );
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  // ─── Teacher ────────────────────────────────────────────────────────────────

  async getTeacherCourseById(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getTeacherCourseById(req.params.id, req.user!.userId);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async getTeacherCoursePreview(req: Request<SlugParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getCourseBySlugTeacher(req.params.slug, req.user!.userId);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  // No params used here — plain Request is fine
  async listTeacherCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = req.query.page  as string | undefined;
      const limit = req.query.limit as string | undefined;

      const result = await courseService.listTeacherCourses(req.user!.userId, {
        page:  parsePage(page),
        limit: parseLimit(limit, 20),
      });

      res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  },

  // No params used here — plain Request is fine
  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, category_id, level } = req.body;

      if (!title || !category_id) {
        res.status(400).json({ status: 'error', message: 'title and category_id are required' });
        return;
      }
      if (level && !Object.values(CourseLevel).includes(level)) {
        res.status(400).json({ status: 'error', message: 'Invalid level value' });
        return;
      }

      const course = await courseService.createCourse(req.user!.userId, req.body);
      res.status(201).json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async updateCourse(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.updateCourse(
        req.params.id,
        req.user!.userId,
        req.body,
      );
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async submitCourse(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.submitCourse(req.params.id, req.user!.userId);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async replaceObjectives(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { objectives } = req.body;

      if (!Array.isArray(objectives) || objectives.length === 0) {
        res.status(400).json({ status: 'error', message: 'objectives must be a non-empty array' });
        return;
      }

      const validTypes = Object.values(ObjectiveType);
      for (const obj of objectives) {
        if (!obj.type || !validTypes.includes(obj.type)) {
          res.status(400).json({ status: 'error', message: `Invalid objective type: ${obj.type}` });
          return;
        }
        if (!obj.content) {
          res.status(400).json({ status: 'error', message: 'Each objective must have a content field' });
          return;
        }
      }

      const result = await courseService.replaceObjectives(
        req.params.id,
        req.user!.userId,
        objectives,
      );
      res.json({ status: 'success', data: { objectives: result } });
    } catch (err) {
      next(err);
    }
  },

  // ─── Admin ──────────────────────────────────────────────────────────────────

  async getCourseBySlugAdmin(req: Request<SlugParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getCourseBySlugAdmin(req.params.slug);
      res.json({ success: true, data: { course } });
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
    }
  },

  async getAdminCourseById(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getAdminCourseById(req.params.id);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  // No params used here — plain Request is fine
  async listAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page   = req.query.page   as string | undefined;
      const limit  = req.query.limit  as string | undefined;

      if (status && !Object.values(CourseStatus).includes(status as CourseStatus)) {
        res.status(400).json({ status: 'error', message: 'Invalid status value' });
        return;
      }

      const result = await courseService.listAllCourses({
        status: status as CourseStatus | undefined,
        search,
        page:  parsePage(page),
        limit: parseLimit(limit, 20),
      });

      res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  },

  async approveCourse(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.approveCourse(req.params.id);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async rejectCourse(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      if (!reason) {
        res.status(400).json({ status: 'error', message: 'reason is required' });
        return;
      }
      const course = await courseService.rejectCourse(req.params.id, reason);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async adminDeleteCourse(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      await courseService.adminDeleteCourse(req.params.id);
      res.json({ status: 'success', message: 'Course deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async togglePopular(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { is_popular } = req.body;
      if (typeof is_popular !== 'boolean') {
        res.status(400).json({ status: 'error', message: 'is_popular must be a boolean' });
        return;
      }
      const course = await courseService.togglePopular(req.params.id, is_popular);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  // ─── Categories ─────────────────────────────────────────────────────────────

  async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await courseService.listCategories();
      res.json({ status: 'success', data: { categories } });
    } catch (err) {
      next(err);
    }
  },

  // No params used here — plain Request is fine
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, parent_id } = req.body;
      if (!name) {
        res.status(400).json({ status: 'error', message: 'name is required' });
        return;
      }
      const category = await courseService.createCategory(name, parent_id);
      res.status(201).json({ status: 'success', data: { category } });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await courseService.updateCategory(req.params.id, req.body);
      res.json({ status: 'success', data: { category } });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      await courseService.deleteCategory(req.params.id);
      res.json({ status: 'success', message: 'Category deleted successfully' }); // ✅ fixed: was 'Course deleted' — copy-paste bug
    } catch (err) {
      next(err);
    }
  },

  async getLearnCourse(req: Request<CourseIdParam>, res: Response): Promise<void> {
    try {
      const result = await courseService.getLearnCourse(
        req.params.courseId,
        req.user!.userId,
      );
      res.json({ success: true, data: { course: result } });
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
    }
  },

  async getCourseById(req: Request<IdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await courseService.getCourseById(req.params.id);
      res.json({ success: true, data: { course: result } });
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
    }
  },
};