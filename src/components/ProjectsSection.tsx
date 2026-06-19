"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import "../app/projects.css";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1280&q=85`;

type Project = {
  n: string;
  name: string;
  category: string;
  images: [string, string, string];
};

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Riverside Complex",
    category: "Residential",
    images: [
      U("1504307651254-35680f356dfd"),
      U("1541888946425-d81bb19240f5"),
      U("1503387762-592deb58ef4e"),
    ],
  },
  {
    n: "02",
    name: "Industrial Park",
    category: "Commercial",
    images: [
      U("1581094794329-c8112c4e1190"),
      U("1565043666747-69f6646db940"),
      U("1553413077-190dd305871c"),
    ],
  },
  {
    n: "03",
    name: "Harbor Tower",
    category: "Mixed-Use",
    images: [
      U("1486406146926-c627a92ad1ab"),
      U("1564013799919-ab600027ffc6"),
      U("1545324418-cc1a3fa10c00"),
    ],
  },
];

function ProjectCard({
  project,
  index,
  total,
  sectionProgress,
}: {
  project: Project;
  index: number;
  total: number;
  sectionProgress: MotionValue<number>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: cardScroll } = useScroll({
    target: cardRef,
    offset: ["start end", "start 0.35"],
  });

  const targetScale = 1 - (total - 1 - index) * 0.05;
  const scale = useTransform(sectionProgress, [index / total, 1], [1, targetScale]);

  const cardY = useTransform(cardScroll, [0, 1], [120, 0]);
  const cardOpacity = useTransform(cardScroll, [0, 0.6], [0, 1]);

  const imgY1 = useTransform(cardScroll, [0, 1], [40, 0]);
  const imgY2 = useTransform(cardScroll, [0, 1], [60, 0]);

  return (
    <div className="proj-card-wrap" ref={cardRef}>
      <motion.article
        className="proj-card"
        style={{
          scale,
          top: `calc(var(--proj-sticky) + ${index * 28}px)`,
          y: cardY,
          opacity: cardOpacity,
        }}
      >
        <div className="proj-card__top">
          <span className="proj-card__num">{project.n}</span>
          <div className="proj-card__info">
            <span className="proj-card__cat">{project.category}</span>
            <span className="proj-card__name">{project.name}</span>
          </div>
          <button className="proj-live" type="button">
            Live Project
          </button>
        </div>

        <div className="proj-card__grid">
          <div className="proj-card__col1">
            <motion.div style={{ y: imgY1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="proj-img proj-img--t" src={project.images[0]} alt="" loading="lazy" />
            </motion.div>
            <motion.div style={{ y: imgY2 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="proj-img proj-img--b" src={project.images[1]} alt="" loading="lazy" />
            </motion.div>
          </div>
          <div className="proj-card__col2">
            <motion.div style={{ y: imgY1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="proj-img proj-img--tall" src={project.images[2]} alt="" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function ProjectsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section className="proj" ref={ref} id="work">
      <motion.h2
        className="proj__heading"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "50px", amount: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        Our Market
      </motion.h2>

      <div className="proj__list">
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.n}
            project={p}
            index={i}
            total={PROJECTS.length}
            sectionProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
