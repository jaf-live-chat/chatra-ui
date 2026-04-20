import { Zap, MapPin, LayoutDashboard, BellOff } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    color: "bg-cyan-100 text-cyan-600",
    gradient: "from-cyan-500 to-cyan-600",
    title: "Real-Time Messaging",
    description:
      "Instantly respond to website visitors and provide immediate support. Reduce friction and resolve issues before visitors leave.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    color: "bg-amber-100 text-amber-600",
    gradient: "from-amber-400 to-amber-500",
    title: "Visitor Tracking",
    description:
      "See who is visiting your website and understand their location and activity. Know exactly what pages they're browsing.",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    color: "bg-violet-100 text-violet-600",
    gradient: "from-violet-500 to-violet-600",
    title: "Agent Dashboard",
    description:
      "Manage conversations, assign chats, and monitor support performance — all from one beautifully designed panel.",
  },
  {
    icon: <BellOff className="w-6 h-6" />,
    color: "bg-emerald-100 text-emerald-600",
    gradient: "from-emerald-400 to-emerald-500",
    title: "Offline Messaging",
    description:
      "Never miss an inquiry with automated offline message collection. All messages are saved and delivered when you're back.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center w-screen relative left-1/2 -translate-x-1/2 -mt-24 mb-16 flex flex-col items-center justify-center"
          style={{
            background: "#0A192FFF",
            padding: "clamp(8rem, 12vw, 10rem) clamp(1.5rem, 4vw, 3rem) clamp(4rem, 10vw, 6rem)",
            borderColor: "#1E293BFF #1E293BFF #1E293BFF #1E293BFF",
            borderStyle: "solid",
            borderWidth: "0 0 1px 0",
          }}
        >
          <h2
            className="mb-6"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Everything you need <br /> for exceptional support
          </h2>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "1.125rem",
              lineHeight: "1.6",
              color: "#94A3B8",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Discover the powerful features that make JAF Chatra the perfect platform to connect with your customers and streamline your workflow.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300"
              style={{
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 139, 139, 0.1)";
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3, ease: "easeOut" }}
                className="text-gray-900 mb-3"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1rem" }}
              >
                {feature.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.4, ease: "easeOut" }}
                className="text-gray-500"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.88rem", lineHeight: "1.6" }}
              >
                {feature.description}
              </motion.p>

              {/* Hover gradient line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;


