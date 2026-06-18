"use client";

import { useEffect, useRef } from "react";
import "../app/enerblock.css";

type Solution = {
  n: string;
  label: string;
  title: string;
  desc: string;
  img: string;
};

const SOLUTIONS: Solution[] = [
  {
    n: "01",
    label: "Enerblock Panel",
    title: "Industrial innovation for building envelope systems",
    desc: "Lightweight multilayer sandwich panels designed to integrate precisely with the industrialized components of the Enerblock System®. Offsite manufacturing, process control and services geared towards meeting technical and regulatory requirements.",
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    n: "02",
    label: "Enerblock Robot",
    title: "Digital precision applied to industrial execution",
    desc: "Precision cutting and machining that translate design into exact components ready for assembly. It automates machining, cutting and drilling to reduce errors, minimize waste and maintain scalable control through CAD/CAM technology.",
    img: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80",
  },
  {
    n: "03",
    label: "Enerblock Frame",
    title: "Lightweight industrialized structure designed to fit",
    desc: "A cold-formed steel framing system engineered for tight tolerances and rapid assembly. It coordinates with panels and services so structure, envelope and MEP align as one industrialized package.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    n: "04",
    label: "Enerblock System",
    title: "The 2D industrialized system that reduces risk and provides certainty",
    desc: "Comprehensive system that coordinates envelopes, structure and processes within an industrialized and digital framework. It connects design, manufacturing and assembly as a single governable and scalable process.",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
  },
];

const BAND_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80";

export default function EnerblockSections() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let destroyed = false;
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

    function tick() {
      if (destroyed) return;
      const vh = window.innerHeight;

      // 1. Blueprint 2D -> 3D tilt
      if (stage.current) {
        const r = stage.current.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.95) - 0.1);
        stage.current.style.setProperty("--p", String(p));
      }

      // 2. Industrial band parallax
      if (band.current) {
        const r = band.current.parentElement!.getBoundingClientRect();
        const offset = clamp((vh - r.top) / (vh + r.height)) - 0.5;
        band.current.style.transform = `translateY(${offset * 12}%)`;
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    return () => {
      destroyed = true;
    };
  }, []);

  return (
    <div className="eb" ref={root}>
      {/* 1. Intro: red title + 2D->3D blueprint */}
      <section className="eb-intro">
        <div className="eb-intro__left">
          <h2 className="eb-title eb-intro__title">
            The industrialized component system that reduces risk and provides
            certainty
          </h2>
          <p className="eb-intro__desc">
            Integrates enclosures, structure, and processes within an
            industrialized and digital framework. It connects design,
            manufacturing, and assembly to reduce deviations in timelines, costs,
            and compliance, turning construction into a planned assembly process.
          </p>
        </div>
        <div className="eb-intro__right">
          <div className="eb-bp-stage" ref={stage}>
            <div className="eb-bp">
              <svg viewBox="0 0 300 420" aria-label="Standard floor plan">
                <rect className="eb-bp__line" x="20" y="20" width="260" height="380" />
                <line className="eb-bp__line" x1="20" y1="120" x2="280" y2="120" />
                <line className="eb-bp__line" x1="20" y1="220" x2="280" y2="220" />
                <line className="eb-bp__line" x1="20" y1="320" x2="280" y2="320" />
                <line className="eb-bp__line" x1="150" y1="20" x2="150" y2="400" />
                <rect className="eb-bp__line" x="120" y="150" width="60" height="140" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={i}
                    className="eb-bp__hatch"
                    x1={40 + i * 8}
                    y1="40"
                    x2={40 + i * 8}
                    y2="100"
                  />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={`b${i}`}
                    className="eb-bp__hatch"
                    x1={190 + i * 8}
                    y1="340"
                    x2={190 + i * 8}
                    y2="390"
                  />
                ))}
              </svg>
            </div>
          </div>
          <div className="eb-intro__caption">
            <span className="mark">⧉</span>
            <span className="meta">
              STANDARD FLOOR PLAN AND AXONOMETRICS
              <br />
              DRAWING NO.: 158.01.00 · SCALE: 1/100
            </span>
          </div>
        </div>
      </section>

      {/* 2. SOLUTIONS accordion grid */}
      <section className="eb-sol" id="solutions">
        <div className="eb-sol__eyebrow">
          <span>Solutions</span>
          <span>■</span>
        </div>
        <div className="eb-sol__head">
          <h2 className="eb-title">
            Industrialized technology for an evolving environment
          </h2>
        </div>
        <div className="eb-sol__list">
          {SOLUTIONS.map((s, i) => (
            <div
              className="eb-item"
              key={s.n}
              style={{ top: `calc(${i} * var(--eb-head))`, zIndex: i + 1 }}
            >
              <div className="eb-item__num">{s.n} /</div>
              <div className="eb-item__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.label} />
              </div>
              <div className="eb-item__body">
                <div className="eb-item__label">{s.label}</div>
                <h3 className="eb-item__title">{s.title}</h3>
                <p className="eb-item__desc">{s.desc}</p>
                <span className="eb-item__more">
                  Learn more <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Industrial band + PROJECTS */}
      <div className="eb-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={band}
          className="eb-band__img"
          src={BAND_IMG}
          alt="Industrialized steel framing"
        />
      </div>
      <section className="eb-projects" id="projects">
        <div className="eb-projects__eyebrow">
          <span>Projects</span>
          <span>■</span>
        </div>
        <h2 className="eb-title" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", paddingTop: "4rem" }}>
          Built with the Enerblock system
        </h2>
      </section>
    </div>
  );
}
