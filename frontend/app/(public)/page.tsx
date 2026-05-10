import HeroSection from "@/components/landing/HeroSection"
import StatsSection from "@/components/landing/StatsSection"
import CoursesSection from "@/components/landing/CoursesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import CTASection from "@/components/landing/CTASection"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <CoursesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
