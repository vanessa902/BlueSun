"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SHOWCASE_VIDEO = `${BASE}/home-showcase.mp4`;

// One "scroll unit" is one chunky wheel-scroll — same pacing convention used
// by the About page's hero story (AboutHeroStory.tsx). One unit = one second
// of video, so scrolling through the whole track reveals the whole clip.
const UNIT_VH = 60;
const PIN_VH = 100;
// Used only until the real video duration is known, so the track doesn't
// flash at zero height before metadata loads.
const FALLBACK_SCRUB_UNITS = 15;

/** Scrollytelling video: the frame pins in place while scroll progress across
 * the track drives the video's currentTime directly, one second of footage
 * per scroll unit, from the very first frame to the very last — the whole
 * clip is scrubbed by scrolling, nothing plays on its own. */
export default function ScrollVideoShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrubUnits, setScrubUnits] = useState(FALLBACK_SCRUB_UNITS);

  const trackVh = PIN_VH + scrubUnits * UNIT_VH;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

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
        setScrubUnits(Math.max(1, Math.ceil(v.duration)));
      }
    };
    if (v.readyState >= 1 && v.duration) onMeta();
    else v.addEventListener("loadedmetadata", onMeta, { once: true });
  }, []);

  return (
    <div className="eb-scrollvideo-track" ref={trackRef} style={{ height: `${trackVh}vh` }}>
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
