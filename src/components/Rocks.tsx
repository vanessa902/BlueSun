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
  const textRef = useRef<HTMLSpanElement>(null);

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

      // LEFT rock: float during hero, fade out before mountain
      if (left.current) {
        const fadeIn = seg(sy, vh * 0.3, vh * 0.8);
        const bob = Math.sin(t * 0.9) * 10;
        const par = -seg(sy, 0, vh * 3) * 100;
        const op = fadeIn * (1 - seg(sy, vh * 2.5, vh * 3.5));
        left.current.style.opacity = String(op);
        left.current.style.transform = `translate(-50%, -50%) translateY(${par + bob}px)`;
      }

      // RIGHT rock: appears at mountain section, phased scroll animation.
      // Each "scroll" ≈ 1 vh of the rock-scroll-zone (280vh total).
      const zone = document.getElementById("rock-scroll-zone");
      const mountain = document.getElementById("eb-mountain");
      if (right.current && zone && mountain) {
        const mRect = mountain.getBoundingClientRect();
        const zRect = zone.getBoundingClientRect();
        // p: normalized progress through the rock animation zone
        // 0 = mountain top hits viewport bottom, goes up from there
        const scrollInto = vh - mRect.top;
        const totalRange = mountain.offsetHeight + zone.offsetHeight;
        const p = clamp(scrollInto / totalRange);

        const bob = Math.cos(t * 0.8) * 5 * (1 - seg(p, 0.7, 0.85));

        // Phase 0 (p 0.00-0.06): Rock fades in at right side
        const fadeIn = seg(p, 0.0, 0.06);

        // Phase 1 (p 0.06-0.20): Rock grows 30% (≈2 scroll steps)
        const growP = seg(p, 0.06, 0.20);
        const scale = lerp(1, 1.3, growP);

        // Phase 2 (p 0.20-0.36): Rock rotates (≈2 scroll steps)
        const rotP = seg(p, 0.20, 0.36);
        const rotation = lerp(0, 18, rotP);

        // Phase 3 (p 0.36-0.48): Rock moves to center-left
        const moveP = seg(p, 0.36, 0.48);
        const startX = vw * 0.72;
        const centerX = vw * 0.5;
        const startY = vh * 0.42;
        const centerY = vh * 0.46;
        let x = lerp(startX, centerX, moveP);
        let y = lerp(startY, centerY, moveP);

        // Phase 4 (p 0.48-0.60): "Building Spaces" typewriter appears below rock
        const typeP = seg(p, 0.48, 0.60);

        // Phase 5 (p 0.60-0.85): Rock descends, "Building Spaces" erases,
        // rock lands on the blueprint vector
        const descendP = seg(p, 0.60, 0.85);
        const eraseP = seg(p, 0.65, 0.80);

        // Landing: blend toward the blueprint target
        let finalScale = scale;
        const target = document.getElementById("eb-bp-target");
        if (target && descendP > 0) {
          const r = target.getBoundingClientRect();
          const tcx = r.left + r.width * 0.5;
          const tcy = r.top + r.height * 0.45;
          const naturalW = right.current.offsetWidth || 200;
          const landScale = (r.width * 0.85) / naturalW;
          x = lerp(centerX, tcx, descendP);
          y = lerp(centerY, tcy, descendP);
          finalScale = lerp(scale, Math.max(landScale, 0.6), descendP);
        } else if (descendP > 0) {
          y = lerp(centerY, centerY + vh * 0.5, descendP);
        }

        // Fade out when section exits viewport
        const exitOp = target
          ? 1 - seg(-(target.getBoundingClientRect().bottom), 0, vh * 0.3)
          : 1;

        right.current.style.left = `${x}px`;
        right.current.style.top = `${y + bob}px`;
        right.current.style.transform = `translate(-50%, -50%) scale(${finalScale}) rotate(${rotation}deg)`;
        right.current.style.opacity = String(fadeIn * exitOp);

        // "Building Spaces" text
        if (textRef.current) {
          const textVisible = typeP > 0 && eraseP < 1;
          const textReveal = typeP;
          const textErase = 1 - eraseP;
          textRef.current.style.opacity = String(textVisible ? Math.min(textReveal, textErase) : 0);
          textRef.current.style.clipPath = `inset(0 ${(1 - textReveal * textErase) * 100}% 0 0)`;
          textRef.current.style.left = `${x}px`;
          textRef.current.style.top = `${y + bob + 80}px`;
        }

        // Hide/show the "Building spaces" prefix in the section title
        const prefix = document.getElementById("eb-title-prefix");
        if (prefix) {
          prefix.style.opacity = String(1 - seg(p, 0.78, 0.88));
        }
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
      <span ref={textRef} id="rock-text">
        Building Spaces
      </span>
    </div>
  );
}
