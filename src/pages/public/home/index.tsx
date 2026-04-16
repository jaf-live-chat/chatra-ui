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
      </div>
    </React.Fragment>
  );
}

export default Home;

