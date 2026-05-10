import FeaturesSection from "@/components/landing/FeaturesSection"
import TeachersSection from "@/components/landing/TeachersSection"
import StatsSection from "@/components/landing/StatsSection"

export const metadata = { title: "About – Neo Nexor" }

export default function AboutPage() {
  return (
    <main className="pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20 text-center">
        <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-full mb-4">
          About Neo Nexor
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Empowering Learners Worldwide
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto px-4">
          We believe everyone deserves access to world-class education. Neo Nexor connects ambitious
          learners with expert teachers to unlock their full potential.
        </p>
      </div>

      {/* Mission */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Mission</h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-8">
            Founded in 2024, Neo Nexor was built on a simple idea: learning should be accessible,
            practical, and rewarding. We partner with industry professionals and passionate educators
            to deliver courses that create real career outcomes — not just certificates.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { value: "2024", label: "Founded" },
              { value: "10,000+", label: "Students Enrolled" },
              { value: "500+", label: "Courses Available" },
            ].map(({ value, label }) => (
              <div key={label} className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-3xl font-extrabold text-indigo-600 mb-1">{value}</p>
                <p className="text-slate-600 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection />
      <FeaturesSection />
      <TeachersSection />
    </main>
  )
}
