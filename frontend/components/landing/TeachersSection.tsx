"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star, BookOpen, Users, Loader2 } from "lucide-react"
import api from "@/lib/axios"

const gradients = [
  "from-indigo-400 to-purple-600",
  "from-pink-400 to-rose-600",
  "from-purple-400 to-violet-600",
  "from-amber-400 to-orange-600",
  "from-emerald-400 to-teal-600",
  "from-cyan-400 to-blue-600",
]

interface TeacherCard {
  id: string
  name: string
  initials: string
  avatar?: string | null
  subject: string
  courses: number
  students: number
  rating: number
  gradient: string
}

export default function TeachersSection() {
  const [teachers, setTeachers] = useState<TeacherCard[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get("/api/courses?limit=50")
      .then(({ data }) => {
        const courses: any[] = Array.isArray(data.data) ? data.data : (data.data?.data ?? [])
        const map = new Map<string, TeacherCard>()
        courses.forEach((course: any) => {
          const t = course.teacher
          if (!t?.id) return
          if (map.has(t.id)) {
            const existing = map.get(t.id)!
            existing.courses += 1
            existing.students += Number(course.totalStudents ?? 0)
            const r = Number(course.avgRating ?? 0)
            if (r > 0) existing.rating = Math.max(existing.rating, r)
          } else {
            const nameParts = (t.name ?? "Instructor").split(" ")
            const initials  = nameParts.map((p: string) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
            map.set(t.id, {
              id:       t.id,
              name:     t.name ?? "Instructor",
              initials,
              avatar:   t.avatar ?? null,
              subject:  course.category?.name ?? "General",
              courses:  1,
              students: Number(course.totalStudents ?? 0),
              rating:   Number(course.avgRating ?? 0),
              gradient: gradients[map.size % gradients.length],
            })
          }
        })
        setTeachers([...map.values()].slice(0, 4))
      })
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Meet Our Instructors</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Learn from industry professionals who&apos;ve worked at top companies around the world.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No instructors available yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {teachers.map(({ id, name, subject, initials, avatar, courses, students, rating, gradient }) => (
              <div key={id} className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md hover:border-indigo-200 transition-all">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl font-bold text-white mx-auto mb-4 overflow-hidden`}>
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-0.5">{name}</h3>
                <p className="text-xs text-indigo-600 font-semibold mb-4">{subject}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                  <div>
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                    </div>
                    <p className="font-semibold text-slate-700">{courses}</p>
                    <p>courses</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <Users className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="font-semibold text-slate-700">{students.toLocaleString()}</p>
                    <p>students</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <Star className="w-3 h-3 text-amber-400" />
                    </div>
                    <p className="font-semibold text-slate-700">{rating > 0 ? rating.toFixed(1) : "—"}</p>
                    <p>rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/auth/register/teacher"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-2xl transition-all"
          >
            Become an Instructor
          </Link>
        </div>
      </div>
    </section>
  )
}
