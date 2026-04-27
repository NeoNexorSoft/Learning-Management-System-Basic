// ─────────────────────────────────────────────────────────────
// components/blog/BlogContent.tsx
// Renders rich-text / HTML content with Tailwind typography.
//
// ⚠️  SECURITY NOTE:
//   In production, sanitize `content` server-side with a library
//   like DOMPurify (client) or sanitize-html (server) before
//   passing it to this component. The LMS backend should already
//   strip malicious tags at the API layer.
// ─────────────────────────────────────────────────────────────

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <article
      // prose classes come from @tailwindcss/typography (already a common dep in Next.js starters)
      // If the plugin is not installed: npm install @tailwindcss/typography
      className={[
        "prose prose-slate max-w-none",
        // Responsive font scaling
        "prose-base sm:prose-lg",
        // Headings
        "prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:scroll-mt-20",
        // Links
        "prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline",
        // Blockquotes
        "prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1",
        // Images inside content
        "prose-img:rounded-xl prose-img:shadow-md",
        // Code
        "prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
