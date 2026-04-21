import { Role, TransactionStatus, TransactionType, EnrollmentStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { comparePassword, hashPassword } from '../utils/password';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  avatar: true,
  mobile: true,
  bio: true,
  country: true,
  balance: true,
  email_verified: true,
  is_banned: true,
  social_links: true,
  created_at: true,
  updated_at: true,
} as const;

interface GetUsersQuery {
  role?: Role;
  is_banned?: boolean;
  email_verified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdateProfileInput {
  name?: string;
  mobile?: string;
  bio?: string;
  country?: string;
  social_links?: Record<string, string>;
}

export const userService = {
  async getUsers({ role, is_banned, email_verified, search, page = 1, limit = 20 }: GetUsersQuery) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (is_banned !== undefined) where.is_banned = is_banned;
    if (email_verified !== undefined) where.email_verified = email_verified;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: SAFE_USER_SELECT,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getUserStats() {
    const [totalUsers, bannedUsers, emailVerified, totalTeachers, activeTeachers, totalStudents] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { is_banned: true } }),
        prisma.user.count({ where: { email_verified: true } }),
        prisma.user.count({ where: { role: Role.TEACHER } }),
        prisma.user.count({ where: { role: Role.TEACHER, is_banned: false } }),
        prisma.user.count({ where: { role: Role.STUDENT } }),
      ]);

    return {
      totalUsers,
      activeUsers: totalUsers - bannedUsers,
      bannedUsers,
      emailVerified,
      totalTeachers,
      activeTeachers,
      totalStudents,
    };
  },

  async toggleBan(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    return prisma.user.update({
      where: { id },
      data: { is_banned: !user.is_banned },
      select: SAFE_USER_SELECT,
    });
  },

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    await prisma.user.delete({ where: { id } });
  },

  async getUserProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...SAFE_USER_SELECT,
        _count: { select: { courses: true, enrollments: true } },
      },
    });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const { _count, ...rest } = user;
    return {
      ...rest,
      ...(rest.role === Role.TEACHER ? { coursesCount: _count.courses } : {}),
      ...(rest.role === Role.STUDENT ? { enrollmentsCount: _count.enrollments } : {}),
    };
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    return prisma.user.update({ where: { id: userId }, data, select: SAFE_USER_SELECT });
  },

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

    const password_hash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password_hash } });
  },

  async getLoginHistory(userId: string) {
    return prisma.loginHistory.findMany({
      where: { user_id: userId },
      orderBy: { logged_at: 'desc' },
      take: 20,
    });
  },

  async getTeacherStats(userId: string) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [totalCourses, distinctStudents, totalEarningsAgg, monthEarningsAgg, pendingWithdrawalsAgg, approvedWithdrawalsAgg] =
      await Promise.all([
        prisma.course.count({ where: { teacher_id: userId } }),
        prisma.enrollment.findMany({
          where: { course: { teacher_id: userId } },
          select: { student_id: true },
          distinct: ['student_id'],
        }),
        prisma.transaction.aggregate({
          where: {
            course: { teacher_id: userId },
            status: TransactionStatus.COMPLETED,
            type: TransactionType.PURCHASE,
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            course: { teacher_id: userId },
            status: TransactionStatus.COMPLETED,
            type: TransactionType.PURCHASE,
            completed_at: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { teacher_id: userId, status: 'PENDING' },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { teacher_id: userId, status: 'APPROVED' },
          _sum: { amount: true },
        }),
      ]);

    const totalEarnings      = Number(totalEarningsAgg._sum.amount      ?? 0);
    const pendingWithdrawals = Number(pendingWithdrawalsAgg._sum.amount  ?? 0);
    const approvedWithdrawals = Number(approvedWithdrawalsAgg._sum.amount ?? 0);

    return {
      totalStudents: distinctStudents.length,
      totalCourses,
      totalEarnings,
      thisMonthEarnings: Number(monthEarningsAgg._sum.amount ?? 0),
      pendingWithdrawals,
      availableBalance: Math.max(0, totalEarnings - pendingWithdrawals - approvedWithdrawals),
    };
  },

  async getStudentStats(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const [enrolledCourses, completedCourses, pendingAssignments] = await Promise.all([
      prisma.enrollment.count({ where: { student_id: userId } }),
      prisma.enrollment.count({ where: { student_id: userId, status: EnrollmentStatus.COMPLETED } }),
      prisma.assignment.count({
        where: {
          lesson: {
            section: {
              course: { enrollments: { some: { student_id: userId } } },
            },
          },
          submissions: { none: { student_id: userId } },
        },
      }),
    ]);

    return { enrolledCourses, completedCourses, pendingAssignments, balance: user.balance };
  },
};
