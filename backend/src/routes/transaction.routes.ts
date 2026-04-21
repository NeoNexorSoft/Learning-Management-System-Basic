import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { transactionController } from '../controllers/transaction.controller';

// ─── /api/teacher/transactions ────────────────────────────────────────────────

export const teacherTransactionRouter = Router();
teacherTransactionRouter.use(authenticate, requireRole('TEACHER'));
teacherTransactionRouter.get('/transactions', transactionController.getTeacherTransactions);

// ─── /api/admin/payments ──────────────────────────────────────────────────────

export const adminPaymentRouter = Router();
adminPaymentRouter.use(authenticate, requireRole('ADMIN'));
adminPaymentRouter.get('/payments', transactionController.getAdminPayments);
