"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";

// Scroll-driven background video, served same-origin from /public (no CORS).
// NEXT_PUBLIC_BASE_PATH is set to the repo subpath on GitHub Pages, empty locally.
const VIDEO_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/construction.mp4`;

export default function VeldaraPage() {
  useEffect(() => {
    let destroyed = false;
    const cleanups: Array<() => void> = [];
    const onWin = (
      ev: string,
      fn: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions
    ) => {
      window.addEventListener(ev, fn, opts);
      cleanups.push(() => window.removeEventListener(ev, fn, opts));
    };

    // ===================== SMOOTH SCROLL (Lenis) =====================
    // Smooths scrollY so the video scrub interpolates between frames instead
    // of jumping per wheel notch — the immersive "video advances with you" feel.
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    function lenisLoop(time: number) {
      if (destroyed) return;
      lenis.raf(time);
      requestAnimationFrame(lenisLoop);
    }
    requestAnimationFrame(lenisLoop);
    cleanups.push(() => lenis.destroy());

    // ===================== SCROLL VIDEO =====================
    const canvas = document.getElementById("video-canvas") as HTMLCanvasElement;
    const videoEl = document.getElementById(
      "video-fallback"
    ) as HTMLVideoElement;
    const ctx = canvas.getContext("2d")!;
    const frames: ImageBitmap[] = [];
    let framesReady = false;
    let lastFrameIndex = -1;
    let videoSeeking = false;

    function resizeCanvas() {
      const dpr = Math.min(devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      lastFrameIndex = -1;
    }

    async function extractFrames() {
      try {
        const response = await fetch(VIDEO_URL, { mode: "cors" });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        video.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject();
          setTimeout(() => reject(), 15000);
        });

        const scale = Math.min(1, 1280 / video.videoWidth);
        const scaledWidth = Math.round(video.videoWidth * scale);
        const scaledHeight = Math.round(video.videoHeight * scale);
        const frameCount = Math.max(
          30,
          Math.min(120, Math.round(video.duration * 24))
        );

        for (let i = 0; i < frameCount; i++) {
          if (destroyed) return;
          const time = (i / (frameCount - 1)) * (video.duration - 0.05);
          video.currentTime = time;
          await new Promise<void>((resolve, reject) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              resolve();
            };
            video.addEventListener("seeked", onSeeked);
            setTimeout(() => {
              video.removeEventListener("seeked", onSeeked);
              reject();
            }, 3000);
          });
          const bitmap = await createImageBitmap(video, {
            resizeWidth: scaledWidth,
            resizeHeight: scaledHeight,
          });
          frames.push(bitmap);
        }

        if (frames.length > 0) {
          framesReady = true;
          canvas.style.visibility = "visible";
          videoEl.style.display = "none";
        }
        URL.revokeObjectURL(objectUrl);
      } catch {
        /* fallback to video seeking */
      }
    }

    function getScrollBounds() {
      const vh = window.innerHeight;
      return {
        start: vh * 0.5,
        end: document.documentElement.scrollHeight - vh,
      };
    }

    function getProgress() {
      const { start, end } = getScrollBounds();
      const range = end - start;
      if (range <= 0) return 0;
      return Math.max(0, Math.min(1, (window.scrollY - start) / range));
    }

    function drawFrame(frame: ImageBitmap) {
      const cw = canvas.width,
        ch = canvas.height;
      const s = Math.max(cw / frame.width, ch / frame.height);
      const dw = frame.width * s,
        dh = frame.height * s;
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    function videoTick() {
      if (destroyed) return;
      const progress = getProgress();
      if (framesReady && frames.length > 0) {
        const idx = Math.round(progress * (frames.length - 1));
        if (idx !== lastFrameIndex) {
          lastFrameIndex = idx;
          if (frames[idx]) drawFrame(frames[idx]);
        }
      } else if (
        videoEl.duration &&
        isFinite(videoEl.duration) &&
        videoEl.readyState >= 1
      ) {
        const target = progress * videoEl.duration;
        if (!videoSeeking && Math.abs(videoEl.currentTime - target) > 0.001) {
          videoSeeking = true;
          videoEl.currentTime = target;
        }
      }
      requestAnimationFrame(videoTick);
    }

    videoEl.addEventListener("seeked", () => {
      videoSeeking = false;
    });
    videoEl.addEventListener("stalled", () => {
      videoSeeking = false;
    });
    videoEl.addEventListener("loadeddata", () => {
      videoEl.currentTime = 0;
    });
    canvas.style.visibility = "hidden";

    resizeCanvas();
    onWin("resize", resizeCanvas);
    requestAnimationFrame(videoTick);
    extractFrames();

    // ===================== PARTICLES =====================
    const pCanvas = document.getElementById(
      "particles-canvas"
    ) as HTMLCanvasElement;
    const pCtx = pCanvas.getContext("2d")!;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    function createParticles() {
      particles = [];
      const count = Math.floor((pCanvas.width * pCanvas.height) / 12000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * pCanvas.width,
          y: Math.random() * pCanvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
    }

    function resizeParticles() {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
      createParticles();
    }

    function animateParticles() {
      if (destroyed) return;
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = pCanvas.width;
        if (p.x > pCanvas.width) p.x = 0;
        if (p.y < 0) p.y = pCanvas.height;
        if (p.y > pCanvas.height) p.y = 0;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        pCtx.fill();
      }
      requestAnimationFrame(animateParticles);
    }

    resizeParticles();
    onWin("resize", resizeParticles);
    requestAnimationFrame(animateParticles);

    // ===================== HERO FADE =====================
    function updateHeroOpacity() {
      const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.3));
      const hero = document.getElementById("hero");
      if (hero) hero.style.opacity = String(fade);
    }
    onWin("scroll", updateHeroOpacity, { passive: true });

    // ===================== FIXED CARDS =====================
    const fixedCards = document.getElementById("fixed-cards") as HTMLElement;
    const cardsGrid = fixedCards.querySelector(".grid") as HTMLElement;

    function tickCards() {
      if (destroyed) return;
      const trigger = document.getElementById("cards-trigger") as HTMLElement;
      const rect = trigger.getBoundingClientRect();
      const triggerTop = rect.top + window.scrollY;
      const triggerHeight = rect.height;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const start = triggerTop - vh * 0.5;
      const end = triggerTop + triggerHeight - vh * 0.3;
      const range = end - start;

      let progress = range > 0 ? (scrollY - start) / range : 0;
      progress = Math.max(0, Math.min(1, progress));

      const isActive = scrollY >= start - vh * 0.2 && scrollY <= end + vh * 0.3;
      const fadeIn = Math.min(
        1,
        Math.max(0, (scrollY - (start - vh * 0.2)) / (vh * 0.2))
      );
      const fadeOut = Math.min(
        1,
        Math.max(0, (end + vh * 0.3 - scrollY) / (vh * 0.3))
      );
      const containerOpacity = isActive ? Math.min(fadeIn, fadeOut) : 0;

      fixedCards.style.opacity = String(containerOpacity);
      fixedCards.style.pointerEvents = containerOpacity > 0.1 ? "auto" : "none";

      const isMobile = window.innerWidth < 768;
      const revealPct = progress * 130;
      if (isMobile) {
        cardsGrid.style.maskImage = `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`;
        cardsGrid.style.webkitMaskImage = `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`;
      } else {
        cardsGrid.style.maskImage = `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;
        cardsGrid.style.webkitMaskImage = `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;
      }

      requestAnimationFrame(tickCards);
    }
    requestAnimationFrame(tickCards);

    // ===================== SECTION 3 INTERSECTION =====================
    const sectionThreeInner = document.getElementById(
      "section-three-inner"
    ) as HTMLElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionThreeInner.classList.add("visible");
          observer.unobserve(sectionThreeInner);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionThreeInner);
    cleanups.push(() => observer.disconnect());

    return () => {
      destroyed = true;
      cleanups.forEach((fn) => fn());
      frames.forEach((f) => f.close?.());
    };
  }, []);

  return (
    <>
      {/* Scroll Video Background */}
      <div id="scroll-video-container">
        <canvas id="video-canvas" />
        <video
          id="video-fallback"
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          src={VIDEO_URL}
        />
        <div className="overlay" />
      </div>

      {/* Particles */}
      <canvas id="particles-canvas" />

      {/* Fixed Cards */}
      <div id="fixed-cards">
        <div className="grid">
          <div className="card">
            <h3>Explore Veldara</h3>
            <p>
              Veldara merges the elegance of Svelte 5 with the depth of Three.js
              within easy reach. It&apos;s crafted to be robust and adaptable
              while remaining intuitive and simple to grasp.
            </p>
          </div>
          <div className="card">
            <h3>Unlock Three.js</h3>
            <p>
              The web is growing increasingly dimensional. At its heart, Veldara
              offers a composable declarative API for building performant
              Three.js experiences on the web.
            </p>
          </div>
          <div className="card">
            <h3>Connect Everything</h3>
            <p>
              Veldara ships with tooling for physics, XR, animation, layouting,
              model loading, and extensive utilities to make building compelling
              3D apps for the web effortless.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation (Lumentrack menu) */}
      <Navbar />

      {/* Main Content */}
      <div id="content">
        {/* Section 1: Hero */}
        <section id="hero">
          <div className="gradient-overlay" />
          <div className="content">
            <p className="subtitle">Our Purpose:</p>
            <h1>
              Instantly craft immersive{" "}
              <span className="underlined">
                <span className="line" />
                <span>3D worlds</span>
              </span>{" "}
              on the web.
            </h1>
            <div className="ctas">
              <div className="code-box">
                <span className="prompt">&gt;</span>
                <code>npm i @veldara/core</code>
              </div>
              <a href="#" className="cta-btn">
                Get Started <span>&rarr;</span>
              </a>
            </div>
          </div>
          <div className="bounce-arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </section>

        {/* Immersive video-travel zone (longer = slower, more cinematic scrub) */}
        <div style={{ height: "320vh" }} />

        {/* Cards Trigger Zone */}
        <div id="cards-trigger" style={{ height: "260vh" }} />

        {/* Spacer */}
        <div style={{ height: "160vh" }} />

        {/* Section 3 */}
        <section id="section-three">
          <div className="inner" id="section-three-inner">
            <p>Presenting</p>
            <h2>Veldara 8</h2>
          </div>
        </section>
      </div>
    </>
  );
}
