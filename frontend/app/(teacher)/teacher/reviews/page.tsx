"use client"

import { useEffect, useState } from "react"
import { Star, Loader2 } from "lucide-react"
import TopBar from "@/components/shared/TopBar"
import api from "@/lib/axios"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: any }) {
  const name    = review.student?.name ?? "Student"
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{name}</p>
            <p className="text-xs text-slate-400">{review.course?.title ?? ""}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} />
          <span className="text-xs text-slate-400">
            {new Date(review.created_at ?? review.date ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews]   = useState<any[]>([])
  const [courses, setCourses]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const coursesRes = await api.get("/api/teacher/courses")
        const courseList: any[] = coursesRes.data.data.data ?? []
        setCourses(courseList)

        const allReviews: any[] = []
        await Promise.all(
          courseList.map(async (course: any) => {
            try {
              const res = await api.get(`/api/courses/${course.id}/reviews`)
              const list: any[] = res.data.data.data ?? []
              list.forEach((r: any) => allReviews.push({ ...r, course }))
            } catch {}
          }),
        )
        setReviews(allReviews)
      } catch {
        // empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalReviews = reviews.length
  const avgRating    = totalReviews > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : "—"
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar placeholder="Search reviews…" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar placeholder="Search reviews…" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Reviews</h1>
          <p className="text-slate-500 mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""} across all courses</p>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No reviews yet.</p>
              </div>
            ) : (
              reviews.map((r, i) => <ReviewCard key={`${r.id}-${i}`} review={r} />)
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">Rating Summary</h3>
              <div className="text-center mb-5">
                <p className="text-5xl font-extrabold text-slate-900 mb-1">{avgRating}</p>
                <StarRating rating={Math.round(Number(avgRating) || 0)} />
                <p className="text-xs text-slate-400 mt-1">{totalReviews} total reviews</p>
              </div>
              <div className="space-y-2">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-3">{star}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-amber-400" style={{ width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-xs text-slate-400 w-3 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">By Course</h3>
              <div className="space-y-3">
                {courses.filter((c) => (c.totalReviews ?? 0) > 0).map((c) => (
                  <div key={c.id}>
                    <p className="text-xs font-medium text-slate-700 mb-1 truncate">{c.title}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(c.avgRating ?? 0)} />
                      <span className="text-xs text-slate-500">{Number(c.avgRating ?? 0).toFixed(1)} ({c.totalReviews})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
