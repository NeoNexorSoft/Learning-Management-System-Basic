import ContactSection from "@/components/landing/ContactSection"

export const metadata = { title: "Contact – Neo Nexor" }

export default function ContactPage() {
  return (
    <main className="pt-16">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16 text-center">
        <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-full mb-4">
          Get in Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Contact Us</h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto">
          Have questions about our courses or platform? Our team is ready to help.
        </p>
      </div>
      <ContactSection />
    </main>
  )
}
