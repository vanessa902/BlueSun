"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HlsVideo from "./HlsVideo";

// Replace these with your own assets. The .m3u8 is a public Mux demo stream so
// the HLS pipeline works out of the box; swap it for your luxury property reel.
const HERO_HLS =
  "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  // Scroll parallax via GSAP ScrollTrigger (replaces the previous Framer hooks).
  useGSAP(
    () => {
      const st = {
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to(videoWrap.current, { yPercent: 25, ease: "none", scrollTrigger: st });
      gsap.fromTo(
        overlay.current,
        { opacity: 0.55 },
        { opacity: 0.9, ease: "none", scrollTrigger: st }
      );
      gsap.to(content.current, {
        yPercent: -40,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: st,
      });
    },
    { scope: section }
  );

  return (
    <section
      ref={section}
      id="residences"
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* Background video */}
      <div ref={videoWrap} className="absolute inset-0 scale-110">
        <HlsVideo
          src={HERO_HLS}
          poster={HERO_POSTER}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Gradient + dim overlay for legibility */}
      <div ref={overlay} className="absolute inset-0 bg-background opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

      {/* Headline — animated by the ported okd engine (SplitText line reveal +
          sequenced reveals); video parallax stays on GSAP ScrollTrigger. */}
      <div
        ref={content}
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
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-foreground/30 p-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-soft" />
        </div>
      </div>
    </section>
  );
}
