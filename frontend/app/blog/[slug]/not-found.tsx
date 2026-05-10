// ─────────────────────────────────────────────────────────────
// app/blog/[slug]/not-found.tsx
// Rendered by Next.js when `notFound()` is called in page.tsx
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-black text-indigo-100 mb-4 select-none">
          404
        </p>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
          Post not found
        </h1>
        <p className="text-gray-500 mb-8">
          The blog post you are looking for doesn't exist or may have been
          removed.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
