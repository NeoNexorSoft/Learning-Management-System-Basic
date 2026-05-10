import { Router } from "express";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCoupon,
} from "../controllers/coupon.controller";

const router = Router();

router.get("/", getCoupons);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.patch("/:id/toggle", toggleCoupon);

export default router;