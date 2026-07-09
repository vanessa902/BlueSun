"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/contact/AboutSection";
import FeaturedVideoSection from "@/components/contact/FeaturedVideoSection";
import PhilosophySection from "@/components/contact/PhilosophySection";
import ScrollVideoSection from "@/components/contact/ScrollVideoSection";
import ServicesSection from "@/components/contact/ServicesSection";
import "../contact.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <div className="contact-page">
        {/* ============================================================
            Section 1 — Hero (same treatment as the Our Markets hero:
            HUD grid overlay + centered eyebrow/title/paragraph)
            ============================================================ */}
        <section className="contact-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="contact-hero__frame-overlay" src={`${BASE}/hero-frame-light.svg`} alt="" />

          <div className="contact-hero__center">
            <motion.p
              className="contact-hero__eyebrow"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              Get in touch
            </motion.p>
            <motion.h1
              className="contact-hero__title"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              Contact Us
            </motion.h1>
            <motion.p
              className="contact-hero__desc"
              initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
            >
              Have a project in mind? Tell us about it and a member of our
              team will get back to you within one business day.
            </motion.p>
          </div>
        </section>

        {/* ============================================================
            Section 2 — About
            ============================================================ */}
        <AboutSection />

        {/* ============================================================
            Section 3 — Featured video
            ============================================================ */}
        <FeaturedVideoSection />

        {/* ============================================================
            Section 4 — Philosophy
            ============================================================ */}
        <PhilosophySection />

        {/* ============================================================
            Section 5 — Scroll video break
            ============================================================ */}
        <ScrollVideoSection />

        {/* ============================================================
            Section 6 — Services
            ============================================================ */}
        <ServicesSection />
      </div>

      <Footer />
    </>
  );
}
