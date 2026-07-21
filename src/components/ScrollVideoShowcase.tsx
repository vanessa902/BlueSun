"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SHOWCASE_VIDEO = `${BASE}/home-showcase.mp4`;

// One "scroll unit" is one chunky wheel-scroll — same pacing convention used
// by the About page's hero story (AboutHeroStory.tsx).
const UNIT_VH = 60;
// Scroll 1: the video grows from small to full size.
const GROW_UNITS = 1;
// Phase 2 pacing: two scroll units per second of video, so scrubbing feels
// slow and deliberate rather than snapping a full second per scroll.
const SCRUB_UNITS_PER_SECOND = 2;
const PIN_VH = 100;
// Used only until the real video duration is known, so the track doesn't
// flash at zero height before metadata loads.
const FALLBACK_SCRUB_UNITS = 24;

/** Scrollytelling video, in two distinct phases:
 *  1. Grow — the first scroll unit grows the video from a small centered
 *     card up to its full (still modest) size.
 *  2. Scrub — every two scroll units after that advance the video by one
 *     second, so the clip's scenes step forward slowly instead of playing
 *     on a timer. */
export default function ScrollVideoShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrubUnits, setScrubUnits] = useState(FALLBACK_SCRUB_UNITS);

  const totalUnits = GROW_UNITS + scrubUnits;
  const growEnd = GROW_UNITS / totalUnits;
  const trackVh = PIN_VH + totalUnits * UNIT_VH;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Phase 1 only: grows the frame. Holds steady at full size for all of
  // phase 2 (useTransform clamps outside its input range by default).
  const scale = useTransform(scrollYProgress, [0, growEnd], [0.42, 1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const v = videoRef.current;
    if (!v || !v.duration || Number.isNaN(v.duration)) return;
    // Video stays on its first frame throughout phase 1, then scrubs
    // linearly across its full duration throughout phase 2.
    const scrubProgress = Math.max(0, Math.min(1, (latest - growEnd) / (1 - growEnd)));
    v.currentTime = scrubProgress * v.duration;
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      v.currentTime = 0.001;
      if (v.duration && !Number.isNaN(v.duration)) {
        setScrubUnits(Math.max(1, Math.ceil(v.duration * SCRUB_UNITS_PER_SECOND)));
      }
    };
    if (v.readyState >= 1 && v.duration) onMeta();
    else v.addEventListener("loadedmetadata", onMeta, { once: true });
  }, []);

  return (
    <div className="eb-scrollvideo-track" ref={trackRef} style={{ height: `${trackVh}vh` }}>
      <section className="eb-scrollvideo">
        <motion.div className="eb-scrollvideo__frame" style={{ scale }}>
          <video
            ref={videoRef}
            className="eb-scrollvideo__video"
            src={SHOWCASE_VIDEO}
            muted
            playsInline
            preload="auto"
          />
          <div className="eb-scrollvideo__gradient" aria-hidden="true" />
        </motion.div>
      </section>
    </div>
  );
}
