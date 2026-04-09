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
import React from "react";
import LiveChatWidget from "../../../components/widgets/LiveChatWidget";

const Home = () => {
  return (
    <React.Fragment>
      <PageTitle
        title="Home"
        description="JAF Chatra - The Ultimate AI-Powered Customer Support Solution for Your Business"
        canonical="/portal/home"

      />
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
        <LiveChatWidget initialConfig={{ apiKey: "jaf_84ee72f898f1dc74ab2167e0bfac96a1a24ce2132b0f3de8" }} />
      </div>
    </React.Fragment>
  );
}

export default Home;

