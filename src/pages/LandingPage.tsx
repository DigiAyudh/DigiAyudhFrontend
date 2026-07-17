import { PublicNavbar } from '../components/public/public-navbar';
import { PublicFooter } from '../components/public/public-footer';
import { HeroSection } from '../components/public/hero-section';
import { TrustedBySection } from '../components/public/trusted-by-section';
import { ServicesSection } from '../components/public/services-section';
import { WhyUsSection } from '../components/public/why-us-section';
import { ProcessSection } from '../components/public/process-section';
import { PortfolioSection } from '../components/public/portfolio-section';
// import { PricingSection } from '../components/public/pricing-section';
import { TestimonialSection } from '../components/public/testimonial-section';
import { FAQSection } from '../components/public/faq-section';
import { ContactSection } from '../components/public/contact-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <ServicesSection />
        <WhyUsSection />
        <ProcessSection />
        <PortfolioSection />
        {/* <PricingSection /> */}
        <TestimonialSection />
        <FAQSection />
        <ContactSection />
      </main>
      <PublicFooter />
    </div>
  );
}
