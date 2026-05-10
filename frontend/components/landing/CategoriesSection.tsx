"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import api from "@/lib/axios"

const fallbackEmoji: Record<string, string> = {
  "Web Development": "💻", "Frontend Development": "🖥️", "Backend Development": "⚙️",
  "Mobile Development": "📱", "React Native": "📱", "Flutter": "🦋",
  "Data Science": "📈", "Machine Learning": "🤖", "Data Analysis": "📊",
  Programming: "💻", Design: "🎨", CS: "🔬", Business: "📊", Marketing: "📣",
}
const fallbackColor: Record<string, string> = {
  "Web Development": "bg-blue-50 border-blue-100 hover:border-blue-300",
  Programming: "bg-blue-50 border-blue-100 hover:border-blue-300",
  Design: "bg-pink-50 border-pink-100 hover:border-pink-300",
  "Data Science": "bg-cyan-50 border-cyan-100 hover:border-cyan-300",
  "Machine Learning": "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
  Business: "bg-amber-50 border-amber-100 hover:border-amber-300",
}
const colors = [
  "bg-blue-50 border-blue-100 hover:border-blue-300",
  "bg-pink-50 border-pink-100 hover:border-pink-300",
  "bg-purple-50 border-purple-100 hover:border-purple-300",
  "bg-amber-50 border-amber-100 hover:border-amber-300",
  "bg-green-50 border-green-100 hover:border-green-300",
  "bg-cyan-50 border-cyan-100 hover:border-cyan-300",
]

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get("/api/categories")
      .then(({ data }) => setCategories(data.data?.categories ?? data.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  const top = categories.filter((c: any) => !c.parent_id).slice(0, 6)

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Browse by Category</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {top.map((cat: any, i: number) => {
              const name  = cat.name
              const color = fallbackColor[name] ?? colors[i % colors.length]
              const emoji = fallbackEmoji[name] ?? "📚"
              return (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.slug}`}
                  className={`flex flex-col items-center gap-2 p-4 border rounded-2xl transition-all cursor-pointer ${color}`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-xs font-semibold text-slate-800 text-center">{name}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
