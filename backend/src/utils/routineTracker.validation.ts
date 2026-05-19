import { z } from 'zod';
import {
  RoutinePlanStatus,
  RoutineTaskStatus,
  RoutineTaskType,
  TrackerRecommendationPriority,
  WeaknessLevel,
} from '@prisma/client';

const parseableDateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

const optionalDateString = parseableDateString.optional();
const requiredDateString = parseableDateString;

const uuid = z.string().trim().min(1, 'ID is required');

export const routineTrackerValidation = {
  dateRangeQuery: z.object({
    startDate: optionalDateString,
    endDate: optionalDateString,
  }),

  studentIdParam: z.object({
    studentId: uuid,
  }),

  taskIdParam: z.object({
    taskId: uuid,
  }),

  categoryIdParam: z.object({
    categoryId: uuid,
  }),

  createCategory: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    type: z.string().trim().max(80).optional(),
    is_active: z.boolean().optional(),
  }),

  updateCategory: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    type: z.string().trim().max(80).nullable().optional(),
    is_active: z.boolean().optional(),
  }),

  createPlan: z.object({
    title: z.string().trim().min(2).max(160),
    start_date: requiredDateString,
    end_date: optionalDateString,
    status: z.nativeEnum(RoutinePlanStatus).optional(),
  }),

  createTask: z.object({
    routine_plan_id: z.string().trim().min(1).optional(),
    category_id: z.string().trim().min(1).optional(),
    subject: z.string().trim().min(2).max(120),
    topic: z.string().trim().max(160).optional(),
    task_type: z.nativeEnum(RoutineTaskType).optional(),
    date: requiredDateString,
    start_time: optionalDateString,
    end_time: optionalDateString,
    duration_minutes: z.number().int().positive().max(1440).optional(),
    status: z.nativeEnum(RoutineTaskStatus).optional(),
    note: z.string().trim().max(2000).optional(),
  }),

  updateTask: z.object({
    routine_plan_id: z.string().trim().min(1).nullable().optional(),
    category_id: z.string().trim().min(1).nullable().optional(),
    subject: z.string().trim().min(2).max(120).optional(),
    topic: z.string().trim().max(160).nullable().optional(),
    task_type: z.nativeEnum(RoutineTaskType).optional(),
    date: optionalDateString,
    start_time: parseableDateString.nullable().optional(),
    end_time: parseableDateString.nullable().optional(),
    duration_minutes: z.number().int().positive().max(1440).nullable().optional(),
    status: z.nativeEnum(RoutineTaskStatus).optional(),
    note: z.string().trim().max(2000).nullable().optional(),
  }),

  completeTask: z.object({
    note: z.string().trim().max(2000).optional(),
  }),

  upsertWeakness: z.object({
    category_id: z.string().trim().min(1),
    score: z.number().int().min(0).max(100),
    level: z.nativeEnum(WeaknessLevel).optional(),
    note: z.string().trim().max(2000).optional(),
  }),

  createRecommendation: z.object({
    category_id: z.string().trim().min(1).optional(),
    title: z.string().trim().min(2).max(180),
    description: z.string().trim().max(2000).optional(),
    priority: z.nativeEnum(TrackerRecommendationPriority).optional(),
    action_label: z.string().trim().max(80).optional(),
    resource_url: z.string().trim().url().optional(),
  }),

  createFeedback: z.object({
    message: z.string().trim().min(2).max(3000),
  }),
};

export const parseDateRange = (query: unknown): { startDate?: Date; endDate?: Date } => {
  const parsed = routineTrackerValidation.dateRangeQuery.parse(query);
  return {
    startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
    endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
  };
};
