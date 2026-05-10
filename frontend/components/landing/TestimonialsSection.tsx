import { Star } from "lucide-react"

const testimonials = [
  { name: "Michael Chen", role: "Full-Stack Developer", initials: "MC", rating: 5, text: "Neo Nexor transformed my career. I landed a developer job within 6 months of completing my first course. The quality of instruction is unmatched." },
  { name: "Sarah Ahmed", role: "UX Designer", initials: "SA", rating: 5, text: "The design courses here are incredibly practical. I went from zero design knowledge to getting hired at a top agency in under a year." },
  { name: "Rahim Uddin", role: "Data Analyst", initials: "RU", rating: 5, text: "I tried many online platforms before finding Neo Nexor. The structured curriculum and mentor support made all the difference for me." },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">What Our Students Say</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Join thousands of learners who&apos;ve already transformed their careers with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, initials, rating, text }) => (
            <div key={name} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
