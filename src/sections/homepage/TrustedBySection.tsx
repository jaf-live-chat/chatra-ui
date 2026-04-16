import ScrollReveal from "../../components/ScrollReveal";

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
        <ScrollReveal preset="glide" duration={0.8}>
          <p
            className="text-center text-gray-400 mb-10"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Trusted by growing businesses worldwide
          </p>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {companies.map((company, index) => (
            <ScrollReveal
              key={company.name}
              preset={index % 2 === 0 ? "swingLeft" : "swingRight"}
              delay={0.03 + index * 0.045}
              duration={0.85}
              className="flex items-center gap-2.5 text-gray-400 hover:text-gray-600 transition-colors grayscale hover:grayscale-0"
            >
              <span style={{ fontSize: "1.5rem" }}>{company.icon}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1rem" }}>{company.name}</span>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedBySection;

