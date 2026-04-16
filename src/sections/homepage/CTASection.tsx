import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import ImageWithFallback from "../../components/ImageWithFallback";

const CTASection = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      content: "The billing system and shared state management have been game-changers for us. We needed a dashboard that was both robust and strictly matched our brand's cool aesthetic.",
    },
    {
      id: 2,
      name: "David Chen",
      role: "Director of IT, Nexus Inc.",
      image: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      content: "Setup was flawless, and the performance is unmatched. The clean interface allows my team to easily navigate complex customer interactions seamlessly. Highly recommended.",
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "VP of Support",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      content: "JAF Chatra provided exactly what we needed: scalable chat features without the clutter. The strict adherence to cool tones makes it a joy to look at every single day.",
    },
  ];

  return (
    <section
      className="relative overflow-hidden pt-24 pb-36"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(circle at 50% 30%, #0f3a66 0%, #072a4d 40%, #051a35 70%, #041428 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 z-0 h-20" style={{ background: "linear-gradient(to top, #0f5f96 0%, transparent 100%)", opacity: 0.45 }} />

      {/* Top wave */}
      <svg className="absolute top-0 left-0 z-10 w-full h-[130px]" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,62 C220,128 455,2 720,14 C992,26 1210,126 1440,60 L1440,0 L0,0 Z"
          fill="#f8fafc"
        />
      </svg>

      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/[0.12] text-slate-100 px-3 py-1 rounded-full mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700 }}
          >
            <Star className="w-2.5 h-2.5 fill-current text-yellow-400" />
            Trusted by Industry Leaders
          </div>

          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 3.7vw, 2.9rem)",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
            }}
          >
            What Our Clients Are Saying
          </h2>
          <p
            className="text-sky-100/70 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1.12rem", lineHeight: "1.65" }}
          >
            Discover how businesses are transforming their customer support and scaling operations using JAF Chatra.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.09, ease: "easeOut" }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
                ))}
              </div>

              <p
                className="text-white/80 mb-6 flex-grow"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.98rem", lineHeight: "1.7" }}
              >
                {review.content}
              </p>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 shrink-0">
                  <ImageWithFallback
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4
                    className="text-white font-bold truncate"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.88rem" }}
                  >
                    {review.name}
                  </h4>
                  <p
                    className="text-sky-100/60 truncate"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem" }}
                  >
                    {review.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous testimonials"
            className="w-9 h-9 rounded-full border border-white/15 bg-white/5 text-white/70 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-6 h-2 rounded-full bg-cyan-400" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
          </div>

          <button
            type="button"
            aria-label="Next testimonials"
            className="w-9 h-9 rounded-full border border-white/15 bg-white/5 text-white/70 flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <motion.div
          className="mx-auto mt-20 max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h3
            className="text-white mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 3.6vw, 3rem)",
              lineHeight: "1.15",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to transform your customer
            <br />
            support?
          </h3>

          <p
            className="text-sky-100/70 max-w-2xl mx-auto mb-7"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", lineHeight: "1.75" }}
          >
            Join thousands of businesses using JAF Chatra to connect with visitors, increase sales, and build lasting relationships.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-cyan-700 px-6 py-2.5 rounded-full"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.92rem" }}
            >
              Start your free trial
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white/12 border border-white/20 text-white px-6 py-2.5 rounded-full"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.92rem" }}
            >
              Talk to Sales
            </button>
          </div>

          <p
            className="text-sky-100/55 mt-4"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem" }}
          >
            No credit card required. 14-day free trial.
          </p>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <svg className="absolute bottom-0 left-0 z-10 w-full h-[88px]" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,74 C250,118 470,16 720,30 C980,44 1170,120 1440,78 L1440,120 L0,120 Z"
          fill="#f8fafc"
        />
      </svg>
    </section>
  );
}

export default CTASection;



