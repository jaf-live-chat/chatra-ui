import { PageTitle } from "../../../components/common/PageTitle";
import Navbar from "../../../components/common/Navbar";
import HeroSection from "../../../sections/homepage/HeroSection";
import TrustedBySection from "../../../sections/homepage/TrustedBySection";
import ProductsSection from "../../../sections/homepage/ProductsSection";
import HowItWorksSection from "../../../sections/homepage/HowItWorksSection";
import DashboardPreviewSection from "../../../sections/dashboard/DashboardPreviewSection";
import IntegrationSection from "../../../sections/homepage/IntegrationSection";
import CTASection from "../../../sections/homepage/CTASection";
import Footer from "../../../components/common/Footer";
import HomepageFaqSection from "../../../sections/homepage/HomepageFaqSection";
import ScrollReveal from "../../../components/ScrollReveal";
import React from "react";

const Home = () => {
  return (
    <React.Fragment>
      <PageTitle
        title="Home"
        description="JAF Chatra - The Ultimate AI-Powered Customer Support Solution for Your Business"
        canonical="/portal/home"

      />
      <div className="min-h-screen scroll-smooth" style={{ fontFamily: "Inter, sans-serif" }}>
        <Navbar />
        <main>
          <ScrollReveal preset="hero" duration={0.95} distance={36}>
            <HeroSection />
          </ScrollReveal>
          <ScrollReveal preset="soft" delay={0.03} duration={0.74}>
            <TrustedBySection />
          </ScrollReveal>
          <ScrollReveal preset="lift" delay={0.06} duration={0.8}>
            <ProductsSection />
          </ScrollReveal>
          <ScrollReveal preset="cardLeft" delay={0.08} duration={0.84} distance={30}>
            <HowItWorksSection />
          </ScrollReveal>
          <ScrollReveal preset="cardRight" delay={0.09} duration={0.84} distance={30}>
            <DashboardPreviewSection />
          </ScrollReveal>
          <ScrollReveal preset="scale" delay={0.1} duration={0.78}>
            <IntegrationSection />
          </ScrollReveal>
          <ScrollReveal preset="fade" delay={0.11} duration={0.68}>
            <HomepageFaqSection />
          </ScrollReveal>
          <ScrollReveal preset="cta" delay={0.12} duration={0.86} distance={26}>
            <CTASection />
          </ScrollReveal>
        </main>
        <Footer />
      </div>
    </React.Fragment>
  );
}

export default Home;

