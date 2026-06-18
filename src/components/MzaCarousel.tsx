"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import "../app/mza.css";

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

type Slide = { title: string; kicker: string; text: string; img: string };

const SLIDES: Slide[] = [
  {
    title: "Riverside Tower",
    kicker: "Commercial",
    text: "A 24-storey office tower delivered with industrialized envelopes and structure, on schedule and to code.",
    img: U("1486406146926-c627a92ad1ab"),
  },
  {
    title: "Maple Court Residences",
    kicker: "Residential",
    text: "120 multi-family units produced offsite and assembled fast, with consistent quality and cost control.",
    img: U("1564013799919-ab600027ffc6"),
  },
  {
    title: "Northgate Logistics Park",
    kicker: "Industrial",
    text: "A large-span distribution facility engineered for throughput, automation and future growth.",
    img: U("1504307651254-35680f356dfd"),
  },
  {
    title: "Civic Center Renovation",
    kicker: "Public",
    text: "A structural remodel that modernized performance and space without compromising the original integrity.",
    img: U("1503387762-592deb58ef4e"),
  },
  {
    title: "Harbor Mixed-Use",
    kicker: "Mixed-Use",
    text: "An integrated development combining living, working and retail in a single industrialized program.",
    img: U("1541888946425-d81bb19240f5"),
  },
];

const AUTOPLAY_MS = 6000;

export default function MzaCarousel() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const n = SLIDES.length;

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + n) % n),
    [n]
  );

  // Coverflow layout based on distance from the active slide.
  const layout = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>(".mzaCarousel-slide");
    slides.forEach((el, i) => {
      let off = i - active;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      const abs = Math.abs(off);
      const tx = off * 62;
      const tz = -abs * 180;
      const ry = Math.max(-45, Math.min(45, -off * 32));
      const sc = 1 - Math.min(abs * 0.12, 0.42);
      el.style.transform = `translate(-50%, -50%) translateX(${tx}%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      el.style.opacity = abs > 2 ? "0" : "1";
      el.style.zIndex = String(100 - abs);
      el.style.pointerEvents = off === 0 ? "auto" : "none";
      el.dataset.state = off === 0 ? "active" : "";
    });
  }, [active, n]);

  useEffect(() => {
    layout();
  }, [layout]);

  useEffect(() => {
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layout]);

  // Autoplay + progress bar.
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    let paused = false;
    const root = rootRef.current;

    const onEnter = () => (paused = true);
    const onLeave = () => {
      paused = false;
      start = performance.now();
    };
    root?.addEventListener("pointerenter", onEnter);
    root?.addEventListener("pointerleave", onLeave);

    const loop = (t: number) => {
      if (!paused) {
        const p = Math.min(1, (t - start) / AUTOPLAY_MS);
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        if (p >= 1) {
          start = t;
          go(1);
        }
      } else {
        start = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      root?.removeEventListener("pointerenter", onEnter);
      root?.removeEventListener("pointerleave", onLeave);
    };
  }, [go]);

  // Drag / swipe + pointer bg-parallax on the active card.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let downX = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      downX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      const activeCard = track
        .querySelector<HTMLElement>('.mzaCarousel-slide[data-state="active"] .mzaCard');
      if (activeCard) {
        const r = track.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        activeCard.style.setProperty("--mzaParBgX", `${x * 18}px`);
        activeCard.style.setProperty("--mzaParBgY", `${y * 18}px`);
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - downX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    };

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [go]);

  return (
    <section
      className="mzaCarousel"
      ref={rootRef}
      id="projects"
      aria-roledescription="carousel"
    >
      <div
        className="mzaCarousel-viewport"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <div className="mzaCarousel-track" ref={trackRef}>
          {SLIDES.map((s, i) => (
            <div
              className="mzaCarousel-slide"
              key={i}
              role="group"
              aria-roledescription="slide"
            >
              <article
                className="mzaCard"
                style={{ ["--mzaCard-bg"]: `url(${s.img})` } as CSSProperties}
              >
                <div className="mzaCard-head">
                  <p className="mzaCard-kicker">{s.kicker}</p>
                  <h3 className="mzaCard-title">{s.title}</h3>
                </div>
                <p className="mzaCard-text">{s.text}</p>
                <div className="mzaCard-actions">
                  <button className="mzaBtn" type="button">
                    View project
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="mzaCarousel-controls">
          <button
            className="mzaCarousel-prev"
            aria-label="Previous"
            onClick={() => go(-1)}
          >
            ‹
          </button>
          <button
            className="mzaCarousel-next"
            aria-label="Next"
            onClick={() => go(1)}
          >
            ›
          </button>
        </div>

        <div className="mzaCarousel-pagination" role="tablist">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className="mzaCarousel-dot"
              aria-selected={active === i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      <div className="mzaCarousel-progress">
        <span className="mzaCarousel-progressBar" ref={barRef} />
      </div>
    </section>
  );
}
