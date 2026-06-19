"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROCK_L = `${BASE}/rock2.png`;
const ROCK_R = `${BASE}/rock1.png`;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function Rocks() {
  const left = useRef<HTMLImageElement>(null);
  const right = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let destroyed = false;
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      if (destroyed) return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const sy = window.scrollY;
      const t = (now - t0) / 1000;

      const fadeIn = seg(sy, vh * 0.3, vh * 0.8);

      // LEFT rock: float during hero, parallax up, fade out
      if (left.current) {
        const bob = Math.sin(t * 0.9) * 10;
        const par = -seg(sy, 0, vh * 3) * 100;
        const op = fadeIn * (1 - seg(sy, vh * 2.5, vh * 3.5));
        left.current.style.opacity = String(op);
        left.current.style.transform = `translate(-50%, -50%) translateY(${par + bob}px)`;
      }

      // RIGHT rock animation phases (matching the reference video):
      // Phase 1 (hero): float on the right side
      // Phase 2 (mid-scroll): move to center, grow
      // Phase 3 (transition): descend with section toward the blueprint
      // Phase 4 (landing): lock onto the blueprint vector and ride with it
      if (right.current) {
        const bob = Math.cos(t * 0.8) * 8 * (1 - seg(sy, vh * 4, vh * 5));

        // Phase scroll boundaries
        const heroEnd = vh * 2.8;
        const centerAt = vh * 3.6;
        const landStart = vh * 4.5;

        // Phase 1→2: move from right side to center-left
        const toCenter = seg(sy, heroEnd, centerAt);
        // Phase 2→3→4: lock onto the blueprint target
        const target = document.getElementById("eb-bp-target");

        // Home position (floating on the right)
        const homeX = vw * 0.86;
        const homeY = vh * 0.42;
        // Center position (mid-transition)
        const midX = vw * 0.42;
        const midY = vh * 0.45;

        let x: number, y: number, scale: number, op: number;

        if (target) {
          const r = target.getBoundingClientRect();
          const tcx = r.left + r.width * 0.5;
          const tcy = r.top + r.height * 0.45;
          const naturalW = right.current.offsetWidth || 200;
          const landScale = (r.width * 0.85) / naturalW;

          const toLand = seg(sy, centerAt, landStart);

          if (toCenter < 1) {
            // Phase 1→2: float → center
            x = lerp(homeX, midX, toCenter) + bob;
            y = lerp(homeY, midY, toCenter) + bob * 0.6;
            scale = lerp(1, 1.3, toCenter);
          } else {
            // Phase 2→4: center → land on blueprint
            x = lerp(midX, tcx, toLand);
            y = lerp(midY, tcy, toLand);
            scale = lerp(1.3, landScale, toLand);
          }
          // Fade out once the section scrolls past
          op = fadeIn * (1 - seg(-r.bottom, 0, vh * 0.3));
        } else {
          // Fallback: just float
          x = lerp(homeX, midX, toCenter) + bob;
          y = lerp(homeY, midY, toCenter) + bob * 0.6;
          scale = lerp(1, 1.3, toCenter);
          op = fadeIn;
        }

        right.current.style.left = `${x}px`;
        right.current.style.top = `${y}px`;
        right.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        right.current.style.opacity = String(op);
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
    <div id="rocks-layer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={left} id="rock-left" src={ROCK_L} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={right} id="rock-right" src={ROCK_R} alt="" />
    </div>
  );
}
