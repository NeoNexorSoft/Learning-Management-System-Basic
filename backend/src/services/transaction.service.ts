import { TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../config/db';

export const transactionService = {
  async getTeacherTransactions(
    teacherId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number },
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          course:  { teacher_id: teacherId },
          status:  TransactionStatus.COMPLETED,
          type:    TransactionType.PURCHASE,
        },
        orderBy: { completed_at: 'desc' },
        skip,
        take:    limit,
        select: {
          id:               true,
          trx_id:           true,
          gateway:          true,
          amount:           true,
          converted_amount: true,
          status:           true,
          type:             true,
          initiated_at:     true,
          completed_at:     true,
          user:   { select: { id: true, name: true, email: true, avatar: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.transaction.count({
        where: {
          course:  { teacher_id: teacherId },
          status:  TransactionStatus.COMPLETED,
          type:    TransactionType.PURCHASE,
        },
      }),
    ]);

    return { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getAdminPayments({
    status,
    gateway,
    search,
    date_from,
    date_to,
    page = 1,
    limit = 20,
  }: {
    status?: TransactionStatus;
    gateway?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status)  where.status  = status;
    if (gateway) where.gateway = gateway;
    if (date_from || date_to) {
      where.initiated_at = {
        ...(date_from ? { gte: new Date(date_from) } : {}),
        ...(date_to   ? { lte: new Date(`${date_to}T23:59:59.999Z`) } : {}),
      };
    }
    if (search) {
      where.OR = [
        { trx_id: { contains: search, mode: 'insensitive' } },
        { user: { email:  { contains: search, mode: 'insensitive' } } },
        { user: { name:   { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { initiated_at: 'desc' },
        skip,
        take:    limit,
        select: {
          id:               true,
          trx_id:           true,
          gateway:          true,
          amount:           true,
          converted_amount: true,
          status:           true,
          type:             true,
          initiated_at:     true,
          completed_at:     true,
          user:   { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
