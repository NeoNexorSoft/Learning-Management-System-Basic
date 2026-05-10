// ─────────────────────────────────────────────────────────────
// components/blog/BlogHeader.tsx
// Displays: title, author, publish date, read time, tags
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import { Blog } from "@/types/blog";

interface BlogHeaderProps {
  blog: Pick<
    Blog,
    | "title"
    | "author"
    | "publishedAt"
    | "readTimeMinutes"
    | "tags"
    | "category"
    | "featuredImageUrl"
  >;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogHeader({ blog }: BlogHeaderProps) {
  return (
    <header className="mb-8">
      {/* ── Category badge ── */}
      {blog.category && (
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {blog.category}
        </span>
      )}

      {/* ── Title ── */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
        {blog.title}
      </h1>

      {/* ── Author row ── */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Avatar */}
        {blog.author.avatarUrl ? (
          <Image
            src={blog.author.avatarUrl}
            alt={`${blog.author.name} avatar`}
            width={44}
            height={44}
            className="rounded-full ring-2 ring-indigo-200 object-cover"
            priority
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-indigo-200">
            {blog.author.name.charAt(0)}
          </div>
        )}

        {/* Author info */}
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-none">
            {blog.author.name}
          </p>
          {blog.author.role && (
            <p className="text-xs text-gray-500 mt-0.5">{blog.author.role}</p>
          )}
        </div>

        {/* Divider */}
        <span className="hidden sm:block text-gray-300 text-lg">·</span>

        {/* Date */}
        <time dateTime={blog.publishedAt} className="text-sm text-gray-500">
          {formatDate(blog.publishedAt)}
        </time>

        {/* Read time */}
        {blog.readTimeMinutes && (
          <>
            <span className="hidden sm:block text-gray-300 text-lg">·</span>
            <span className="text-sm text-gray-500">
              {blog.readTimeMinutes} min read
            </span>
          </>
        )}
      </div>

      {/* ── Featured image ── */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-6">
        <Image
          src={blog.featuredImageUrl}
          alt={blog.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
          priority
        />
      </div>

      {/* ── Tags ── */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
