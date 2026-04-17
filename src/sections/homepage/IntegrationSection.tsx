import { motion } from "motion/react";
import IntegrationGuideSwitcher from "../../components/IntegrationGuideSwitcher";

const IntegrationSection = () => {
  return (
    <section className="bg-white py-12 sm:py-20 lg:py-24">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <motion.div
          className="h-[2px] w-40 mx-auto mb-8 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent 0%, #0ea5e9 50%, transparent 100%)" }}
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <IntegrationGuideSwitcher />
      </motion.div>
    </section>
  );
};

export default IntegrationSection;


