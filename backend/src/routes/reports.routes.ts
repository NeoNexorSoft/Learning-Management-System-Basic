import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { reportsController } from "../controllers/reports.controller";

const router = Router();

router.get(
  "/notifications",
  authenticate,
  requireRole(Role.ADMIN),
  reportsController.getNotificationHistory,
);

export default router;
