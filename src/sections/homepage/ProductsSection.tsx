import { ArrowRight, MessageCircle, Shield, Zap, X } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useState } from "react";

import ImageWithFallback from "../../components/ImageWithFallback";

const ProductsSection = () => {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  return (
    <>
      <section id="products" className="py-24 bg-[#0A192FFF] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#1E3A8A] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            className="text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.span
              className="inline-block text-[#0EA5E9] mb-3 uppercase tracking-wider"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", fontWeight: 700 }}
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
              >OUR PRODUCTS</motion.span>
            <motion.h2
              className="text-white mb-6"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
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
              className="text-[#94A3B8] max-w-[600px] mx-auto"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "1.05rem", lineHeight: "1.6" }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            >
              Discover our suite of tools designed to help you connect, engage, and support your customers better than ever before.
            </motion.p>
          </motion.div>

          {/* Product Showcase Card */}
          <div className="bg-[#112240] rounded-3xl border border-[#1E3A8A]/50 shadow-2xl overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-0 relative z-10">
              {/* Left Content */}
              <motion.div
                className="p-8 lg:p-12 xl:p-14 flex flex-col justify-center"
                initial={{ opacity: 0, x: -26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: "#0EA5E9", boxShadow: "0 10px 15px -3px #0EA5E933" }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <motion.h3
                    className="text-white"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.35rem" }}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    JAF Chatra
                  </motion.h3>
                </div>

                <motion.p
                  className="text-[#94A3B8] mb-8 lg:mb-10 text-sm lg:text-[0.95rem] leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  The ultimate live chat solution that turns your website visitors into loyal customers. Engage in real-time, track visitor behavior, and deliver exceptional support experiences with our powerful, customizable chat widget.
                </motion.p>

                <motion.ul
                  className="space-y-3.5 mb-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ staggerChildren: 0.08, delayChildren: 0.16 }}
                >
                  {[
                    { icon: Zap, text: "Real-time communication with less than 50ms latency" },
                    { icon: Shield, text: "Enterprise-grade security and session tracking" },
                    { icon: MessageCircle, text: "Fully customizable widget to match your brand" }
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -12 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center">
                         {/* Simple bullet diamond/star replacing icon background */}
                        <div className="w-2.5 h-2.5 bg-[#0EA5E9] rotate-45 flex-shrink-0 opacity-80 shadow-[0_0_8px_#0EA5E9]" />
                        {/* <item.icon className="hidden" /> */}
                      </div>
                      <span
                        className="text-[#CBD5E1]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 500 }}
                      >
                        {item.text}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.div
                  className="flex flex-wrap gap-4 mt-auto"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
                >
                  <Link
                    to="/checkout/free"
                    className="text-white px-5 py-2.5 lg:px-6 lg:py-2.5 rounded-full transition-all flex items-center justify-center gap-2 group cursor-pointer text-sm lg:text-[0.95rem]"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, backgroundColor: "#0EA5E9", boxShadow: "0 4px 14px -2px #0EA5E966" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0EA5E9")}
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/pricing"
                    className="bg-[#1E293B] hover:bg-[#334155] border border-[#334155]/50 text-[#F8FAFC] px-5 py-2.5 lg:px-6 lg:py-2.5 rounded-full transition-colors flex items-center justify-center text-sm lg:text-[0.95rem]"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}
                  >
                    View Pricing
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Image/Visual */}
              <motion.div
                className="bg-[#0B172F] lg:min-h-[480px] relative overflow-hidden flex items-center justify-center p-8 border-l border-[#1E3A8A]/30"
                initial={{ opacity: 0, x: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-px bg-white/15 hidden lg:block"
                  initial={{ scaleY: 0, transformOrigin: "top" }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
                />
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: "#0891b233" }}></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" style={{ backgroundColor: "#22d3ee33" }}></div>

                {/* Product Mockup */}
                <motion.div
                  className="relative z-10 w-full max-w-md rounded-xl overflow-hidden border border-gray-800 shadow-2xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                >
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



