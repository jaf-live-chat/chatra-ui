import { Twitter, Github, Linkedin, Globe, Mail, Phone } from "lucide-react";
import Logo from "./Logo";
import useCompanyBranding from "../../hooks/useCompanyBranding";

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Careers"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Support", "API Reference"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "GDPR"],
  },
];

const Footer = () => {
  const { companyInfo, companyName, companyEmail, companyWebsite, companyPhone } = useCompanyBranding();
  const companyDescription = companyInfo?.businessDetails?.description ||
    "Real-time customer support made simple for businesses of all sizes.";

  return (
    <footer className="bg-white text-gray-500 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-2">
            <Logo variant="dark" alt={companyName} size="sm" />
            <p
              className="text-gray-600 leading-snug"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem" }}
            >
              {companyDescription}
            </p>
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-gray-600">
              {companyWebsite && (
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.76rem" }}
                >
                  <Globe className="w-3 h-3" />
                  {companyWebsite}
                </a>
              )}
              {companyEmail && (
                <a
                  href={`mailto:${companyEmail}`}
                  className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.76rem" }}
                >
                  <Mail className="w-3 h-3" />
                  {companyEmail}
                </a>
              )}
              {companyPhone && (
                <a
                  href={`tel:${companyPhone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.76rem" }}
                >
                  <Phone className="w-3 h-3" />
                  {companyPhone}
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
            {footerColumns.map((col) => (
              <div key={col.title} className="space-y-1.5">
                <h4
                  className="text-gray-900 font-semibold"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem" }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-1">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "0.76rem" }}
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
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-gray-500"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.74rem" }}
            >
              © 2026 {companyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span
                className="text-gray-500"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.74rem" }}
              >
                All systems operational
              </span>
              <div className="ml-1.5 flex items-center gap-1">
                {[
                  { Icon: Twitter, name: "Twitter" },
                  { Icon: Github, name: "Github" },
                  { Icon: Linkedin, name: "Linkedin" },
                ].map(({ Icon, name }) => (
                  <a
                    key={name}
                    href="#"
                    title={name}
                    className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center"
                  >
                    <Icon className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

};

export default Footer;


