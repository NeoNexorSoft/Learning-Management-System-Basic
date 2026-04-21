import { Users, BookOpen, Award, Globe } from "lucide-react"

const stats = [
  { icon: Users,    value: "10,000+", label: "Active Students" },
  { icon: BookOpen, value: "500+",    label: "Expert Courses" },
  { icon: Award,    value: "98%",     label: "Success Rate" },
  { icon: Globe,    value: "50+",     label: "Countries" },
]

export default function StatsSection() {
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">{value}</p>
              <p className="text-sm text-slate-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
