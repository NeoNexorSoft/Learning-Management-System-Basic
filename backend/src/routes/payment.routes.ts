import { Router } from "express"
import { authenticate } from "../middlewares/auth.middleware"
import { requireRole } from "../middlewares/role.middleware"
import { paymentController } from "../controllers/payment.controller"

const router = Router()

router.post(
    "/payment/initiate",
    authenticate,
    requireRole("STUDENT"),
    paymentController.initiatePayment
)

// ✅ Paystation server → your server (process enrollment)
router.get("/payment/callback",  paymentController.handleCallback)
router.post("/payment/callback", paymentController.handleCallback)

// ✅ Paystation → user's browser (redirect to course)
router.get("/payment/return", paymentController.handleReturn)

export default router