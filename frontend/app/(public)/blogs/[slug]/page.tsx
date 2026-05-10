import Link from "next/link"
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react"
import { mockBlogs } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return mockBlogs.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = mockBlogs.find((b) => b.slug === slug)
  return { title: post ? `${post.title} – Neo Nexor Blog` : "Blog – Neo Nexor" }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = mockBlogs.find((b) => b.slug === slug)
  if (!post) notFound()

  const related = mockBlogs.filter((b) => b.slug !== slug).slice(0, 3)

  return (
    <main className="pt-16 bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${post.gradient} py-16`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 bg-white/20 text-white`}>
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${post.authorGradient} border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white`}>
                {post.authorInitials}
              </div>
              <span className="font-medium">{post.author}</span>
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium border-l-4 border-indigo-400 pl-5 italic">
            {post.excerpt}
          </p>
          {post.body.split("\n\n").map((para, i) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-5 text-base">
              {para}
            </p>
          ))}
        </div>

        {/* Author card */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${post.authorGradient} flex items-center justify-center text-xl font-bold text-white flex-shrink-0`}>
            {post.authorInitials}
          </div>
          <div>
            <p className="font-bold text-slate-900">{post.author}</p>
            <p className="text-sm text-slate-500 mt-0.5">Expert educator at Neo Nexor</p>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-5">More Articles</h2>
          <div className="space-y-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/blogs/${rel.slug}`}
                className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rel.gradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {rel.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${rel.categoryColor}`}>
                    {rel.category}
                  </span>
                  <p className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {rel.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{rel.readTime}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
