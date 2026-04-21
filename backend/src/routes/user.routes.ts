import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

// ─── Static paths must come before /:id ──────────────────────────────────────

// Admin only
router.get('/stats', requireRole('ADMIN'), userController.getUserStats);

// Teacher only
router.get('/teacher/stats', requireRole('TEACHER'), userController.getTeacherStats);

// Student only
router.get('/student/stats', requireRole('STUDENT'), userController.getStudentStats);

// Any authenticated user (own profile)
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.get('/login-history', userController.getLoginHistory);

// ─── Param routes ─────────────────────────────────────────────────────────────

// Admin only
router.get('/', requireRole('ADMIN'), userController.getUsers);
router.post('/:id/ban', requireRole('ADMIN'), userController.toggleBan);
router.delete('/:id', requireRole('ADMIN'), userController.deleteUser);

// Any authenticated user — must be last to avoid swallowing static paths
router.get('/:id', userController.getUserProfile);

export default router;
