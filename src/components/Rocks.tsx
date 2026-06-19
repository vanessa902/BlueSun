"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROCK_L = `${BASE}/rock2.png`; // asteroid cluster (left)
const ROCK_R = `${BASE}/rock1.png`; // hex stone (right, travels)

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

/**
 * Two rocks float at the sides during the hero video scrollytelling. When it
 * ends, the right rock moves to the center, then keeps descending into the next
 * section. Driven by scroll position (+ a gentle time-based bob).
 */
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
      const sy = window.scrollY;
      const t = (now - t0) / 1000;

      const fadeIn = seg(sy, vh * 0.4, vh * 0.9);
      const heroEnd = vh * 2.6;
      const centerEnd = vh * 3.8;
      const descEnd = vh * 6.5;

      // LEFT rock: float, parallax up, fade out as the hero ends.
      if (left.current) {
        const bob = Math.sin(t * 0.9) * 10;
        const par = -seg(sy, 0, heroEnd) * 80;
        const op = fadeIn * (1 - seg(sy, heroEnd, centerEnd));
        left.current.style.opacity = String(op);
        left.current.style.transform = `translate(-50%, -50%) translateY(${par + bob}px)`;
      }

      // RIGHT rock: float -> move to center -> descend into next section.
      if (right.current) {
        const bob = Math.cos(t * 0.8) * 10;
        const toCenter = seg(sy, heroEnd, centerEnd); // 88% -> 50%
        const descend = seg(sy, centerEnd, descEnd); // down + shrink
        const par = -seg(sy, 0, heroEnd) * 60;
        const x = toCenter * -38; // vw
        const y = descend * 130; // vh
        const scale = 1 - descend * 0.45;
        const op = fadeIn * (1 - seg(sy, descEnd - vh * 1.0, descEnd));
        right.current.style.opacity = String(op);
        right.current.style.transform = `translate(-50%, -50%) translateX(${x}vw) translateY(calc(${par + bob}px + ${y}vh)) scale(${scale})`;
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
