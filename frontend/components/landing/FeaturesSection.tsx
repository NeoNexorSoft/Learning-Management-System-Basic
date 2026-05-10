import { Zap, Shield, Clock, HeadphonesIcon, BarChart, Globe } from "lucide-react"

const features = [
  { icon: Zap,             title: "Learn at Your Pace",      desc: "Access course content anytime, anywhere. No deadlines, no pressure — just progress." },
  { icon: Shield,          title: "Expert Instructors",      desc: "Every course is taught by verified industry professionals with real-world experience." },
  { icon: Clock,           title: "Lifetime Access",         desc: "Buy once, access forever. Course updates are always included at no extra cost." },
  { icon: HeadphonesIcon,  title: "24/7 Support",            desc: "Our support team is always available to help you with any questions or issues." },
  { icon: BarChart,        title: "Track Your Progress",     desc: "Visual dashboards help you stay motivated and see how far you've come." },
  { icon: Globe,           title: "Global Community",        desc: "Connect with learners from 50+ countries and grow your professional network." },
]

export default function FeaturesSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why Choose Us</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Everything you need to succeed — built into one powerful learning platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
