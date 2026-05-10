import { Request, Response, NextFunction } from 'express';
import { TransactionStatus } from '@prisma/client';
import { transactionService } from '../services/transaction.service';

export const transactionController = {
  async getTeacherTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = req.query.page  as string | undefined;
      const limit = req.query.limit as string | undefined;

      const result = await transactionService.getTeacherTransactions(req.user!.userId, {
        page:  page  ? parseInt(page, 10) : 1,
        limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAdminPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status    = req.query.status    as string | undefined;
      const gateway   = req.query.gateway   as string | undefined;
      const search    = req.query.search    as string | undefined;
      const date_from = req.query.date_from as string | undefined;
      const date_to   = req.query.date_to   as string | undefined;
      const page      = req.query.page      as string | undefined;
      const limit     = req.query.limit     as string | undefined;

      if (status && !Object.values(TransactionStatus).includes(status as TransactionStatus)) {
        res.status(400).json({ status: 'error', message: 'Invalid status value' });
        return;
      }

      const result = await transactionService.getAdminPayments({
        status:    status as TransactionStatus | undefined,
        gateway,
        search,
        date_from,
        date_to,
        page:  page  ? parseInt(page, 10) : 1,
        limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },
};
