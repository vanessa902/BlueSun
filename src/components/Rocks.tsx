"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROCK_L = `${BASE}/rock2.png`; // asteroid cluster (left)
const ROCK_R = `${BASE}/rock1.png`; // hex stone (right, travels + lands)

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Both rocks float at the sides during the hero. The RIGHT rock is ALWAYS
 * floating; as the blueprint "Building spaces…" vector scrolls into view it
 * expands and descends, then locks on top of the vector and rides with it as
 * you keep scrolling (it arrives there via scroll — it is never static).
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
      const vw = window.innerWidth;
      const sy = window.scrollY;
      const t = (now - t0) / 1000;

      const fadeIn = seg(sy, vh * 0.4, vh * 0.9);

      // LEFT rock: float + parallax during the hero, then fade out.
      if (left.current) {
        const bob = Math.sin(t * 0.9) * 10;
        const par = -seg(sy, 0, vh * 2.6) * 80;
        const op = fadeIn * (1 - seg(sy, vh * 2.6, vh * 3.8));
        left.current.style.opacity = String(op);
        left.current.style.transform = `translate(-50%, -50%) translateY(${par + bob}px)`;
      }

      // RIGHT rock: always floating; lands on the blueprint vector via scroll.
      if (right.current) {
        const bobx = Math.cos(t * 0.8) * 8;
        const boby = Math.sin(t * 0.7) * 10;

        // Home (floating) position on the right side of the viewport.
        const homeCx = vw * 0.86;
        const homeCy = vh * 0.5;

        let cx = homeCx + bobx;
        let cy = homeCy + boby;
        let scale = 1;
        let exit = 1;

        const target = document.getElementById("eb-bp-target");
        if (target) {
          const r = target.getBoundingClientRect();
          const tcx = r.left + r.width / 2;
          const tcy = r.top + r.height / 2;
          // Blend from floating-home to locked-on-vector as the blueprint
          // scrolls up into view; once locked it rides with the section.
          const blend = seg(vh - r.top, 0, vh * 0.75);
          const naturalW = right.current.offsetWidth || 1;
          const targetScale = (r.width * 0.92) / naturalW;

          cx = lerp(homeCx + bobx, tcx, blend) + boby * (1 - blend) * 0;
          cy = lerp(homeCy + boby, tcy + boby * 0.4, blend);
          scale = lerp(1, targetScale, blend);
          // Fade out once it has ridden the vector up past the top edge.
          exit = 1 - seg(-tcy, 0, vh * 0.3);
        }

        right.current.style.left = `${cx}px`;
        right.current.style.top = `${cy}px`;
        right.current.style.transformOrigin = "center center";
        right.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        right.current.style.opacity = String(fadeIn * exit);
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
