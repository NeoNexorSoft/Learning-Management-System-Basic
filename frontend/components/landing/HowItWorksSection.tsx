import { UserPlus, BookOpen, Trophy } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    desc: "Sign up for free in under a minute. No credit card required to get started.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Choose Your Course",
    desc: "Browse 500+ expert-led courses across programming, design, business, and more.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Learn & Achieve",
    desc: "Complete at your own pace, earn certificates, and transform your career.",
    color: "bg-amber-50 text-amber-600",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Getting started is simple. Three steps to unlock your learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, step, title, desc, color }) => (
            <div key={step} className="relative text-center">
              <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                <Icon className="w-8 h-8" />
              </div>
              <span className="absolute top-0 right-1/2 translate-x-8 -translate-y-1 text-xs font-bold text-slate-300">
                {step}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
