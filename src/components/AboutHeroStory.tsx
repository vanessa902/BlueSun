"use client";

import { useEffect, useRef } from "react";


const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// The whole story is paced in "scroll units" (~1 chunky wheel-scroll each):
// 2 to grow the title, 1 for it to disappear, 4 for the paragraph to type
// in (slow and deliberate), 2 for it to disappear, then 3 for the cards to
// rise in (the last of those is a hold so they don't vanish the instant
// the section unpins).
const UNIT_VH = 60;
const GROW_UNITS = 2;
const TITLE_OUT_UNITS = 1;
const PARA_IN_UNITS = 4;
const PARA_OUT_UNITS = 2;
const CARDS_IN_UNITS = 2;
const HOLD_UNITS = 1;
const TOTAL_UNITS =
  GROW_UNITS + TITLE_OUT_UNITS + PARA_IN_UNITS + PARA_OUT_UNITS + CARDS_IN_UNITS + HOLD_UNITS;

const GROW_END = GROW_UNITS / TOTAL_UNITS;
const TITLE_OUT_END = GROW_END + TITLE_OUT_UNITS / TOTAL_UNITS;
const PARA_IN_END = TITLE_OUT_END + PARA_IN_UNITS / TOTAL_UNITS;
const PARA_OUT_END = PARA_IN_END + PARA_OUT_UNITS / TOTAL_UNITS;
const CARDS_IN_END = PARA_OUT_END + CARDS_IN_UNITS / TOTAL_UNITS;

const TRACK_HEIGHT_VH = 100 + UNIT_VH * TOTAL_UNITS;

const PARA_TEXT =
  "At BlueSun Construction, we transform ideas into exceptional " +
  "residential and commercial environments. Through expert " +
  "craftsmanship, strategic planning, and a commitment to quality, " +
  "we deliver projects that elevate communities, support businesses, " +
  "and create places people are proud to call home.";
const PARA_CHARS = Array.from(PARA_TEXT);

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

export default function AboutHeroStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let destroyed = false;

    function tick() {
      if (destroyed) return;
      const track = trackRef.current;
      const title = titleRef.current;
      const para = paraRef.current;
      const cards = cardsRef.current;

      if (track && title && para && cards) {
        const vh = window.innerHeight;
        const rect = track.getBoundingClientRect();
        const range = Math.max(1, rect.height - vh);
        const p = clamp(-rect.top / range);

        // ---- Title: appears, grows big, then disappears (opacity only — no blur) ----
        const growP = seg(p, 0, GROW_END);
        const introFade = seg(p, 0, 0.015);
        const titleFadeOut = seg(p, GROW_END, TITLE_OUT_END);
        title.style.opacity = String(introFade * (1 - titleFadeOut));
        title.style.transform = `scale(${lerp(1, 1.7, growP)})`;

        // ---- Paragraph: types in letter by letter, then disappears ----
        const typeP = seg(p, TITLE_OUT_END, PARA_IN_END);
        const paraFadeOut = seg(p, PARA_IN_END, PARA_OUT_END);
        const visibleChars = typeP * PARA_CHARS.length;
        const fadeMul = 1 - paraFadeOut;
        const chars = para.children;
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i] as HTMLElement;
          char.style.opacity = String(clamp(visibleChars - i) * fadeMul);
        }

        // ---- Stat cards: rise in, then hold ----
        const cardsInP = seg(p, PARA_OUT_END, CARDS_IN_END);
        cards.style.opacity = String(cardsInP);
        cards.style.transform = `translateY(${lerp(60, 0, cardsInP)}px) scale(${lerp(0.9, 1, cardsInP)})`;
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="about-hero-track" ref={trackRef} style={{ height: `${TRACK_HEIGHT_VH}vh` }}>
      <section className="about-hero">
        <div className="about-hero__stage">
          <h1 className="about-hero__story-title" ref={titleRef}>
            About Us
          </h1>

          <p className="about-hero__story-para" ref={paraRef}>
            {PARA_CHARS.map((char, i) => (
              <span key={i} className="about-hero__char">
                {char}
              </span>
            ))}
          </p>

          <div className="about-stats" ref={cardsRef}>
            <div className="about-stat liquid-glass">
              <span className="about-stat__icon">
                <ClockIcon />
              </span>
              <div className="about-stat__num">6 Weeks</div>
              <div className="about-stat__label">Average End-to-End Launch Time</div>
            </div>
            <div className="about-stat liquid-glass">
              <span className="about-stat__icon">
                <GlobeIcon />
              </span>
              <div className="about-stat__num">140+</div>
              <div className="about-stat__label">Brands Shipped Across Four Continents</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
