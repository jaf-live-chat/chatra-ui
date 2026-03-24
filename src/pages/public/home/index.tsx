import Navbar from "../../../components/common/Navbar";
import HeroSection from "../../../sections/homepage/HeroSection";
import TrustedBySection from "../../../sections/homepage/TrustedBySection";
import ProductsSection from "../../../sections/homepage/ProductsSection";
import HowItWorksSection from "../../../sections/homepage/HowItWorksSection";
import DashboardPreviewSection from "../../../sections/dashboard/DashboardPreviewSection";
import PricingSection from "../../../sections/homepage/PricingSection";
import IntegrationSection from "../../../sections/homepage/IntegrationSection";
import CTASection from "../../../sections/homepage/CTASection";
import Footer from "../../../components/common/Footer";
import LiveChatWidget from "../../../components/widgets/LiveChatWidget";
import HomepageFaqSection from "../../../sections/homepage/HomepageFaqSection";

const Home = () => {
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
        <HomepageFaqSection />
        <CTASection />
      </main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}

export default Home;

