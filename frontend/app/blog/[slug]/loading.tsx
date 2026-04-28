// ─────────────────────────────────────────────────────────────
// app/blog/[slug]/loading.tsx
//
// Next.js automatically wraps the page in a <Suspense> boundary
// and shows this component while the Server Component is streaming.
// No extra code needed in page.tsx.
// ─────────────────────────────────────────────────────────────

import BlogSkeleton from "@/components/blog/BlogSkeleton";

export default function BlogDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky bar placeholder */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 h-14" />
      <BlogSkeleton />
    </div>
  );
}
