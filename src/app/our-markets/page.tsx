"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollVideoShowcase from "@/components/ScrollVideoShowcase";
import "../our-markets.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=85`;

// Cache-buster: GitHub Pages/browsers can keep serving a stale copy of this
// video under its unchanged filename after a swap. Bump this to the file's
// own content hash (`md5sum public/markets-showcase.mp4 | cut -c1-10`)
// every time the video changes.
const VIDEO_CACHE_BUST = "7e6d409d62";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
// Same fade-in/hold/fade-out shape as the home page's card timing, in video
// frames (this page uses ScrollVideoShowcase's default pxPerFrame, so no
// custom "scrolls" unit is needed here).
const FADE_FRAMES = 10;

// Opening exterior establishing shot, right at the start of the first clip
// (frame ~12 of 722, hence 0.017) — a slow zoom on the house facade, holds
// through frame ~125, fading out well before Electrical's wireframe scene
// starts (frame ~140 below), not overlapping it.
const WINDOWS_SCENE_START_FRAC = 0.017;
const WINDOWS_HOLD_FRAMES = 93;

// Electrical panel + glass-wireframe moment in the first clip (frame ~140
// of 722, hence 0.194) — located by extracting and eyeballing frames.
// Holds 40 frames, fading out before the wireframe breaks apart into the
// next interior shot.
const ELECTRICAL_SCENE_START_FRAC = 0.194;
const ELECTRICAL_HOLD_FRAMES = 40;

// Rooftop solar + battery-storage aerial, near the end of the first clip
// (frame ~300 of 722, hence 0.415) — the cyan line runs from the panels
// down to the battery unit on the lower deck. Holds until the clip cuts to
// the second clip's exterior shot (~frame 361), fading out right at that
// boundary so it doesn't bleed into the next scene.
const BATTERY_SCENE_START_FRAC = 0.415;
const BATTERY_HOLD_FRAMES = 40;

// Second clip's own opening exterior shot (frame ~365 of 722, hence 0.506)
// — the lit roofline overhang over the glass facade, right after the cut
// from the first clip. Holds 25 frames, fading out before the blue
// structural wireframe forms over the facade in the next moment.
const ROOFING_SCENE_START_FRAC = 0.506;
const ROOFING_HOLD_FRAMES = 25;

function sceneOpacity(frame: number, total: number, startFrac: number, holdFrames: number) {
  const start = total * startFrac;
  const fadeInEnd = start + FADE_FRAMES;
  const holdEnd = fadeInEnd + holdFrames;
  const fadeOutEnd = holdEnd + FADE_FRAMES;
  return Math.min(seg(frame, start, fadeInEnd), 1 - seg(frame, holdEnd, fadeOutEnd));
}

type MarketItem = {
  label: string;
  image: string;
};

const MARKETS: MarketItem[] = [
  { label: "Residential", image: U("1560518883-ce09059eeffa") },
  { label: "Commercial", image: U("1486406146926-c627a92ad1ab") },
  { label: "Industrial", image: `${BASE}/about-studio-small.jpg` },
  { label: "Institutional", image: U("1503387762-592deb58ef4e") },
  { label: "Multi-Family", image: U("1545324418-cc1a3fa10c00") },
  { label: "Renovation", image: U("1503387762-592deb58ef4e") },
];

/** Draggable carousel: whileHover grows the item under the cursor, and the
 * whole row drags horizontally within however far its content overflows
 * the visible viewport (recomputed on resize). */
function MarketCarousel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);

  useEffect(() => {
    function measure() {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      if (!wrapper || !track) return;
      setDragLimit(Math.max(0, track.scrollWidth - wrapper.offsetWidth));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="gallery-wrapper" ref={wrapperRef}>
      <motion.div
        className="gallery-track"
        ref={trackRef}
        drag="x"
        dragConstraints={{ left: -dragLimit, right: 0 }}
        dragElastic={0.12}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      >
        {MARKETS.map((market, i) => (
          <motion.div
            key={market.label}
            className="gallery-item"
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={market.image} alt={market.label} loading="lazy" draggable={false} />
            <span className="gallery-item__label">{market.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function OurMarketsPage() {
  const windowsBoxRef = useRef<HTMLDivElement>(null);
  const electricalBoxRef = useRef<HTMLDivElement>(null);
  const batteryBoxRef = useRef<HTMLDivElement>(null);
  const roofingBoxRef = useRef<HTMLDivElement>(null);

  function handleVideoFrame(frame: number, total: number) {
    if (windowsBoxRef.current) {
      windowsBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, WINDOWS_SCENE_START_FRAC, WINDOWS_HOLD_FRAMES)
      );
    }
    if (electricalBoxRef.current) {
      electricalBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, ELECTRICAL_SCENE_START_FRAC, ELECTRICAL_HOLD_FRAMES)
      );
    }
    if (batteryBoxRef.current) {
      batteryBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, BATTERY_SCENE_START_FRAC, BATTERY_HOLD_FRAMES)
      );
    }
    if (roofingBoxRef.current) {
      roofingBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, ROOFING_SCENE_START_FRAC, ROOFING_HOLD_FRAMES)
      );
    }
  }

  return (
    <>
      <Navbar />

      <div className="markets-page">
        {/* ============================================================
            Hero
            ============================================================ */}
        <section className="hero">
          {/* Same technical HUD frame as the homepage hero (hero-frame.svg),
              recolored for this page's light background. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-frame-overlay" src={`${BASE}/hero-frame-light.svg`} alt="" />

          <div className="container">
            <div className="row row-content">
              <div className="col-12 hero-center">
                <motion.p
                  className="hero-eyebrow"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  Residential &amp; Commercial
                </motion.p>
                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                >
                  Our Markets
                </motion.h1>
                <motion.p
                  className="about-text"
                  initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.35 }}
                >
                  BlueSun builds across residential, commercial,
                  industrial, and institutional markets — bringing the
                  same craftsmanship and planning discipline to every
                  scale of project, from single-family homes to
                  multi-phase developments.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

        {/* Scrollytelling video break, same frame-by-frame scroll effect
            as the home page's showcase video. */}
        <ScrollVideoShowcase
          videoFile={`markets-showcase.mp4?v=${VIDEO_CACHE_BUST}`}
          objectFit="cover"
          onFrame={handleVideoFrame}
          overlay={
            <>
              <div className="markets-infobox markets-infobox--windows" ref={windowsBoxRef}>
                <h3 className="markets-infobox__title">Windows</h3>
                <p className="markets-infobox__body">
                  Our energy efficient window solutions improve home
                  comfort, appearance, insulation, security, and overall
                  energy performance.
                </p>
              </div>
              <div className="markets-infobox" ref={electricalBoxRef}>
                <h3 className="markets-infobox__title">Electrical Services</h3>
                <p className="markets-infobox__body">
                  We offer residential electrical services including panel
                  upgrades, wiring, lighting installation, troubleshooting,
                  and system upgrades to ensure your home is safe, efficient,
                  and up to code.
                </p>
              </div>
              <div className="markets-infobox markets-infobox--battery" ref={batteryBoxRef}>
                <h3 className="markets-infobox__title">Battery Storage</h3>
                <p className="markets-infobox__body">
                  BlueSun installs residential battery systems that provide
                  backup power, energy independence, and better control over
                  when and how electricity is used.
                </p>
              </div>
              <div className="markets-infobox markets-infobox--roofing" ref={roofingBoxRef}>
                <h3 className="markets-infobox__title">Residential Roofing</h3>
                <p className="markets-infobox__body">
                  We install, repair, and replace residential roofing
                  systems using dependable materials and quality workmanship
                  designed to protect your home.
                </p>
              </div>
            </>
          }
        />

        {/* ============================================================
            Gallery (draggable carousel)
            ============================================================ */}
        <section className="gallery">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <MarketCarousel />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <motion.p
                  className="gallery-caption"
                  initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  Every market has its own codes, timelines, and clients
                  to answer to. Our teams specialize by sector so each
                  project gets people who already know its rules.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}
