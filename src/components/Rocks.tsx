"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROCK = `${BASE}/rock1.png`;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export default function Rocks() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rockRef = useRef<HTMLImageElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let destroyed = false;
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      if (destroyed) return;
      const vh = window.innerHeight;
      const t = (now - t0) / 1000;

      const zone = document.getElementById("rock-zone");
      const stage = stageRef.current;
      const rock = rockRef.current;
      const text1 = text1Ref.current;
      const text2 = text2Ref.current;

      if (zone && stage && rock && text1 && text2) {
        const zr = zone.getBoundingClientRect();
        const range = Math.max(1, zone.offsetHeight - vh);
        const p = clamp(-zr.top / range);

        // Stage: fade in at start, fade out at end to reveal next section
        const stageOp = Math.min(seg(p, 0, 0.03), 1 - seg(p, 0.88, 1.0));
        stage.style.opacity = String(Math.max(0, stageOp));

        const bob = Math.sin(t * 0.8) * 4 * (1 - seg(p, 0.58, 0.68));

        // ---- ROCK ----
        // 1. Appear from above (0.00–0.06)
        const appear = seg(p, 0.0, 0.06);
        let rockY = lerp(-vh * 0.3, 0, appear);

        // 2. Grow 80%: scale 1 → 1.8 (0.06–0.16)
        let scale = lerp(1, 1.8, seg(p, 0.06, 0.16));

        // 3. Stay at 1.8 while "Building Spaces" appears (0.16–0.26)

        // 4. Grow 200% more: scale 1.8 → 3.6 (0.26–0.36)
        scale = lerp(scale, 3.6, seg(p, 0.26, 0.36));

        // 6. Impact: rock gets pushed downward (0.42–0.54)
        const impact = seg(p, 0.42, 0.54);
        rockY += lerp(0, vh * 0.38, impact);

        // Rock opacity: fade in, then dissolve (0.60–0.72)
        const rockOp = seg(p, 0.0, 0.04) * (1 - seg(p, 0.60, 0.72));

        rock.style.top = `calc(50% + ${rockY + bob}px)`;
        rock.style.transform = `translate(-50%, -50%) scale(${scale})`;
        rock.style.opacity = String(rockOp);

        // ---- "BUILDING SPACES" (text1) ----
        // Typewriter reveal (0.16–0.26), disappear (0.36–0.42)
        const reveal1 = seg(p, 0.16, 0.26);
        const fade1 = seg(p, 0.36, 0.42);
        const t1Op = reveal1 * (1 - fade1);

        text1.style.opacity = String(t1Op);
        text1.style.clipPath = `inset(0 ${(1 - reveal1) * 100}% 0 0)`;
        text1.style.filter = `blur(${fade1 * 10}px)`;
        text1.style.top = `calc(62% + ${bob}px)`;

        // ---- "THAT STAND THE TEST OF TIME" (text2) ----
        // Drops from above with easeOutBack (0.42–0.54)
        const drop = seg(p, 0.42, 0.54);
        const dropEased = easeOutBack(drop);
        const t2Y = lerp(-vh * 0.6, 0, dropEased);

        // Starts at 2× size (100% larger), shrinks to 20% (0.72–0.80)
        const t2Scale = lerp(2.0, 0.4, seg(p, 0.72, 0.80));

        // Fade in during drop, fade out at end (0.80–0.88)
        const t2Op = seg(p, 0.42, 0.48) * (1 - seg(p, 0.80, 0.88));

        text2.style.top = `calc(50% + ${t2Y}px)`;
        text2.style.transform = `translate(-50%, -50%) scale(${t2Scale})`;
        text2.style.opacity = String(t2Op);
        text2.style.filter = `blur(${seg(p, 0.80, 0.88) * 12}px)`;
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
    <div id="rock-stage" ref={stageRef}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={rockRef} id="rock-right" src={ROCK} alt="" />
      <span ref={text1Ref} id="rock-text">
        Building Spaces
      </span>
      <span ref={text2Ref} id="rock-text2">
        That stand the test of time
      </span>
    </div>
  );
}
