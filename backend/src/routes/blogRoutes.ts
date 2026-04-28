import { Router } from "express";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public routes — accessible without authentication
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Protected routes — require authentication
router.post("/", authenticate, createBlog);
router.put("/:slug", authenticate, updateBlog);
router.delete("/:slug", authenticate, deleteBlog);

export default router;