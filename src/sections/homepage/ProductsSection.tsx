import { ArrowRight, MessageCircle, Shield, Zap, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

import ImageWithFallback from "../../components/ImageWithFallback";

const ProductsSection = () => {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  return (
    <>
      <section id="products" className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 600 }}
          >Our Products</span>
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
            }}
          >
            Built for modern teams
          </h2>
          <p
            className="text-gray-500"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", lineHeight: "1.7" }}
          >
            Discover our suite of tools designed to help you connect, engage, and support your customers better than ever before.
          </p>
        </div>

        {/* Product Showcase Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: "#0891b2", boxShadow: "0 10px 15px -3px #0891b233" }}>
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3
                  className="text-gray-900"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  JAF Chatra
                </h3>
              </div>
              
              <p
                className="text-gray-600 mb-8"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "1.1rem", lineHeight: "1.6" }}
              >
                The ultimate live chat solution that turns your website visitors into loyal customers. Engage in real-time, track visitor behavior, and deliver exceptional support experiences with our powerful, customizable chat widget.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  { icon: Zap, text: "Real-time communication with less than 50ms latency" },
                  { icon: Shield, text: "Enterprise-grade security and session tracking" },
                  { icon: MessageCircle, text: "Fully customizable widget to match your brand" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0891b214" }}>
                      <item.icon className="w-3.5 h-3.5" style={{ color: "#0891b2" }} />
                    </div>
                    <span 
                      className="text-gray-700"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 500 }}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-4 mt-auto">
                <Link
                  to="/checkout/free-trial"
                  className="text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "1rem", backgroundColor: "#0891b2", boxShadow: "0 10px 15px -3px #0891b233" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e7490")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0891b2")}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/pricing"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl transition-colors font-medium flex items-center"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "1rem" }}
                >
                  View Pricing
                </Link>
              </div>
            </div>
            
            {/* Right Image/Visual */}
            <div className="bg-gray-900 lg:min-h-[500px] relative overflow-hidden flex items-center justify-center p-8">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: "#0891b233" }}></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" style={{ backgroundColor: "#22d3ee33" }}></div>
              
              {/* Product Mockup */}
              <div className="relative z-10 w-full max-w-md rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-xs text-gray-400 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>jaf-dashboard.app</div>
                </div>
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY2hhdCUyMGxhcHRvcHxlbnwxfHx8fDE3NzMyMTI1Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                  alt="JAF Chatra Dashboard" 
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Free Trial Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsTrialModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Inter, sans-serif" }}>Start your 14-day free trial</h3>
              <button 
                onClick={() => setIsTrialModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
                No credit card required. Get full access to all JAF Live Chat features for 14 days.
              </p>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); /* Handle form submission */ }}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Work Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="you@company.com" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Company Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Acme Inc." 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Create a strong password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Create Account
                  </button>
                </div>
                
                <p className="text-xs text-center text-slate-500 mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductsSection;



