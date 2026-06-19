"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import "../app/projects.css";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const IMG = (path: string) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F${path}&w=1280&q=85`;

type Project = {
  n: string;
  name: string;
  category: string;
  images: [string, string, string];
};

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Nextlevel Studio",
    category: "Client",
    images: [
      IMG("hf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png"),
      IMG("hf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png"),
      IMG("hf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png"),
    ],
  },
  {
    n: "02",
    name: "Aura Brand Identity",
    category: "Personal",
    images: [
      IMG("hf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png"),
      IMG("hf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png"),
      IMG("hf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png"),
    ],
  },
  {
    n: "03",
    name: "Solaris Digital",
    category: "Client",
    images: [
      IMG("hf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png"),
      IMG("hf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png"),
      IMG("hf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png"),
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
