"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import FadingVideo from "@/components/FadingVideo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const FEATURED_VIDEO = `${BASE}/contact-aerial.mp4`;

export default function FeaturedVideoSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="contact-featured">
      <div className="contact-featured__inner">
        <motion.div
          className="contact-featured__frame"
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <FadingVideo src={FEATURED_VIDEO} className="contact-featured__video" />
          <div className="contact-featured__gradient" aria-hidden="true" />

          <div className="contact-featured__bottom">
            <div className="contact-featured__card liquid-glass">
              <div className="contact-featured__card-label">Our Approach</div>
              <p className="contact-featured__card-body">
                We believe in the power of curiosity-driven exploration.
                Every project starts with a question, and every answer
                opens a new door to innovation.
              </p>
            </div>

            <motion.button
              type="button"
              className="contact-featured__explore liquid-glass"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore more
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
