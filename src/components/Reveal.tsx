import { ReactNode, createElement } from "react";

type RevealProps = {
  children: ReactNode;
  /** Maps to data-okd-sr-delay (seconds) for the solo reveal path. */
  delay?: number;
  /** Travel distance in px for the slide-up (data-okd-sr-y). */
  y?: number;
  className?: string;
  as?: "div" | "section" | "span" | "li";
};

/**
 * Scroll-triggered fade + slide-up — now powered by the ported okd engine
 * instead of Framer Motion. Renders the element with `data-okd-scroll-reveal`
 * so <OkdMotion> animates it (autoAlpha + y → 0, ScrollTrigger, once).
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: RevealProps) {
  return createElement(
    as,
    {
      className,
      "data-okd-scroll-reveal": "",
      "data-okd-sr-y": String(y),
      ...(delay ? { "data-okd-sr-delay": String(delay) } : {}),
    },
    children
  );
}
