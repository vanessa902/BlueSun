"use client";

import { useEffect, useRef } from "react";
import { lenisBridge } from "@/lib/lenisBridge";
import "../app/capabilities-showcase.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CAP_VIDEO = `${BASE}/about-showcase.mp4`;

// 24fps clip; each scroll step advances one real encoded frame.
const VIDEO_FPS = 24;
// Accumulated scroll distance (px) per video frame — higher makes the scrub
// slower / more granular (closer to "a frame per scroll").
const PX_PER_FRAME = 8;
// Extra scroll room past the pinned 100vh so a scroll input reliably lands
// inside the pin-detection window (the sticky stay-put mechanic is CSS
// position: sticky; this is just detection slack).
const BUFFER_VH = 20;
const PIN_VH = 100;
const FALLBACK_TOTAL_FRAMES = Math.round(15 * VIDEO_FPS);

/* SVG icons (kept identical to the previous static section). */
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
    tags: ["Licensed & Insured", "Family-Owned", "20+ Years", "Local Crews"],
    body: "Built from the ground up on hard work and a handshake, BlueSun has grown from a small local crew into a full-service construction partner — without losing the craftsmanship and accountability that got us here.",
  },
  {
    title: "Our Mission",
    Icon: MovieIcon,
    tags: ["Safety First", "Quality Craftsmanship", "On-Time Delivery", "Clear Communication"],
    body: "We deliver every project on schedule and to code, backed by skilled crews and hands-on project management. Safety and quality aren't line items — they're how we operate on every site, every day.",
  },
  {
    title: "Our Vision",
    Icon: LightbulbIcon,
    tags: ["Sustainable Building", "Community Impact", "Long-Term Partnerships", "Growth-Ready"],
    body: "We build for what's next — durable, sustainable structures that support growing businesses and stronger communities for decades to come, not just through ribbon-cutting day.",
  },
];

// Reveal windows as fractions of the clip's full frame range. The header
// fades in first and stays. Then the cards show ONE AT A TIME, in sequence:
// each fades in, holds, and fades back out before the next fades in (the last
// one stays). All driven off the SAME scroll that scrubs the video, so
// scrolling back up reverses the whole sequence.
const HEADER_WINDOW: [number, number] = [0.02, 0.1];
// Per card: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]. A null
// fade-out (last card) means it stays visible through the end.
const CARD_PHASES: Array<[number, number, number | null, number | null]> = [
  [0.12, 0.2, 0.3, 0.38],
  [0.44, 0.52, 0.62, 0.7],
  [0.76, 0.84, null, null],
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Capabilities scrollytelling section: the excavator clip pins in place and
 * scrubs one encoded frame per scroll step (the same proven engine the home
 * "Commercial Construction" video uses), and the header + three cards reveal
 * progressively across that very same scroll — nothing plays on a timer, so
 * scrolling up rewinds both the video and the reveals. */
export default function CapabilitiesShowcase() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef(0);
  const totalFramesRef = useRef(FALLBACK_TOTAL_FRAMES);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      v.currentTime = 0;
      if (v.duration && !Number.isNaN(v.duration)) {
        totalFramesRef.current = Math.max(1, Math.round(v.duration * VIDEO_FPS));
      }
    };
    if (v.readyState >= 1 && v.duration) onMeta();
    else v.addEventListener("loadedmetadata", onMeta, { once: true });
  }, []);

  useEffect(() => {
    const touchYRef = { current: null as number | null };
    const accumRef = { current: 0 };
    const lockedRef = { current: false };
    const armedRef = { current: true };
    let rafId = 0;

    function isPinned() {
      const el = spacerRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight;
    }

    // Structural scroll lock on the ROOT <html> (never <body>, which would
    // become a scroll container and break the stage's position: sticky). The
    // About page has no Lenis, so lenisBridge is a no-op here — html overflow
    // + preventDefault are what hold the pin.
    const rootEl = document.documentElement;
    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      lenisBridge.current?.stop();
      const scrollbarWidth = window.innerWidth - rootEl.clientWidth;
      rootEl.style.overflow = "hidden";
      if (scrollbarWidth > 0) rootEl.style.paddingRight = `${scrollbarWidth}px`;
    }

    function unlock() {
      if (!lockedRef.current) return;
      lockedRef.current = false;
      lenisBridge.current?.start();
      rootEl.style.overflow = "";
      rootEl.style.paddingRight = "";
    }

    // Reveal is driven entirely off the current frame, so it's in lockstep
    // with the video and rewinds when scrolling back up.
    function applyReveal(frame: number) {
      const total = totalFramesRef.current;
      const f = frame / total;
      const header = headerRef.current;
      if (header) {
        const p = clamp01((f - HEADER_WINDOW[0]) / (HEADER_WINDOW[1] - HEADER_WINDOW[0]));
        header.style.opacity = String(p);
        header.style.transform = `translateY(${(1 - p) * 30}px)`;
      }
      CARD_PHASES.forEach((ph, i) => {
        const card = cardRefs.current[i];
        if (!card) return;
        const [is, ie, os, oe] = ph;
        const inP = clamp01((f - is) / (ie - is));
        const outP =
          os != null && oe != null ? clamp01((f - os) / (oe - os)) : 0;
        const opacity = inP * (1 - outP);
        card.style.opacity = String(opacity);
        // rise in on entry, drift up slightly on exit
        card.style.transform = `translateY(${(1 - inP) * 40 - outP * 24}px)`;
        card.style.filter = `blur(${(1 - inP) * 8 + outP * 6}px)`;
      });
    }

    function applyFrame(next: number) {
      const total = totalFramesRef.current;
      frameRef.current = Math.max(0, Math.min(total - 1, next));
      const v = videoRef.current;
      if (v) v.currentTime = frameRef.current / VIDEO_FPS;
      applyReveal(frameRef.current);
    }

    function stepByDistance(rawDelta: number) {
      const dir = Math.sign(rawDelta);
      if (dir === 0) return true;
      const atStart = frameRef.current <= 0;
      const atEnd = frameRef.current >= totalFramesRef.current - 1;
      if ((dir > 0 && atEnd) || (dir < 0 && atStart)) {
        accumRef.current = 0;
        armedRef.current = false;
        unlock();
        return false;
      }
      accumRef.current += rawDelta;
      while (Math.abs(accumRef.current) >= PX_PER_FRAME) {
        const step = Math.sign(accumRef.current);
        const prev = frameRef.current;
        applyFrame(prev + step);
        accumRef.current -= step * PX_PER_FRAME;
        if (frameRef.current === prev) {
          accumRef.current = 0;
          armedRef.current = false;
          unlock();
          return false;
        }
      }
      return true;
    }

    // Per-frame monitor catches entry into the pin zone from either direction
    // (input-event sampling alone misses it when smooth-scroll glides through).
    function monitorPin() {
      if (!lockedRef.current) {
        if (isPinned()) {
          if (armedRef.current) lock();
        } else {
          armedRef.current = true;
        }
      }
      rafId = requestAnimationFrame(monitorPin);
    }

    function onWheel(e: WheelEvent) {
      if (!lockedRef.current) return;
      if (stepByDistance(e.deltaY)) e.preventDefault();
    }

    function onTouchStart(e: TouchEvent) {
      touchYRef.current = e.touches[0]?.clientY ?? null;
      accumRef.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      const currentY = e.touches[0]?.clientY;
      if (currentY == null || touchYRef.current == null) return;
      const deltaY = touchYRef.current - currentY;
      touchYRef.current = currentY;
      if (!lockedRef.current) return;
      if (stepByDistance(deltaY)) e.preventDefault();
    }

    const KEY_DELTA: Record<string, number> = {
      ArrowDown: PX_PER_FRAME * 2,
      PageDown: PX_PER_FRAME * 6,
      " ": PX_PER_FRAME * 6,
      Spacebar: PX_PER_FRAME * 6,
      ArrowUp: -PX_PER_FRAME * 2,
      PageUp: -PX_PER_FRAME * 6,
    };

    function onKeyDown(e: KeyboardEvent) {
      const delta = KEY_DELTA[e.key];
      if (delta === undefined) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (!lockedRef.current) return;
      if (stepByDistance(delta)) e.preventDefault();
    }

    applyReveal(0); // set the initial (all-hidden) reveal state
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    rafId = requestAnimationFrame(monitorPin);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(rafId);
      unlock();
    };
  }, []);

  return (
    <div
      className="cap-spacer"
      ref={spacerRef}
      style={{ height: `${PIN_VH + BUFFER_VH}vh` }}
    >
      <div className="cap-stage" ref={stageRef}>
        <section className="about-cap cap-stage__inner">
          <div className="about-cap__content">
            <div className="about-cap__header cap-reveal" ref={headerRef}>
              <span className="about-cap__label">{"// Capabilities"}</span>
              <h2 className="about-cap__heading">
                Why Choose
                <br />
                BlueSun
              </h2>
            </div>

            <div className="cap-center">
              {/* Smaller, fully-visible (contained) video */}
              <div className="cap-video-frame">
                <video
                  ref={videoRef}
                  className="cap-video"
                  src={CAP_VIDEO}
                  muted
                  playsInline
                  preload="auto"
                />
              </div>

              {/* One card visible at a time — they stack in the same spot and
                  cross-fade in sequence (driven by CARD_PHASES). */}
              <div className="cap-cardstack">
                {CAPABILITIES.map((cap, i) => (
                  <div
                    key={cap.title}
                    className="about-card liquid-glass cap-card cap-reveal"
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
