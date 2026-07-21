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
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rockRef = useRef<HTMLImageElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let raf = 0;
    const t0 = performance.now();

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const fallbackVideo = fallbackVideoRef.current!;
    const frames: ImageBitmap[] = [];
    let framesReady = false;
    let lastIdx = -1;
    let videoSeeking = false;

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

    function drawFrame(frame: ImageBitmap | HTMLVideoElement, sourceW: number, sourceH: number) {
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / sourceW, ch / sourceH);
      const dw = sourceW * s;
      const dh = sourceH * s;
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    // Extraction runs against its own throwaway video (fetched as a blob) so
    // it never fights the fallback video below over currentTime/seeking.
    // Frame extraction alone can take several seconds (seeking is sequential,
    // one frame at a time) — until it finishes, the fallback video renders
    // directly so the background never sits blank while loading.
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
        /* fallback video keeps rendering directly */
      }
    }

    fallbackVideo.addEventListener("seeked", () => { videoSeeking = false; });
    fallbackVideo.addEventListener("stalled", () => { videoSeeking = false; });
    fallbackVideo.addEventListener("loadeddata", () => { fallbackVideo.currentTime = 0; });

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    extractFrames();

    const tick = (now: number) => {
      if (destroyed) return;
      const vh = window.innerHeight;
      const t = (now - t0) / 1000;

      const zone = document.getElementById("rock-zone");
      const stage = stageRef.current;
      const overlay = overlayRef.current;
      const rock = rockRef.current;
      const text1 = text1Ref.current;
      const text2 = text2Ref.current;

      if (zone && stage && overlay && rock && text1 && text2) {
        const zr = zone.getBoundingClientRect();
        const range = Math.max(1, zone.offsetHeight - vh);
        const p = clamp(-zr.top / range);

        // Stage: fade in at start; the final dissolve (the "6th scroll") fades
        // the whole stage out at 0.93–1.0 to reveal the next section.
        const stageOp = Math.min(seg(p, 0, 0.03), 1 - seg(p, 0.93, 1.0));
        stage.style.opacity = String(Math.max(0, stageOp));

        // ---- SCROLL-DRIVEN VIDEO BACKGROUND ----
        // Only appears after "Building Spaces" finishes typing (p≥0.26)
        const bgFade = seg(p, 0.26, 0.32);
        canvas.style.opacity = String(bgFade);
        if (p >= 0.25) {
          const bgP = seg(p, 0.26, 0.95);
          if (framesReady && frames.length > 0) {
            const idx = Math.round(bgP * (frames.length - 1));
            if (idx !== lastIdx) {
              lastIdx = idx;
              if (frames[idx]) drawFrame(frames[idx], frames[idx].width, frames[idx].height);
            }
          } else if (
            fallbackVideo.duration &&
            isFinite(fallbackVideo.duration) &&
            fallbackVideo.readyState >= 1
          ) {
            const target = bgP * fallbackVideo.duration;
            if (!videoSeeking && Math.abs(fallbackVideo.currentTime - target) > 0.05) {
              videoSeeking = true;
              fallbackVideo.currentTime = target;
            }
            drawFrame(fallbackVideo, fallbackVideo.videoWidth, fallbackVideo.videoHeight);
          }
        }

        // ---- VIDEO GROW-TO-FULLSCREEN FINALE ----
        // After "That stand the test of time" shrinks small (done by ~0.70),
        // the video settles into a centered panel (0.60–0.70), then grows +20%
        // per scroll across 5 scroll-steps (0.70–0.93) until it covers the whole
        // screen, then dissolves with the stage on the 6th scroll (0.93–1.0).
        const settle = seg(p, 0.6, 0.7);
        const growth = seg(p, 0.7, 0.93);
        let videoScale = 1;
        if (p >= 0.7) {
          videoScale = 0.41 * Math.pow(1.2, 5 * growth); // 0.41 → ~1.02 (covers)
        } else if (p >= 0.6) {
          videoScale = lerp(1, 0.41, settle);
        }
        canvas.style.transform = `scale(${videoScale})`;
        overlay.style.opacity = String(lerp(0.7, 0.12, settle));

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

        // 6. Impact: rock gets pushed downward (0.46–0.58)
        const impact = seg(p, 0.46, 0.58);
        rockY += lerp(0, vh * 0.42, impact);

        // Rock opacity: fade in, then dissolve before the video finale (0.52–0.62)
        const rockOp = seg(p, 0.0, 0.04) * (1 - seg(p, 0.52, 0.62));

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
        // Drops in, shrinks small, then clears out before the video grows.
        const drop = seg(p, 0.46, 0.58);
        const t2Y = lerp(-vh * 0.55, 0, easeOutBack(drop));
        const t2Scale = lerp(2.0, 0.45, seg(p, 0.56, 0.66));
        const t2Op = seg(p, 0.46, 0.52) * (1 - seg(p, 0.62, 0.7));

        text2.style.top = `calc(50% + ${t2Y}px)`;
        text2.style.transform = `translate(-50%, -50%) scale(${t2Scale})`;
        text2.style.opacity = String(t2Op);
        text2.style.filter = `blur(${seg(p, 0.62, 0.7) * 12}px)`;
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
      <video
        ref={fallbackVideoRef}
        muted
        playsInline
        preload="auto"
        src={ROCK_BG}
        style={{ display: "none" }}
      />
      <div ref={overlayRef} className="rock-stage-overlay" />
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
