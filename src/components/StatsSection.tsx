"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import "../app/stats.css";

type Stat = {
  label: string;
  value: string;
  image: string;
};

const STATS: Stat[] = [
  {
    label: "Years\nExperience",
    value: "12+",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=700&fit=crop&q=80",
  },
  {
    label: "Completed\nProjects",
    value: "25K+",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=700&fit=crop&q=80",
  },
  {
    label: "Award\nWinning",
    value: "110+",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=700&fit=crop&q=80",
  },
  {
    label: "Satisfied\nClients",
    value: "4M+",
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
  const startAt = index * 0.12;
  const endAt = Math.min(startAt + 0.5, 1);

  const y = useTransform(progress, [startAt, endAt], [120, 0]);
  const opacity = useTransform(progress, [startAt, startAt + 0.35], [0, 1]);

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
        <span className="stat-card__value">{stat.value}</span>
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

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.2"],
  });

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
