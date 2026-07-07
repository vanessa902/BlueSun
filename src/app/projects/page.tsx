"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Clock, Menu, X, Link2 } from "lucide-react";
import RollButton from "@/components/axion/RollButton";
import ExpandButton from "@/components/axion/ExpandButton";
import PartnerBadgeIcon from "@/components/axion/PartnerBadgeIcon";
import useLondonTime from "@/components/axion/useLondonTime";
import "../axion.css";

const AxionHeroShader = dynamic(() => import("@/components/AxionHeroShader"), {
  ssr: false,
});

const SMALL_IMG =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85";
const LARGE_IMG =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85";
const NARRATIV_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4";
const LUMINAR_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4";

const NAV_LINKS = ["Projects", "Studio", "Journal", "Connect"];

export default function ProjectsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const time = useLondonTime();

  return (
    <div className="axion-page">
      {/* ============================================================
          Section 1 — Hero
          ============================================================ */}
      <section className="axion-hero">
        <AxionHeroShader />

        <div className="axion-nav-wrap">
          <div className="axion-nav-container">
            <nav className="axion-nav">
              <div className="axion-nav__left">
                <a className="axion-nav__logo" href="#hero" aria-label="Axion Studio">
                  AX
                </a>
                <div className="axion-nav__links">
                  {NAV_LINKS.map((label) => (
                    <a key={label} href={`#${label.toLowerCase()}`}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="axion-nav__right">
                <span className="axion-nav__note">
                  Taking on projects for Q1 2026
                </span>
                <span className="axion-nav__time">
                  <Clock size={14} />
                  {time} in London
                </span>
                <RollButton label="Book a strategy call" variant="dark" />
              </div>

              <button
                type="button"
                className="axion-nav__toggle"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </nav>
          </div>
        </div>

        <div className={`axion-mmenu${menuOpen ? " is-open" : ""}`}>
          <div
            className="axion-mmenu__backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="axion-mmenu__sheet">
            <span className="axion-mmenu__time">
              <Clock size={14} />
              {time} in London
            </span>
            <nav className="axion-mmenu__links">
              {NAV_LINKS.map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
            <RollButton label="Start a project" variant="dark" block />
          </div>
        </div>

        <div className="axion-hero__content">
          <div className="axion-hero__inner">
            <p className="axion-hero__label">Axion Studio</p>
            <h1 className="axion-hero__headline">
              We craft digital experiences
              <br className="axion-br-desktop" />
              <span className="axion-sp-mobile"> </span>
              for brands ready to dominate
              <br className="axion-br-desktop" />
              <span className="axion-sp-mobile"> </span>
              their category online.
            </h1>

            <div className="axion-hero__ctas">
              <RollButton label="Start a project" variant="orange" />

              <div className="axion-partner">
                <PartnerBadgeIcon className="axion-partner__icon" />
                <span className="axion-partner__text">Certified Partner</span>
                <span className="axion-partner__badge">Featured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 2 — About
          ============================================================ */}
      <section className="axion-about" id="studio">
        <div className="axion-container">
          <div className="axion-badge-row">
            <span className="axion-badge-num">1</span>
            <span className="axion-badge-pill">Introducing Axion</span>
          </div>

          <h2 className="axion-about__heading">
            Strategy-led creatives, delivering
            <br className="axion-br-desktop" />
            <span className="axion-sp-mobile"> </span>
            results in digital and beyond.
          </h2>

          {/* mobile / tablet stacked layout */}
          <div className="axion-about__stack">
            <p className="axion-about__copy">
              Through research, creative thinking and iteration we help
              growing brands realize their digital full potential.
            </p>
            <RollButton label="About our studio" variant="orange" />
            <div className="axion-about__images">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="axion-about__img axion-about__img--small"
                src={SMALL_IMG}
                alt=""
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="axion-about__img axion-about__img--large"
                src={LARGE_IMG}
                alt=""
              />
            </div>
          </div>

          {/* desktop grid layout */}
          <div className="axion-about__grid">
            <div className="axion-about__grid-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="axion-about__img axion-about__img--small"
                src={SMALL_IMG}
                alt=""
              />
            </div>
            <div className="axion-about__grid-center">
              <div>
                <p className="axion-about__copy axion-about__copy--desktop">
                  Through research, creative thinking and iteration
                  <br />
                  we help growing brands realize their digital
                  <br />
                  full potential.
                </p>
                <RollButton label="About our studio" variant="orange" />
              </div>
            </div>
            <div className="axion-about__grid-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="axion-about__img axion-about__img--large"
                src={LARGE_IMG}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 3 — Case studies
          ============================================================ */}
      <section className="axion-cases" id="projects">
        <div className="axion-container">
          <div className="axion-badge-row">
            <span className="axion-badge-num">2</span>
            <span className="axion-badge-pill axion-badge-pill--gray300">
              Featured client work
            </span>
          </div>

          <h2 className="axion-cases__heading">Our projects</h2>

          <div className="axion-cases__grid">
            <div className="axion-case axion-case--narrativ">
              <div className="axion-case__media">
                <video
                  src={NARRATIV_VIDEO}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <ExpandButton
                  variant="light"
                  width={148}
                  label="Learn more"
                  icon={<Link2 size={14} />}
                />
              </div>
              <p className="axion-case__desc">
                Winner of Site of the Month 2025 — an interactive 3D showcase
                driving record engagement
              </p>
              <p className="axion-case__title">Narrativ</p>
            </div>

            <div className="axion-case axion-case--luminar">
              <div className="axion-case__media">
                <video src={LUMINAR_VIDEO} autoPlay muted loop playsInline />
                <ExpandButton
                  variant="dark"
                  width={168}
                  label="View case study"
                  icon={<ArrowRight size={14} />}
                />
              </div>
              <p className="axion-case__desc">
                Transforming a dated platform into a conversion-focused brand
                experience
              </p>
              <p className="axion-case__title">Luminar</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
