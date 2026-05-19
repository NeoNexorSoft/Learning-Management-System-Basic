import {
  Prisma,
  Role,
  RoutinePlanStatus,
  RoutineTaskStatus,
  RoutineTaskType,
  TrackerRecommendationPriority,
  WeaknessLevel,
} from '@prisma/client';
import { prisma } from '../config/db';
import { routineTrackerEngine } from '../utils/routineTrackerEngine';
import {
  CreateFeedbackInput,
  CreateRecommendationInput,
  CreateRoutinePlanInput,
  CreateRoutineTaskInput,
  DateRangeFilter,
  UpdateRoutineTaskInput,
  UpsertStudentWeaknessInput,
} from '../types/routineTracker.types';

const err = (msg: string, statusCode: number) =>
  Object.assign(new Error(msg), { statusCode });

const taskInclude = {
  category: { select: { id: true, name: true, type: true } },
  routinePlan: { select: { id: true, title: true, start_date: true, end_date: true, status: true } },
} satisfies Prisma.RoutineTaskInclude;

const weaknessInclude = {
  category: { select: { id: true, name: true, type: true, description: true } },
  identifiedBy: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.StudentWeaknessInclude;

const recommendationInclude = {
  category: { select: { id: true, name: true, type: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.TrackerRecommendationInclude;

const toDateWhere = (range?: DateRangeFilter): Prisma.RoutineTaskWhereInput => {
  if (!range?.startDate && !range?.endDate) return {};

  return {
    date: {
      ...(range.startDate ? { gte: range.startDate } : {}),
      ...(range.endDate ? { lte: range.endDate } : {}),
    },
  };
};

export const routineTrackerService = {
  async assertStudent(studentId: string) {
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: Role.STUDENT, is_banned: false },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!student) throw err('Student not found', 404);
    return student;
  },

  async assertTeacherCanAccessStudent(teacherId: string, studentId: string) {
    await this.assertStudent(studentId);

    const linkedEnrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: studentId,
        course: { teacher_id: teacherId },
      },
      select: { id: true },
    });

    if (!linkedEnrollment) {
      throw err('Student is not assigned to this teacher', 403);
    }
  },

  async assertActorCanAccessStudent(actorId: string, role: Role, studentId: string) {
    if (role === Role.ADMIN) {
      await this.assertStudent(studentId);
      return;
    }

    if (role === Role.TEACHER) {
      await this.assertTeacherCanAccessStudent(actorId, studentId);
      return;
    }

    if (actorId !== studentId) throw err('Forbidden', 403);
    await this.assertStudent(studentId);
  },

  async listWeaknessCategories() {
    return prisma.weaknessCategory.findMany({
      orderBy: [{ is_active: 'desc' }, { name: 'asc' }],
    });
  },

  async createWeaknessCategory(data: {
    name: string;
    description?: string;
    type?: string;
    is_active?: boolean;
  }) {
    return prisma.weaknessCategory.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        is_active: data.is_active ?? true,
      },
    });
  },

  async updateWeaknessCategory(
    categoryId: string,
    data: { name?: string; description?: string | null; type?: string | null; is_active?: boolean },
  ) {
    await this.assertCategory(categoryId);
    return prisma.weaknessCategory.update({
      where: { id: categoryId },
      data,
    });
  },

  async deleteWeaknessCategory(categoryId: string) {
    await this.assertCategory(categoryId);
    return prisma.weaknessCategory.update({
      where: { id: categoryId },
      data: { is_active: false },
    });
  },

  async assertCategory(categoryId?: string | null) {
    if (!categoryId) return null;
    const category = await prisma.weaknessCategory.findFirst({ where: { id: categoryId } });
    if (!category) throw err('Weakness category not found', 404);
    return category;
  },

  async assertRoutinePlan(planId?: string | null, studentId?: string) {
    if (!planId) return null;
    const plan = await prisma.routinePlan.findFirst({
      where: {
        id: planId,
        ...(studentId ? { student_id: studentId } : {}),
      },
    });
    if (!plan) throw err('Routine plan not found', 404);
    return plan;
  },

  async getStudentOverview(studentId: string) {
    await this.assertStudent(studentId);

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [todayTotal, todayCompleted, allTotal, allCompleted, weakSubjects, strongestWeakness] =
      await Promise.all([
        prisma.routineTask.count({ where: { student_id: studentId, date: { gte: startOfDay, lte: endOfDay } } }),
        prisma.routineTask.count({ where: { student_id: studentId, date: { gte: startOfDay, lte: endOfDay }, status: RoutineTaskStatus.COMPLETED } }),
        prisma.routineTask.count({ where: { student_id: studentId } }),
        prisma.routineTask.count({ where: { student_id: studentId, status: RoutineTaskStatus.COMPLETED } }),
        prisma.studentWeakness.count({ where: { student_id: studentId, level: { in: [WeaknessLevel.HIGH, WeaknessLevel.MEDIUM] } } }),
        prisma.studentWeakness.findFirst({
          where: { student_id: studentId },
          include: { category: true },
          orderBy: { score: 'desc' },
        }),
      ]);

    const overallPerformance = routineTrackerEngine.calculatePerformanceScore(allCompleted, allTotal);

    return {
      todayStudyPlan: {
        total: todayTotal,
        completed: todayCompleted,
      },
      overallPerformance,
      weakSubjects,
      strongestSubject: strongestWeakness
        ? {
            subject: strongestWeakness.category.name,
            score: strongestWeakness.score,
          }
        : null,
    };
  },

  async listRoutinePlans(studentId: string) {
    await this.assertStudent(studentId);
    return prisma.routinePlan.findMany({
      where: { student_id: studentId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { start_date: 'desc' },
    });
  },

  async createRoutinePlan(data: CreateRoutinePlanInput) {
    await this.assertStudent(data.student_id);

    return prisma.routinePlan.create({
      data: {
        student_id: data.student_id,
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status ?? RoutinePlanStatus.ACTIVE,
        created_by_id: data.created_by_id,
      },
    });
  },

  async listRoutineTasks(studentId: string, range?: DateRangeFilter) {
    await this.assertStudent(studentId);
    return prisma.routineTask.findMany({
      where: {
        student_id: studentId,
        ...toDateWhere(range),
      },
      include: taskInclude,
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
    });
  },

  async createRoutineTask(data: CreateRoutineTaskInput) {
    await this.assertStudent(data.student_id);
    await this.assertCategory(data.category_id);
    await this.assertRoutinePlan(data.routine_plan_id, data.student_id);

    return prisma.routineTask.create({
      data: {
        routine_plan_id: data.routine_plan_id,
        student_id: data.student_id,
        category_id: data.category_id,
        subject: data.subject,
        topic: data.topic,
        task_type: data.task_type ?? RoutineTaskType.READING,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes,
        status: data.status ?? RoutineTaskStatus.UPCOMING,
        note: data.note,
        created_by_id: data.created_by_id,
      },
      include: taskInclude,
    });
  },

  async updateRoutineTask(taskId: string, studentId: string, data: UpdateRoutineTaskInput) {
    const task = await prisma.routineTask.findFirst({ where: { id: taskId, student_id: studentId } });
    if (!task) throw err('Routine task not found', 404);

    if (data.category_id !== undefined) await this.assertCategory(data.category_id);
    if (data.routine_plan_id !== undefined) await this.assertRoutinePlan(data.routine_plan_id, studentId);

    return prisma.routineTask.update({
      where: { id: taskId },
      data: {
        ...(data.routine_plan_id !== undefined && { routine_plan_id: data.routine_plan_id }),
        ...(data.category_id !== undefined && { category_id: data.category_id }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.topic !== undefined && { topic: data.topic }),
        ...(data.task_type !== undefined && { task_type: data.task_type }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.start_time !== undefined && { start_time: data.start_time }),
        ...(data.end_time !== undefined && { end_time: data.end_time }),
        ...(data.duration_minutes !== undefined && { duration_minutes: data.duration_minutes }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.note !== undefined && { note: data.note }),
      },
      include: taskInclude,
    });
  },

  async completeRoutineTask(taskId: string, studentId: string, note?: string) {
    const task = await prisma.routineTask.findFirst({ where: { id: taskId, student_id: studentId } });
    if (!task) throw err('Routine task not found', 404);

    return prisma.$transaction(async (tx) => {
      const updatedTask = await tx.routineTask.update({
        where: { id: taskId },
        data: { status: RoutineTaskStatus.COMPLETED },
        include: taskInclude,
      });

      await tx.routineTaskLog.create({
        data: {
          routine_task_id: taskId,
          student_id: studentId,
          status: RoutineTaskStatus.COMPLETED,
          completed_at: new Date(),
          note,
        },
      });

      return updatedTask;
    });
  },

  async deleteRoutineTask(taskId: string, studentId: string) {
    const task = await prisma.routineTask.findFirst({ where: { id: taskId, student_id: studentId } });
    if (!task) throw err('Routine task not found', 404);
    return prisma.routineTask.delete({ where: { id: taskId } });
  },

  async listWeaknesses(studentId: string) {
    await this.assertStudent(studentId);
    return prisma.studentWeakness.findMany({
      where: { student_id: studentId },
      include: weaknessInclude,
      orderBy: [{ level: 'desc' }, { score: 'asc' }],
    });
  },

  async upsertWeakness(data: UpsertStudentWeaknessInput) {
    await this.assertStudent(data.student_id);
    await this.assertCategory(data.category_id);

    const existingTasks = await prisma.routineTask.groupBy({
      by: ['status'],
      where: { student_id: data.student_id, category_id: data.category_id },
      _count: { _all: true },
    });

    const totalTasks = existingTasks.reduce((sum, item) => sum + item._count._all, 0);
    const completedTasks = existingTasks.find((item) => item.status === RoutineTaskStatus.COMPLETED)?._count._all ?? 0;
    const missedTasks = existingTasks.find((item) => item.status === RoutineTaskStatus.MISSED)?._count._all ?? 0;
    const calculated = routineTrackerEngine.calculateWeakness({
      score: data.score,
      completedTasks,
      totalTasks,
      missedTasks,
    });

    return prisma.studentWeakness.upsert({
      where: { student_id_category_id: { student_id: data.student_id, category_id: data.category_id } },
      create: {
        student_id: data.student_id,
        category_id: data.category_id,
        score: calculated.normalizedScore,
        level: data.level ?? calculated.level,
        note: data.note,
        identified_by_id: data.identified_by_id,
      },
      update: {
        score: calculated.normalizedScore,
        level: data.level ?? calculated.level,
        note: data.note,
        identified_by_id: data.identified_by_id,
      },
      include: weaknessInclude,
    });
  },

  async recalculateWeaknesses(studentId: string) {
    const weaknesses = await prisma.studentWeakness.findMany({ where: { student_id: studentId } });

    const updated = [];
    for (const weakness of weaknesses) {
      const taskCounts = await prisma.routineTask.groupBy({
        by: ['status'],
        where: { student_id: studentId, category_id: weakness.category_id },
        _count: { _all: true },
      });

      const totalTasks = taskCounts.reduce((sum, item) => sum + item._count._all, 0);
      const completedTasks = taskCounts.find((item) => item.status === RoutineTaskStatus.COMPLETED)?._count._all ?? 0;
      const missedTasks = taskCounts.find((item) => item.status === RoutineTaskStatus.MISSED)?._count._all ?? 0;
      const calculated = routineTrackerEngine.calculateWeakness({
        score: weakness.score,
        completedTasks,
        totalTasks,
        missedTasks,
      });

      updated.push(
        await prisma.studentWeakness.update({
          where: { id: weakness.id },
          data: { score: calculated.normalizedScore, level: calculated.level },
          include: weaknessInclude,
        }),
      );
    }

    return updated;
  },

  async listRecommendations(studentId: string) {
    await this.assertStudent(studentId);
    return prisma.trackerRecommendation.findMany({
      where: { student_id: studentId, is_active: true },
      include: recommendationInclude,
      orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
    });
  },

  async createRecommendation(data: CreateRecommendationInput) {
    await this.assertStudent(data.student_id);
    await this.assertCategory(data.category_id);

    return prisma.trackerRecommendation.create({
      data: {
        student_id: data.student_id,
        category_id: data.category_id,
        title: data.title,
        description: data.description,
        priority: data.priority ?? TrackerRecommendationPriority.MEDIUM,
        action_label: data.action_label,
        resource_url: data.resource_url,
        created_by_id: data.created_by_id,
      },
      include: recommendationInclude,
    });
  },

  async createFeedback(data: CreateFeedbackInput) {
    await this.assertStudent(data.student_id);
    return prisma.trackerFeedback.create({
      data: {
        student_id: data.student_id,
        teacher_id: data.teacher_id,
        message: data.message,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  },

  async getPerformance(studentId: string, range?: DateRangeFilter) {
    await this.assertStudent(studentId);
    const tasks = await prisma.routineTask.findMany({
      where: {
        student_id: studentId,
        ...toDateWhere(range),
      },
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    });

    const buckets = new Map<string, { total: number; completed: number }>();
    for (const task of tasks) {
      const key = task.date.toISOString().slice(0, 10);
      const bucket = buckets.get(key) ?? { total: 0, completed: 0 };
      bucket.total += 1;
      if (task.status === RoutineTaskStatus.COMPLETED) bucket.completed += 1;
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries()).map(([date, bucket]) => ({
      date,
      score: routineTrackerEngine.calculatePerformanceScore(bucket.completed, bucket.total),
      completed: bucket.completed,
      total: bucket.total,
    }));
  },

  async getTeacherStudents(teacherId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { course: { teacher_id: teacherId } },
      select: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolled_at: 'desc' },
    });

    const byStudent = new Map<string, { id: string; name: string; email: string; avatar: string | null; courses: { id: string; title: string }[] }>();
    for (const enrollment of enrollments) {
      const existing = byStudent.get(enrollment.student.id) ?? { ...enrollment.student, courses: [] };
      existing.courses.push(enrollment.course);
      byStudent.set(enrollment.student.id, existing);
    }

    return Array.from(byStudent.values());
  },

  async getAdminOverview() {
    const [students, activePlans, totalTasks, completedTasks, highWeaknesses, categories] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.routinePlan.count({ where: { status: RoutinePlanStatus.ACTIVE } }),
      prisma.routineTask.count(),
      prisma.routineTask.count({ where: { status: RoutineTaskStatus.COMPLETED } }),
      prisma.studentWeakness.count({ where: { level: WeaknessLevel.HIGH } }),
      prisma.weaknessCategory.count({ where: { is_active: true } }),
    ]);

    return {
      students,
      activePlans,
      totalTasks,
      completedTasks,
      completionRate: routineTrackerEngine.calculatePerformanceScore(completedTasks, totalTasks),
      highWeaknesses,
      activeCategories: categories,
    };
  },

  async getAdminStudents() {
    const students = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        _count: {
          select: {
            routineTasks: true,
            studentWeaknesses: true,
            trackerRecommendations: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return students;
  },
};
