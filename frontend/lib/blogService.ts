// ─────────────────────────────────────────────────────────────
// lib/blogService.ts  –  API calls for blog endpoints
// Follows the same pattern as existing LMS API service files.
// ─────────────────────────────────────────────────────────────

import { Blog, BlogApiResponse, BlogListApiResponse } from "@/types/blog";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

// ── Helper ──────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    // Next.js 13+ cache control
    next: { revalidate: 60 }, // ISR – revalidate every 60 s
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.message ?? `API error ${res.status}: ${res.statusText}`,
    );
  }

  return res.json() as Promise<T>;
}

// ── Public API ───────────────────────────────────────────────

/**
 * Fetch a single blog post by its slug.
 * GET /api/blogs/:slug
 */
export async function getBlogBySlug(slug: string): Promise<Blog> {
  const json = await apiFetch<BlogApiResponse>(`/api/blogs/${slug}`);
  return json.data;
}

/**
 * Fetch the most recent N blog posts (used on listing pages).
 * GET /api/blogs?page=1&limit=10
 */
export async function getBlogs(
  page = 1,
  limit = 10,
): Promise<BlogListApiResponse> {
  return apiFetch<BlogListApiResponse>(
    `/api/blogs?page=${page}&limit=${limit}`,
  );
}

// ── Mock (used during development / when backend is not running) ──
export const MOCK_BLOG: Blog = {
  id: "mock-1",
  slug: "getting-started-with-neonexor-lms",
  title: "Getting Started with NeoNexor LMS: A Complete Guide",
  excerpt:
    "Discover how to set up your first course, manage learners, and track progress on the NeoNexor Learning Management System.",
  content: `
    <h2>Welcome to NeoNexor LMS</h2>
    <p>
      NeoNexor LMS is built for modern learners and educators. Whether you are
      an instructor publishing your first course or a student working toward a
      certificate, this guide will walk you through everything you need to know.
    </p>
    <h3>Step 1 – Create Your Account</h3>
    <p>
      Navigate to the registration page and fill in your name, email, and
      password. Choose your role: <strong>Instructor</strong> or
      <strong>Student</strong>. Admins are provisioned separately.
    </p>
    <blockquote>
      "Education is the most powerful weapon which you can use to change the world."
      — Nelson Mandela
    </blockquote>
    <h3>Step 2 – Set Up Your First Course</h3>
    <p>
      After logging in as an Instructor, click <em>New Course</em> from the
      dashboard. Add a title, description, thumbnail, and at least one module.
      You can embed videos, attach PDFs, and add quizzes.
    </p>
    <ul>
      <li>Fill in the course title and short description.</li>
      <li>Upload a cover image (16:9 recommended).</li>
      <li>Add modules and lessons inside each module.</li>
      <li>Publish when you are ready for learners to enroll.</li>
    </ul>
    <h3>Step 3 – Manage Your Learners</h3>
    <p>
      The <strong>Learners</strong> tab in the instructor dashboard shows you
      who has enrolled, their progress percentage, and their last activity date.
      You can send announcements or respond to questions directly from there.
    </p>
    <h3>Step 4 – Track Progress & Analytics</h3>
    <p>
      Head to <strong>Analytics</strong> for a bird's-eye view of completions,
      quiz scores, and engagement metrics. Data is updated in real time.
    </p>
    <p>
      Happy teaching — and happy learning! If you have questions, visit our
      <a href="/support">Support Center</a>.
    </p>
  `,
  featuredImageUrl:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
  author: {
    id: "author-1",
    name: "Neon Nexor Team",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Neon+Nexor&background=6366f1&color=fff",
    role: "Platform Team",
  },
  publishedAt: new Date().toISOString(),
  tags: ["LMS", "Getting Started", "Courses"],
  readTimeMinutes: 5,
  category: "Guides",
};
