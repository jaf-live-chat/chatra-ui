import { Code2, MessageCircle, Headphones } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Code2 className="w-7 h-7" />,
    color: "bg-blue-100 text-blue-600",
    title: "Install Chat Widget",
    description: "Embed a simple one-line script into your website. No technical knowledge required — it takes under 5 minutes.",
  },
  {
    number: "02",
    icon: <MessageCircle className="w-7 h-7" />,
    color: "bg-sky-100 text-sky-600",
    title: "Visitors Start Chat",
    description: "Website visitors open the chat widget and send messages. The widget is beautifully designed to match your brand.",
  },
  {
    number: "03",
    icon: <Headphones className="w-7 h-7" />,
    color: "bg-gray-900 text-white",
    title: "Agents Respond Instantly",
    description: "Your support team replies through the dashboard in real time. Get notified immediately and never miss a message.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24" style={{ background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 600 }}
          >
            How It Works
          </span>
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              lineHeight: "1.2",
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
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2 w-[66%] h-0.5 z-0">
            <div className="w-full h-full bg-gradient-to-r from-blue-300 via-sky-400 to-gray-400 rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, index) => (
               <div key={step.title} className="flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {step.icon}
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-blue-300 rounded-full flex items-center justify-center"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.65rem", fontWeight: 800, color: "#2563eb" }}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Number */}
                <span
                  className="text-gray-200 mb-2"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.1em" }}
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
                  className="text-gray-500 max-w-xs"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", lineHeight: "1.65" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;


