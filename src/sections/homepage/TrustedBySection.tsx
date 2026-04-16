import { motion } from "motion/react";

const TrustedBySection = () => {
  const companies = [
    { name: "TechNova", icon: "🔷" },
    { name: "CloudBase", icon: "☁️" },
    { name: "Streamly", icon: "⚡" },
    { name: "Growthify", icon: "📈" },
    { name: "Nextera", icon: "🔵" },
    { name: "LaunchPad", icon: "🚀" },
  ];

  return (
    <section className="py-16 bg-white border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          className="text-center text-gray-400 mb-10"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Trusted by growing businesses worldwide
        </motion.p>

        <motion.div
          className="h-[2px] w-36 mx-auto mb-9 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent 0%, #38bdf8 50%, transparent 100%)" }}
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              className="flex items-center gap-2.5 text-gray-400 hover:text-gray-600 transition-colors grayscale hover:grayscale-0"
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.06 * index, ease: "easeOut" }}
            >
              <span style={{ fontSize: "1.5rem" }}>{company.icon}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1rem" }}>{company.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedBySection;


