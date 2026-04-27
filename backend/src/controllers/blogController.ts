import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTHOR_SELECT = {
  id: true,
  name: true,
  role: true,
} as const;

// GET /api/blogs
export async function getBlogs(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const where = {
      publishedAt: { lte: new Date() },
      ...(category ? { category } : {}),
    };

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          featuredImageUrl: true,
          publishedAt: true,
          readTimeMinutes: true,
          category: true,
          tags: true,
          author: { select: AUTHOR_SELECT },
        },
      }),
    ]);

    res.json({ success: true, data: blogs, total, page, limit });
  } catch (error) {
    console.error("[getBlogs]", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch blog posts" });
  }
}

// GET /api/blogs/:slug
export async function getBlogBySlug(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (!blog || blog.publishedAt > new Date()) {
      res.status(404).json({ success: false, message: "Blog post not found" });
      return;
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("[getBlogBySlug]", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch blog post" });
  }
}

// POST /api/blogs
export async function createBlog(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImageUrl,
      tags,
      category,
      readTimeMinutes,
      publishedAt,
    } = req.body;

    const authorId = (req as any).user?.id;
    if (!authorId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!title || !slug || !excerpt || !content || !featuredImageUrl) {
      res.status(400).json({
        success: false,
        message: "title, slug, excerpt, content, featuredImageUrl are required",
      });
      return;
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImageUrl,
        tags: tags ?? [],
        category,
        readTimeMinutes,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        authorId,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ success: false, message: "Slug already exists" });
      return;
    }
    console.error("[createBlog]", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create blog post" });
  }
}

// PUT /api/blogs/:slug
export async function updateBlog(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const authorId = (req as any).user?.id;

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Blog post not found" });
      return;
    }

    if (existing.authorId !== authorId && (req as any).user?.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const updated = await prisma.blog.update({
      where: { slug },
      data: { ...req.body },
      include: { author: { select: AUTHOR_SELECT } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[updateBlog]", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update blog post" });
  }
}

// DELETE /api/blogs/:slug
export async function deleteBlog(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const authorId = (req as any).user?.id;

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Blog post not found" });
      return;
    }

    if (existing.authorId !== authorId && (req as any).user?.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    await prisma.blog.delete({ where: { slug } });
    res.json({ success: true, message: "Blog post deleted" });
  } catch (error) {
    console.error("[deleteBlog]", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete blog post" });
  }
}
