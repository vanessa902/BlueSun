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

      {/* Headline — animated by the ported okd engine (SplitText line reveal +
          sequenced reveals). The video parallax stays on Framer. */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <div
          data-okd-scroll-reveal-group
          data-okd-srg-stagger="0.12"
          data-okd-srg-start="top 95%"
          className="flex flex-col items-center"
        >
          <p
            data-okd-scroll-reveal
            data-okd-sr-y="14"
            className="mb-6 text-xs uppercase tracking-[0.45em] text-gold-soft"
          >
            Private Collection · Est. MMXXVI
          </p>

          <h1
            data-okd-scroll-text-reveal
            data-okd-str-type="lines"
            className="max-w-5xl font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Live where the extraordinary feels ordinary.
          </h1>

          <div
            data-okd-scroll-reveal
            data-okd-sr-y="20"
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <a
              href="#collections"
              className="u-btn--1 rounded-full bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-background transition-transform hover:scale-[1.03]"
            >
              <span data-button-animate-chars>Explore Residences</span>
            </a>
            <a
              href="#contact"
              className="u-btn--1 rounded-full border border-foreground/25 px-8 py-3.5 text-sm tracking-wide text-foreground transition-colors hover:border-foreground/60"
            >
              <span data-button-animate-chars>Arrange a Viewing</span>
            </a>
          </div>
        </div>
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
