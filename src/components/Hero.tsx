"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HlsVideo from "./HlsVideo";

// Replace these with your own assets. The .m3u8 is a public Mux demo stream so
// the HLS pipeline works out of the box; swap it for your luxury property reel.
const HERO_HLS =
  "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80";

const words = ["Live", "where", "the", "extraordinary", "feels", "ordinary."];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const word = {
  hidden: { opacity: 0, y: "110%" },
  show: {
    opacity: 1,
    y: "0%",
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax: video drifts down and fades, content lifts away as you scroll.
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      id="residences"
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* Background video */}
      <motion.div style={{ y: videoY }} className="absolute inset-0 scale-110">
        <HlsVideo
          src={HERO_HLS}
          poster={HERO_POSTER}
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Gradient + dim overlay for legibility */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-background"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

      {/* Headline */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mb-6 text-xs uppercase tracking-[0.45em] text-gold-soft"
        >
          Private Collection · Est. MMXXVI
        </motion.p>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display text-balance text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <motion.span variants={word} className="inline-block">
                {w === "extraordinary" ? (
                  <span className="italic text-gold-soft">{w}</span>
                ) : (
                  w
                )}
                {i < words.length - 1 && " "}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href="#collections"
            className="rounded-full bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-background transition-transform hover:scale-[1.03]"
          >
            Explore Residences
          </a>
          <a
            href="#contact"
            className="rounded-full border border-foreground/25 px-8 py-3.5 text-sm tracking-wide text-foreground transition-colors hover:border-foreground/60"
          >
            Arrange a Viewing
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-foreground/30 p-1.5">
          <motion.span
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-gold-soft"
          />
        </div>
      </motion.div>
    </section>
  );
}
