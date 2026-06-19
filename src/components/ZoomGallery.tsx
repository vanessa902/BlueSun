"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "../app/gallery.css";

const GRID = 4;
const GAP = 32; // 2rem

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// 16 temporary construction images (4×4 grid).
const IMAGES = [
  "1564013799919-ab600027ffc6",
  "1503387762-592deb58ef4e",
  "1504307651254-35680f356dfd",
  "1541888946425-d81bb19240f5",
  "1486406146926-c627a92ad1ab",
  "1565043666747-69f6646db940",
  "1590725140246-20acdee442be",
  "1581094794329-c8112a89af12",
  "1600585154340-be6161a56a0c",
  "1600607687939-ce8a6c25118c",
  "1545324418-cc1a3fa10c00",
  "1512917774080-9991f1c4c750",
  "1494522855154-9297ac14b55f",
  "1517089152318-42ec560349c0",
  "1448630360428-65456885c650",
  "1600566753190-17f0baa2a6c3",
].map(U);

export default function ZoomGallery() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const sel = pos.y * GRID + pos.x;

  // Center the selected cell under the focus frame.
  const place = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const offX = cw / 2 - (pos.x * (cw + GAP) + cw / 2);
    const offY = ch / 2 - (pos.y * (ch + GAP) + ch / 2);
    c.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;
  }, [pos]);

  useEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [place]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      if (e.key === "ArrowRight")
        setPos((p) => ({ ...p, x: Math.min(GRID - 1, p.x + 1) }));
      if (e.key === "ArrowLeft")
        setPos((p) => ({ ...p, x: Math.max(0, p.x - 1) }));
      if (e.key === "ArrowDown")
        setPos((p) => ({ ...p, y: Math.min(GRID - 1, p.y + 1) }));
      if (e.key === "ArrowUp") setPos((p) => ({ ...p, y: Math.max(0, p.y - 1) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section className={`zoomgal${open ? " open" : ""}`} id="projects">
      <div className="viewport">
        <div className="canvas" ref={canvasRef}>
          {IMAGES.map((src, i) => (
            <div
              key={i}
              className={i === sel ? "selected" : ""}
              onClick={() => {
                if (i === sel) setOpen(true);
                else setPos({ x: i % GRID, y: Math.floor(i / GRID) });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="focus-container">
        <div
          className="focus"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Zoom out" : "Zoom in"}
        />
      </div>

      <div className="map-container">
        <div className="map">
          {IMAGES.map((_, i) => (
            <div
              key={i}
              className={i === sel ? "selected" : ""}
              onClick={() => setPos({ x: i % GRID, y: Math.floor(i / GRID) })}
            />
          ))}
        </div>
      </div>

      <button className="back" onClick={() => setOpen(false)}>
        ← Back
      </button>

      <div className="mas">
        <div className="v" />
        <div className="h" />
        <div className="r" />
      </div>
    </section>
  );
}
