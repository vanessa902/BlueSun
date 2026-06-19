"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROCK = `${BASE}/rock1.png`;
const ROCK_BG = `${BASE}/rock-bg.mp4`;

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rockRef = useRef<HTMLImageElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let raf = 0;
    const t0 = performance.now();

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const frames: ImageBitmap[] = [];
    let framesReady = false;
    let lastIdx = -1;

    function resizeCanvas() {
      const dpr = Math.min(devicePixelRatio, 2);
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      lastIdx = -1;
    }

    function drawFrame(frame: ImageBitmap) {
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / frame.width, ch / frame.height);
      const dw = frame.width * s;
      const dh = frame.height * s;
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    async function extractFrames() {
      try {
        const res = await fetch(ROCK_BG, { mode: "cors" });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        video.src = url;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject();
          setTimeout(() => reject(), 15000);
        });

        const scale = Math.min(1, 1280 / video.videoWidth);
        const sw = Math.round(video.videoWidth * scale);
        const sh = Math.round(video.videoHeight * scale);
        const count = Math.max(30, Math.min(90, Math.round(video.duration * 20)));

        for (let i = 0; i < count; i++) {
          if (destroyed) return;
          video.currentTime = (i / (count - 1)) * (video.duration - 0.05);
          await new Promise<void>((resolve, reject) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              resolve();
            };
            video.addEventListener("seeked", onSeeked);
            setTimeout(() => { video.removeEventListener("seeked", onSeeked); reject(); }, 3000);
          });
          frames.push(await createImageBitmap(video, { resizeWidth: sw, resizeHeight: sh }));
        }

        if (frames.length > 0) framesReady = true;
        URL.revokeObjectURL(url);
      } catch {
        /* silent fallback — canvas stays black */
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    extractFrames();

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

        // Stage: fade in at start, fade out at the very end to reveal next section
        const stageOp = Math.min(seg(p, 0, 0.03), 1 - seg(p, 0.9, 1.0));
        stage.style.opacity = String(Math.max(0, stageOp));

        // ---- SCROLL-DRIVEN VIDEO BACKGROUND ----
        if (framesReady && frames.length > 0) {
          const idx = Math.round(p * (frames.length - 1));
          if (idx !== lastIdx) {
            lastIdx = idx;
            if (frames[idx]) drawFrame(frames[idx]);
          }
        }

        const bob = Math.sin(t * 0.8) * 4 * (1 - seg(p, 0.5, 0.62));

        // ---- ROCK ----
        // 1. Appear from above (0.00–0.06)
        const appear = seg(p, 0.0, 0.06);
        let rockY = lerp(-vh * 0.3, 0, appear);

        // 2. Grow 80%: scale 1 → 1.8 (0.06–0.16)
        let scale = lerp(1, 1.8, seg(p, 0.06, 0.16));

        // 3. Stay at 1.8 while "Building Spaces" appears (0.16–0.26)

        // 4. Grow 200% more: scale 1.8 → 3.6 (0.26–0.36)
        scale = lerp(scale, 3.6, seg(p, 0.26, 0.36));

        // 6. Impact: rock gets pushed downward (0.50–0.62)
        const impact = seg(p, 0.5, 0.62);
        rockY += lerp(0, vh * 0.42, impact);

        // Rock opacity: fade in, then dissolve (0.62–0.74)
        const rockOp = seg(p, 0.0, 0.04) * (1 - seg(p, 0.62, 0.74));

        rock.style.top = `calc(50% + ${rockY + bob}px)`;
        rock.style.transform = `translate(-50%, -50%) scale(${scale})`;
        rock.style.opacity = String(rockOp);

        // ---- "BUILDING SPACES" (text1) ----
        const reveal1 = seg(p, 0.16, 0.26);
        const fade1 = seg(p, 0.36, 0.42);
        const t1Op = reveal1 * (1 - fade1);

        text1.style.opacity = String(t1Op);
        text1.style.clipPath = `inset(0 ${(1 - reveal1) * 100}% 0 0)`;
        text1.style.filter = `blur(${fade1 * 10}px)`;
        text1.style.top = `calc(62% + ${bob}px)`;

        // ---- "THAT STAND THE TEST OF TIME" (text2, two lines) ----
        const drop = seg(p, 0.5, 0.62);
        const t2Y = lerp(-vh * 0.55, 0, easeOutBack(drop));
        const t2Scale = lerp(2.0, 0.45, seg(p, 0.74, 0.84));
        const t2Op = seg(p, 0.5, 0.56) * (1 - seg(p, 0.84, 0.92));

        text2.style.top = `calc(50% + ${t2Y}px)`;
        text2.style.transform = `translate(-50%, -50%) scale(${t2Scale})`;
        text2.style.opacity = String(t2Op);
        text2.style.filter = `blur(${seg(p, 0.84, 0.92) * 12}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      frames.forEach((f) => f.close?.());
    };
  }, []);

  return (
    <div id="rock-stage" ref={stageRef}>
      <canvas ref={canvasRef} className="rock-stage-bg" />
      <div className="rock-stage-overlay" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={rockRef} id="rock-right" src={ROCK} alt="" />
      <span ref={text1Ref} id="rock-text">
        Building Spaces
      </span>
      {/* Impact text, two lines, drops from above then shrinks away */}
      <div ref={text2Ref} id="rock-text2">
        <span>That stand</span>
        <span>the test of time</span>
      </div>
    </div>
  );
}
