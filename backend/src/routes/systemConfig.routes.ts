import { Router } from "express";
import { getConfig, updateConfig } from "../controllers/systemConfig.controller";

const router = Router();

router.get("/", getConfig);
router.patch("/", updateConfig);

export default router;