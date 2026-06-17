"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import "./projects.css";

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase, useGSAP);

type Project = {
  title: string;
  year: string;
  image: string;
};

const projects: Project[] = [
  { title: "Villa Aurelia", year: "2026", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80" },
  { title: "Glass Pavilion", year: "2025", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80" },
  { title: "Casa del Mar", year: "2025", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80" },
  { title: "Skyline Penthouse", year: "2024", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80" },
  { title: "The Monolith", year: "2024", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80" },
  { title: "Courtyard House", year: "2023", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80" },
  { title: "Cliff Residence", year: "2023", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80" },
  { title: "Atrium Loft", year: "2022", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80" },
  { title: "Concrete Villa", year: "2022", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80" },
  { title: "The Pavilion", year: "2021", image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80" },
];

export default function ProjectsPage() {
  const root = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const popupImgRef = useRef<HTMLImageElement>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Apply the viewport-rem base only while this page is mounted.
  useEffect(() => {
    document.documentElement.classList.add("projects-active");
    return () => document.documentElement.classList.remove("projects-active");
  }, []);

  useGSAP(
    () => {
      CustomEase.create("revealEase", "0.16,1,0.3,1");

      // Wordmark reveal
      gsap.to(".logo-path", {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.4,
        ease: "revealEase",
        delay: 0.1,
      });

      // Staggered entrance of project rows/cards
      gsap.from(".project-item", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "revealEase",
        stagger: 0.05,
        delay: 0.2,
      });
    },
    { scope: root }
  );

  // Animate layout changes between grid and list with GSAP Flip.
  const changeView = (next: "grid" | "list") => {
    if (next === view) return;
    const container = containerRef.current;
    if (!container) return;

    const items = gsap.utils.toArray<HTMLElement>(
      container.querySelectorAll(".project-item")
    );
    const state = Flip.getState(items, { props: "borderRadius" });

    setView(next);

    // Wait for React to apply the new class, then run the Flip.
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.7,
        ease: "power3.inOut",
        stagger: 0.025,
        absolute: true,
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  };

  // Hover image popup (active in list view, where thumbnails are hidden).
  const showPopup = (src: string) => {
    if (view !== "list") return;
    const overlay = overlayRef.current;
    const img = popupImgRef.current;
    if (!overlay || !img) return;
    img.src = src;
    overlay.style.display = "flex";
    gsap.fromTo(
      overlay.querySelector(".popup-content"),
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  };

  const hidePopup = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.to(overlay.querySelector(".popup-content"), {
      scale: 0.96,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        overlay.style.display = "none";
      },
    });
  };

  return (
    <div className="projects-page" ref={root}>
      {/* Header */}
      <header className="site-header">
        <div className="grid-container">
          <Link href="/" className="logo-container" aria-label="BlueSun home">
            <div className="logo-circles">
              <span className="circle circle-1" />
              <span className="circle circle-2" />
            </div>
          </Link>
          <nav className="main-nav">
            <ul>
              <li>
                <Link href="/">
                  Index<sup>01</sup>
                </Link>
              </li>
              <li>
                <a className="active" href="#">
                  Projects<sup>02</sup>
                </a>
              </li>
            </ul>
          </nav>
          <div className="contact-link">
            <a href="#contact">Get in touch</a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="grid-container">
        {/* Wordmark */}
        <div className="header-logo">
          <svg viewBox="0 0 1000 140" role="img" aria-label="Projects">
            <text
              className="logo-path"
              x="0"
              y="115"
              fontSize="150"
              fontWeight="700"
              letterSpacing="-6"
              fill="var(--warm-off-white)"
            >
              PROJECTS
            </text>
          </svg>
        </div>

        {/* Header row with title + toggle */}
        <div className="header">
          <h1>
            Selected Work<sup>{projects.length}</sup>
          </h1>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => changeView("grid")}
            >
              Grid
            </button>
            <button
              className={`toggle-btn ${view === "list" ? "active" : ""}`}
              onClick={() => changeView("list")}
            >
              List
            </button>
          </div>
        </div>

        {/* Projects */}
        <div
          ref={containerRef}
          className={`projects-container ${view}-view`}
        >
          {projects.map((p) => (
            <div
              className="project-item"
              key={p.title}
              onMouseEnter={() => showPopup(p.image)}
              onMouseLeave={hidePopup}
            >
              <div className="project-image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="project-image" src={p.image} alt={p.title} />
              </div>
              <span className="project-title">{p.title}</span>
              <span className="project-year">{p.year}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Hover popup */}
      <div id="popup-overlay" ref={overlayRef}>
        <div className="popup-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="popup-image" ref={popupImgRef} alt="" />
        </div>
      </div>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-header">
            <h2>
              <span className="light-text">Let&apos;s build something</span>
              <span className="bold-text">irreplaceable together.</span>
            </h2>
          </div>
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-section">
                <h3>Studio</h3>
                <p>BlueSun Estates</p>
                <p>Lake Como · Dubai · Malibu</p>
              </div>
            </div>
            <div className="footer-column">
              <div className="footer-section">
                <h3>Contact</h3>
                <p>
                  <a href="mailto:hello@bluesun.estate">hello@bluesun.estate</a>
                </p>
                <p>+1 (555) 012 0126</p>
              </div>
            </div>
            <div className="footer-column">
              <div className="footer-section">
                <h3>Social</h3>
                <p>
                  <a href="#">Instagram</a>
                </p>
                <p>
                  <a href="#">LinkedIn</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-logo">
          <svg viewBox="0 0 1000 130" role="img" aria-label="BlueSun">
            <text
              x="0"
              y="105"
              fontSize="140"
              fontWeight="700"
              letterSpacing="-5"
              fill="var(--warm-off-black)"
            >
              BLUESUN
            </text>
          </svg>
        </div>
      </footer>
    </div>
  );
}
