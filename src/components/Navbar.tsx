"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const links = ["Residences", "Collections", "About", "Journal", "Contact"];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 40);
  });

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a
          href="#"
          className="font-display text-xl tracking-[0.2em] uppercase"
        >
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
        </ul>

        <a
          href="#contact"
          className="rounded-full border border-gold/60 px-5 py-2 text-sm text-gold-soft transition-colors hover:bg-gold hover:text-background"
        >
          Private Viewing
        </a>
      </nav>
    </motion.header>
  );
}
