import { Code2, MessageCircle, Headphones } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    icon: <Code2 className="w-7 h-7" />,
    title: "Install Chat Widget",
    description: "Embed a simple one-line script into your website. No technical knowledge required — it takes under 5 minutes.",
  },
  {
    number: "02",
    icon: <MessageCircle className="w-7 h-7" />,
    title: "Visitors Start Chat",
    description: "Website visitors open the chat widget and send messages. The widget is beautifully designed to match your brand.",
  },
  {
    number: "03",
    icon: <Headphones className="w-7 h-7" />,
    title: "Agents Respond Instantly",
    description: "Your support team replies through the dashboard in real time. Get notified immediately and never miss a message.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24" style={{ background: "linear-gradient(180deg, #edf7ff 0%, #eaf5ff 100%)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span
            className="inline-block text-blue-500 mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            How It Works
          </span>
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3.05rem)",
              lineHeight: "1.12",
              letterSpacing: "-0.02em",
            }}
          >
            Up and running in 3 simple steps
          </h2>
          <p
            className="text-gray-500"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", lineHeight: "1.7" }}
          >
            Getting started with JAF Live Chat is effortless. Set it up once and start connecting with customers immediately.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2 w-[74%] h-px z-0">
            <motion.div
              className="w-full h-full bg-blue-400 rounded-full"
              initial={{ scaleX: 0, transformOrigin: "left" }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
              >
                {/* Icon Circle */}
                <div className="relative mb-6">
                  <motion.div
                    className="w-16 h-16 bg-white text-blue-500 rounded-full flex items-center justify-center border border-slate-200 shadow-lg shadow-blue-100/60"
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.12, ease: "easeOut" }}
                  >
                    {step.icon}
                  </motion.div>
                  <motion.div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sky-500 border-2 border-[#eaf5ff] rounded-full flex items-center justify-center"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.62rem", fontWeight: 800, color: "#ffffff" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.12, ease: "easeOut" }}
                  >
                    {index + 1}
                  </motion.div>
                </div>

                {/* Step Number */}
                <span
                  className="text-slate-300 mb-2"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.74rem", letterSpacing: "0.08em" }}
                >
                  STEP {step.number}
                </span>

                <h3
                  className="text-gray-900 mb-3"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-slate-500 max-w-xs"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.92rem", lineHeight: "1.7" }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;


