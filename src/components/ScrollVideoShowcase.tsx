"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SHOWCASE_VIDEO = `${BASE}/home-showcase.mp4`;

/** Scrollytelling video: the frame pins in place while a tall track scrolls
 * beneath it, and scroll position drives which frame of the video is
 * showing — like scrubbing a film strip — instead of the video playing on
 * its own timeline. Grows into place on entry, holds while scrubbing
 * through the clip, then shrinks back out on exit. */
export default function ScrollVideoShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0.86, 1, 1, 0.92]);
  const radius = useTransform(
    scrollYProgress,
    [0, 0.12, 0.88, 1],
    ["3rem", "0rem", "0rem", "3rem"]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const v = videoRef.current;
    if (!v || !v.duration || Number.isNaN(v.duration)) return;
    const clamped = Math.max(0, Math.min(1, latest));
    v.currentTime = clamped * v.duration;
  });

  // Paint the first frame right away instead of a blank box before any
  // scrolling happens.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const prime = () => {
      v.currentTime = 0.001;
    };
    if (v.readyState >= 1) prime();
    else v.addEventListener("loadedmetadata", prime, { once: true });
  }, []);

  return (
    <div className="eb-scrollvideo-track" ref={trackRef}>
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
