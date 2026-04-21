import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { withdrawalController } from '../controllers/withdrawal.controller';

// ─── /api/withdrawals  (teacher) ──────────────────────────────────────────────

export const withdrawalRouter = Router();
withdrawalRouter.use(authenticate, requireRole('TEACHER'));

withdrawalRouter.post('/',    withdrawalController.requestWithdrawal);
withdrawalRouter.get('/my',   withdrawalController.getMyWithdrawals);

// ─── /api/admin/withdrawals ───────────────────────────────────────────────────
// Mounted onto the existing adminRouter in app.ts via separate export.

export const adminWithdrawalRouter = Router();
adminWithdrawalRouter.use(authenticate, requireRole('ADMIN'));

adminWithdrawalRouter.get ('/',              withdrawalController.listWithdrawals);
adminWithdrawalRouter.put ('/:id/approve',   withdrawalController.approveWithdrawal);
adminWithdrawalRouter.put ('/:id/reject',    withdrawalController.rejectWithdrawal);
