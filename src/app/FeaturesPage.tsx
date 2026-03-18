import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { FeaturesSection } from "./components/FeaturesSection";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { useState } from "react";
import {
  Shield,
  Globe,
  Smartphone,
  BarChart3,
  Users,
  Clock,
  Palette,
  Bell,
} from "lucide-react";

const extendedFeatures = [
  {
    icon: <Shield className="w-6 h-6" />,
    color: "bg-green-100 text-green-600",
    title: "End-to-End Encryption",
    description:
      "All messages are encrypted in transit and at rest, ensuring your customer conversations remain private and secure.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-600",
    title: "Multi-Language Support",
    description:
      "Serve customers in their native language with automatic translation and localized chat widgets.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-600",
    title: "Mobile Responsive",
    description:
      "The chat widget adapts beautifully to any screen size, providing a seamless experience on mobile devices.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-600",
    title: "Analytics & Reports",
    description:
      "Track response times, satisfaction scores, and chat volume with detailed analytics dashboards.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: "bg-indigo-100 text-indigo-600",
    title: "Team Collaboration",
    description:
      "Transfer chats between agents, leave internal notes, and collaborate in real-time on complex issues.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    color: "bg-yellow-100 text-yellow-700",
    title: "Business Hours",
    description:
      "Set custom availability schedules and automatically show offline forms outside business hours.",
  },
  {
    icon: <Palette className="w-6 h-6" />,
    color: "bg-pink-100 text-pink-600",
    title: "Full Customization",
    description:
      "Match the chat widget to your brand with custom colors, logos, and greeting messages.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    color: "bg-red-100 text-red-600",
    title: "Smart Notifications",
    description:
      "Get notified instantly via browser, email, or mobile push when new messages arrive.",
  },
];

export function FeaturesPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setStatusMessage("Please enter a valid email address.");
      return;
    }
    // Save to localStorage
    const existing: string[] = JSON.parse(localStorage.getItem("jaf_signups") || "[]");
    if (existing.includes(trimmed)) {
      setStatus("error");
      setStatusMessage("This email is already signed up.");
      return;
    }
    existing.push(trimmed);
    localStorage.setItem("jaf_signups", JSON.stringify(existing));
    setStatus("success");
    setStatusMessage("You're signed up! We'll be in touch soon.");
    setEmail("");
    setTimeout(() => {
      setStatus("idle");
      setStatusMessage("");
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <FeaturesSection />

        {/* Extended Features */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
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
                And so much more
              </h2>
              <p
                className="text-gray-500"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1rem",
                  lineHeight: "1.7",
                }}
              >
                Explore the full set of tools that make JAF Live Chat the best
                choice for your support team.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="divide-y divide-gray-200/60">
                {extendedFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="py-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 group hover:bg-gray-100/50 px-6 -mx-6 rounded-2xl transition-colors duration-200"
                  >
                    <div
                      className={`flex-shrink-0 w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <div className="sm:w-1/3">
                      <h3
                        className="text-gray-900 mb-2 sm:mb-0"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        {feature.title}
                      </h3>
                    </div>
                    <div className="sm:w-2/3">
                      <p
                        className="text-gray-500"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                        }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Highlight Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mt-24 max-w-5xl mx-auto">
              {/* Integrations Card */}
              <div className="bg-[#f8f9fa] rounded-[2rem] overflow-hidden flex flex-col items-center pt-12 relative border border-gray-100 shadow-sm">
                <div className="w-full flex justify-center mb-12 px-8">
                  <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm mx-auto">
                    {[
                      { name: "Google Ads", icon: "G", color: "text-blue-500", bg: "bg-blue-50" },
                      { name: "WooCommerce", icon: "W", color: "text-purple-500", bg: "bg-purple-50" },
                      { name: "Mailchimp", icon: "M", color: "text-yellow-500", bg: "bg-yellow-50" },
                      { name: "Zendesk", icon: "Z", color: "text-emerald-500", bg: "bg-emerald-50" },
                      { name: "Dropbox", icon: "D", color: "text-blue-600", bg: "bg-blue-100" },
                      { name: "Whatsapp", icon: "W", color: "text-green-500", bg: "bg-green-50" },
                      { name: "ChatBot", icon: "C", color: "text-blue-400", bg: "bg-blue-50" },
                      { name: "Slack", icon: "S", color: "text-red-500", bg: "bg-red-50" },
                      { name: "HelpDesk", icon: "H", color: "text-green-600", bg: "bg-green-100" },
                      { name: "Instagram", icon: "I", color: "text-pink-500", bg: "bg-pink-50" },
                    ].map((app) => (
                      <div
                        key={app.name}
                        className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-2.5 flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] gap-1.5 border border-gray-50 hover:shadow-md transition-shadow"
                      >
                        <div className={`w-8 h-8 rounded-lg ${app.bg} flex items-center justify-center font-bold text-lg ${app.color}`}>
                          {app.icon}
                        </div>
                        <span className="text-[9px] font-medium text-gray-400 text-center leading-tight truncate w-full">
                          {app.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-10 pb-10 w-full text-left bg-[#f8f9fa] mt-auto">
                  <h3 className="text-[1.35rem] font-bold text-gray-900 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                    200+ Integrations
                  </h3>
                  <p className="text-gray-500 text-[0.95rem] leading-relaxed mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
                    Improve your workflow by connecting JAF Live Chat with apps you use every day. Create a personalized hub to manage all your customer interactions.
                  </p>
                  <button className="px-5 py-2 border border-gray-300 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Visit Marketplace
                  </button>
                </div>
              </div>

              {/* Quick Replies Card */}
              <div className="bg-[#1c1d22] rounded-[2rem] overflow-hidden flex flex-col items-center pt-12 relative shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a2b36] to-[#1c1d22] opacity-80"></div>
                {/* Background Icons */}
                <div className="absolute top-6 left-12 text-white/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="absolute top-10 right-10 text-white/40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                
                <div className="w-full flex justify-center mb-12 px-8 z-10 mt-8">
                  {/* Quick Reply mockup */}
                  <div className="w-full max-w-sm relative">
                    {/* Autocomplete popover */}
                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 mb-2 overflow-hidden w-64 mx-auto relative z-20">
                      <div className="px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Quick Replies
                      </div>
                      <div className="p-1">
                        <div className="px-3 py-2 hover:bg-blue-50 bg-blue-50/50 rounded cursor-pointer flex flex-col">
                          <span className="text-[12px] font-bold text-gray-800">/pricing</span>
                          <span className="text-[11px] text-gray-500 truncate">Our pricing plans start at $10/mo...</span>
                        </div>
                        <div className="px-3 py-2 hover:bg-gray-50 rounded cursor-pointer flex flex-col">
                          <span className="text-[12px] font-bold text-gray-800">/hello</span>
                          <span className="text-[11px] text-gray-500 truncate">Hi there! How can I help you today?</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chat input */}
                    <div className="bg-[#e2e8f8] rounded-xl p-3 shadow-2xl relative">
                      <div className="bg-white rounded-lg px-3 py-2.5 shadow-sm flex items-center gap-2">
                        <span className="text-blue-500 font-bold">/pr</span>
                        <span className="text-gray-300 font-light animate-pulse">|</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 px-1">
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="text-sm font-bold">T</span>
                          <span className="text-sm">☺</span>
                          <span className="text-sm">📎</span>
                        </div>
                        <button className="px-4 py-1.5 bg-[#4285f4] text-white text-[13px] font-semibold rounded hover:bg-blue-600 transition-colors">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-10 pb-10 w-full text-left z-10 mt-auto">
                  <h3 className="text-[1.35rem] font-bold text-white mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                    Lightning-fast responses.
                  </h3>
                  <p className="text-gray-400 text-[0.95rem] leading-relaxed mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
                    Save time and impress customers by using canned responses to instantly answer frequently asked questions.
                  </p>
                  <button className="px-5 py-2 border border-white/20 bg-transparent text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors">
                    Explore Quick Replies
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-32 pt-16 text-center">
              <h2
                className="text-gray-900 mb-6"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                }}
              >
                Start using JAF Chatra<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup> now!
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10">
                {["Free 14-day trial", "No credit card required"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-500" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3.5 3.5L13 4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSignup}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status !== "idle") { setStatus("idle"); setStatusMessage(""); } }}
                  className={`w-full sm:flex-1 px-5 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow ${status === "error" ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-gray-300"}`}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 600 }}
                >
                  Sign up free
                </button>
              </form>
              {status !== "idle" && (
                <p
                  className={`mt-3 ${status === "success" ? "text-green-600" : "text-red-500"}`}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}
                >
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}