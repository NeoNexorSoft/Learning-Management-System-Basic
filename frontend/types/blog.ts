// ─────────────────────────────────────────────────────────────
// types/blog.ts  –  Blog domain types for the NeoNexor LMS
// ─────────────────────────────────────────────────────────────

export interface BlogAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string; // e.g. "Instructor", "Admin"
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Raw HTML / rich-text string from the CMS / DB
  featuredImageUrl: string;
  author: BlogAuthor;
  publishedAt: string; // ISO-8601 date string
  updatedAt?: string;
  tags?: string[];
  readTimeMinutes?: number;
  category?: string;
}

export interface BlogApiResponse {
  success: boolean;
  data: Blog;
  message?: string;
}

export interface BlogListApiResponse {
  success: boolean;
  data: Blog[];
  total: number;
  page: number;
  limit: number;
}
