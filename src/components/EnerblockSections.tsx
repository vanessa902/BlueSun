"use client";

import { useEffect, useRef, useState } from "react";
import "../app/enerblock.css";

type Item = { n: string; label: string; title: string; desc: string; img: string };

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const MARKETS: Record<string, { name: string; items: Item[] }> = {
  residential: {
    name: "Residential",
    items: [
      {
        n: "01",
        label: "Custom Homes",
        title: "Single-family residences engineered to last",
        desc: "Bespoke homes built with industrialized precision — durable envelopes, refined detailing and timeless design delivered on schedule.",
        img: U("1564013799919-ab600027ffc6"),
      },
      {
        n: "02",
        label: "Multi-Family Housing",
        title: "Apartments and condominiums delivered at scale",
        desc: "Repeatable, high-quality residential units produced offsite and assembled fast, with consistent control over cost and quality.",
        img: U("1545324418-cc1a3fa10c00"),
      },
      {
        n: "03",
        label: "Renovations",
        title: "Structural remodels that modernize without compromise",
        desc: "Expansions and retrofits that upgrade performance and space while preserving the integrity of the existing structure.",
        img: U("1503387762-592deb58ef4e"),
      },
    ],
  },
  commercial: {
    name: "Commercial",
    items: [
      {
        n: "01",
        label: "Offices & Retail",
        title: "Workplaces and storefronts built to spec",
        desc: "Commercial interiors and shells delivered on time and to code, engineered for flexibility and long-term value.",
        img: U("1486406146926-c627a92ad1ab"),
      },
      {
        n: "02",
        label: "Hospitality",
        title: "Hotels and venues crafted for experience",
        desc: "Guest-focused environments that balance design, performance and longevity across every space.",
        img: U("1551882547-ff40c63fe5fa"),
      },
      {
        n: "03",
        label: "Mixed-Use",
        title: "Integrated developments in a single build",
        desc: "Living, working and retail combined into one industrialized program, coordinated end to end.",
        img: U("1496307042754-b4aa456c4a2d"),
      },
    ],
  },
  industrial: {
    name: "Industrial",
    items: [
      {
        n: "01",
        label: "Warehouses",
        title: "Large-span storage built for scale",
        desc: "Distribution and storage facilities engineered for speed of delivery and operational efficiency.",
        img: U("1553413077-190dd305871c"),
      },
      {
        n: "02",
        label: "Manufacturing Plants",
        title: "Production environments engineered for uptime",
        desc: "Facilities designed around process, safety and continuity, with industrialized precision throughout.",
        img: U("1565043666747-69f6646db940"),
      },
      {
        n: "03",
        label: "Logistics Centers",
        title: "High-throughput hubs designed for flow",
        desc: "Resilient logistics infrastructure built for automation, throughput and future growth.",
        img: U("1504307651254-35680f356dfd"),
      },
    ],
  },
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const BAND_IMG = `${BASE}/band.png`;

export default function EnerblockSections() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLImageElement>(null);
  const [market, setMarket] = useState<keyof typeof MARKETS>("residential");

  useEffect(() => {
    let destroyed = false;
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

    function tick() {
      if (destroyed) return;
      const vh = window.innerHeight;

      // Blueprint 2D -> 3D tilt
      if (stage.current) {
        const r = stage.current.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.95) - 0.1);
        stage.current.style.setProperty("--p", String(p));
      }

      // Industrial band: zoom-in parallax (image grows as you scroll down)
      if (band.current && band.current.parentElement) {
        const r = band.current.parentElement.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height));
        band.current.style.transform = `translateY(${(p - 0.5) * 6}%) scale(${
          1 + p * 0.28
        })`;
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => {
      destroyed = true;
    };
  }, []);

  const items = MARKETS[market].items;

  return (
    <div className="eb" ref={root}>
      {/* 1. Intro: red title + 2D->3D blueprint */}
      <section className="eb-intro">
        <div className="eb-intro__left">
          <h2 className="eb-title eb-intro__title">
            Building spaces that stand the test of time
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
                  <line key={i} className="eb-bp__hatch" x1={40 + i * 8} y1="40" x2={40 + i * 8} y2="100" />
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

      {/* 2. Our Markets — toggle drives the content */}
      <section className="eb-sol" id="markets">
        <div className="eb-sol__eyebrow">
          <span>Our Markets</span>
          <span>■</span>
        </div>

        <div className="eb-markets-head">
          <h2 className="eb-title">Our Markets</h2>
          <div className="eb-toggle" role="tablist">
            {(Object.keys(MARKETS) as Array<keyof typeof MARKETS>).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={market === k}
                className={market === k ? "is-active" : ""}
                onClick={() => setMarket(k)}
              >
                {MARKETS[k].name}
              </button>
            ))}
          </div>
        </div>

        <div className="eb-sol__list" key={market}>
          {items.map((s, i) => (
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

      {/* 3. Industrial band (zoom parallax) + PROJECTS */}
      <div className="eb-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={band} className="eb-band__img" src={BAND_IMG} alt="Construction site" />
      </div>
      <section className="eb-projects" id="projects">
        <div className="eb-projects__eyebrow">
          <span>Projects</span>
          <span>■</span>
        </div>
        <h2
          className="eb-title"
          style={{ fontSize: "clamp(2rem,4vw,3.5rem)", paddingTop: "4rem" }}
        >
          Built with the BlueSun system
        </h2>
      </section>
    </div>
  );
}
