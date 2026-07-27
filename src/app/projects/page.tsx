"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import RollButton from "@/components/axion/RollButton";
import TypewriterHeading from "@/components/axion/TypewriterHeading";
import "../axion.css";
import "../axion-swap.css";

const AxionHeroShader = dynamic(() => import("@/components/AxionHeroShader"), {
  ssr: false,
});

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SMALL_IMG = `${BASE}/about-studio-small.jpg`;
const LARGE_IMG = `${BASE}/about-studio-large.jpg`;

// Real BlueSun job-site media (drone footage + crew photos), sourced from
// the team's own Supabase uploads rather than stock/placeholder images.
const ROOFING_1 = `${BASE}/project-roofing-1.jpg`;
const ROOFING_2 = `${BASE}/project-roofing-2.jpg`;
const ROOFING_3 = `${BASE}/project-roofing-3.jpg`;
const ROOFING_4 = `${BASE}/project-roofing-4.jpg`;
const ROOFING_5 = `${BASE}/project-roofing-5.jpg`;
const ROOFING_6 = `${BASE}/project-roofing-6.jpg`;
const ROOFING_7 = `${BASE}/project-roofing-7.jpg`;
const ROOFING_8 = `${BASE}/project-roofing-8.jpg`;
const ROOFING_VIDEO = `${BASE}/project-roofing.mp4`;
const MECHANICAL_1 = `${BASE}/project-mechanical-1.jpg`;
const MECHANICAL_2 = `${BASE}/project-mechanical-2.jpg`;
const MECHANICAL_VIDEO = `${BASE}/project-mechanical.mp4`;
const HVAC_LIFT_1 = `${BASE}/project-hvac-lift-1.jpg`;
const HVAC_LIFT_2 = `${BASE}/project-hvac-lift-2.jpg`;
const HVAC_LIFT_VIDEO = `${BASE}/project-hvac-lift.mp4`;
const FRAMING_1 = `${BASE}/project-framing-1.jpg`;
const FRAMING_2 = `${BASE}/project-framing-2.jpg`;
const FRAMING_VIDEO = `${BASE}/project-framing.mp4`;

type SwapProject = {
  title: string;
  desc: string;
  swapImages: [string, string];
  bigImage?: string;
  bigVideo?: string;
  reversed?: boolean;
};

const SWAP_PROJECTS: SwapProject[] = [
  {
    title: "Residential Roofing",
    desc: "A full apartment complex re-roof, from tear-off to new membrane, documented from the air and on the deck.",
    swapImages: [ROOFING_1, ROOFING_2],
    bigVideo: ROOFING_VIDEO,
  },
  {
    title: "Residential Roofing — Crew at Work",
    desc: "Insulation board and membrane going down, crew on the deck.",
    swapImages: [ROOFING_3, ROOFING_4],
    bigImage: ROOFING_5,
    reversed: true,
  },
  {
    title: "Residential Roofing — Aerial Progress",
    desc: "Tracking the re-roof building by building across the complex.",
    swapImages: [ROOFING_6, ROOFING_7],
    bigImage: ROOFING_8,
  },
  {
    title: "Mechanical Retrofit",
    desc: "Rooftop-level HVAC survey and unit swaps planned around live building operations.",
    swapImages: [MECHANICAL_1, MECHANICAL_2],
    bigVideo: MECHANICAL_VIDEO,
    reversed: true,
  },
  {
    title: "Rooftop HVAC Lift",
    desc: "A full mechanical unit craned into place and set on the roof without ever shutting the building down.",
    swapImages: [HVAC_LIFT_1, HVAC_LIFT_2],
    bigVideo: HVAC_LIFT_VIDEO,
  },
  {
    title: "Framing",
    desc: "Structural framing and renovation work, tracked from above as the building takes shape.",
    swapImages: [FRAMING_1, FRAMING_2],
    bigVideo: FRAMING_VIDEO,
    reversed: true,
  },
];

function ControllerMedia({ project }: { project: SwapProject }) {
  return (
    <div className="controller">
      {project.bigVideo ? (
        <video src={project.bigVideo} autoPlay muted loop playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.bigImage} alt="" />
      )}
    </div>
  );
}

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
            <h1 className="axion-hero__headline">
              Projects Built
              <br />
              with Purpose
            </h1>

            <div className="axion-hero__ctas">
              <RollButton label="Start a project" variant="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 2 — About
          ============================================================ */}
      <section className="axion-about" id="studio">
        <div className="axion-container">
          <TypewriterHeading
            className="axion-about__heading"
            text="Our projects are more than structures—they are environments designed to support businesses, strengthen communities, and improve everyday living."
          />

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
          Section 4 — Scroll-driven work showcase
          ============================================================ */}
      <div className="axion-swap">
        <main>
          {SWAP_PROJECTS.map((project) => (
            <section key={project.title}>
              <div className={`image-box${project.reversed ? " image-box--reversed" : ""}`}>
                {project.reversed && <ControllerMedia project={project} />}

                <div className="swapper">
                  <div className="progress">
                    <div>
                      <div />
                    </div>
                    <div>
                      <div />
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.swapImages[0]} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.swapImages[1]} alt="" />
                </div>

                {!project.reversed && <ControllerMedia project={project} />}
              </div>
            </section>
          ))}
        </main>
      </div>
      </div>
    </>
  );
}
