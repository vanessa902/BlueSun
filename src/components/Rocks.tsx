"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROCK = `${BASE}/rock1.png`;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The rock does NOT appear over the hero video. It only appears later, in a
 * pure-black stage, after scrolling into #rock-zone. The whole animation plays
 * out scroll-by-scroll, then dissolves to reveal the "That stand the test of
 * time" section.
 */
export default function Rocks() {
  const stage = useRef<HTMLDivElement>(null);
  const rock = useRef<HTMLImageElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let destroyed = false;
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      if (destroyed) return;
      const vh = window.innerHeight;
      const t = (now - t0) / 1000;

      const zone = document.getElementById("rock-zone");
      if (zone && stage.current && rock.current && text.current) {
        const zr = zone.getBoundingClientRect();
        const range = Math.max(1, zone.offsetHeight - vh);
        // p: progress through the rock zone (0 = zone top hits viewport top)
        const p = clamp(-zr.top / range);

        // Pure-black stage: fades in as we enter the zone, fades out near the
        // end so the next section ("That stand the test of time") is revealed.
        const stageOp = Math.min(seg(p, 0, 0.03), 1 - seg(p, 0.84, 0.97));
        stage.current.style.opacity = String(Math.max(0, stageOp));

        const bob = Math.sin(t * 0.8) * 5 * (1 - seg(p, 0.45, 0.55));

        // ---- ROCK ----
        // Phase A (0.00-0.10): appears in the center and descends in.
        const appear = seg(p, 0.0, 0.10);
        const rockY = lerp(-vh * 0.14, 0, appear);

        // Phase B (0.10-0.22): grows 60%.
        // Phase C (0.22-0.32): reduces in size.
        // Phase D (0.32-0.42): reduces another 20%.
        let scale = lerp(1, 1.6, seg(p, 0.1, 0.22));
        scale = lerp(scale, 1.25, seg(p, 0.22, 0.32));
        scale = lerp(scale, 1.0, seg(p, 0.32, 0.42));

        // Phase F (0.52-0.60): rock disappears.
        const rockOp = seg(p, 0.0, 0.05) * (1 - seg(p, 0.52, 0.6));

        rock.current.style.top = `calc(50% + ${rockY + bob}px)`;
        rock.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        rock.current.style.opacity = String(rockOp);

        // ---- "BUILDING SPACES" TEXT ----
        // Phase E (0.42-0.52): typewriter reveal below the rock (+40% size).
        const reveal = seg(p, 0.42, 0.52);
        // Phase G (0.60-0.70): text rises to where the rock was (center).
        const rise = seg(p, 0.6, 0.7);
        const textBelow = vh * 0.2;
        const textY = lerp(textBelow, 0, rise);
        // Phase H (0.70-0.80): text dissolves (fade + blur).
        const dissolve = seg(p, 0.7, 0.8);
        const textOp = reveal * (1 - dissolve);

        text.current.style.top = `calc(50% + ${textY + bob}px)`;
        text.current.style.opacity = String(textOp);
        text.current.style.clipPath = `inset(0 ${(1 - reveal) * 100}% 0 0)`;
        text.current.style.filter = `blur(${dissolve * 10}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div id="rock-stage" ref={stage}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={rock} id="rock-right" src={ROCK} alt="" />
      <span ref={text} id="rock-text">
        Building Spaces
      </span>
    </div>
  );
}
