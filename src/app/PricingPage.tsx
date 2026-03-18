import { Navbar } from "./components/Navbar";
import { PricingSection } from "./components/PricingSection";
import { Footer } from "./components/Footer";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { useEffect } from "react";

export function PricingPage() {
  // Scroll to top when loading the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <main className="pt-16">
        <PricingSection />
      </main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}