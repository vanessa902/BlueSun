"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SHOWCASE_VIDEO = `${BASE}/home-showcase.mp4`;

// How much scroll (in vh) is dedicated to each second of video — higher
// means a slower, more deliberate scrub. The pinned viewport itself adds
// another 100vh on top of this.
const VH_PER_SECOND = 14;
const PIN_VH = 100;
// Used only until the real video duration is known (metadata load is fast,
// but this avoids a 0-height track flashing before then).
const FALLBACK_TRACK_VH = 400;

/** Scrollytelling video: the frame pins in place while a tall track scrolls
 * beneath it. Scroll progress across the FULL track maps one-to-one onto
 * the video's complete duration, so every second of the clip gets its own
 * dedicated scroll distance — nothing is skipped or compressed. The
 * grow-in/shrink-out of the frame at the very edges of the scroll range is
 * a purely cosmetic overlay and doesn't affect that time mapping. */
export default function ScrollVideoShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trackVh, setTrackVh] = useState(FALLBACK_TRACK_VH);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.04, 0.96, 1], [0.86, 1, 1, 0.92]);
  const radius = useTransform(
    scrollYProgress,
    [0, 0.04, 0.96, 1],
    ["3rem", "0rem", "0rem", "3rem"]
  );

  // The full 0→1 scroll range always maps to the full 0→duration of the
  // video, regardless of the cosmetic scale/radius above — every second of
  // the clip is reachable by scrolling, none of it is skipped.
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const v = videoRef.current;
    if (!v || !v.duration || Number.isNaN(v.duration)) return;
    const clamped = Math.max(0, Math.min(1, latest));
    v.currentTime = clamped * v.duration;
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      v.currentTime = 0.001;
      if (v.duration && !Number.isNaN(v.duration)) {
        setTrackVh(PIN_VH + v.duration * VH_PER_SECOND);
      }
    };
    if (v.readyState >= 1 && v.duration) onMeta();
    else v.addEventListener("loadedmetadata", onMeta, { once: true });
  }, []);

  return (
    <div className="eb-scrollvideo-track" ref={trackRef} style={{ height: `${trackVh}vh` }}>
      <section className="eb-scrollvideo">
        <motion.div className="eb-scrollvideo__frame" style={{ scale, borderRadius: radius }}>
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
