"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Delay in seconds before the element animates in. */
  delay?: number;
  /** Travel distance in px for the slide-up. */
  y?: number;
  className?: string;
  as?: "div" | "section" | "span" | "li";
};

/**
 * Scroll-triggered fade + slide-up. Animates once when it enters the viewport,
 * mirroring the reveal pattern used across motion-rich marketing sites.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
