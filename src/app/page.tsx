"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import EnerblockSections from "@/components/EnerblockSections";
import Footer from "@/components/Footer";
import ProjectsSection from "@/components/ProjectsSection";
import StatsSection from "@/components/StatsSection";
import Rocks from "@/components/Rocks";
import Navbar from "@/components/Navbar";
import "./hud.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Scroll-driven background video, served same-origin from /public.
const VIDEO_URL = `${BASE}/hero.mp4`;

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

    const heroFrame = document.getElementById("hero-frame");
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
      // The video finishes where the post-video sections begin (#video-end),
      // not at the document bottom — so the scrub "ends" then content takes over.
      const marker = document.getElementById("video-end");
      const end = marker
        ? marker.getBoundingClientRect().top + window.scrollY - vh
        : document.documentElement.scrollHeight - vh;
      return { start: vh * 0.5, end };
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

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const line1 = document.getElementById("hf-line1");
    const line2 = document.getElementById("hf-line2");
    const hfCenter = document.getElementById("hf-center");

    function videoTick() {
      if (destroyed) return;
      const progress = getProgress();

      // Keep the SVG HUD frame for the whole video; fade it only as it ends.
      if (heroFrame) {
        heroFrame.style.opacity = String(
          1 - Math.max(0, Math.min(1, (progress - 0.88) / 0.12))
        );
        heroFrame.style.setProperty("--hero-p", String(progress));
      }
      // Typewriter hero text: types on scroll, stays visible through the
      // transition, then fades out near the end.
      if (line1 && line2 && hfCenter) {
        const typeP = clamp01(progress / 0.28);
        const r1 = clamp01(typeP * 2);
        const r2 = clamp01(typeP * 2 - 1);
        line1.style.width = `${Math.round(line1.scrollWidth * r1)}px`;
        line2.style.width = `${Math.round(line2.scrollWidth * r2)}px`;
        const typed = r1 >= 1 && r2 >= 1;
        line1.classList.toggle("is-typing", r1 < 1);
        line2.classList.toggle("is-typing", r1 >= 1 && r2 < 1);
        line1.classList.toggle("is-done", r1 >= 1);
        line2.classList.toggle("is-done", typed);
        const fadeOut = clamp01((progress - 0.78) / 0.12);
        hfCenter.style.opacity = String(1 - fadeOut);
        hfCenter.style.visibility = fadeOut >= 1 ? "hidden" : "visible";
      }
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

    // ===================== HERO FADE =====================
    function updateHeroOpacity() {
      const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.3));
      const hero = document.getElementById("hero");
      if (hero) hero.style.opacity = String(fade);
    }
    onWin("scroll", updateHeroOpacity, { passive: true });

    return () => {
      destroyed = true;
      cleanups.forEach((fn) => fn());
      frames.forEach((f) => f.close?.());
    };
  }, []);

  return (
    <>
      {/* Fixed glass header with chamfered (cut) corners */}
      <Navbar />

      {/* Scroll Video Background — clipped to the SVG hero-frame shape via
           clip-path polygon in globals.css (no inline mask needed). */}
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
      </div>



      {/* Scroll-driven floating rocks */}
      <Rocks />

      {/* SVG HUD hero frame (stays during the whole video; fades as it ends) */}
      <div id="hero-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hf-svg" src={`${BASE}/hero-frame.svg`} alt="" />
        <div className="hf-center" id="hf-center">
          <p className="hf-eyebrow">Residential &amp; Commercial</p>
          <h1 className="hf-title">
            <span className="hf-line" id="hf-line1">
              Construction
            </span>
            <span className="hf-line hf-line--reg" id="hf-line2">
              Experts
            </span>
          </h1>
        </div>
        <div className="hf-scroll">
          SCROLL<span className="chev">⌄</span>
        </div>
        <div className="hf-chip">
          <span className="dim">Engineering.</span> <b>Construction.</b>{" "}
          <b>Solutions.</b>
        </div>
      </div>


      {/* Main Content */}
      <div id="content">
        {/* Section 1: Hero (scroll zone; visuals are the fixed SVG frame + video) */}
        <section id="hero" />

        {/* Immersive video-travel zone (longer = slower, more cinematic scrub) */}
        <div style={{ height: "320vh" }} />


        {/* Smooth fade from the video into the black intro — no hard cut. */}
        <div className="video-to-black" />

        {/* Video scrub finishes here; opaque scroll sections take over. */}
        <div id="video-end" />
        <EnerblockSections />
        <ProjectsSection />
        <StatsSection />
        <Footer />
      </div>
    </>
  );
}
