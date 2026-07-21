"use client";

import { useEffect, useRef } from "react";
import ScrollVideoShowcase from "@/components/ScrollVideoShowcase";
import "../app/enerblock.css";

export default function EnerblockSections() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let destroyed = false;
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

    function tick() {
      if (destroyed) return;
      const vh = window.innerHeight;

      // Blueprint 2D -> 3D tilt
      if (stage.current) {
        const r = stage.current.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.95) - 0.1);
        stage.current.style.setProperty("--p", String(p));
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Typewriter intro title: lines start hidden ("eb-armed") and reveal
    // left-to-right with a stepped clip once the title scrolls into view.
    const title = document.getElementById("eb-intro-title");
    let io: IntersectionObserver | null = null;
    if (title) {
      title.classList.add("eb-armed");
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              title.classList.add("is-typing");
              io?.disconnect();
            }
          }
        },
        { threshold: 0.35 }
      );
      io.observe(title);
    }

    return () => {
      destroyed = true;
      io?.disconnect();
    };
  }, []);

  return (
    <div className="eb" ref={root}>
      {/* Tall pure-black scroll zone where the rock animation plays out.
          The fixed black stage + rock + text live in <Rocks/>. */}
      <div id="rock-zone" style={{ height: "960vh", background: "var(--bg-black)" }} />

      {/* 1. Intro: title + 2D->3D blueprint */}
      <section className="eb-intro" id="about">
        <div className="eb-intro__left">
          <h2 className="eb-title eb-intro__title" id="eb-intro-title">
            <span className="eb-intro__line">
              <span>WE</span>
              <span>APPROACH</span>
              <span>EACH</span>
              <span>OF</span>
            </span>
            <span className="eb-intro__line">
              <span>OUR</span>
              <span>DISCIPLINES</span>
              <span>AS</span>
              <span>A</span>
            </span>
            <span className="eb-intro__line">
              <span>GENEROUS</span>
              <span>GESTURE</span>
            </span>
            <span className="eb-intro__line">
              <span>TRYING</span>
              <span>TO</span>
              <span>REACH</span>
              <span>OUT</span>
            </span>
            <span className="eb-intro__line">
              <span>IT&rsquo;S</span>
              <span>AUDIENCE</span>
            </span>
          </h2>
          <p className="eb-intro__desc">
            Integrates enclosures, structure, and processes within
            <br />
            an industrialized and digital framework. It connects
            <br />
            design, manufacturing, and assembly to reduce
            <br />
            deviations in timelines, costs, and compliance, turning
            <br />
            construction into a planned assembly process.
          </p>
        </div>
        <div className="eb-intro__right">
          <div className="eb-bp-stage" id="eb-bp-target" ref={stage}>
            <div className="eb-bp">
              <svg viewBox="0 0 300 420" aria-label="Standard floor plan">
                <rect className="eb-bp__line" x="20" y="20" width="260" height="380" />
                <line className="eb-bp__line" x1="20" y1="120" x2="280" y2="120" />
                <line className="eb-bp__line" x1="20" y1="220" x2="280" y2="220" />
                <line className="eb-bp__line" x1="20" y1="320" x2="280" y2="320" />
                <line className="eb-bp__line" x1="150" y1="20" x2="150" y2="400" />
                <rect className="eb-bp__line" x="120" y="150" width="60" height="140" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={i} className="eb-bp__hatch" x1={40 + i * 8} y1="40" x2={40 + i * 8} y2="100" />
                ))}
              </svg>
            </div>
          </div>
          {/* The rock that "lands" here is the scroll-driven #rock-right
              (rendered in <Rocks/>), which arrives on top of this vector via
              scrolling — it is intentionally NOT a static image anymore. */}
          <div className="eb-intro__caption">
            <span className="mark">⧉</span>
            <span className="meta">
              STANDARD FLOOR PLAN AND AXONOMETRICS
              <br />
              DRAWING NO.: 158.01.00 · SCALE: 1/100
            </span>
          </div>
        </div>
      </section>

      {/* 1b. Scrollytelling video break */}
      <ScrollVideoShowcase
        videoFile="home-showcase.mp4"
        titleLines={["Commercial", "Construction"]}
      />

    </div>
  );
}
