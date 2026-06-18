import type { CSSProperties } from "react";
import "../app/dock.css";

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

// Temporary construction images.
const IMAGES = [
  U("1564013799919-ab600027ffc6"),
  U("1503387762-592deb58ef4e"),
  U("1504307651254-35680f356dfd"),
  U("1541888946425-d81bb19240f5"),
  U("1486406146926-c627a92ad1ab"),
  U("1565043666747-69f6646db940"),
  U("1590725140246-20acdee442be"),
  U("1581094794329-c8112a89af12"),
];

const MAX_P = IMAGES.length;
const MAX_Z = 5;

export default function ProjectsDock() {
  return (
    <section className="dock" id="projects">
      <span className="dock__label">Projects ■</span>
      <nav
        style={
          {
            "--max-p": MAX_P,
            "--max-z": MAX_Z,
            "--p": (MAX_P + 1) / 2,
            "--z": (MAX_Z + 1) / 2,
          } as CSSProperties
        }
      >
        {IMAGES.map((src, i) => (
          <a key={i} href="#" style={{ ["--i"]: i } as CSSProperties}>
            <span
              className="img"
              style={{ ["--img"]: `url(${src})` } as CSSProperties}
            />
            <span className="hover-zone">
              {Array.from({ length: MAX_Z }).map((_, k) => (
                <i key={k} />
              ))}
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
}
