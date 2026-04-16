import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type ScrollRevealPreset = "soft" | "hero" | "cardLeft" | "cardRight" | "lift" | "fade" | "scale" | "cta";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  preset?: ScrollRevealPreset;
}

type RevealVariant = {
  initial: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    rotate?: number;
  };
  whileInView: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    rotate?: number;
  };
};

type RevealTransition = {
  type: "spring" | "tween";
  duration?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  ease?: [number, number, number, number];
};

const presetVariants: Record<ScrollRevealPreset, RevealVariant> = {
  soft: {
    initial: { opacity: 0, y: 20, scale: 0.995 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
  },
  hero: {
    initial: { opacity: 0, y: 34, scale: 0.985 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
  },
  cardLeft: {
    initial: { opacity: 0, x: -44, y: 10, scale: 0.99, rotate: -0.6 },
    whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
  },
  cardRight: {
    initial: { opacity: 0, x: 44, y: 10, scale: 0.99, rotate: 0.6 },
    whileInView: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
  },
  lift: {
    initial: { opacity: 0, y: 28, scale: 0.99 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
  },
  fade: {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.965, y: 14 },
    whileInView: { opacity: 1, scale: 1, y: 0 },
  },
  cta: {
    initial: { opacity: 0, y: 22, scale: 0.98, rotate: -0.35 },
    whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
  },
};

const presetTransitions: Record<ScrollRevealPreset, RevealTransition> = {
  soft: { type: "tween", duration: 0.78, ease: [0.22, 1, 0.36, 1] },
  hero: { type: "tween", duration: 0.95, ease: [0.2, 0.9, 0.2, 1] },
  cardLeft: { type: "spring", stiffness: 145, damping: 24, mass: 0.82 },
  cardRight: { type: "spring", stiffness: 145, damping: 24, mass: 0.82 },
  lift: { type: "spring", stiffness: 120, damping: 22, mass: 0.9 },
  fade: { type: "tween", duration: 0.7, ease: [0.25, 1, 0.3, 1] },
  scale: { type: "spring", stiffness: 128, damping: 20, mass: 0.86 },
  cta: { type: "spring", stiffness: 112, damping: 18, mass: 0.92 },
};

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.9,
  distance = 28,
  preset = "soft",
}: ScrollRevealProps) => {
  const prefersReducedMotion = useReducedMotion();
  const baseVariant = presetVariants[preset];
  const baseTransition = presetTransitions[preset];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ ...baseVariant.initial, y: baseVariant.initial.y ?? distance }}
      whileInView={{ ...baseVariant.whileInView, y: baseVariant.whileInView.y ?? 0 }}
      transition={{
        ...baseTransition,
        duration: baseTransition.duration ? baseTransition.duration : duration,
        delay,
      }}
      viewport={{ once: true, amount: preset === "hero" ? 0.25 : 0.35 }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
