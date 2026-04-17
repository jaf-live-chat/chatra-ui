import { Facebook, Globe, Instagram } from "lucide-react";
import { motion } from "motion/react";
import Logo from "./Logo";
import useCompanyBranding from "../../hooks/useCompanyBranding";

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Careers", "Blog"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Support", "API Reference", "Community"],
  },
];

const footerLinkMap: Record<string, string> = {
  Features: "/features",
  Pricing: "/pricing",
  Integrations: "/integrations",
  Changelog: "/resources/changelog",
  About: "/about",
  Contact: "/contact",
  Careers: "/careers",
  Blog: "/blog",
  Documentation: "/resources/help-center",
  Support: "/resources/help-center",
  "API Reference": "/resources/api-developers",
  Community: "/community",
};

const Footer = () => {
  const { companyName, companyEmail, companyWebsite, companyPhone, companySocialLinks } = useCompanyBranding();
  const companyDescription = "Real-time customer support made simple for businesses of all sizes.";
  const websiteLink = companySocialLinks.website || companyWebsite;
  const socialLinks = [
    { Icon: Facebook, name: "Facebook", href: companySocialLinks.facebook },
    { Icon: Instagram, name: "Instagram", href: companySocialLinks.instagram },
    { Icon: Globe, name: "Website", href: companySocialLinks.website || companyWebsite },
  ].filter((item) => Boolean(item.href));

  const blockAnimation = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const rowAnimation = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-[#F8FAFC] text-slate-500 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr] gap-10 lg:gap-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.14 }}
        >
          <motion.div className="max-w-md space-y-5" variants={blockAnimation} transition={{ duration: 0.45, ease: "easeOut" }}>
            <motion.div variants={rowAnimation} transition={{ duration: 0.4, ease: "easeOut" }}>
              <Logo variant="dark" alt={companyName} size="sm" />
            </motion.div>
            <motion.p
              className="text-slate-500 leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 500 }}
              variants={rowAnimation}
              transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            >
              {companyDescription}
            </motion.p>

            <div className="space-y-1.5 text-slate-500" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}>
              {websiteLink && (
                <motion.p variants={rowAnimation} transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}>
                  <span className="font-semibold text-slate-600 mr-2">Web:</span>
                  <a href={websiteLink} target="_blank" rel="noreferrer" className="hover:text-slate-800 transition-colors">{websiteLink}</a>
                </motion.p>
              )}
              {companyEmail && (
                <motion.p variants={rowAnimation} transition={{ duration: 0.35, delay: 0.11, ease: "easeOut" }}>
                  <span className="font-semibold text-slate-600 mr-2">Email:</span>
                  <a href={`mailto:${companyEmail}`} className="hover:text-slate-800 transition-colors">{companyEmail}</a>
                </motion.p>
              )}
              {companyPhone && (
                <motion.p variants={rowAnimation} transition={{ duration: 0.35, delay: 0.14, ease: "easeOut" }}>
                  <span className="font-semibold text-slate-600 mr-2">Phone:</span>
                  <a href={`tel:${companyPhone.replace(/[^+\d]/g, "")}`} className="hover:text-slate-800 transition-colors">{companyPhone}</a>
                </motion.p>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map(({ Icon, name, href }) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={name}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center"
                  variants={rowAnimation}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 lg:gap-x-14 gap-y-6" variants={blockAnimation} transition={{ duration: 0.45, ease: "easeOut" }}>
            {footerColumns.map((col) => (
              <motion.div key={col.title} className="space-y-2.5" variants={rowAnimation} transition={{ duration: 0.35, ease: "easeOut" }}>
                <motion.h4
                  className="text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "1.05rem", fontWeight: 700 }}
                  variants={rowAnimation}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {col.title}
                </motion.h4>
                <motion.ul className="space-y-2" variants={rowAnimation} transition={{ duration: 0.35, ease: "easeOut" }}>
                  {col.links.map((link) => (
                    <motion.li key={link} variants={rowAnimation} transition={{ duration: 0.3, ease: "easeOut" }}>
                      <motion.a
                        href={footerLinkMap[link] || "#"}
                        className="text-slate-500 hover:text-slate-800 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}
                        whileHover={{ x: 2 }}
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
      </div>

      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-7">
          <motion.div
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <motion.p
              className="text-slate-500"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 500 }}
              variants={rowAnimation}
            >
              © 2026 {companyName}. All rights reserved.
            </motion.p>
            <motion.div className="flex flex-wrap items-center gap-x-7 gap-y-2" variants={rowAnimation}>
              <motion.div className="flex items-center gap-2" variants={rowAnimation}>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <span
                  className="text-slate-500"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 500 }}
                >
                  All systems operational
                </span>
              </motion.div>

              <motion.a href="/privacy-policy" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 500 }} whileHover={{ y: -1 }}>
                Privacy Policy
              </motion.a>
              <motion.a href="/terms-of-service" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", fontWeight: 500 }} whileHover={{ y: -1 }}>
                Terms of Service
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );

};

export default Footer;


