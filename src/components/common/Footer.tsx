import { Facebook, Globe, Instagram } from "lucide-react";
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
  Documentation: "/resources/documentation",
  "System Status": "/resources/system-status",
  "About Us": "/about",
  Blog: "/blog",
  Contact: "/contact",
};

const Footer = () => {
  const { companyName, companySocialLinks } = useCompanyBranding();
  const companyDescription = "Real-time customer support made simple. Elevate your business communication and customer experience with our intelligent platform.";
  
  const socialLinks = [
    { Icon: Facebook, name: "Facebook", href: companySocialLinks.facebook || "#" },
    { Icon: Instagram, name: "Instagram", href: companySocialLinks.instagram || "#" },
    { Icon: Globe, name: "Website", href: companySocialLinks.website || "#" },
  ];

  const blockAnimation = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const rowAnimation = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-white text-slate-500">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 pt-10 pb-6">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-10 lg:gap-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div className="max-w-sm space-y-6" variants={blockAnimation} transition={{ duration: 0.45, ease: "easeOut" }}>
            <motion.div variants={rowAnimation} transition={{ duration: 0.4, ease: "easeOut" }}>
              <Logo variant="dark" alt={companyName} size="sm" />
            </motion.div>
            <motion.p
              className="text-slate-500 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 400 }}
              variants={rowAnimation}
              transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            >
              {companyDescription}
            </motion.p>
            
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(({ Icon, name, href }) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={name}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] text-slate-500 hover:bg-[#E2E8F0] hover:text-slate-700 transition-colors flex items-center justify-center"
                  variants={rowAnimation}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10" variants={blockAnimation} transition={{ duration: 0.45, ease: "easeOut" }}>
            {footerColumns.map((col) => (
              <motion.div key={col.title} className="space-y-4" variants={rowAnimation} transition={{ duration: 0.35, ease: "easeOut" }}>
                <motion.h4
                  className="text-slate-800 tracking-wider"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}
                  variants={rowAnimation}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {col.title}
                </motion.h4>
                <motion.ul className="space-y-3" variants={rowAnimation} transition={{ duration: 0.35, ease: "easeOut" }}>
                  {col.links.map((link) => (
                    <motion.li key={link} variants={rowAnimation} transition={{ duration: 0.3, ease: "easeOut" }}>
                      <motion.a
                        href={footerLinkMap[link] || "#"}
                        className="text-slate-500 hover:text-slate-800 transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 400 }}
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
          className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p
            className="text-slate-400"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
          >
            © 2026 {companyName}. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="/privacy-policy" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Terms of Service
            </a>
            <a href="/cookie-policy" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;


