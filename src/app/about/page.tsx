"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadingVideo from "@/components/FadingVideo";
import AboutHeroStory from "@/components/AboutHeroStory";
import "../about.css";

const CAP_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4";

/* ---- SVG Icons ---- */
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

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* ============================================================
          Section 1 — Hero (scroll-choreographed story: title -> grows ->
          disappears -> paragraph types in -> disappears -> cards rise in)
          ============================================================ */}
      <AboutHeroStory />

      {/* ============================================================
          Section 2 — Capabilities
          ============================================================ */}
      <section className="about-cap">
        <FadingVideo src={CAP_VIDEO} className="about-cap__video" />

        <div className="about-cap__content">
          <div className="about-cap__header">
            <span className="about-cap__label">// Capabilities</span>
            <h2 className="about-cap__heading">Why Choose BlueSun</h2>
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
