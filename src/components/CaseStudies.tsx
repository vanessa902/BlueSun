"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import "../app/cases.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const FLOATS: [number, number, number][] = [
  [6, 20, 12], [12, 32, 8], [8, 44, 6], [88, 18, 10],
  [92, 30, 14], [85, 42, 7], [90, 52, 5], [14, 56, 5],
];

type Mag = [number, number, number];
type Study = {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  mags: Mag[];
};

const STUDIES: Study[] = [
  {
    id: "heartx",
    title: "HeartX",
    category: "Brand Strategy & Product Design",
    year: "2026",
    image:
      "https://images.pexels.com/photos/7691249/pexels-photo-7691249.jpeg?auto=compress&cs=tinysrgb&w=800",
    mags: [[5, 30, 16], [10, 42, 10], [3, 52, 7], [80, 70, 14], [85, 82, 9], [78, 60, 6]],
  },
  {
    id: "swave",
    title: "Swave®",
    category: "Web Design & Identity",
    year: "2025",
    image:
      "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800",
    mags: [[82, 55, 16], [88, 68, 10], [78, 72, 7], [85, 42, 6], [90, 80, 8]],
  },
  {
    id: "eduspark",
    title: "EduSpark",
    category: "Brand Strategy & Web Design",
    year: "2023",
    image:
      "https://images.pexels.com/photos/5428003/pexels-photo-5428003.jpeg?auto=compress&cs=tinysrgb&w=800",
    mags: [[4, 24, 16], [10, 36, 10], [2, 44, 7], [78, 78, 14], [84, 88, 8]],
  },
  {
    id: "greenergy",
    title: "Greenergy",
    category: "Brand Strategy & Web Design",
    year: "2022",
    image:
      "https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=800",
    mags: [[82, 26, 14], [88, 38, 10], [78, 44, 7], [84, 54, 5], [90, 60, 8]],
  },
];

function ParallaxSquare({
  pos,
  index,
  progress,
}: {
  pos: [number, number, number];
  index: number;
  progress: MotionValue<number>;
}) {
  const [x, y, size] = pos;
  const py = useSpring(useTransform(progress, [0, 1], [0, -(80 + index * 30)]), {
    stiffness: 40,
    damping: 20,
  });
  return (
    <motion.div
      style={{ position: "absolute", left: `${x}%`, top: `${y}%`, y: py }}
      aria-hidden
    >
      <motion.div
        className="cs-float"
        style={{ width: size, height: size }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3 + index * 0.4,
          ease: "easeInOut",
          repeat: Infinity,
          delay: index * 0.3,
        }}
      />
    </motion.div>
  );
}

function MagSquare({
  sq,
  mx,
  my,
}: {
  sq: Mag;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const [sx, sy, size] = sq;
  const cfg = { stiffness: 80, damping: 18, mass: 0.6 };
  const tx = useSpring(useTransform(mx, (v) => (v - sx / 100) * 40), cfg);
  const ty = useSpring(useTransform(my, (v) => (v - sy / 100) * 40), cfg);
  return (
    <motion.div
      className="cs-mag"
      style={{ left: `${sx}%`, top: `${sy}%`, width: size, height: size, x: tx, y: ty }}
      aria-hidden
    />
  );
}

function CaseCard({ data, index }: { data: Study; index: number }) {
  const [hover, setHover] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  return (
    <motion.article
      className="cs-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        mx.set(0.5);
        my.set(0.5);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cs-card__img" src={data.image} alt={data.title} />

      {data.mags.map((sq, i) => (
        <MagSquare key={i} sq={sq} mx={mx} my={my} />
      ))}

      <div className="cs-pixels">
        {Array.from({ length: 96 }).map((_, i) => {
          const row = Math.floor(i / 12);
          const col = i % 12;
          const delayIn = (row + col) * 0.018;
          const delayOut = (8 - row + (12 - col)) * 0.012;
          return (
            <motion.div
              key={i}
              className="cs-pixel"
              initial={{ scale: 0, opacity: 0 }}
              animate={hover ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{
                duration: 0.25,
                delay: hover ? delayIn : delayOut,
                ease: EASE,
              }}
            />
          );
        })}
      </div>

      <div className="cs-plus">+</div>

      <div className="cs-plate">
        <div className="cs-plate__title">{data.title}</div>
        <div className="cs-plate__meta">
          <span className="cs-cat">{data.category}</span>
          <span className="cs-year">{data.year}</span>
        </div>
      </div>
    </motion.article>
  );
}

/* ---- marquee logos ---- */
type IconType =
  | "code" | "dots" | "circle-ring" | "arrow"
  | "wave-circle" | "lines" | "bolt" | "plus";

function Icon({ type }: { type: IconType }) {
  switch (type) {
    case "code":
      return (
        <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6,4 1,9 6,14" /><polyline points="16,4 21,9 16,14" /><line x1="13" y1="2" x2="9" y2="16" />
        </svg>
      );
    case "dots":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="#000">
          {[3, 10, 17].map((cx) => [3, 10, 17].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" />))}
        </svg>
      );
    case "circle-ring":
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth={2}>
          <circle cx="11" cy="11" r="9" /><circle cx="11" cy="11" r="4" />
        </svg>
      );
    case "arrow":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="16" x2="16" y2="2" /><polyline points="7,2 16,2 16,11" />
        </svg>
      );
    case "wave-circle":
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="9" /><path d="M5 11Q8 7 11 11Q14 15 17 11" />
        </svg>
      );
    case "lines":
      return (
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="#000" strokeWidth={2.2} strokeLinecap="round">
          <line x1="0" y1="3" x2="24" y2="3" /><line x1="6" y1="9" x2="24" y2="9" /><line x1="0" y1="15" x2="18" y2="15" />
        </svg>
      );
    case "bolt":
      return (
        <svg width="14" height="20" viewBox="0 0 14 20" fill="#000">
          <polygon points="8,0 0,11 6,11 6,20 14,9 8,9" />
        </svg>
      );
    case "plus":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#000">
          <rect x="7.5" y="0" width="3" height="18" /><rect x="0" y="7.5" width="18" height="3" />
        </svg>
      );
  }
}

const LOGOS: [string, IconType][] = [
  ["Codecraft_", "code"], ["ennLabs", "dots"], ["GlobalBank", "circle-ring"],
  ["45 Degrees°", "arrow"], ["AlphaWave", "wave-circle"], ["Biosynthesis", "lines"],
  ["Boltshift", "bolt"], ["Clandestine", "plus"],
];

export default function CaseStudies() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section className="cases" ref={ref} id="projects">
      <div className="cases__top">
        <div className="cases__floats">
          {FLOATS.map((pos, i) => (
            <ParallaxSquare key={i} pos={pos} index={i} progress={scrollYProgress} />
          ))}
        </div>
        <motion.div
          className="cases__head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="cs-badge">Projects</span>
          <h2 className="cs-heading">
            Insights from <span className="cs-muted">Our</span>
            <br />
            <span className="cs-muted">Case Studies</span>
          </h2>
        </motion.div>
      </div>

      <div className="cases__grid">
        <div className="cases__grid-inner">
          {STUDIES.map((s, i) => (
            <CaseCard key={s.id} data={s} index={i} />
          ))}
        </div>
      </div>

      <div className="cases__footer">
        <div className="cases__cta">
          <div className="cs-footplus">+</div>
          <p className="cs-foottext">
            We partner with ambitious brands that are ready to move beyond
            fragmented visuals and shallow quick fixes — turning their identity,
            website, and messaging into one focused engine for growth.
          </p>
          <button className="cs-cta-btn" type="button">
            <span className="cs-cta-btn__label">Let&apos;s work together</span>
            <span className="cs-cta-btn__badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                <path d="M18.75 6V15.75C18.75 15.949 18.671 16.14 18.53 16.28C18.39 16.421 18.199 16.5 18 16.5C17.801 16.5 17.61 16.421 17.47 16.28C17.329 16.14 17.25 15.949 17.25 15.75V7.81L6.53 18.53C6.39 18.671 6.199 18.75 6 18.75C5.801 18.75 5.61 18.671 5.47 18.53C5.329 18.39 5.25 18.199 5.25 18C5.25 17.801 5.329 17.61 5.47 17.47L16.19 6.75H8.25C8.051 6.75 7.86 6.671 7.72 6.53C7.579 6.39 7.5 6.199 7.5 6C7.5 5.801 7.579 5.61 7.72 5.47C7.86 5.329 8.051 5.25 8.25 5.25H18C18.199 5.25 18.39 5.329 18.53 5.47C18.671 5.61 18.75 5.801 18.75 6Z" />
              </svg>
            </span>
          </button>
        </div>

        <div className="cases__marquee">
          <div className="cases__marquee-track marquee-projects">
            {[...LOGOS, ...LOGOS].map(([name, icon], i) => (
              <span className="cs-logo" key={i}>
                <Icon type={icon} />
                <span className="cs-logo__name">{name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="cases__spacer" />
    </section>
  );
}
