import Navbar from "../../../components/common/Navbar";
import PricingSection from "../../../sections/homepage/PricingSection";
import Footer from "../../../components/common/Footer";
import React, { useEffect } from "react";
import PageTitle from "../../../components/common/PageTitle";

const PricingPage = () => {
  // Scroll to top when loading the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <React.Fragment>
      <PageTitle
        title="Pricing"
        description="Choose the perfect plan for your team's needs."
        canonical="/portal/pricing"
      />
      <div className="min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
        <Navbar />
        <main>
          <PricingSection />
        </main>
        <Footer />
      </div>
    </React.Fragment>

  );
}

export default PricingPage;




