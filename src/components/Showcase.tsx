"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Reveal from "./Reveal";

const stats = [
  { value: "€4.2B", label: "In closed transactions" },
  { value: "42", label: "Active residences" },
  { value: "19", label: "Countries served" },
  { value: "100%", label: "Discretion guaranteed" },
];

export default function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Image drifts vertically inside its frame for a parallax effect.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id="about" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-28 md:grid-cols-2 md:py-40">
        <div ref={ref} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <motion.div style={{ y: imageY }} className="absolute -inset-y-[12%] inset-x-0">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Architectural interior"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <div>
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">
              The BlueSun Standard
            </p>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              We don&apos;t sell properties. We curate the way you live.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-muted">
              Every residence in our collection is hand-selected for its
              architecture, location and soul. From private islands to alpine
              retreats, we represent only the few homes that redefine what it
              means to live well.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-8">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.15 + i * 0.08}>
                <p className="font-display text-4xl text-gold-soft">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
