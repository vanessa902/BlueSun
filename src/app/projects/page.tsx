"use client";

import dynamic from "next/dynamic";
import { ArrowRight, Link2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import RollButton from "@/components/axion/RollButton";
import ExpandButton from "@/components/axion/ExpandButton";
import PartnerBadgeIcon from "@/components/axion/PartnerBadgeIcon";
import "../axion.css";
import "../axion-swap.css";

const SWAP = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=85`;

type SwapProject = {
  title: string;
  desc: string;
  swapImages: [string, string];
  bigImage: string;
  reversed?: boolean;
};

const SWAP_PROJECTS: SwapProject[] = [
  {
    title: "Solace",
    desc: "A wellness platform redesigned around calm, unhurried pacing.",
    swapImages: [SWAP("1600607687939-ce8a6c25118c"), SWAP("1600585154340-be6161a56a0c")],
    bigImage: SWAP("1600607687644-a94e6a2c0b3f"),
  },
  {
    title: "Northline",
    desc: "Logistics tooling that makes dense operational data legible.",
    swapImages: [SWAP("1553413077-190dd305871c"), SWAP("1581091226825-a6a2a5aee158")],
    bigImage: SWAP("1565043666747-69f6646db940"),
  },
  {
    title: "Verve",
    desc: "An editorial-first storefront for a fashion label's US launch.",
    swapImages: [SWAP("1441984904996-e0b6ba687e04"), SWAP("1490481651871-ab68de25d43d")],
    bigImage: SWAP("1483985988355-763728e1935b"),
    reversed: true,
  },
  {
    title: "Continuum",
    desc: "A fintech dashboard rebuilt for clarity under real load.",
    swapImages: [SWAP("1454165804606-c3d57bc86b40"), SWAP("1551288049-bebda4e38f71")],
    bigImage: SWAP("1487958449943-2429e8be8625"),
    reversed: true,
  },
];

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

export default function ProjectsPage() {
  return (
    <>
      <Navbar />

      <div className="axion-page">
      {/* ============================================================
          Section 1 — Hero
          ============================================================ */}
      <section className="axion-hero">
        <AxionHeroShader />

        <div className="axion-hero__content">
          <div className="axion-hero__inner">
            <h1 className="axion-hero__headline">Our projects</h1>

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

      {/* ============================================================
          Section 4 — Scroll-driven work showcase
          ============================================================ */}
      <div className="axion-swap">
        <header>
          <h1>
            <span>Selected work</span>
            Built to hold up
          </h1>
          <h2>Scroll to explore</h2>
        </header>

        <main>
          {SWAP_PROJECTS.map((project) => (
            <section key={project.title}>
              <div className="image-box">
                {project.reversed && (
                  <div className="controller">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.bigImage} alt="" />
                  </div>
                )}

                <div className="swapper">
                  <div className="progress">
                    <div>
                      <div />
                    </div>
                    <div>
                      <div />
                    </div>
                  </div>
                  <div className="caption">
                    <h2>{project.title}</h2>
                    <p>{project.desc}</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.swapImages[0]} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.swapImages[1]} alt="" />
                </div>

                {!project.reversed && (
                  <div className="controller">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.bigImage} alt="" />
                  </div>
                )}
              </div>
            </section>
          ))}

          <section>
            <h2>Let&rsquo;s build something worth scrolling for.</h2>
            <h2>Available for new projects — Q1 2026</h2>
          </section>
        </main>
      </div>
      </div>
    </>
  );
}
