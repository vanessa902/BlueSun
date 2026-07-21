"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadingVideo from "@/components/FadingVideo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SHOWCASE_VIDEO = `${BASE}/home-showcase.mp4`;

/** Scrollytelling video break: the frame grows into place as it enters the
 * viewport and eases back down as it leaves, while the video itself drifts
 * at a different rate inside the frame for a subtle parallax. */
export default function ScrollVideoShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 0.5, 1], ["3rem", "0rem", "3rem"]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section className="eb-scrollvideo" ref={sectionRef}>
      <motion.div className="eb-scrollvideo__frame" style={{ scale, borderRadius: radius }}>
        <motion.div className="eb-scrollvideo__video-wrap" style={{ y: videoY }}>
          <FadingVideo src={SHOWCASE_VIDEO} className="eb-scrollvideo__video" />
        </motion.div>
        <div className="eb-scrollvideo__gradient" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
