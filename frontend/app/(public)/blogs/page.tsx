import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { mockBlogs } from "@/lib/mock-data"

export const metadata = { title: "Blog – Neo Nexor" }

export default function BlogsPage() {
  return (
    <main className="pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16 text-center">
        <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-full mb-4">
          Neo Nexor Blog
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Insights & Tutorials</h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto">
          Expert articles, tutorials, and career advice from our team of educators and industry professionals.
        </p>
      </div>

      {/* Blog grid */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBlogs.map((post) => (
              <Link
                key={post.id}
                href={`/blogs/${post.slug}`}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className={`bg-gradient-to-br ${post.gradient} h-44 flex items-center justify-center`}>
                  <span className="text-6xl">{post.emoji}</span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${post.categoryColor}`}>
                    {post.category}
                  </span>
                  <h2 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${post.authorGradient} flex items-center justify-center text-xs font-bold text-white`}>
                        {post.authorInitials}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
