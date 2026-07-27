"use client";

import { useEffect, useState } from "react";
import "../app/header.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// "#hero" only resolves on the homepage itself, so route through it
// explicitly — this is what both the logo and the "Home" link use, so
// they always land on the same place regardless of which page you're on.
const HOME_HREF = `${BASE}/#hero`;

const NAV_ITEMS = [
  { label: "Home", href: HOME_HREF },
  { label: "About Us", href: `${BASE}/about` },
  { label: "Our Market", href: `${BASE}/our-markets` },
  { label: "Projects", href: `${BASE}/projects` },
  { label: "Contact us", href: `${BASE}/contact` },
];

/**
 * Fixed glass header: a rectangular bar with chamfered (cut) corners and a
 * frosted-glass backdrop. Logo on the left, nav links on the right.
 *
 * Below 820px the five links don't fit (they used to shrink to ~10px and
 * still run off the right edge), so they collapse into a hamburger that
 * opens a full-screen drawer. The drawer is rendered as a *sibling* of
 * <header>, not a child: .bsnav has a clip-path for its chamfered corners,
 * and clip-path clips descendants — a drawer inside it would be cut off.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="bsnav">
        <a className="bsnav__logo" href={HOME_HREF} aria-label="Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE}/logo.webp`} alt="BlueSun" />
        </a>

        <nav className="bsnav__links" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} className="bsnav__link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="bsnav__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="bsnav-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`bsnav__burger-box${open ? " is-open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      <div
        id="bsnav-drawer"
        className={`bsnav-drawer${open ? " is-open" : ""}`}
        hidden={!open}
      >
        {/* Backdrop sits behind the panel; tapping it closes the menu. */}
        <button
          type="button"
          className="bsnav-drawer__scrim"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
        <nav className="bsnav-drawer__panel" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              className="bsnav-drawer__link"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
