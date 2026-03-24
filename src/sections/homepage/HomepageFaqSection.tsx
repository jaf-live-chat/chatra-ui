import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { loadFaqs, FAQ_STORAGE_KEY, type FaqItem } from "../settings/FaqEditorView";

// ── Accordion item ────────────────────────────────────────────────────────────

function FaqAccordionItem({
  faq,
  index,
}: {
  faq: FaqItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyH, setBodyH] = useState(0);

  // Measure the natural height of the answer content
  useEffect(() => {
    if (!bodyRef.current) return;
    const ro = new ResizeObserver(() => {
      if (bodyRef.current) setBodyH(bodyRef.current.scrollHeight);
    });
    ro.observe(bodyRef.current);
    setBodyH(bodyRef.current.scrollHeight);
    return () => ro.disconnect();
  }, [faq.a]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <div
        className={`bg-white rounded-xl border transition-all duration-200 ${
          open
            ? "border-cyan-200 shadow-md"
            : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
        }`}
      >
        {/* Question row */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
        >
          <span
            className={`text-[0.95rem] transition-colors ${
              open ? "text-cyan-700" : "text-gray-900 group-hover:text-cyan-700"
            }`}
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}
          >
            {faq.q}
          </span>

          <span
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              open
                ? "bg-cyan-600 text-white rotate-180"
                : "bg-gray-100 text-gray-400 group-hover:bg-cyan-50 group-hover:text-cyan-600"
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>

        {/* Answer — height transitions via measured px value */}
        <div
          style={{
            height: open ? `${bodyH}px` : "0px",
            overflow: "hidden",
            transition: "height 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div ref={bodyRef}>
            <p
              className="px-6 pb-5 text-gray-500"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.75,
              }}
            >
              {faq.a}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

const HomepageFaqSection = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(loadFaqs);

  // Stay in sync when admin edits FAQs in the same session
  useEffect(() => {
    const onUpdate = () => setFaqs(loadFaqs());
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAQ_STORAGE_KEY) setFaqs(loadFaqs());
    };
    window.addEventListener("jaf_faqs_updated", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("jaf_faqs_updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2
            className="text-gray-900 mb-3"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-gray-500"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", lineHeight: 1.6 }}
          >
            Everything you need to know about JAF Chatra
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <FaqAccordionItem key={faq.id} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomepageFaqSection;


