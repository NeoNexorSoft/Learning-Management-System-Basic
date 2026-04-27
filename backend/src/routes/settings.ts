import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), getSettings);
router.put("/", authenticate, requireRole("ADMIN"), updateSettings);

export default router;
