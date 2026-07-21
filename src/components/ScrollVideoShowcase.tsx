"use client";

import { useEffect, useRef } from "react";
import { lenisBridge } from "@/lib/lenisBridge";
import "../app/scroll-video.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// The video's own encoded frame rate — every clip used with this component
// so far is 24fps — the video is stepped through by these actual frames, so
// the mapping stays in lockstep with the footage rather than an arbitrary
// time slice.
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

// Optional intro title (two words): the first types on, holds, fades out —
// then the second types on in the same spot, holds, and fades out. One word
// is on screen at a time. Driven directly off the current frame (not a
// timer), so it stays in lockstep with scroll like everything else here.
const FRAMES_PER_SCROLL = 100 / PX_PER_FRAME;
const WORD_TYPE_FRAMES = Math.round(1.5 * FRAMES_PER_SCROLL);
const WORD_HOLD_FRAMES = Math.round(2.5 * FRAMES_PER_SCROLL);
const WORD_FADE_FRAMES = Math.round(0.8 * FRAMES_PER_SCROLL);
const FINAL_HOLD_FRAMES = Math.round(3 * FRAMES_PER_SCROLL);
const FINAL_FADE_FRAMES = Math.round(1.6 * FRAMES_PER_SCROLL);

const LINE1_FADE_START = WORD_TYPE_FRAMES + WORD_HOLD_FRAMES;
const LINE1_FADE_END = LINE1_FADE_START + WORD_FADE_FRAMES;
const LINE2_START = LINE1_FADE_END;
const LINE2_TYPE_END = LINE2_START + WORD_TYPE_FRAMES;
const LINE2_FADE_START = LINE2_TYPE_END + FINAL_HOLD_FRAMES;

/** Scrollytelling video: the frame pins in place and captures scroll input
 * while active, stepping the video forward or backward through its actual
 * encoded frames in proportion to how far the user scrolls or drags,
 * instead of mapping continuous scroll distance onto video time. Once the
 * clip reaches its first or last frame, scrolling further releases the pin
 * and the page scrolls on normally.
 *
 * The home page runs Lenis smooth-scroll globally (see page.tsx), which has
 * its own wheel/touch listener and animates scrollY independently over
 * ~1.4s of easing. Merely calling preventDefault() on our own listener
 * doesn't stop that animation — Lenis keeps gliding the page past the
 * section regardless, which is what made the pin feel like it could be
 * skipped before the video finished (or conversely get stuck fighting
 * Lenis's own motion). So while the video is pinned and not yet fully
 * watched, we explicitly pause Lenis (lenisBridge) and drive currentTime
 * ourselves; we hand control back the instant the first/last frame is
 * reached. */
type ScrollVideoShowcaseProps = {
  /** Filename under /public, e.g. "home-showcase.mp4". */
  videoFile: string;
  /** Optional two-word sequential typewriter title overlaid near the top. */
  titleLines?: readonly [string, string];
};

export default function ScrollVideoShowcase({
  videoFile,
  titleLines,
}: ScrollVideoShowcaseProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleText1Ref = useRef<HTMLSpanElement>(null);
  const titleText2Ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const totalFramesRef = useRef(FALLBACK_TOTAL_FRAMES);
  const hasTitleRef = useRef(!!titleLines);
  const videoSrc = `${BASE}/${videoFile}`;

  useEffect(() => {
    hasTitleRef.current = !!titleLines;
  }, [titleLines]);

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
    const lockedRef = { current: false };

    function isPinned() {
      const el = trackRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight;
    }

    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      lenisBridge.current?.stop();
    }

    function unlock() {
      if (!lockedRef.current) return;
      lockedRef.current = false;
      lenisBridge.current?.start();
    }

    function updateTitle(frame: number) {
      if (!hasTitleRef.current) return;
      const t1 = titleText1Ref.current;
      const t2 = titleText2Ref.current;
      if (!t1 || !t2) return;

      // Line 1 ("Commercial"): types in, holds, fades out — fully gone by
      // LINE1_FADE_END, before line 2 ever starts typing.
      const r1 = Math.max(0, Math.min(1, frame / WORD_TYPE_FRAMES));
      t1.style.width = `${Math.round(t1.scrollWidth * r1)}px`;
      t1.classList.toggle("is-typing", frame > 0 && frame < WORD_TYPE_FRAMES);
      t1.classList.toggle("is-done", r1 >= 1);
      const fade1 = Math.max(
        0,
        Math.min(1, (frame - LINE1_FADE_START) / WORD_FADE_FRAMES)
      );
      t1.style.opacity = String(1 - fade1);

      // Line 2 ("Construction"): stays hidden until line 1 has fully faded,
      // then types in the same spot, holds, and fades out at the end.
      const r2 = Math.max(
        0,
        Math.min(1, (frame - LINE2_START) / WORD_TYPE_FRAMES)
      );
      t2.style.width = `${Math.round(t2.scrollWidth * r2)}px`;
      t2.classList.toggle("is-typing", frame >= LINE2_START && frame < LINE2_TYPE_END);
      t2.classList.toggle("is-done", r2 >= 1);
      const fade2 = Math.max(
        0,
        Math.min(1, (frame - LINE2_FADE_START) / FINAL_FADE_FRAMES)
      );
      t2.style.opacity = frame < LINE2_START ? "0" : String(1 - fade2);
    }

    function applyFrame(next: number) {
      const total = totalFramesRef.current;
      frameRef.current = Math.max(0, Math.min(total - 1, next));
      const v = videoRef.current;
      if (v) v.currentTime = frameRef.current / VIDEO_FPS;
      updateTitle(frameRef.current);
    }

    // Shared by wheel and touch: accumulates raw scroll/drag distance and
    // converts it into whole-frame steps, carrying any leftover forward so
    // fast gestures advance multiple frames at once instead of dropping them.
    // Returns true while the video isn't done yet (caller should keep
    // intercepting), false once the boundary is hit (caller should unlock
    // and let this input through).
    function stepByDistance(rawDelta: number) {
      const dir = Math.sign(rawDelta);
      if (dir === 0) return true;
      const atStart = frameRef.current <= 0;
      const atEnd = frameRef.current >= totalFramesRef.current - 1;
      if ((dir > 0 && atEnd) || (dir < 0 && atStart)) {
        accumRef.current = 0;
        unlock();
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
          unlock();
          return false;
        }
      }
      return true;
    }

    function onWheel(e: WheelEvent) {
      if (!lockedRef.current) {
        if (!isPinned()) return;
        lock();
      }
      if (stepByDistance(e.deltaY)) e.preventDefault();
    }

    function onTouchStart(e: TouchEvent) {
      touchYRef.current = e.touches[0]?.clientY ?? null;
      accumRef.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      const currentY = e.touches[0]?.clientY;
      if (currentY == null || touchYRef.current == null) return;
      const deltaY = touchYRef.current - currentY;
      touchYRef.current = currentY;
      if (!lockedRef.current) {
        if (!isPinned()) return;
        lock();
      }
      if (stepByDistance(deltaY)) e.preventDefault();
    }

    // Lenis only intercepts wheel/touch — keyboard scrolling (PageDown,
    // Space, arrow keys) would bypass the pin entirely otherwise.
    const KEY_DELTA: Record<string, number> = {
      ArrowDown: PX_PER_FRAME * 2,
      PageDown: PX_PER_FRAME * 6,
      " ": PX_PER_FRAME * 6,
      Spacebar: PX_PER_FRAME * 6,
      ArrowUp: -PX_PER_FRAME * 2,
      PageUp: -PX_PER_FRAME * 6,
    };

    function onKeyDown(e: KeyboardEvent) {
      const delta = KEY_DELTA[e.key];
      if (delta === undefined) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (!lockedRef.current) {
        if (!isPinned()) return;
        lock();
      }
      if (stepByDistance(delta)) e.preventDefault();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      unlock();
    };
  }, []);

  return (
    <div
      className="eb-scrollvideo-track"
      ref={trackRef}
      style={{ height: `${PIN_VH + BUFFER_VH}vh` }}
    >
      <section className="eb-scrollvideo">
        {titleLines && (
          <div className="eb-scrollvideo__title">
            <span className="eb-scrollvideo__title-text" ref={titleText1Ref}>
              {titleLines[0]}
            </span>
            <span className="eb-scrollvideo__title-text" ref={titleText2Ref}>
              {titleLines[1]}
            </span>
          </div>
        )}
        <div className="eb-scrollvideo__frame">
          <video
            ref={videoRef}
            className="eb-scrollvideo__video"
            src={videoSrc}
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
