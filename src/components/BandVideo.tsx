"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SRC = `${BASE}/band.mp4`;

/**
 * Full-screen, scroll-scrubbed video band (same idea as the hero): a tall
 * section with a sticky full-viewport video whose currentTime is driven by how
 * far the section has scrolled through the pin range.
 */
export default function BandVideo() {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    const w = wrap.current;
    if (!v || !w) return;

    let destroyed = false;
    let seeking = false;
    let raf = 0;

    const onSeeked = () => {
      seeking = false;
    };
    const onLoaded = () => {
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
    };
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("loadeddata", onLoaded);

    const tick = () => {
      if (destroyed) return;
      const rect = w.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

      if (v.duration && isFinite(v.duration)) {
        const target = p * (v.duration - 0.05);
        if (!seeking && Math.abs(v.currentTime - target) > 0.01) {
          seeking = true;
          v.currentTime = target;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("loadeddata", onLoaded);
    };
  }, []);

  return (
    <section className="eb-bandvid" ref={wrap}>
      <div className="eb-bandvid__sticky">
        <video
          ref={video}
          className="eb-bandvid__video"
          src={SRC}
          muted
          playsInline
          preload="auto"
        />
      </div>
    </section>
  );
}
