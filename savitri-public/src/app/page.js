/**
 * Homepage - Complete with All New Sections
 * src/app/page.js
 */

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import Toast from "@/components/common/Toast";

// Import all new sections
import HeroCarousel from "@/components/home/HeroCarousel/";
import StatsSection from "@/components/home/StatsSection";
import FeaturedBoats from "@/components/home/FeaturedBoats";
import ServicesSection from "@/components/home/ServicesSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

// Keep your existing WhyChooseUs if you want
import WhyChooseUs from "@/components/home/WhyChooseUs";

export const metadata = {
  title: "Savitri Shipping - Mumbai Water Transport",
  description: "Book speed boats, party boats, and ferry services in Mumbai",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <MobileMenu />

      <main>
        {/* 1. Hero Carousel - 3 Slides */}
        <HeroCarousel />

        {/* 2. Animated Stats */}
        <StatsSection />

        {/* 3. Featured Boats Slider */}
        <FeaturedBoats />

        {/* 4. Our Services */}
        <ServicesSection />

        {/* 5. How It Works Timeline */}
        <HowItWorks />

        {/* 6. Why Choose Us (Your existing component) */}
        <WhyChooseUs />

        {/* 7. Customer Testimonials */}
        <Testimonials />

        {/* 8. Final CTA */}
        <CTASection />
      </main>

      <Footer />
      <Toast />
    </>
  );
}
