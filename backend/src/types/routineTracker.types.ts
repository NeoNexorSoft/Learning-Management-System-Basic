import {
  RoutinePlanStatus,
  RoutineTaskStatus,
  RoutineTaskType,
  TrackerRecommendationPriority,
  WeaknessLevel,
} from '@prisma/client';

export type AuthRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface CreateRoutinePlanInput {
  student_id: string;
  title: string;
  start_date: Date;
  end_date?: Date;
  status?: RoutinePlanStatus;
  created_by_id?: string;
}

export interface CreateRoutineTaskInput {
  routine_plan_id?: string;
  student_id: string;
  category_id?: string;
  subject: string;
  topic?: string;
  task_type?: RoutineTaskType;
  date: Date;
  start_time?: Date;
  end_time?: Date;
  duration_minutes?: number;
  status?: RoutineTaskStatus;
  note?: string;
  created_by_id?: string;
}

export interface UpdateRoutineTaskInput {
  routine_plan_id?: string | null;
  category_id?: string | null;
  subject?: string;
  topic?: string | null;
  task_type?: RoutineTaskType;
  date?: Date;
  start_time?: Date | null;
  end_time?: Date | null;
  duration_minutes?: number | null;
  status?: RoutineTaskStatus;
  note?: string | null;
}

export interface UpsertStudentWeaknessInput {
  student_id: string;
  category_id: string;
  score: number;
  level?: WeaknessLevel;
  note?: string;
  identified_by_id?: string;
}

export interface CreateRecommendationInput {
  student_id: string;
  category_id?: string;
  title: string;
  description?: string;
  priority?: TrackerRecommendationPriority;
  action_label?: string;
  resource_url?: string;
  created_by_id?: string;
}

export interface CreateFeedbackInput {
  student_id: string;
  teacher_id?: string;
  message: string;
}

export interface WeaknessCalculationInput {
  score: number;
  completedTasks?: number;
  totalTasks?: number;
  missedTasks?: number;
}

export interface WeaknessCalculationResult {
  normalizedScore: number;
  level: WeaknessLevel;
  completionRate: number;
  missedRate: number;
}
