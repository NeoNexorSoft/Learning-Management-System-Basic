import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// GET settings
router.get("/general", authenticate, async (req, res) => {
  res.json({
    site_name: "NeoNexor LMS",
    email: "admin@neonexor.com",
    contact_number: "123456",
    address: "Dhaka",
  });
});

// UPDATE settings
router.put("/general", authenticate, async (req, res) => {
  res.json({
    message: "Settings updated successfully",
    data: req.body,
  });
});

export default router;
