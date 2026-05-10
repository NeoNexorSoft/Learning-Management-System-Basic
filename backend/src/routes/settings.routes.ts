import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { settingsController } from "../controllers/settings.controller";

const router = Router();

router.get("/", authenticate, settingsController.getSettings);
router.put("/", authenticate, settingsController.updateSettings);

router.get("/general", authenticate, settingsController.getSettings);
router.put("/general", authenticate, settingsController.updateSettings);

router.get("/social-language", authenticate, settingsController.getSettings);
router.put("/social-language", authenticate, settingsController.updateSettings);

export default router;
