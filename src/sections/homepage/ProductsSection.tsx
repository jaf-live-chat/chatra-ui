import { ArrowRight, MessageCircle, Shield, Zap, X } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useState } from "react";

import ImageWithFallback from "../../components/ImageWithFallback";

const ProductsSection = () => {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  return (
    <>
      <section 
        id="products" 
        className="py-24 relative" 
        style={{ 
          backgroundColor: "#0b162c",
          backgroundImage: "radial-gradient(ellipse 65% 70% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(11, 22, 44, 0) 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.span
              className="inline-block text-[#00a3ff] mb-4 uppercase tracking-widest text-xs font-bold"
              style={{ fontFamily: "Inter, sans-serif" }}
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
            >OUR PRODUCTS</motion.span>
            <motion.h2
              className="text-white mb-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
            >
              Built for modern teams
            </motion.h2>

            <motion.p
              className="text-[#8ba2c4] max-w-xl mx-auto"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", lineHeight: "1.6" }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            >
              Discover our suite of tools designed to help you connect, engage, and support your customers better than ever before.
            </motion.p>
          </motion.div>

          {/* Product Showcase Card */}
          <div className="rounded-[1.5rem] border overflow-hidden" style={{ backgroundColor: "#111b33", borderColor: "rgba(255, 255, 255, 0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Content */}
              <motion.div
                className="p-8 lg:p-14 flex flex-col justify-center"
                initial={{ opacity: 0, x: -26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden bg-[#00a3ff]">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3
                    className="text-white"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.35rem" }}
                  >
                    JAF Chatra
                  </h3>
                </div>

                <p
                  className="text-[#9ca3af] mb-8"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", lineHeight: "1.6" }}
                >
                  The ultimate live chat solution that turns your website visitors into loyal customers. Engage in real-time, track visitor behavior, and deliver exceptional support experiences with our powerful, customizable chat widget.
                </p>

                <motion.ul
                  className="space-y-3 mb-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ staggerChildren: 0.08, delayChildren: 0.16 }}
                >
                  {[
                    "Real-time communication with less than 50ms latency",
                    "Enterprise-grade security and session tracking",
                    "Fully customizable widget to match your brand"
                  ].map((text, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -12 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-[#00a3ff]">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span
                        className="text-[#cbd5e1]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 500 }}
                      >
                        {text}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.div
                  className="flex flex-wrap gap-4 mt-auto items-center"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
                >
                  <Link
                    to="/checkout/free"
                    className="text-white px-5 py-2.5 rounded-full transition-all flex items-center gap-2 group cursor-pointer text-sm"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, backgroundColor: "#00a3ff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#008ce6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00a3ff")}
                  >
                    Start Free Trial <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/pricing"
                    className="text-[#cbd5e1] px-5 py-2.5 rounded-full transition-colors border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] font-medium text-sm flex items-center"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}
                  >
                    View Pricing
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Image/Visual */}
              <motion.div
                className="relative overflow-hidden flex items-center justify-center p-8 bg-gradient-to-br from-[#111b33] to-[#0b1224]"
                initial={{ opacity: 0, x: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: "rgba(0, 163, 255, 0.15)" }}></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" style={{ backgroundColor: "rgba(0, 163, 255, 0.15)" }}></div>

                {/* Product Mockup */}
                <motion.div
                  className="relative z-10 w-full rounded-lg overflow-hidden border border-[#2d3748] shadow-2xl max-w-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-[#1e293b] px-4 py-2 flex items-center gap-2 border-b border-[#334155]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                    <div className="ml-4 text-[10px] text-[#64748b] font-medium tracking-wide flex-1 text-center" style={{ fontFamily: "Inter, sans-serif" }}>jaf-dashboard.app</div>
                  </div>
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY2hhdCUyMGxhcHRvcHxlbnwxfHx8fDE3NzMyMTI1Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="JAF Chatra Dashboard"
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              </motion.div>
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



