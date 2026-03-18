import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router";

const faqs = [
  {
    q: "How long does installation take?",
    a: "Most teams are up and running in under 5 minutes. Simply copy the embed code and paste it into your website's HTML.",
  },
  {
    q: "Do I need any coding experience?",
    a: "Not at all. The setup wizard guides you step by step. If you can copy and paste, you can install JAF Live Chat.",
  },
  {
    q: "Can I customize the chat widget?",
    a: "Yes! You can change colors, position, greeting messages, agent avatars, and much more from the dashboard.",
  },
  {
    q: "Is there a free trial?",
    a: "Absolutely. Start with a 14-day free trial — no credit card required. Experience all features before committing.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <HowItWorksSection />

        {/* Benefits */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2
                className="text-gray-900 mb-4"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                }}
              >
                Why teams choose JAF Live Chat
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "No installation headaches",
                "Works with any website platform",
                "Real-time visitor monitoring",
                "Automatic chat routing",
                "Built-in offline messaging",
                "Detailed analytics included",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-4"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span
                    className="text-gray-700"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.95rem",
                    }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2
                className="text-gray-900 mb-4"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  lineHeight: "1.2",
                }}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white border border-gray-100 rounded-xl p-6"
                >
                  <h3
                    className="text-gray-900 mb-2"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {faq.q}
                  </h3>
                  <p
                    className="text-gray-500"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.9rem",
                      lineHeight: "1.65",
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/free-trial"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
