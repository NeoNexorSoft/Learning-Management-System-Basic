import { Router } from "express";
import { getConfig, updateConfig } from "../controllers/systemConfig.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), getConfig);
router.patch("/", authenticate, requireRole("ADMIN"), updateConfig);

export default router;