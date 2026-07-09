"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import FadingVideo from "@/components/FadingVideo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PHILOSOPHY_VIDEO = `${BASE}/contact-rooftop.mp4`;

export default function PhilosophySection() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });
  const videoRef = useRef(null);
  const videoInView = useInView(videoRef, { once: true, margin: "-100px" });
  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-100px" });

  return (
    <section className="contact-philosophy">
      <div className="contact-philosophy__inner">
        <motion.h2
          className="contact-philosophy__heading"
          ref={headingRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Innovation <span className="serif">x</span> Vision
        </motion.h2>

        <div className="contact-philosophy__grid">
          <motion.div
            className="contact-philosophy__video-wrap"
            ref={videoRef}
            initial={{ opacity: 0, x: -40 }}
            animate={videoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <FadingVideo src={PHILOSOPHY_VIDEO} className="contact-philosophy__video" />
          </motion.div>

          <motion.div
            className="contact-philosophy__text"
            ref={textRef}
            initial={{ opacity: 0, x: 40 }}
            animate={textInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div>
              <div className="contact-philosophy__block-label">
                Choose your space
              </div>
              <p className="contact-philosophy__block-body">
                Every meaningful breakthrough begins at the intersection of
                disciplined strategy and remarkable creative vision. We
                operate at that crossroads, turning bold thinking into
                tangible outcomes that move people and reshape industries.
              </p>
            </div>

            <div className="contact-philosophy__divider" />

            <div>
              <div className="contact-philosophy__block-label">
                Shape the future
              </div>
              <p className="contact-philosophy__block-body">
                We believe that the best work emerges when curiosity meets
                conviction. Our process is designed to uncover hidden
                opportunities and translate them into experiences that
                resonate long after the first impression.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
