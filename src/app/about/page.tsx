"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadingVideo from "@/components/FadingVideo";
import BlurText from "@/components/BlurText";
import "../about.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const HERO_IMAGE = `${BASE}/about-hero.png`;
const CAP_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4";

function fadeBlur(delay: number) {
  return {
    initial: { filter: "blur(10px)", opacity: 0, y: 20 } as const,
    animate: { filter: "blur(0px)", opacity: 1, y: 0 } as const,
    transition: { duration: 0.8, ease: "easeOut" as const, delay },
  };
}

/* ---- SVG Icons ---- */
function ArrowUpRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-5z" />
    </svg>
  );
}
function MovieIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4h-4z" />
    </svg>
  );
}
function LightbulbIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21h6v-1H9v1zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

type Capability = {
  title: string;
  Icon: () => React.JSX.Element;
  tags: string[];
  body: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: "Our Story",
    Icon: ImageIcon,
    tags: ["Brand Systems", "Art Direction", "Visual Identity", "Motion"],
    body: "We shape identities and interfaces that feel unmistakably yours — typographic systems, component libraries, and art-directed pages that scale without losing soul.",
  },
  {
    title: "Our Mission",
    Icon: MovieIcon,
    tags: ["React", "Next.js", "Headless CMS", "Edge-Ready"],
    body: "Production-grade front-ends built on modern stacks. Performant, accessible, and instrumented — with code your team will enjoy extending long after launch.",
  },
  {
    title: "Our Vision",
    Icon: LightbulbIcon,
    tags: ["SEO", "Analytics", "A/B Testing", "Retention"],
    body: "Launch is the starting line. We partner with your team on conversion, content, and iteration loops that turn a beautiful site into a compounding asset.",
  },
];

const TRUST_NAMES = ["Aeon", "Vela", "Apex", "Orbit", "Zeno"];

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Parallax depth: the image (far layer) drifts down and lags behind the
  // scroll, while the text (near layer) drifts up faster — the gap between
  // the two is what reads as depth as the user scrolls the hero away.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  // Stat cards: hidden and pushed back until the user actually scrolls, then
  // rise into place on top of the content's own parallax drift — the two
  // stacked motions is what makes the depth read as more pronounced here.
  const statsOpacity = useTransform(scrollYProgress, [0, 0.28], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0, 0.32], [160, 0]);
  const statsBlur = useTransform(scrollYProgress, [0, 0.28], [18, 0]);
  const statsFilter = useTransform(statsBlur, (v) => `blur(${v}px)`);
  const statsScale = useTransform(scrollYProgress, [0, 0.32], [0.88, 1]);

  return (
    <>
      <Navbar />

      {/* ============================================================
          Section 1 — Hero (parallax: image and text drift at different
          rates as the user scrolls, reading as depth)
          ============================================================ */}
      <section className="about-hero" ref={heroRef}>
        <motion.div className="about-hero__image-wrap" style={{ y: imageY }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="about-hero__image" src={HERO_IMAGE} alt="" />
        </motion.div>
        <div className="about-hero__gradient" aria-hidden="true" />

        <motion.div className="about-hero__content" style={{ y: contentY }}>
          <div className="about-hero__main">
            {/* Badge */}
            <motion.div className="about-badge liquid-glass" {...fadeBlur(0.4)}>
              <span className="about-badge__text">Company</span>
            </motion.div>

            {/* Headline */}
            <div className="about-headline">
              <BlurText text="About Us" className="about-headline__text" />
            </div>

            {/* Subtext */}
            <motion.p className="about-subtext" {...fadeBlur(0.8)}>
              At BlueSun Construction, we transform ideas into exceptional
              residential and commercial environments. Through expert
              craftsmanship, strategic planning, and a commitment to
              quality, we deliver projects that elevate communities,
              support businesses, and create places people are proud to
              call home.
            </motion.p>

            {/* CTA */}
            <motion.div className="about-cta" {...fadeBlur(1.1)}>
              <button className="about-cta__btn liquid-glass-strong" type="button">
                Start a Project <ArrowUpRight />
              </button>
              <button className="about-cta__link" type="button">
                <PlayIcon /> Watch Showreel
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="about-stats"
              style={{
                opacity: statsOpacity,
                y: statsY,
                scale: statsScale,
                filter: statsFilter,
              }}
            >
              <div className="about-stat liquid-glass">
                <span className="about-stat__icon"><ClockIcon /></span>
                <div className="about-stat__num">6 Weeks</div>
                <div className="about-stat__label">Average End-to-End Launch Time</div>
              </div>
              <div className="about-stat liquid-glass">
                <span className="about-stat__icon"><GlobeIcon /></span>
                <div className="about-stat__num">140+</div>
                <div className="about-stat__label">Brands Shipped Across Four Continents</div>
              </div>
            </motion.div>
          </div>

          {/* Trust bar */}
          <motion.div className="about-trust" {...fadeBlur(1.4)}>
            <div className="about-trust__pill liquid-glass">
              Trusted by founders, operators, and creative directors worldwide
            </div>
            <div className="about-trust__logos">
              {TRUST_NAMES.map((name) => (
                <span key={name} className="about-trust__name">{name}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================
          Section 2 — Capabilities
          ============================================================ */}
      <section className="about-cap">
        <FadingVideo src={CAP_VIDEO} className="about-cap__video" />

        <div className="about-cap__content">
          <div className="about-cap__header">
            <span className="about-cap__label">// Capabilities</span>
            <h2 className="about-cap__heading">
              Studio craft,
              <br />
              end to end
            </h2>
          </div>

          <div className="about-cap__grid">
            {CAPABILITIES.map((cap) => (
              <motion.div
                key={cap.title}
                className="about-card liquid-glass"
                initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
                whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="about-card__top">
                  <div className="about-card__icon liquid-glass">
                    <cap.Icon />
                  </div>
                  <div className="about-card__tags">
                    {cap.tags.map((tag) => (
                      <span key={tag} className="about-card__tag liquid-glass">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="about-card__spacer" />
                <h3 className="about-card__title">{cap.title}</h3>
                <p className="about-card__body">{cap.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
