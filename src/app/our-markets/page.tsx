"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../our-markets.css";

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=85`;

const HERO_IMAGE = U("1541888946425-d81bb19240f5");

type MarketItem = {
  label: string;
  image: string;
};

const MARKETS: MarketItem[] = [
  { label: "Residential", image: U("1560518883-ce09059eeffa") },
  { label: "Commercial", image: U("1486406146926-c627a92ad1ab") },
  { label: "Industrial", image: U("1581094794329-c8112c4e1190") },
  { label: "Institutional", image: U("1503387762-592deb58ef4e") },
];

export default function OurMarketsPage() {
  return (
    <>
      <Navbar />

      <div className="markets-page">
        {/* ============================================================
            Hero
            ============================================================ */}
        <section className="hero">
          <div className="container">
            <div className="row row-content">
              <div className="col-6 hero-left">
                <motion.div
                  className="hero-image"
                  initial={{ opacity: 0, scale: 0, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={HERO_IMAGE} alt="" />
                  <div className="texture-overlay" />
                </motion.div>
              </div>
              <div className="col-6 hero-right">
                <motion.p
                  className="about-text"
                  initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                >
                  BlueSun builds across residential, commercial,
                  industrial, and institutional markets — bringing the
                  same craftsmanship and planning discipline to every
                  scale of project, from single-family homes to
                  multi-phase developments.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            Gallery
            ============================================================ */}
        <section className="gallery">
          <div className="container">
            <div className="row">
              <div className="col-12 gallery-wrapper">
                {MARKETS.map((market, i) => (
                  <motion.div
                    key={market.label}
                    className="gallery-item"
                    initial={{ opacity: 0, y: 50, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                      delay: i * 0.12,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={market.image} alt={market.label} loading="lazy" />
                    <span className="gallery-item__label">{market.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <motion.p
                  className="gallery-caption"
                  initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  Every market has its own codes, timelines, and clients
                  to answer to. Our teams specialize by sector so each
                  project gets people who already know its rules.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            Closing CTA
            ============================================================ */}
        <section className="cta-section">
          <motion.div
            className="footer-cta"
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <a className="footer-button" href="#contact">
              Get in touch
            </a>
            <a className="footer-email" href="mailto:hello@bluesun.build">
              hello@bluesun.build
            </a>
          </motion.div>
        </section>
      </div>

      <Footer />
    </>
  );
}
