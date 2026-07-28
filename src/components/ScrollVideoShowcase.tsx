"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { lenisBridge } from "@/lib/lenisBridge";
import { PLAYBACK_MODE_QUERY, playInlineWithGestureFallback } from "@/lib/videoMode";
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
// events depending on the input device. Lower = faster (fewer px needed per
// frame, so the same scroll gesture advances further through the clip).
// Overridable per instance via the `pxPerFrame` prop (default below) so one
// usage can scrub slower/faster without affecting every other usage of this
// shared component.
const PX_PER_FRAME = 5;
// Extra scroll room, on top of the 100vh the stage itself occupies, purely
// so a real scroll input reliably has a wide enough window to be detected
// and released — too small risks a single large wheel/touch delta jumping
// clean past it. This never shows as a gap of any color: the stage is
// position: fixed while pinned (see below), completely independent of how
// much document space this buffer consumes underneath it.
const BUFFER_VH = 20;
const PIN_VH = 100;
const FALLBACK_TOTAL_FRAMES = Math.round(15 * VIDEO_FPS);

/** How many virtual frames make up "one scroll" (100px of wheel delta) at a
 * given pxPerFrame. Exported as a function (not a fixed constant) because
 * pxPerFrame is now configurable per instance — callers driving their own
 * scroll-timed content (e.g. an `onFrame` overlay) should compute their
 * "scrolls" unit from the SAME pxPerFrame value they pass in, so the two
 * stay in sync. FRAMES_PER_SCROLL below is the old fixed export, kept for
 * any caller still relying on the default pxPerFrame. */
export function framesPerScroll(pxPerFrame = PX_PER_FRAME) {
  return 100 / pxPerFrame;
}
export const FRAMES_PER_SCROLL = framesPerScroll();

// Optional intro title (two words): the first types on, holds, fades out —
// then the second types on in the same spot, holds, and fades out. One word
// is on screen at a time. Driven off an "intro progress" counter (see
// introScrolls in the props) that runs from 0 to introBudgetFrames — either
// the dedicated pre-video intro phase when introScrolls is set, or (when
// it's 0, the default) frame 0 onward directly, exactly matching the
// original behavior where the title played out overlapping the video's own
// early frames. Proportions across the 5 phases (type/hold/fade x2 words,
// swapping the last fade for a slightly longer one) are fixed; only the
// total duration scales with introBudgetFrames.
const TITLE_PHASE_UNITS = {
  type: 1.5,
  hold: 2.5,
  fade: 0.8,
  finalHold: 3,
  finalFade: 1.6,
} as const;
const TITLE_PHASE_TOTAL_UNITS =
  TITLE_PHASE_UNITS.type * 2 +
  TITLE_PHASE_UNITS.hold +
  TITLE_PHASE_UNITS.fade +
  TITLE_PHASE_UNITS.finalHold +
  TITLE_PHASE_UNITS.finalFade;

function computeTitleTiming(introBudgetFrames: number) {
  // introBudgetFrames > 0 means introScrolls was set — scale every phase so
  // the whole two-word sequence fits exactly inside that budget. Otherwise
  // fall back to the original fixed timing (in units of the default
  // FRAMES_PER_SCROLL), unchanged from before this prop existed.
  const scale =
    introBudgetFrames > 0 ? introBudgetFrames / TITLE_PHASE_TOTAL_UNITS : FRAMES_PER_SCROLL;
  const wordTypeFrames = Math.round(TITLE_PHASE_UNITS.type * scale);
  const wordHoldFrames = Math.round(TITLE_PHASE_UNITS.hold * scale);
  const wordFadeFrames = Math.round(TITLE_PHASE_UNITS.fade * scale);
  const finalHoldFrames = Math.round(TITLE_PHASE_UNITS.finalHold * scale);
  const finalFadeFrames = Math.round(TITLE_PHASE_UNITS.finalFade * scale);

  const line1FadeStart = wordTypeFrames + wordHoldFrames;
  const line1FadeEnd = line1FadeStart + wordFadeFrames;
  const line2Start = line1FadeEnd;
  const line2TypeEnd = line2Start + wordTypeFrames;
  const line2FadeStart = line2TypeEnd + finalHoldFrames;

  return {
    wordTypeFrames,
    wordFadeFrames,
    line1FadeStart,
    line1FadeEnd,
    line2Start,
    line2TypeEnd,
    line2FadeStart,
    finalFadeFrames,
  };
}

type TitleTiming = ReturnType<typeof computeTitleTiming>;

/** Drives the two-word typewriter title to the state it should be in at
 * `frame`. Hoisted to module scope (rather than living inside the scroll
 * effect) because both the desktop scroll path and the mobile playback path
 * need it — on mobile `frame` comes from video playback instead of scroll. */
function applyTitle(
  t1: HTMLSpanElement | null,
  t2: HTMLSpanElement | null,
  timing: TitleTiming,
  frame: number
) {
  if (!t1 || !t2) return;

  // Line 1 ("Commercial"): types in, holds, fades out — fully gone by
  // line1FadeEnd, before line 2 ever starts typing.
  const r1 = Math.max(0, Math.min(1, frame / timing.wordTypeFrames));
  t1.style.width = `${Math.round(t1.scrollWidth * r1)}px`;
  t1.classList.toggle("is-typing", frame > 0 && frame < timing.wordTypeFrames);
  t1.classList.toggle("is-done", r1 >= 1);
  const fade1 = Math.max(
    0,
    Math.min(1, (frame - timing.line1FadeStart) / timing.wordFadeFrames)
  );
  t1.style.opacity = String(1 - fade1);

  // Line 2 ("Construction"): stays hidden until line 1 has fully faded,
  // then types in the same spot, holds, and fades out at the end.
  const r2 = Math.max(
    0,
    Math.min(1, (frame - timing.line2Start) / timing.wordTypeFrames)
  );
  t2.style.width = `${Math.round(t2.scrollWidth * r2)}px`;
  t2.classList.toggle(
    "is-typing",
    frame >= timing.line2Start && frame < timing.line2TypeEnd
  );
  t2.classList.toggle("is-done", r2 >= 1);
  const fade2 = Math.max(
    0,
    Math.min(1, (frame - timing.line2FadeStart) / timing.finalFadeFrames)
  );
  t2.style.opacity = frame < timing.line2Start ? "0" : String(1 - fade2);
}

/** Scrollytelling video. Pinning is done with a JS-toggled
 * position: fixed/absolute swap on the stage — not CSS position: sticky.
 * Before/after the pin window, the stage sits position: absolute, inset: 0
 * inside the tall spacer (so it visually occupies exactly the spacer's own
 * box, matching normal document flow). The instant scroll reaches the pin
 * window, the stage switches to position: fixed, inset: 0 — pixel-identical
 * to where it already was, so the swap is invisible, but now genuinely
 * locked to the viewport with zero possible sub-pixel drift, independent of
 * whatever the surrounding page layout is doing. Scroll input is captured
 * while pinned and stepped through the video's actual encoded frames in
 * proportion to how far the user scrolls or drags, instead of mapping
 * continuous scroll distance onto video time. Once the clip reaches its
 * first or last frame, scrolling further un-pins (back to absolute) and the
 * page scrolls on normally, immediately revealing whatever comes next — the
 * spacer has no background of its own, so there is nothing to show through.
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
  /** "cover" fills the frame edge-to-edge (cropping as needed, no letterbox
   * bars); "contain" (default) shows the whole frame uncropped, which can
   * letterbox if the video's aspect ratio doesn't match the frame's. */
  objectFit?: "cover" | "contain";
  /** When there's a title, the frame normally shrinks to 80vh to leave room
   * above it (see .eb-scrollvideo--has-title in scroll-video.css). Setting
   * this lets the frame fill the full 100vh stage instead, with the title
   * overlaid directly on top of the video. Default false preserves existing
   * usages exactly as they were. */
  fullBleed?: boolean;
  /** Optional arbitrary content laid over the video frame (e.g. an info
   * card), positioned by whatever the caller's own CSS does with it. Not
   * used by any existing caller, so omitting it changes nothing. */
  overlay?: ReactNode;
  /** Called with the current VIDEO frame (i.e. excluding any introScrolls
   * lead-in — frame 0 is the video's own first frame) and total video frame
   * count every time it changes, so a caller-supplied `overlay` can drive
   * its own scroll-timed reveal without the engine needing to know
   * anything about that content. Not used by any existing caller. */
  onFrame?: (frame: number, total: number) => void;
  /** Overrides the default 5px-per-frame scroll speed — higher is slower
   * (more scroll distance needed per frame advance). Default preserves
   * every existing usage's exact feel. */
  pxPerFrame?: number;
  /** When set, the first `introScrolls` scrolls (in units of this
   * instance's own pxPerFrame) are a dedicated title-only lead-in: the
   * video stays on its own frame 0 while scroll instead drives the title
   * type/hold/fade sequence, which is rescaled to fit entirely inside this
   * budget. Once exhausted, further scroll starts advancing the video's
   * own frames from 0, with the title left in its final (faded-out) state.
   * Default 0 preserves the original behavior, where the title plays out
   * overlapping the video's own early frames instead of before them. */
  introScrolls?: number;
};

export default function ScrollVideoShowcase({
  videoFile,
  titleLines,
  objectFit = "contain",
  fullBleed = false,
  overlay,
  onFrame,
  pxPerFrame = PX_PER_FRAME,
  introScrolls = 0,
}: ScrollVideoShowcaseProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleText1Ref = useRef<HTMLSpanElement>(null);
  const titleText2Ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const totalFramesRef = useRef(FALLBACK_TOTAL_FRAMES);
  const hasTitleRef = useRef(!!titleLines);
  const onFrameRef = useRef(onFrame);
  // Both are static per-usage configuration (same as videoFile, objectFit,
  // ...) — captured once via ref, same as the other values the pin effect
  // below reads without listing in its deps array, rather than reacting to
  // changes after mount.
  const pxPerFrameRef = useRef(pxPerFrame);
  const introScrollsRef = useRef(introScrolls);
  const videoSrc = `${BASE}/${videoFile}`;

  // Touch / small-screen devices can't scrub (see lib/videoMode.ts) — they
  // get ordinary inline playback instead. Starts false so the server-rendered
  // markup is the desktop one, then flips on mount if this device qualifies.
  const [playbackMode, setPlaybackMode] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PLAYBACK_MODE_QUERY);
    const apply = () => setPlaybackMode(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    hasTitleRef.current = !!titleLines;
  }, [titleLines]);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

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

  // ---- Playback mode (touch / small screens): just play the clip ----
  // No pin, no scroll lock, no frame stepping. Overlay content is driven off
  // playback progress so the cards still land on their intended scenes.
  useEffect(() => {
    if (!playbackMode) return;
    const v = videoRef.current;
    if (!v) return;

    v.loop = true;
    const stopTrying = playInlineWithGestureFallback(v);

    // With no scroll budget to spend on a lead-in, the title runs over the
    // clip's own opening frames — which is exactly what computeTitleTiming(0)
    // describes (the behaviour that predates the introScrolls prop).
    const titleTiming = computeTitleTiming(0);

    const onTime = () => {
      const total = totalFramesRef.current;
      const frame = Math.round(v.currentTime * VIDEO_FPS);
      if (hasTitleRef.current) {
        applyTitle(titleText1Ref.current, titleText2Ref.current, titleTiming, frame);
      }
      onFrameRef.current?.(frame, total);
    };

    v.addEventListener("timeupdate", onTime);
    return () => {
      stopTrying();
      v.removeEventListener("timeupdate", onTime);
      v.pause();
    };
  }, [playbackMode]);

  // ---- Scroll-scrub mode (desktop) ----
  useEffect(() => {
    if (playbackMode) return;
    const touchYRef = { current: null as number | null };
    const accumRef = { current: 0 };
    const lockedRef = { current: false };
    // After we unlock at a boundary (first/last frame reached), the spacer is
    // still inside the pin window for a moment — this blocks the per-frame
    // monitor from instantly re-locking. Cleared once the spacer fully leaves
    // the window, so the NEXT approach (from either direction) can re-lock.
    const armedRef = { current: true };
    let rafId = 0;

    const pxPerFrame = pxPerFrameRef.current;
    const introBudgetFrames =
      introScrollsRef.current > 0
        ? Math.round(introScrollsRef.current * framesPerScroll(pxPerFrame))
        : 0;
    const titleTiming = computeTitleTiming(introBudgetFrames);

    // True for the whole BUFFER_VH-tall window where the spacer spans the
    // entire viewport — this is deliberately generous (not a razor-thin
    // instant) so entry is reliably caught whichever direction it's
    // approached from. The actual visual pinning is CSS position: sticky on
    // the stage (a native browser behavior, so it stays correctly "stuck"
    // symmetrically for both scroll directions) — this check only decides
    // when to start intercepting scroll input for frame stepping.
    function isPinned() {
      const el = spacerRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight;
    }

    // While locked we (a) stop Lenis so its inertia can't glide the page past
    // the section, (b) preventDefault every wheel/touch/keydown, and (c) set
    // overflow:hidden on the ROOT <html> element as a structural backstop
    // against any input that slips through before a handler runs. It must be
    // <html>, NOT <body>: locking <body> turns it into a scroll container,
    // which breaks the stage's position: sticky pin (the stage slips upward
    // instead of staying stuck to the viewport). Locking the root preserves
    // sticky because sticky still resolves against the viewport. Scrollbar-
    // width padding avoids a horizontal reflow jump when the bar disappears.
    const rootEl = document.documentElement;
    function lock() {
      if (lockedRef.current) return;
      lockedRef.current = true;
      lenisBridge.current?.stop();
      const scrollbarWidth = window.innerWidth - rootEl.clientWidth;
      rootEl.style.overflow = "hidden";
      if (scrollbarWidth > 0) rootEl.style.paddingRight = `${scrollbarWidth}px`;
    }

    function unlock() {
      if (!lockedRef.current) return;
      lockedRef.current = false;
      lenisBridge.current?.start();
      rootEl.style.overflow = "";
      rootEl.style.paddingRight = "";
    }

    function updateTitle(frame: number) {
      if (!hasTitleRef.current) return;
      applyTitle(titleText1Ref.current, titleText2Ref.current, titleTiming, frame);
    }

    function applyFrame(next: number) {
      const videoTotal = totalFramesRef.current;
      const virtualTotal = introBudgetFrames + videoTotal;
      frameRef.current = Math.max(0, Math.min(virtualTotal - 1, next));
      const videoFrame = Math.max(0, frameRef.current - introBudgetFrames);
      const v = videoRef.current;
      if (v) v.currentTime = videoFrame / VIDEO_FPS;
      // With no intro budget (the default), the title is driven by the raw
      // frame directly — identical to the original behavior, where it plays
      // out overlapping the video's own early frames. With a budget, the
      // title is driven by intro progress only, and is left in its final
      // (faded-out) state for the rest of the video once that's exhausted.
      const introProgress = Math.min(frameRef.current, introBudgetFrames);
      updateTitle(introBudgetFrames > 0 ? introProgress : frameRef.current);
      onFrameRef.current?.(videoFrame, videoTotal);
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
      const virtualTotal = introBudgetFrames + totalFramesRef.current;
      const atStart = frameRef.current <= 0;
      const atEnd = frameRef.current >= virtualTotal - 1;
      if ((dir > 0 && atEnd) || (dir < 0 && atStart)) {
        accumRef.current = 0;
        armedRef.current = false;
        unlock();
        return false;
      }
      accumRef.current += rawDelta;
      while (Math.abs(accumRef.current) >= pxPerFrame) {
        const step = Math.sign(accumRef.current);
        const prev = frameRef.current;
        applyFrame(prev + step);
        accumRef.current -= step * pxPerFrame;
        if (frameRef.current === prev) {
          accumRef.current = 0;
          armedRef.current = false;
          unlock();
          return false;
        }
      }
      return true;
    }

    // Per-frame monitor: this is what makes entry into the pin zone reliable.
    // Sampling isPinned() only on wheel/touch events misses the window,
    // because Lenis smooth-scrolls glide BETWEEN those sparse events — the
    // page can slide clean through the ~BUFFER_VH-tall pin window without any
    // input event landing inside it, so the section would just scroll past
    // ("passes with the cursor / have to click"). Checking every animation
    // frame instead catches the window from either direction.
    function monitorPin() {
      if (!lockedRef.current) {
        if (isPinned()) {
          if (armedRef.current) lock();
        } else {
          armedRef.current = true; // fully left the window → re-arm
        }
      }
      rafId = requestAnimationFrame(monitorPin);
    }

    // The event handlers only SCRUB — locking is owned entirely by the
    // per-frame monitor above (which respects the armed flag, so it won't
    // re-trap you at a boundary you just released through). If we're not
    // locked, let the input scroll the page normally.
    function onWheel(e: WheelEvent) {
      if (!lockedRef.current) return;
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
      if (!lockedRef.current) return;
      if (stepByDistance(deltaY)) e.preventDefault();
    }

    // Lenis only intercepts wheel/touch — keyboard scrolling (PageDown,
    // Space, arrow keys) would bypass the pin entirely otherwise.
    const KEY_DELTA: Record<string, number> = {
      ArrowDown: pxPerFrame * 2,
      PageDown: pxPerFrame * 6,
      " ": pxPerFrame * 6,
      Spacebar: pxPerFrame * 6,
      ArrowUp: -pxPerFrame * 2,
      PageUp: -pxPerFrame * 6,
    };

    function onKeyDown(e: KeyboardEvent) {
      const delta = KEY_DELTA[e.key];
      if (delta === undefined) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (!lockedRef.current) return;
      if (stepByDistance(delta)) e.preventDefault();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    rafId = requestAnimationFrame(monitorPin);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(rafId);
      unlock();
    };
  }, [playbackMode]);

  return (
    <div
      className={`eb-scrollvideo-spacer${titleLines ? " eb-scrollvideo-spacer--has-title" : ""}${
        playbackMode ? " eb-scrollvideo-spacer--playback" : ""
      }`}
      ref={spacerRef}
      /* In playback mode there's nothing to scroll past, so the spacer is
         just the stage's own height — the extra pin buffer would only be
         dead scroll space. */
      style={{ height: playbackMode ? `${PIN_VH}vh` : `${PIN_VH + BUFFER_VH}vh` }}
    >
      <div className="eb-scrollvideo-stage" ref={stageRef}>
        <section
          className={`eb-scrollvideo${titleLines ? " eb-scrollvideo--has-title" : ""}${
            fullBleed ? " eb-scrollvideo--fullbleed" : ""
          }`}
        >
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
              style={{ objectFit }}
              muted
              playsInline
              preload="auto"
              /* Scrub mode never plays the clip (frames are driven by
                 scroll); playback mode does, and loops it. */
              autoPlay={playbackMode}
              loop={playbackMode}
            />
            {titleLines && <div className="eb-scrollvideo__gradient" aria-hidden="true" />}
            {overlay && <div className="eb-scrollvideo__overlay">{overlay}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
