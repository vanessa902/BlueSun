"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  cubicBezier,
  type MotionValue,
} from "framer-motion";
import "../../app/preview/stats.css";

// Forceful ease-out: cards shoot up fast on scroll-in, then settle.
const FORCE = cubicBezier(0.16, 1, 0.3, 1);

type Stat = {
  label: string;
  num: number;
  suffix: string;
  image: string;
};

const STATS: Stat[] = [
  {
    label: "Years\nExperience",
    num: 12,
    suffix: "+",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=700&fit=crop&q=80",
  },
  {
    label: "Completed\nProjects",
    num: 25,
    suffix: "K+",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=700&fit=crop&q=80",
  },
  {
    label: "Award\nWinning",
    num: 110,
    suffix: "+",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=700&fit=crop&q=80",
  },
  {
    label: "Satisfied\nClients",
    num: 4,
    suffix: "M+",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112c4e1190?w=600&h=700&fit=crop&q=80",
  },
];

function StatCard({
  stat,
  index,
  progress,
}: {
  stat: Stat;
  index: number;
  progress: MotionValue<number>;
}) {
  // Stagger each card harder so they launch up one after another.
  const startAt = index * 0.16;
  const endAt = Math.min(startAt + 0.42, 1);

  const y = useTransform(progress, [startAt, endAt], [280, 0], { ease: FORCE });
  const opacity = useTransform(
    progress,
    [startAt, startAt + 0.18],
    [0, 1]
  );

  return (
    <motion.div
      className={`stat-card ${index % 2 === 0 ? "stat-card--low" : "stat-card--high"}`}
      style={{ y, opacity }}
    >
      <div className="stat-card__img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stat.image} alt="" loading="lazy" />
      </div>
      <div className="stat-card__label">{stat.label}</div>
      <div className="stat-card__bottom">
        <span className="stat-card__value">
          <span
            className="stat-card__count"
            style={{ "--target": stat.num } as React.CSSProperties}
          />
          {stat.suffix}
        </span>
        <span className="stat-card__arrow">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </span>
      </div>
    </motion.div>
  );
}

export default function StatsSectionPreview() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.2"],
  });

  // Trigger the CSS count-up once the stats scroll into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-counting");
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="stats" ref={ref}>
      {/* Infinite CSS marquee — the track holds two identical copies and
          slides -50%, so the loop is seamless. */}
      <div className="stats-marquee" aria-hidden="true">
        <div className="stats-marquee__track">
          {[0, 1].map((i) => (
            <span className="stats-marquee__copy" key={i}>
              Engineering&nbsp;&mdash;&nbsp;Construction&nbsp;&mdash;&nbsp;Solutions&nbsp;&mdash;&nbsp;Residencial&nbsp;&mdash;&nbsp;Comercial&nbsp;&mdash;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="stats__grid">
        {STATS.map((s, i) => (
          <StatCard key={i} stat={s} index={i} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
