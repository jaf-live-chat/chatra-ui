import { Facebook, Twitter, Instagram } from "lucide-react";
import { motion } from "motion/react";
import Logo from "./Logo";
import useCompanyBranding from "../../hooks/useCompanyBranding";

const footerColumns = [
  {
    title: "PRODUCT",
    links: ["Features", "Pricing", "Integrations"],
  },
  {
    title: "SUPPORT",
    links: ["Help Center", "Documentation", "System Status"],
  },
  {
    title: "COMPANY",
    links: ["About Us", "Blog", "Contact"],
  },
];

const footerLinkMap: Record<string, string> = {
  Features: "/features",
  Pricing: "/pricing",
  Integrations: "/integrations",
  "Help Center": "/resources/help-center",
  Documentation: "/resources/help-center",
  "System Status": "/system-status",
  "About Us": "/about",
  Blog: "/blog",
  Contact: "/contact",
};

const Footer = () => {
  const { companyName } = useCompanyBranding();
  const companyDescription = "Real-time customer support made simple. Elevate your business communication and customer experience with our intelligent platform.";

  const blockAnimation = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const rowAnimation = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-white text-[#64748b]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-12 pb-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-8 lg:gap-12 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.14 }}
        >
          <motion.div className="max-w-sm space-y-4" variants={blockAnimation} transition={{ duration: 0.45, ease: "easeOut" }}>
            <motion.div variants={rowAnimation} transition={{ duration: 0.4, ease: "easeOut" }}>
              <Logo variant="dark" alt={companyName} size="sm" />
            </motion.div>
            <motion.p
              className="text-[#94a3b8] leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem" }}
              variants={rowAnimation}
              transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            >
              {companyDescription}
            </motion.p>

            <div className="flex items-center gap-2 pt-1">
                <motion.a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#e2e8f0] text-[#94a3b8] hover:text-[#3b82f6] hover:border-[#3b82f6] transition-colors flex items-center justify-center bg-[#f8fafc]"
                  variants={rowAnimation}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  <Facebook className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#e2e8f0] text-[#94a3b8] hover:text-[#e1306c] hover:border-[#e1306c] transition-colors flex items-center justify-center bg-[#f8fafc]"
                  variants={rowAnimation}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  <Instagram className="w-3.5 h-3.5" />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#e2e8f0] text-[#94a3b8] hover:text-[#1da1f2] hover:border-[#1da1f2] transition-colors flex items-center justify-center bg-[#f8fafc]"
                  variants={rowAnimation}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  <Twitter className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0}/>
                </motion.a>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8" variants={blockAnimation} transition={{ duration: 0.45, ease: "easeOut" }}>
            {footerColumns.map((col) => (
              <motion.div key={col.title} className="space-y-3" variants={rowAnimation} transition={{ duration: 0.35, ease: "easeOut" }}>
                <motion.h4
                  className="text-[#475569] font-bold tracking-wide"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }}
                  variants={rowAnimation}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {col.title}
                </motion.h4>
                <motion.ul className="space-y-4" variants={rowAnimation} transition={{ duration: 0.35, ease: "easeOut" }}>
                  {col.links.map((link) => (
                    <motion.li key={link} variants={rowAnimation} transition={{ duration: 0.3, ease: "easeOut" }}>
                      <motion.a
                        href={footerLinkMap[link] || "#"}
                        className="text-[#64748b] hover:text-[#334155] transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", fontWeight: 500 }}
                      >
                        {link}
                      </motion.a>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
           className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-[#f1f5f9]"
           initial={{ opacity: 0, y: 14 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.4 }}
           transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
        >
          <p className="text-[#94a3b8]" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500 }}>
             © 2026 {companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
              <a href="/privacy-policy" className="text-[#94a3b8] hover:text-[#64748b] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500 }}>Privacy Policy</a>
              <a href="/terms-of-service" className="text-[#94a3b8] hover:text-[#64748b] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500 }}>Terms of Service</a>
              <a href="/cookie-policy" className="text-[#94a3b8] hover:text-[#64748b] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500 }}>Cookie Policy</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
