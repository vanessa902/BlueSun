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

const CREW_WATCH = `${BASE}/project-crew-watch.jpg`;
const CREW_GROUP = `${BASE}/project-crew-group.jpg`;
const ROOFTOP_AERIAL = `${BASE}/project-rooftop-aerial.jpg`;
const AERIAL_VIDEO = `${BASE}/contact-aerial.mp4`;
const ROOFTOP_VIDEO = `${BASE}/contact-rooftop.mp4`;
const NIGHT_VIDEO = `${BASE}/contact-scroll.mp4`;

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
    title: "Rooftop HVAC Lift",
    desc: "A full mechanical unit lifted by helicopter and set in place without ever shutting the building down.",
    swapImages: [CREW_WATCH, LARGE_IMG],
    bigVideo: AERIAL_VIDEO,
  },
  {
    title: "Mechanical Retrofit",
    desc: "Rooftop-level upgrades planned around live building operations, from survey to final tie-in.",
    swapImages: [ROOFTOP_AERIAL, SMALL_IMG],
    bigVideo: ROOFTOP_VIDEO,
  },
  {
    title: "Boots on the Ground",
    desc: "Every lift starts with a crew that knows the site cold — safety briefed, positioned, and ready.",
    swapImages: [CREW_GROUP, CREW_WATCH],
    bigImage: LARGE_IMG,
    reversed: true,
  },
  {
    title: "Built After Hours",
    desc: "Night and weekend phasing kept the job moving without disrupting tenants or traffic.",
    swapImages: [SMALL_IMG, ROOFTOP_AERIAL],
    bigVideo: NIGHT_VIDEO,
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
              <div className="image-box">
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
