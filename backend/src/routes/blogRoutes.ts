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

// Public routes — login ছাড়াই দেখা যাবে
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Protected routes — login লাগবে
router.post("/", authenticate, createBlog);
router.put("/:slug", authenticate, updateBlog);
router.delete("/:slug", authenticate, deleteBlog);

export default router;
