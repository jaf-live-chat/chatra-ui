import { Twitter, Github, Linkedin } from "lucide-react";
import jafChatraLogo from "figma:asset/bfc6c96e2889ab05988e23557e5e8d5f485d15bd.png";

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Careers", "Blog", "Press"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Support", "API Reference", "Status Page", "Community"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  },
];

export function Footer() {
  return (
    <footer className="bg-white text-gray-500 border-t border-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={jafChatraLogo} alt="JAF Chatra" className="h-40 w-auto -my-10" />
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", lineHeight: "1.7" }}>
              Real-time customer support made simple for businesses of all sizes.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mt-5">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 bg-gray-100 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors group"
                >
                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4
                className="text-gray-900 mb-4"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "0.9rem" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
            © 2026 JAF Live Chat. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}