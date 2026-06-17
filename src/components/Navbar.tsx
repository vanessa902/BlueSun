"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = ["Residences", "Collections", "About", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#" className="font-display text-xl tracking-[0.2em] uppercase">
          Blue<span className="text-gold">Sun</span>
        </a>

        <ul className="hidden items-center gap-9 text-sm tracking-wide text-muted md:flex">
          {links.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="relative transition-colors hover:text-foreground"
              >
                {link}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/projects"
              className="relative transition-colors hover:text-foreground"
            >
              Projects
            </Link>
          </li>
        </ul>

        <a
          href="#contact"
          className="u-btn--1 rounded-full border border-gold/60 px-5 py-2 text-sm text-gold-soft transition-colors hover:bg-gold hover:text-background"
        >
          <span data-button-animate-chars>Private Viewing</span>
        </a>
      </nav>
    </header>
  );
}
