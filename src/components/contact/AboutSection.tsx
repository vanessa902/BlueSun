"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="contact-about" ref={ref}>
      <motion.p
        className="contact-about__label"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        About Us
      </motion.p>

      <motion.h2
        className="contact-about__heading"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        Pioneering <span className="serif">ideas</span> for
        <br className="contact-about__break" /> minds that{" "}
        <span className="serif">create, build, and inspire.</span>
      </motion.h2>
    </section>
  );
}
