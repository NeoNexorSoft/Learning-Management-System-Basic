import { WithdrawalStatus, TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

const notify = (user_id: string, title: string, message: string): void => {
  prisma.notification.create({ data: { id: uuidv4(), user_id, title, message } }).catch(() => {});
};

export const withdrawalService = {
  // ─── Teacher ──────────────────────────────────────────────────────────────

  async requestWithdrawal(teacherId: string, amount: number, method: string) {
    if (amount <= 0) throw Object.assign(new Error('Amount must be greater than 0'), { statusCode: 400 });
    if (!method)     throw Object.assign(new Error('Payment method is required'), { statusCode: 400 });

    const teacher = await prisma.user.findUnique({ where: { id: teacherId }, select: { id: true } });
    if (!teacher) throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });

    // Compute available balance: total earnings minus all non-rejected withdrawals
    const [earningsAgg, pendingAgg, approvedAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { course: { teacher_id: teacherId }, status: TransactionStatus.COMPLETED, type: TransactionType.PURCHASE },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { teacher_id: teacherId, status: WithdrawalStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { teacher_id: teacherId, status: WithdrawalStatus.APPROVED },
        _sum: { amount: true },
      }),
    ]);

    const availableBalance =
      Number(earningsAgg._sum.amount ?? 0) -
      Number(pendingAgg._sum.amount  ?? 0) -
      Number(approvedAgg._sum.amount ?? 0);

    if (amount > availableBalance) {
      throw Object.assign(new Error('Insufficient balance'), { statusCode: 400 });
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        id:             uuidv4(),
        teacher_id:     teacherId,
        amount,
        method,
        payout_details: {},
        status:         WithdrawalStatus.PENDING,
      },
    });

    return withdrawal;
  },

  async getMyWithdrawals(teacherId: string, { page = 1, limit = 20 }: { page?: number; limit?: number }) {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where:   { teacher_id: teacherId },
        orderBy: { requested_at: 'desc' },
        skip,
        take:    limit,
      }),
      prisma.withdrawal.count({ where: { teacher_id: teacherId } }),
    ]);

    return { data: withdrawals, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // ─── Admin ────────────────────────────────────────────────────────────────

  async listWithdrawals({
    status, page = 1, limit = 20,
  }: { status?: WithdrawalStatus; page?: number; limit?: number }) {
    const skip  = (page - 1) * limit;
    const where = status ? { status } : {};

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { requested_at: 'desc' },
        skip,
        take:    limit,
        include: {
          teacher: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return { data: withdrawals, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async approveWithdrawal(withdrawalId: string) {
    const w = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!w) throw Object.assign(new Error('Withdrawal not found'), { statusCode: 404 });
    if (w.status !== WithdrawalStatus.PENDING) {
      throw Object.assign(new Error('Only PENDING withdrawals can be approved'), { statusCode: 400 });
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data:  { status: WithdrawalStatus.APPROVED, processed_at: new Date() },
    });

    notify(w.teacher_id, 'Withdrawal Approved', `Your withdrawal of TK${w.amount} has been approved.`);

    return updated;
  },

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const w = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!w) throw Object.assign(new Error('Withdrawal not found'), { statusCode: 404 });
    if (w.status !== WithdrawalStatus.PENDING) {
      throw Object.assign(new Error('Only PENDING withdrawals can be rejected'), { statusCode: 400 });
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data:  { status: WithdrawalStatus.REJECTED, processed_at: new Date() },
    });

    // Refund balance on rejection
    await prisma.user.update({
      where: { id: w.teacher_id },
      data:  { balance: { increment: Number(w.amount) } },
    });

    notify(
      w.teacher_id,
      'Withdrawal Rejected',
      `Your withdrawal of TK${w.amount} was rejected. ${reason ? `Reason: ${reason}` : ''} The amount has been refunded to your balance.`,
    );

    return updated;
  },
};
