"use client"

import { useEffect, useState } from "react"
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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherCard[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get("/api/courses?limit=100")
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
        setTeachers([...map.values()])
      })
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="pt-16 bg-slate-50 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16 text-center">
        <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-full mb-4">
          Expert Instructors
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Meet Our Teachers</h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto px-4">
          Learn from world-class educators who combine deep subject expertise with a passion for teaching.
        </p>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No instructors found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map(({ id, name, subject, initials, avatar, courses, students, rating, gradient }) => (
              <div
                key={id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex justify-center pt-8 pb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl font-bold text-white overflow-hidden border-2 border-white shadow`}>
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 text-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">{name}</h3>
                  <p className="text-sm font-semibold text-indigo-600 mb-5">{subject}</p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{courses}</p>
                      <p className="text-[11px] text-slate-500">Courses</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{students.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500">Students</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{rating > 0 ? rating.toFixed(1) : "—"}</p>
                      <p className="text-[11px] text-slate-500">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
