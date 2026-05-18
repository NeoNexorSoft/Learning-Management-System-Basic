import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { routineTrackerService } from '../services/routineTracker.service';
import { parseDateRange, routineTrackerValidation } from '../utils/routineTracker.validation';

const toDate = (value?: string | null): Date | undefined => (value ? new Date(value) : undefined);
const toNullableDate = (value?: string | null): Date | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return new Date(value);
};

export const routineTrackerController = {
  // ─── Common/Student ────────────────────────────────────────────────────────

  async getMyOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await routineTrackerService.getStudentOverview(req.user!.userId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getMyRoutinePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await routineTrackerService.listRoutinePlans(req.user!.userId);
      res.json({ status: 'success', data: { plans } });
    } catch (error) {
      next(error);
    }
  },

  async createMyRoutinePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = routineTrackerValidation.createPlan.parse(req.body);
      const plan = await routineTrackerService.createRoutinePlan({
        student_id: req.user!.userId,
        title: payload.title,
        start_date: new Date(payload.start_date),
        end_date: toDate(payload.end_date),
        status: payload.status,
        created_by_id: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: { plan } });
    } catch (error) {
      next(error);
    }
  },

  async getMyRoutineTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = parseDateRange(req.query);
      const tasks = await routineTrackerService.listRoutineTasks(req.user!.userId, range);
      res.json({ status: 'success', data: { tasks } });
    } catch (error) {
      next(error);
    }
  },

  async createMyRoutineTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = routineTrackerValidation.createTask.parse(req.body);
      const task = await routineTrackerService.createRoutineTask({
        routine_plan_id: payload.routine_plan_id,
        student_id: req.user!.userId,
        category_id: payload.category_id,
        subject: payload.subject,
        topic: payload.topic,
        task_type: payload.task_type,
        date: new Date(payload.date),
        start_time: toDate(payload.start_time),
        end_time: toDate(payload.end_time),
        duration_minutes: payload.duration_minutes,
        status: payload.status,
        note: payload.note,
        created_by_id: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async updateMyRoutineTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = routineTrackerValidation.taskIdParam.parse(req.params);
      const payload = routineTrackerValidation.updateTask.parse(req.body);
      const task = await routineTrackerService.updateRoutineTask(taskId, req.user!.userId, {
        routine_plan_id: payload.routine_plan_id,
        category_id: payload.category_id,
        subject: payload.subject,
        topic: payload.topic,
        task_type: payload.task_type,
        date: toDate(payload.date),
        start_time: toNullableDate(payload.start_time),
        end_time: toNullableDate(payload.end_time),
        duration_minutes: payload.duration_minutes,
        status: payload.status,
        note: payload.note,
      });
      res.json({ status: 'success', data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async completeMyRoutineTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = routineTrackerValidation.taskIdParam.parse(req.params);
      const payload = routineTrackerValidation.completeTask.parse(req.body);
      const task = await routineTrackerService.completeRoutineTask(taskId, req.user!.userId, payload.note);
      res.json({ status: 'success', data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async deleteMyRoutineTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = routineTrackerValidation.taskIdParam.parse(req.params);
      await routineTrackerService.deleteRoutineTask(taskId, req.user!.userId);
      res.json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  },

  async getMyWeaknesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const weaknesses = await routineTrackerService.listWeaknesses(req.user!.userId);
      res.json({ status: 'success', data: { weaknesses } });
    } catch (error) {
      next(error);
    }
  },

  async getMyRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recommendations = await routineTrackerService.listRecommendations(req.user!.userId);
      res.json({ status: 'success', data: { recommendations } });
    } catch (error) {
      next(error);
    }
  },

  async getMyPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = parseDateRange(req.query);
      const performance = await routineTrackerService.getPerformance(req.user!.userId, range);
      res.json({ status: 'success', data: { performance } });
    } catch (error) {
      next(error);
    }
  },

  // ─── Teacher ───────────────────────────────────────────────────────────────

  async getTeacherStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await routineTrackerService.getTeacherStudents(req.user!.userId);
      res.json({ status: 'success', data: { students } });
    } catch (error) {
      next(error);
    }
  },

  async getTeacherStudentOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const data = await routineTrackerService.getStudentOverview(studentId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getTeacherStudentRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const range = parseDateRange(req.query);
      const tasks = await routineTrackerService.listRoutineTasks(studentId, range);
      res.json({ status: 'success', data: { tasks } });
    } catch (error) {
      next(error);
    }
  },

  async getTeacherStudentWeaknesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const weaknesses = await routineTrackerService.listWeaknesses(studentId);
      res.json({ status: 'success', data: { weaknesses } });
    } catch (error) {
      next(error);
    }
  },

  async createTeacherStudentTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const payload = routineTrackerValidation.createTask.parse(req.body);
      const task = await routineTrackerService.createRoutineTask({
        routine_plan_id: payload.routine_plan_id,
        student_id: studentId,
        category_id: payload.category_id,
        subject: payload.subject,
        topic: payload.topic,
        task_type: payload.task_type,
        date: new Date(payload.date),
        start_time: toDate(payload.start_time),
        end_time: toDate(payload.end_time),
        duration_minutes: payload.duration_minutes,
        status: payload.status,
        note: payload.note,
        created_by_id: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: { task } });
    } catch (error) {
      next(error);
    }
  },

  async upsertTeacherStudentWeakness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const payload = routineTrackerValidation.upsertWeakness.parse(req.body);
      const weakness = await routineTrackerService.upsertWeakness({
        student_id: studentId,
        category_id: payload.category_id,
        score: payload.score,
        level: payload.level,
        note: payload.note,
        identified_by_id: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: { weakness } });
    } catch (error) {
      next(error);
    }
  },

  async createTeacherStudentRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const payload = routineTrackerValidation.createRecommendation.parse(req.body);
      const recommendation = await routineTrackerService.createRecommendation({
        student_id: studentId,
        category_id: payload.category_id,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        action_label: payload.action_label,
        resource_url: payload.resource_url,
        created_by_id: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: { recommendation } });
    } catch (error) {
      next(error);
    }
  },

  async createTeacherStudentFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertTeacherCanAccessStudent(req.user!.userId, studentId);
      const payload = routineTrackerValidation.createFeedback.parse(req.body);
      const feedback = await routineTrackerService.createFeedback({
        student_id: studentId,
        teacher_id: req.user!.userId,
        message: payload.message,
      });
      res.status(201).json({ status: 'success', data: { feedback } });
    } catch (error) {
      next(error);
    }
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async getAdminOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await routineTrackerService.getAdminOverview();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await routineTrackerService.getAdminStudents();
      res.json({ status: 'success', data: { students } });
    } catch (error) {
      next(error);
    }
  },

  async getAdminStudentOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      const data = await routineTrackerService.getStudentOverview(studentId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await routineTrackerService.listWeaknessCategories();
      res.json({ status: 'success', data: { categories } });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = routineTrackerValidation.createCategory.parse(req.body);
      const category = await routineTrackerService.createWeaknessCategory(payload);
      res.status(201).json({ status: 'success', data: { category } });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = routineTrackerValidation.categoryIdParam.parse(req.params);
      const payload = routineTrackerValidation.updateCategory.parse(req.body);
      const category = await routineTrackerService.updateWeaknessCategory(categoryId, payload);
      res.json({ status: 'success', data: { category } });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = routineTrackerValidation.categoryIdParam.parse(req.params);
      const category = await routineTrackerService.deleteWeaknessCategory(categoryId);
      res.json({ status: 'success', data: { category } });
    } catch (error) {
      next(error);
    }
  },

  async recalculateStudentWeaknesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = routineTrackerValidation.studentIdParam.parse(req.params);
      await routineTrackerService.assertActorCanAccessStudent(req.user!.userId, req.user!.role as Role, studentId);
      const weaknesses = await routineTrackerService.recalculateWeaknesses(studentId);
      res.json({ status: 'success', data: { weaknesses } });
    } catch (error) {
      next(error);
    }
  },
};
