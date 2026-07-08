"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import FadingVideo from "@/components/FadingVideo";

type Service = {
  video: string;
  tag: string;
  title: string;
  desc: string;
};

const SERVICES: Service[] = [
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
    tag: "Strategy",
    title: "Research & Insight",
    desc: "We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.",
  },
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
    tag: "Craft",
    title: "Design & Execution",
    desc: "From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.",
  },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      className="contact-services__card liquid-glass"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
    >
      <div className="contact-services__card-media">
        <FadingVideo src={service.video} className="contact-services__card-video" />
        <div className="contact-services__card-gradient" aria-hidden="true" />
      </div>
      <div className="contact-services__card-body">
        <div className="contact-services__card-top">
          <span className="contact-services__card-tag">{service.tag}</span>
          <span className="contact-services__card-arrow liquid-glass">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <h3 className="contact-services__card-title">{service.title}</h3>
        <p className="contact-services__card-desc">{service.desc}</p>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section className="contact-services">
      <div className="contact-services__inner">
        <motion.div
          className="contact-services__header"
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="contact-services__title">What we do</h2>
          <span className="contact-services__label">Our services</span>
        </motion.div>

        <div className="contact-services__grid">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
