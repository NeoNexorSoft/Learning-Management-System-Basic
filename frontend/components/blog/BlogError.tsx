// ─────────────────────────────────────────────────────────────
// components/blog/BlogError.tsx
// User-friendly error state shown when a post cannot be fetched.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

interface BlogErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function BlogError({
  message = "We couldn't load this post. Please try again.",
  onRetry,
}: BlogErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 py-16"
    >
      {/* Icon */}
      <div className="w-20 h-20 mb-6 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-500 max-w-sm mb-8">{message}</p>

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Try again
          </button>
        )}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          ← All posts
        </Link>
      </div>
    </div>
  );
}
