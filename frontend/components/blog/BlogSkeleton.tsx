// ─────────────────────────────────────────────────────────────
// components/blog/BlogSkeleton.tsx
// Animated skeleton shown while the blog post is loading.
// ─────────────────────────────────────────────────────────────

export default function BlogSkeleton() {
  return (
    <div
      className="animate-pulse max-w-3xl mx-auto px-4 sm:px-6 py-10"
      aria-label="Loading blog post…"
      role="status"
    >
      {/* Category badge */}
      <div className="h-5 w-24 bg-gray-200 rounded-full mb-5" />

      {/* Title – two lines */}
      <div className="space-y-3 mb-6">
        <div className="h-9 bg-gray-200 rounded-lg w-full" />
        <div className="h-9 bg-gray-200 rounded-lg w-3/4" />
      </div>

      {/* Author row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 bg-gray-200 rounded-full" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="ml-auto h-3 w-24 bg-gray-200 rounded" />
      </div>

      {/* Featured image */}
      <div className="w-full aspect-video bg-gray-200 rounded-2xl mb-6" />

      {/* Tags */}
      <div className="flex gap-2 mb-8">
        {[60, 80, 55].map((w, i) => (
          <div
            key={i}
            className="h-5 bg-gray-200 rounded-full"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Body lines */}
      <div className="space-y-3">
        {[100, 95, 90, 100, 80, 100, 70, 95, 100, 60].map((pct, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${pct}%` }}
          />
        ))}
      </div>
    </div>
  );
}
