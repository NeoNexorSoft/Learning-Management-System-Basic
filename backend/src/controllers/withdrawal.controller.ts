import { Request, Response, NextFunction } from 'express';
import { WithdrawalStatus } from '@prisma/client';
import { withdrawalService } from '../services/withdrawal.service';

export const withdrawalController = {
  async requestWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, method } = req.body;

      if (!amount || !method) {
        res.status(400).json({ status: 'error', message: 'amount and method are required' });
        return;
      }
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        res.status(400).json({ status: 'error', message: 'amount must be a positive number' });
        return;
      }

      const withdrawal = await withdrawalService.requestWithdrawal(req.user!.userId, num, method);
      res.status(201).json({ status: 'success', data: { withdrawal } });
    } catch (err) {
      next(err);
    }
  },

  async getMyWithdrawals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = req.query.page  as string | undefined;
      const limit = req.query.limit as string | undefined;

      const result = await withdrawalService.getMyWithdrawals(req.user!.userId, {
        page:  page  ? parseInt(page, 10) : 1,
        limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async listWithdrawals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const page   = req.query.page   as string | undefined;
      const limit  = req.query.limit  as string | undefined;

      if (status && !Object.values(WithdrawalStatus).includes(status as WithdrawalStatus)) {
        res.status(400).json({ status: 'error', message: 'Invalid status value' });
        return;
      }

      const result = await withdrawalService.listWithdrawals({
        status: status as WithdrawalStatus | undefined,
        page:   page  ? parseInt(page, 10) : 1,
        limit:  limit ? Math.min(parseInt(limit, 10), 100) : 20,
      });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async approveWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const withdrawal = await withdrawalService.approveWithdrawal(req.params.id as string);
      res.json({ status: 'success', data: { withdrawal } });
    } catch (err) {
      next(err);
    }
  },

  async rejectWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const withdrawal = await withdrawalService.rejectWithdrawal(req.params.id as string, reason ?? '');
      res.json({ status: 'success', data: { withdrawal } });
    } catch (err) {
      next(err);
    }
  },
};
