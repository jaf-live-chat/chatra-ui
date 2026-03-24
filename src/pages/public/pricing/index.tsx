import Navbar from "../../../components/common/Navbar";
import PricingSection from "../../../sections/homepage/PricingSection";
import Footer from "../../../components/common/Footer";
import LiveChatWidget from "../../../components/widgets/LiveChatWidget";
import { useEffect } from "react";

const PricingPage = () => {
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

export default PricingPage;




