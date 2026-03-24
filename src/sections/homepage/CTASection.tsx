import { Star, Quote } from "lucide-react";
import ImageWithFallback from "../../components/ImageWithFallback";

const CTASection = () => {
  const reviews = [
    {
      id: 1,
      name: "Marcus Reynolds",
      role: "Customer Success Lead",
      company: "TechFlow Solutions",
      image: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      content: "Since we started using JAF Chatra, our support team has been able to handle double the volume of inquiries without breaking a sweat. The analytics dashboard is incredibly insightful.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      role: "Operations Manager",
      company: "Globex eCommerce",
      image: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      content: "The billing system and shared state management have been game-changers for us. We needed a dashboard that was both robust and strictly matched our brand's cool aesthetic.",
      rating: 5,
    },
    {
      id: 3,
      name: "David Chen",
      role: "Director of IT",
      company: "Nexus Systems",
      image: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      content: "Setup was flawless, and the performance is unmatched. The clean interface allows my team to easily navigate complex customer interactions seamlessly. Highly recommended.",
      rating: 5,
    },
    {
      id: 4,
      name: "Emily Watson",
      role: "VP of Support",
      company: "CloudScale Inc",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      content: "JAF Chatra provided exactly what we needed: scalable chat features without the clutter. The strict adherence to cool tones makes it a joy to look at every single day.",
      rating: 5,
    },
    {
      id: 5,
      name: "James Wilson",
      role: "Product Manager",
      company: "InnovateTech",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      content: "The best administrative interface we've ever used. Managing complex state across different support queues is finally straightforward and visually pleasing.",
      rating: 5,
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      ></div>

      {/* Decorative circles */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #FFFFFF66 0%, transparent 70%)" }}
      ></div>
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #FFFFFF66 0%, transparent 70%)" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #FFFFFF80 0%, transparent 60%)" }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500 }}
          >
            <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
            Trusted by Industry Leaders
          </div>

          <h2
            className="text-white mb-6"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
            }}
          >
            What Our Clients Are Saying
          </h2>
          <p
            className="text-blue-100 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1.1rem", lineHeight: "1.7" }}
          >
            Discover how businesses are transforming their customer support and scaling operations using JAF Chatra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-md relative hover:bg-white/15 transition-colors group flex flex-col"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-white/10 group-hover:text-white/20 transition-colors" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
                ))}
              </div>

              <p
                className="text-white mb-5 relative z-10 flex-grow"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", lineHeight: "1.5" }}
              >
                "{review.content}"
              </p>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                  <ImageWithFallback
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4
                    className="text-white font-bold truncate"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem" }}
                  >
                    {review.name}
                  </h4>
                  <p
                    className="text-sky-200 truncate"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem" }}
                  >
                    {review.role}, {review.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CTASection;



