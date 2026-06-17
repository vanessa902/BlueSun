"use client";

import { motion } from "framer-motion";

const items = [
  "Lake Como",
  "Beverly Hills",
  "Dubai",
  "Saint-Tropez",
  "Aspen",
  "Mykonos",
  "Monaco",
  "Malibu",
];

export default function Marquee() {
  return (
    <section className="border-y border-line py-8">
      <div className="flex overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
          className="flex shrink-0 items-center gap-10 pr-10"
        >
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-display text-3xl italic text-muted md:text-4xl"
            >
              {item}
              <span className="text-gold not-italic">✦</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
