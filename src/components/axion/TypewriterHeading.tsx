"use client";

import { useEffect, useRef, useState } from "react";

type TypewriterHeadingProps = {
  text: string;
  className?: string;
};

const STEP_MS = 18;

/** Types `text` in letter by letter once the heading scrolls into view,
 * via staggered CSS transition-delays rather than a JS animation loop. */
export default function TypewriterHeading({ text, className }: TypewriterHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chars = Array.from(text);

  return (
    <h2
      ref={ref}
      className={`axion-typewriter${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className="axion-typewriter__char"
          style={{ transitionDelay: `${i * STEP_MS}ms` }}
        >
          {char}
        </span>
      ))}
    </h2>
  );
}
