export type RoutineTaskStatus = "PENDING" | "UPCOMING" | "COMPLETED" | "MISSED" | "CANCELLED";
export type RoutineTaskType = "READING" | "PRACTICE" | "REVISION" | "TEST" | "ASSIGNMENT" | "OTHER";
export type WeaknessLevel = "LOW" | "MEDIUM" | "HIGH";
export type RecommendationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface RoutineTrackerOverview {
  todayStudyPlan: {
    total: number;
    completed: number;
  };
  overallPerformance: number;
  weakSubjects: number;
  strongestSubject: {
    subject: string;
    score: number;
  } | null;
}

export interface WeaknessCategory {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  is_active?: boolean;
  isActive?: boolean;
}

export interface StudentWeakness {
  id: string;
  student_id?: string;
  studentId?: string;
  category_id?: string;
  categoryId?: string;
  score: number;
  level: WeaknessLevel;
  note?: string | null;
  category?: WeaknessCategory | null;
}

export interface RoutineTask {
  id: string;
  routine_plan_id?: string | null;
  routinePlanId?: string | null;
  student_id?: string;
  studentId?: string;
  category_id?: string | null;
  categoryId?: string | null;
  subject: string;
  topic?: string | null;
  task_type?: RoutineTaskType;
  taskType?: RoutineTaskType;
  date: string;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
  duration_minutes?: number | null;
  durationMinutes?: number | null;
  status: RoutineTaskStatus;
  note?: string | null;
  category?: WeaknessCategory | null;
}

export interface TrackerRecommendation {
  id: string;
  title: string;
  description?: string | null;
  priority: RecommendationPriority;
  action_label?: string | null;
  actionLabel?: string | null;
  resource_url?: string | null;
  resourceUrl?: string | null;
  category?: WeaknessCategory | null;
}

export interface PerformancePoint {
  date: string;
  score: number;
  completed?: number;
  total?: number;
}

export interface CreateRoutineTaskPayload {
  routine_plan_id?: string | null;
  category_id?: string | null;
  subject: string;
  topic?: string;
  task_type?: RoutineTaskType;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  status?: RoutineTaskStatus;
  note?: string;
}

export interface TeacherTrackerStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  courses?: Array<{ id: string; title: string }>;
}

export interface TeacherStudentTrackerProfile {
  student: TeacherTrackerStudent;
  overview: RoutineTrackerOverview;
  weaknesses: StudentWeakness[];
  routine: RoutineTask[];
  completionRate: number;
  riskLevel: WeaknessLevel;
}

export interface CreateRecommendationPayload {
  category_id?: string | null;
  title: string;
  description?: string;
  priority?: RecommendationPriority;
  action_label?: string;
  resource_url?: string;
}

export interface CreateFeedbackPayload {
  message: string;
}

export interface AdminTrackerOverview {
  students: number;
  activePlans: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  highWeaknesses: number;
  activeCategories: number;
}

export interface AdminTrackerStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  created_at?: string;
  createdAt?: string;
  _count?: {
    routineTasks?: number;
    studentWeaknesses?: number;
    trackerRecommendations?: number;
  };
}

export interface AdminStudentTrackerProfile {
  student: AdminTrackerStudent;
  overview: RoutineTrackerOverview;
  weaknesses: StudentWeakness[];
  routine: RoutineTask[];
  completionRate: number;
  riskLevel: WeaknessLevel;
}
