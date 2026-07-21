"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SHOWCASE_VIDEO = `${BASE}/home-showcase.mp4`;

// This video's own encoded frame rate (home-showcase.mp4 is 24fps) — the
// video is stepped through by these actual frames, so the mapping stays in
// lockstep with the footage rather than an arbitrary time slice.
const VIDEO_FPS = 24;
// How much accumulated scroll/drag distance (px) counts as "one scroll" and
// advances a frame. Using distance rather than raw event count keeps the
// feel consistent across a single mouse-wheel notch, a fast trackpad fling,
// or a slow touch drag — a fixed 1-event-1-frame mapping made the section
// feel stuck, since a real scroll gesture fires wildly different numbers of
// events depending on the input device.
const PX_PER_FRAME = 10;
// Extra scroll room left after the pin so lifting off the first/last frame
// hands scrolling back to the page smoothly instead of snapping.
const BUFFER_VH = 30;
const PIN_VH = 100;
const FALLBACK_TOTAL_FRAMES = Math.round(15 * VIDEO_FPS);

/** Scrollytelling video: the frame pins in place and captures scroll input
 * while active, stepping the video forward or backward through its actual
 * encoded frames in proportion to how far the user scrolls or drags,
 * instead of mapping continuous scroll distance onto video time. Once the
 * clip reaches its first or last frame, scrolling further releases the pin
 * and the page scrolls on normally. */
export default function ScrollVideoShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const totalFramesRef = useRef(FALLBACK_TOTAL_FRAMES);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      v.currentTime = 0;
      if (v.duration && !Number.isNaN(v.duration)) {
        totalFramesRef.current = Math.max(1, Math.round(v.duration * VIDEO_FPS));
      }
    };
    if (v.readyState >= 1 && v.duration) onMeta();
    else v.addEventListener("loadedmetadata", onMeta, { once: true });
  }, []);

  useEffect(() => {
    const touchYRef = { current: null as number | null };
    const accumRef = { current: 0 };

    function isPinned() {
      const el = trackRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight;
    }

    function applyFrame(next: number) {
      const total = totalFramesRef.current;
      frameRef.current = Math.max(0, Math.min(total - 1, next));
      const v = videoRef.current;
      if (v) v.currentTime = frameRef.current / VIDEO_FPS;
    }

    // Shared by wheel and touch: accumulates raw scroll/drag distance and
    // converts it into whole-frame steps, carrying any leftover forward so
    // fast gestures advance multiple frames at once instead of dropping them.
    function stepByDistance(rawDelta: number) {
      const dir = Math.sign(rawDelta);
      if (dir === 0) return false;
      const atStart = frameRef.current <= 0;
      const atEnd = frameRef.current >= totalFramesRef.current - 1;
      if ((dir > 0 && atEnd) || (dir < 0 && atStart)) {
        accumRef.current = 0;
        return false;
      }
      accumRef.current += rawDelta;
      while (Math.abs(accumRef.current) >= PX_PER_FRAME) {
        const step = Math.sign(accumRef.current);
        const prev = frameRef.current;
        applyFrame(prev + step);
        accumRef.current -= step * PX_PER_FRAME;
        if (frameRef.current === prev) {
          accumRef.current = 0;
          break;
        }
      }
      return true;
    }

    function onWheel(e: WheelEvent) {
      if (!isPinned()) return;
      if (stepByDistance(e.deltaY)) e.preventDefault();
    }

    function onTouchStart(e: TouchEvent) {
      touchYRef.current = e.touches[0]?.clientY ?? null;
      accumRef.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!isPinned() || touchYRef.current == null) return;
      const currentY = e.touches[0]?.clientY;
      if (currentY == null) return;
      const deltaY = touchYRef.current - currentY;
      touchYRef.current = currentY;
      if (stepByDistance(deltaY)) e.preventDefault();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      className="eb-scrollvideo-track"
      ref={trackRef}
      style={{ height: `${PIN_VH + BUFFER_VH}vh` }}
    >
      <section className="eb-scrollvideo">
        <div className="eb-scrollvideo__frame">
          <video
            ref={videoRef}
            className="eb-scrollvideo__video"
            src={SHOWCASE_VIDEO}
            muted
            playsInline
            preload="auto"
          />
          <div className="eb-scrollvideo__gradient" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
