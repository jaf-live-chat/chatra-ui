import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { TrustedBySection } from "./components/TrustedBySection";
import { ProductsSection } from "./components/ProductsSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { DashboardPreviewSection } from "./components/DashboardPreviewSection";
import { PricingSection } from "./components/PricingSection";
import { IntegrationSection } from "./components/IntegrationSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { LiveChatWidget } from "./components/LiveChatWidget";

export function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <ProductsSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <IntegrationSection />
        <CTASection />
      </main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}