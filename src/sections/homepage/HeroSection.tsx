import { useState } from "react";
import { ArrowRight, Play, CheckCircle, X } from "lucide-react";

function ChatBubble({ text, isAgent, time }: { text: string; isAgent: boolean; time: string }) {
  return (
    <div className={`flex items-end gap-2 ${isAgent ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0`}
        style={{
          background: isAgent ? "linear-gradient(135deg, #2563eb, #1e40af)" : "#e5e7eb",
        }}
      >
        {isAgent ? (
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "white" }}>A</span>
        ) : (
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#6b7280" }}>V</span>
        )}
      </div>
      <div
        className={`max-w-[160px] px-3 py-2 rounded-2xl ${isAgent
          ? "bg-blue-600 text-white rounded-br-sm"
          : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm"
          }`}
        style={{ fontSize: "0.72rem", fontFamily: "Inter, sans-serif" }}
      >
        <p>{text}</p>
        <p className={`mt-0.5 ${isAgent ? "text-blue-200" : "text-gray-400"}`} style={{ fontSize: "0.6rem" }}>{time}</p>
      </div>
    </div>
  );
}

const HeroSection = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section
      className="min-h-screen flex items-center pt-16"
      style={{
        background: "linear-gradient(90deg, #e0f2fe 0%, #ffffff 50%, #e0f2fe 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full mb-6"
              style={{ fontSize: "0.8rem", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              New: AI-Powered Chat Routing
            </div>

            <h1
              className="text-gray-900 mb-6"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
              }}
            >
              Real-Time Customer Support{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  display: "inline-block",
                }}
              >
                Made Simple
              </span>
            </h1>

            <p
              className="text-gray-500 mb-8 max-w-lg"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.1rem",
                lineHeight: "1.7",
              }}
            >
              JAF Live Chat helps businesses communicate with website visitors instantly, improve customer experience, and increase conversions through real-time messaging.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsDemoOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-7 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
              >
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
                View Demo
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {["Free 3-day trial", "Cancel anytime"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span
                    className="text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat Dashboard Illustration */}
          <div className="hidden lg:flex justify-center">
            <div
              className="relative w-full max-w-lg"
              style={{ transform: "perspective(1000px) rotateY(-5deg) rotateX(3deg)" }}
            >
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div
                  className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1e40af)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-white ml-2" style={{ fontSize: "0.75rem", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>JAF Live Chat — Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100" style={{ fontSize: "0.65rem" }}>12 online</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
                  {[
                    { label: "Active Chats", value: "24", color: "text-blue-600" },
                    { label: "Visitors Online", value: "138", color: "text-yellow-600" },
                    { label: "Avg. Response", value: "1.2m", color: "text-gray-900" },
                  ].map((stat, i) => (
                    <div key={stat.label} className={`p-3 text-center ${i < 2 ? "border-r border-gray-100" : ""}`}>
                      <p className={`${stat.color}`} style={{ fontSize: "1.1rem", fontFamily: "Inter, sans-serif", fontWeight: 700 }}>{stat.value}</p>
                      <p className="text-gray-400" style={{ fontSize: "0.6rem", fontFamily: "Inter, sans-serif" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chat Interface */}
                <div className="flex h-56">
                  {/* Sidebar */}
                  <div className="w-36 border-r border-gray-100 overflow-y-auto">
                    {[
                      { name: "Sarah M.", msg: "Hi, I need help...", time: "now", active: true },
                      { name: "John D.", msg: "Can you track my...", time: "2m", active: false },
                      { name: "Emily K.", msg: "Is there a discount?", time: "5m", active: false },
                      { name: "Michael P.", msg: "Onboarding help", time: "8m", active: false },
                    ].map((conv) => (
                      <div
                        key={conv.name}
                        className={`px-3 py-2.5 cursor-pointer border-b border-gray-50 ${conv.active ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-gray-700" style={{ fontSize: "0.65rem", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{conv.name}</span>
                          <span className="text-gray-400" style={{ fontSize: "0.55rem" }}>{conv.time}</span>
                        </div>
                        <p className="text-gray-400 truncate" style={{ fontSize: "0.6rem" }}>{conv.msg}</p>
                        {conv.active && <div className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                      </div>
                    ))}
                  </div>

                  {/* Chat Window */}
                  <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                        <span className="text-white" style={{ fontSize: "0.55rem", fontWeight: 700 }}>S</span>
                      </div>
                      <div>
                        <p className="text-gray-700" style={{ fontSize: "0.65rem", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Sarah Mitchell</p>
                        <p className="text-green-500" style={{ fontSize: "0.55rem" }}>● Active now</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
                      <ChatBubble text="Hi! I need help with my subscription plan." isAgent={false} time="2:14 PM" />
                      <ChatBubble text="Of course! I'd be happy to assist you with that." isAgent={true} time="2:14 PM" />
                      <ChatBubble text="Can I upgrade to Business plan?" isAgent={false} time="2:15 PM" />
                      {/* Typing indicator */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "white" }}>A</span>
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="px-3 py-2 border-t border-gray-100">
                      <div className="bg-gray-50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <span className="text-gray-400 flex-1" style={{ fontSize: "0.65rem" }}>Type a reply...</span>
                        <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                          <ArrowRight className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 */}
              <div
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
                style={{ transform: "rotate(3deg)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span style={{ fontSize: "1rem" }}>🎯</span>
                  </div>
                  <div>
                    <p className="text-gray-700" style={{ fontSize: "0.65rem", fontFamily: "Inter, sans-serif", fontWeight: 700 }}>+42% Conversion</p>
                    <p className="text-gray-400" style={{ fontSize: "0.55rem" }}>This month</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
                style={{ transform: "rotate(-2deg)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span style={{ fontSize: "1rem" }}>⚡</span>
                  </div>
                  <div>
                    <p className="text-gray-700" style={{ fontSize: "0.65rem", fontFamily: "Inter, sans-serif", fontWeight: 700 }}>1.2s Avg. Reply</p>
                    <p className="text-gray-400" style={{ fontSize: "0.55rem" }}>Response time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {isDemoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsDemoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl mx-4 bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDemoOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                title="JAF Chatra Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HeroSection;


