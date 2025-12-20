import {
  Navbar,
  Hero,
  FeaturesGrid,
  HowItWorks,
  StatsSection,
  DemoCTA,
  PricingSection,
  FAQAccordion,
  NewsSection,
  BottomCTA,
  Footer,
} from '@/components/landing'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <StatsSection />
      <DemoCTA />
      <PricingSection />
      <FAQAccordion />
      <NewsSection />
      <BottomCTA />
      <Footer />
    </main>
  )
}
