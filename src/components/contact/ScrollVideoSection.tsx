"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadingVideo from "@/components/FadingVideo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SCROLL_VIDEO = `${BASE}/contact-scroll.mp4`;

/** Cinematic scroll break: the frame grows into place as it enters the
 * viewport and eases back down as it leaves, while the video itself drifts
 * at a different rate for a subtle parallax inside the frame. */
export default function ScrollVideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 0.5, 1], ["3rem", "0rem", "3rem"]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section className="contact-scroll" ref={sectionRef}>
      <motion.div className="contact-scroll__frame" style={{ scale, borderRadius: radius }}>
        <motion.div className="contact-scroll__video-wrap" style={{ y: videoY }}>
          <FadingVideo src={SCROLL_VIDEO} className="contact-scroll__video" />
        </motion.div>
        <div className="contact-scroll__gradient" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
