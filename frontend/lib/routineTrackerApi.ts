import api from "@/lib/axios";
import type {
  AdminTrackerOverview,
  AdminTrackerStudent,
  CreateFeedbackPayload,
  CreateRecommendationPayload,
  CreateRoutineTaskPayload,
  PerformancePoint,
  RoutineTask,
  RoutineTrackerOverview,
  StudentWeakness,
  TeacherTrackerStudent,
  TrackerRecommendation,
  WeaknessCategory,
} from "@/types/routine-tracker";

const unwrap = <T>(response: any, key?: string): T => {
  const payload = response?.data?.data ?? response?.data;
  if (key && payload?.[key] !== undefined) return payload[key] as T;
  return payload as T;
};

export const routineTrackerApi = {
  async getMyOverview(): Promise<RoutineTrackerOverview> {
    const response = await api.get("/api/routine-tracker/my/overview");
    return unwrap<RoutineTrackerOverview>(response);
  },

  async getMyRoutine(params?: { start_date?: string; end_date?: string }): Promise<RoutineTask[]> {
    const response = await api.get("/api/routine-tracker/my/routine", { params });
    return unwrap<RoutineTask[]>(response, "tasks");
  },

  async createMyTask(payload: CreateRoutineTaskPayload): Promise<RoutineTask> {
    const response = await api.post("/api/routine-tracker/my/routine/tasks", payload);
    return unwrap<RoutineTask>(response, "task");
  },

  async completeMyTask(taskId: string, note?: string): Promise<RoutineTask> {
    const response = await api.patch(`/api/routine-tracker/my/routine/tasks/${taskId}/complete`, { note });
    return unwrap<RoutineTask>(response, "task");
  },

  async getMyWeaknesses(): Promise<StudentWeakness[]> {
    const response = await api.get("/api/routine-tracker/my/weaknesses");
    return unwrap<StudentWeakness[]>(response, "weaknesses");
  },

  async getMyRecommendations(): Promise<TrackerRecommendation[]> {
    const response = await api.get("/api/routine-tracker/my/recommendations");
    return unwrap<TrackerRecommendation[]>(response, "recommendations");
  },

  async getMyPerformance(params?: { start_date?: string; end_date?: string }): Promise<PerformancePoint[]> {
    const response = await api.get("/api/routine-tracker/my/performance", { params });
    return unwrap<PerformancePoint[]>(response, "performance");
  },

  async getTeacherStudents(): Promise<TeacherTrackerStudent[]> {
    const response = await api.get("/api/routine-tracker/teacher/students");
    return unwrap<TeacherTrackerStudent[]>(response, "students");
  },

  async getTeacherStudentOverview(studentId: string): Promise<RoutineTrackerOverview> {
    const response = await api.get(`/api/routine-tracker/teacher/students/${studentId}/overview`);
    return unwrap<RoutineTrackerOverview>(response);
  },

  async getTeacherStudentRoutine(studentId: string, params?: { start_date?: string; end_date?: string }): Promise<RoutineTask[]> {
    const response = await api.get(`/api/routine-tracker/teacher/students/${studentId}/routine`, { params });
    return unwrap<RoutineTask[]>(response, "tasks");
  },

  async getTeacherStudentWeaknesses(studentId: string): Promise<StudentWeakness[]> {
    const response = await api.get(`/api/routine-tracker/teacher/students/${studentId}/weaknesses`);
    return unwrap<StudentWeakness[]>(response, "weaknesses");
  },

  async createTeacherStudentTask(studentId: string, payload: CreateRoutineTaskPayload): Promise<RoutineTask> {
    const response = await api.post(`/api/routine-tracker/teacher/students/${studentId}/routine/tasks`, payload);
    return unwrap<RoutineTask>(response, "task");
  },

  async createTeacherStudentRecommendation(studentId: string, payload: CreateRecommendationPayload): Promise<TrackerRecommendation> {
    const response = await api.post(`/api/routine-tracker/teacher/students/${studentId}/recommendations`, payload);
    return unwrap<TrackerRecommendation>(response, "recommendation");
  },

  async createTeacherStudentFeedback(studentId: string, payload: CreateFeedbackPayload): Promise<{ id: string; message: string }> {
    const response = await api.post(`/api/routine-tracker/teacher/students/${studentId}/feedback`, payload);
    return unwrap<{ id: string; message: string }>(response, "feedback");
  },

  async recalculateTeacherStudentWeaknesses(studentId: string): Promise<StudentWeakness[]> {
    const response = await api.post(`/api/routine-tracker/teacher/students/${studentId}/recalculate-weaknesses`);
    return unwrap<StudentWeakness[]>(response, "weaknesses");
  },

  async getAdminOverview(): Promise<AdminTrackerOverview> {
    const response = await api.get("/api/routine-tracker/admin/overview");
    return unwrap<AdminTrackerOverview>(response);
  },

  async getAdminStudents(): Promise<AdminTrackerStudent[]> {
    const response = await api.get("/api/routine-tracker/admin/students");
    return unwrap<AdminTrackerStudent[]>(response, "students");
  },

  async getAdminStudentOverview(studentId: string): Promise<RoutineTrackerOverview> {
    const response = await api.get(`/api/routine-tracker/admin/students/${studentId}/overview`);
    return unwrap<RoutineTrackerOverview>(response);
  },

  async recalculateAdminStudentWeaknesses(studentId: string): Promise<StudentWeakness[]> {
    const response = await api.post(`/api/routine-tracker/admin/students/${studentId}/recalculate-weaknesses`);
    return unwrap<StudentWeakness[]>(response, "weaknesses");
  },

  async getAdminCategories(): Promise<WeaknessCategory[]> {
    const response = await api.get("/api/routine-tracker/admin/categories");
    return unwrap<WeaknessCategory[]>(response, "categories");
  },
};
