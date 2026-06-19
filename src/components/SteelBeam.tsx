"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SRC = `${BASE}/steel-beam.png`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * Scroll-driven steel beam: emerges from the hero video (vertical, floating),
 * then rotates to horizontal while "CONSTRUCTION" fades in below, then slides
 * down out of view and disappears. Driven by scroll position over a window.
 */
export default function SteelBeam() {
  const beam = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let raf = 0;

    const tick = () => {
      if (destroyed) return;
      const vh = window.innerHeight;
      const start = vh * 1.1;
      const end = vh * 4.0;
      const p = clamp((window.scrollY - start) / (end - start));

      const e1 = 0.3; // emerge
      const e2 = 0.62; // rotate to horizontal + text

      let ty: number, rot: number, op: number, scale: number;
      let labelOp = 0;
      let labelTy = 0;

      if (p <= 0 || p >= 1) {
        op = 0;
        ty = 0;
        rot = 90;
        scale = 0.85;
      } else if (p < e1) {
        const t = p / e1;
        op = t;
        ty = lerp(42, 0, t); // rise into view (vh)
        rot = 90; // vertical
        scale = lerp(0.85, 1, t);
      } else if (p < e2) {
        const t = (p - e1) / (e2 - e1);
        op = 1;
        ty = 0;
        rot = lerp(90, 0, t); // vertical -> horizontal
        scale = 1;
        labelOp = t; // CONSTRUCTION fades in
      } else {
        const t = (p - e2) / (1 - e2);
        op = 1 - t;
        ty = lerp(0, 130, t); // exit downward (vh)
        rot = 0;
        scale = 1;
        labelOp = 1 - t;
        labelTy = lerp(0, 130, t);
      }

      if (beam.current) {
        beam.current.style.opacity = String(op);
        beam.current.style.transform = `translate(-50%, -50%) translateY(${ty}vh) rotate(${rot}deg) scale(${scale})`;
      }
      if (label.current) {
        label.current.style.opacity = String(clamp(labelOp));
        label.current.style.transform = `translate(-50%, ${labelTy}vh)`;
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
    <div id="steel-layer">
      <div id="steel-beam" ref={beam}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SRC} alt="Steel beam" />
      </div>
      <div id="steel-label" ref={label}>
        Construction
      </div>
    </div>
  );
}
