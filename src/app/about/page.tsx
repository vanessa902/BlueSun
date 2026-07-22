"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHeroStory from "@/components/AboutHeroStory";
import CapabilitiesShowcase from "@/components/CapabilitiesShowcase";
import "../about.css";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* ============================================================
          Section 1 — Hero (scroll-choreographed story: title -> grows ->
          disappears -> paragraph types in -> disappears -> cards rise in)
          ============================================================ */}
      <AboutHeroStory />

      {/* ============================================================
          Section 2 — Capabilities (pinned scrollytelling: the excavator
          clip scrubs frame-by-frame on scroll while the header and the
          three cards reveal progressively across the same scroll)
          ============================================================ */}
      <CapabilitiesShowcase />

      <Footer />
    </>
  );
}
