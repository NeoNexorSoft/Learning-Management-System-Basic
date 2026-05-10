// ─────────────────────────────────────────────────────────────
// app/blog/[slug]/error.tsx
//
// Next.js App Router error boundary.  Must be a Client Component.
// Automatically catches errors thrown in the Server Component above.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import BlogError from "@/components/blog/BlogError";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogDetailError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to an error-reporting service (e.g. Sentry) in production
    console.error("[BlogDetailError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 h-14" />
      <BlogError
        message={
          error.message ||
          "We couldn't load this post. Please try again or go back to all posts."
        }
        onRetry={reset}
      />
    </div>
  );
}
