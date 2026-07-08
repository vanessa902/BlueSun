"use client";

import { useState, type FormEvent } from "react";
import { Instrument_Serif } from "next/font/google";
import { ArrowRight, AtSign, X as XIcon, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadingVideo from "@/components/FadingVideo";
import AboutSection from "@/components/contact/AboutSection";
import FeaturedVideoSection from "@/components/contact/FeaturedVideoSection";
import PhilosophySection from "@/components/contact/PhilosophySection";
import ServicesSection from "@/components/contact/ServicesSection";
import "../contact.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";

export default function ContactPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <>
      <Navbar />

      <div className={`contact-page ${instrumentSerif.variable}`}>
        {/* ============================================================
            Section 1 — Hero
            ============================================================ */}
        <section className="contact-hero">
          <FadingVideo src={HERO_VIDEO} className="contact-hero__video" />

          <div className="contact-hero__content">
            <h1 className="contact-hero__heading">
              Know it then <em>all</em>.
            </h1>

            <form className="contact-hero__email liquid-glass" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="contact-hero__email-input"
              />
              <button type="submit" className="contact-hero__email-submit" aria-label="Subscribe">
                <ArrowRight size={20} />
              </button>
            </form>

            <p className="contact-hero__subtitle">
              Stay updated with the latest news and insights. Subscribe to
              our newsletter today and never miss out on exciting updates.
            </p>

            <button type="button" className="contact-hero__manifesto liquid-glass">
              Manifesto
            </button>
          </div>

          <div className="contact-hero__socials">
            <button type="button" className="contact-hero__social-btn liquid-glass" aria-label="Instagram">
              <AtSign size={20} />
            </button>
            <button type="button" className="contact-hero__social-btn liquid-glass" aria-label="X (Twitter)">
              <XIcon size={20} />
            </button>
            <button type="button" className="contact-hero__social-btn liquid-glass" aria-label="Website">
              <Globe size={20} />
            </button>
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
            Section 5 — Services
            ============================================================ */}
        <ServicesSection />
      </div>

      <Footer />
    </>
  );
}
