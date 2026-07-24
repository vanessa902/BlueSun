"use client";

import { useEffect, useRef } from "react";
import ScrollVideoShowcase, { FRAMES_PER_SCROLL } from "@/components/ScrollVideoShowcase";
import "../app/enerblock.css";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

// The video file keeps the same name across every swap, so GitHub Pages'
// CDN and browsers can keep serving a cached, stale copy after a new deploy
// even though the underlying bytes changed. A query-string cache-buster
// forces both to treat it as a new resource — GitHub Pages serves the file
// by path and ignores the query string, so this doesn't need any file
// rename. Bump this (e.g. to the video's own short content hash, via
// `md5sum public/home-showcase.mp4 | cut -c1-10`) every time the video is
// swapped.
const VIDEO_CACHE_BUST = "af0d248bbc";

// Each info box only makes sense over its own scene, located by extracting
// and eyeballing frames with ffmpeg — expressed as a fraction of total
// frames rather than a fixed frame number so it stays roughly in place if a
// future video swap changes the clip's length; re-check these by eye
// whenever the video changes. Each fades in, holds fully visible, then
// fades out — timed in "scrolls" (100px of wheel delta), the same unit the
// title words above already use.
//
// The clip's opening ~0.46s (11 frames) was almost entirely black night
// sky, reading as a hard "cut" rather than a deliberate shot — trimmed out
// of the video itself, then a clean ~0.5s (12 frames) black hold was
// prepended back on so the clip now opens on solid black before revealing
// the building, rather than cutting straight to it. Total duration ~15.08s
// (362 frames), so every scene's fraction below is re-derived once more.
const FADE_FRAMES = Math.round(0.5 * FRAMES_PER_SCROLL);

// Balcony/window shot, right after the "Commercial" title finishes typing
// in and holds (~t=1.55s of this clip's ~15.08s duration, hence 0.103).
const WINDOWS_SCENE_START_FRAC = 0.103;
const WINDOWS_HOLD_FRAMES = 1.5 * FRAMES_PER_SCROLL;

// Elevator-shaft/walkway flythrough, while "Construction" is still typing in
// (~t=3.45s, hence 0.229) — the Framing and Design/Engineering cards sit
// side by side over this same moment, so they share one timing window.
const FRAMING_DESIGN_SCENE_START_FRAC = 0.229;
const FRAMING_DESIGN_HOLD_FRAMES = 2 * FRAMES_PER_SCROLL;

// Same shaft, a beat later once the electrical panels/conduit come into
// view (~t=5.47s, hence 0.363) — holds a full 3 scrolls, matching how long
// that scene itself lasts (fades out almost exactly as Plumbing's scene
// begins).
const ELECTRICAL_SCENE_START_FRAC = 0.363;
const ELECTRICAL_HOLD_FRAMES = 3 * FRAMES_PER_SCROLL;

// Colored-pipe MEP corridor (~t=8.8s, hence 0.583).
const PLUMBING_SCENE_START_FRAC = 0.583;
const PLUMBING_HOLD_FRAMES = 2.5 * FRAMES_PER_SCROLL;

// Rooftop-equipment shot near the end of the clip (~t=12.53s, hence
// 0.831) — holds 4 scrolls; being the last card, it simply stays at full
// opacity through the end of the clip once that hold window runs past the
// video's own remaining length, same as the last card in a sequence
// always does.
const SOLAR_SCENE_START_FRAC = 0.831;
const SOLAR_HOLD_FRAMES = 4 * FRAMES_PER_SCROLL;

function sceneOpacity(
  frame: number,
  total: number,
  startFrac: number,
  holdFrames: number
) {
  const start = total * startFrac;
  const fadeInEnd = start + FADE_FRAMES;
  const holdEnd = fadeInEnd + holdFrames;
  const fadeOutEnd = holdEnd + FADE_FRAMES;
  return Math.min(seg(frame, start, fadeInEnd), 1 - seg(frame, holdEnd, fadeOutEnd));
}

export default function EnerblockSections() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const windowsBoxRef = useRef<HTMLDivElement>(null);
  const framingDesignRowRef = useRef<HTMLDivElement>(null);
  const electricalBoxRef = useRef<HTMLDivElement>(null);
  const plumbingBoxRef = useRef<HTMLDivElement>(null);
  const solarBoxRef = useRef<HTMLDivElement>(null);

  function handleVideoFrame(frame: number, total: number) {
    if (windowsBoxRef.current) {
      windowsBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, WINDOWS_SCENE_START_FRAC, WINDOWS_HOLD_FRAMES)
      );
    }
    if (framingDesignRowRef.current) {
      framingDesignRowRef.current.style.opacity = String(
        sceneOpacity(frame, total, FRAMING_DESIGN_SCENE_START_FRAC, FRAMING_DESIGN_HOLD_FRAMES)
      );
    }
    if (electricalBoxRef.current) {
      electricalBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, ELECTRICAL_SCENE_START_FRAC, ELECTRICAL_HOLD_FRAMES)
      );
    }
    if (plumbingBoxRef.current) {
      plumbingBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, PLUMBING_SCENE_START_FRAC, PLUMBING_HOLD_FRAMES)
      );
    }
    if (solarBoxRef.current) {
      solarBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, SOLAR_SCENE_START_FRAC, SOLAR_HOLD_FRAMES)
      );
    }
  }
  useEffect(() => {
    let destroyed = false;
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

    function tick() {
      if (destroyed) return;
      const vh = window.innerHeight;

      // Blueprint 2D -> 3D tilt
      if (stage.current) {
        const r = stage.current.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.95) - 0.1);
        stage.current.style.setProperty("--p", String(p));
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Typewriter intro title: lines start hidden ("eb-armed") and reveal
    // left-to-right with a stepped clip once the title scrolls into view.
    const title = document.getElementById("eb-intro-title");
    let io: IntersectionObserver | null = null;
    if (title) {
      title.classList.add("eb-armed");
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              title.classList.add("is-typing");
              io?.disconnect();
            }
          }
        },
        { threshold: 0.35 }
      );
      io.observe(title);
    }

    return () => {
      destroyed = true;
      io?.disconnect();
    };
  }, []);

  return (
    <div className="eb" ref={root}>
      {/* Tall pure-black scroll zone where the rock animation plays out.
          The fixed black stage + rock + text live in <Rocks/>. */}
      <div id="rock-zone" style={{ height: "960vh", background: "var(--bg-black)" }} />

      {/* 1. Intro: title + 2D->3D blueprint */}
      <section className="eb-intro" id="about">
        <div className="eb-intro__left">
          <h2 className="eb-title eb-intro__title" id="eb-intro-title">
            <span className="eb-intro__line">
              <span>WE</span>
              <span>APPROACH</span>
              <span>EACH</span>
              <span>OF</span>
            </span>
            <span className="eb-intro__line">
              <span>OUR</span>
              <span>DISCIPLINES</span>
              <span>AS</span>
              <span>A</span>
            </span>
            <span className="eb-intro__line">
              <span>GENEROUS</span>
              <span>GESTURE</span>
            </span>
            <span className="eb-intro__line">
              <span>TRYING</span>
              <span>TO</span>
              <span>REACH</span>
              <span>OUT</span>
            </span>
            <span className="eb-intro__line">
              <span>IT&rsquo;S</span>
              <span>AUDIENCE</span>
            </span>
          </h2>
          <p className="eb-intro__desc">
            Integrates enclosures, structure, and processes within
            <br />
            an industrialized and digital framework. It connects
            <br />
            design, manufacturing, and assembly to reduce
            <br />
            deviations in timelines, costs, and compliance, turning
            <br />
            construction into a planned assembly process.
          </p>
        </div>
        <div className="eb-intro__right">
          <div className="eb-bp-stage" id="eb-bp-target" ref={stage}>
            <div className="eb-bp">
              <svg viewBox="0 0 300 420" aria-label="Standard floor plan">
                <rect className="eb-bp__line" x="20" y="20" width="260" height="380" />
                <line className="eb-bp__line" x1="20" y1="120" x2="280" y2="120" />
                <line className="eb-bp__line" x1="20" y1="220" x2="280" y2="220" />
                <line className="eb-bp__line" x1="20" y1="320" x2="280" y2="320" />
                <line className="eb-bp__line" x1="150" y1="20" x2="150" y2="400" />
                <rect className="eb-bp__line" x="120" y="150" width="60" height="140" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={i} className="eb-bp__hatch" x1={40 + i * 8} y1="40" x2={40 + i * 8} y2="100" />
                ))}
              </svg>
            </div>
          </div>
          {/* The rock that "lands" here is the scroll-driven #rock-right
              (rendered in <Rocks/>), which arrives on top of this vector via
              scrolling — it is intentionally NOT a static image anymore. */}
          <div className="eb-intro__caption">
            <span className="mark">⧉</span>
            <span className="meta">
              STANDARD FLOOR PLAN AND AXONOMETRICS
              <br />
              DRAWING NO.: 158.01.00 · SCALE: 1/100
            </span>
          </div>
        </div>
      </section>

      {/* Breathing room before the pinned video kicks in. Without this the
          video's pin zone starts the instant the intro section ends (zero
          gap), so a real scroll gesture can catch it cutting in abruptly
          mid-motion instead of arriving as its own deliberate moment. */}
      <div style={{ height: "20vh", background: "var(--bg-black)" }} />

      {/* 1b. Scrollytelling video break */}
      <ScrollVideoShowcase
        videoFile={`home-showcase.mp4?v=${VIDEO_CACHE_BUST}`}
        titleLines={["Commercial", "Construction"]}
        objectFit="cover"
        fullBleed
        onFrame={handleVideoFrame}
        overlay={
          <>
            <div className="eb-infobox eb-infobox--windows" ref={windowsBoxRef}>
              <div className="eb-infobox__item">
                <h3 className="eb-infobox__title">Commercial Windows</h3>
                <p className="eb-infobox__body">
                  BlueSun provides commercial window installation and
                  replacement solutions designed to improve energy
                  efficiency, building appearance, security, and long term
                  performance for offices, retail spaces, multifamily
                  properties, and other commercial facilities.
                </p>
              </div>
            </div>
            <div className="eb-cardrow" ref={framingDesignRowRef}>
              <div className="eb-infobox">
                <div className="eb-infobox__item">
                  <h3 className="eb-infobox__title">Framing</h3>
                  <p className="eb-infobox__body">
                    Our experienced crews provide structural wood and metal
                    framing for commercial renovations, additions, tenant
                    improvements, and ground-up construction.
                  </p>
                </div>
              </div>
              <div className="eb-infobox">
                <div className="eb-infobox__item">
                  <h3 className="eb-infobox__title">
                    Design, Engineering &amp; Preconstruction
                  </h3>
                  <p className="eb-infobox__body">
                    BlueSun Services provides architectural design,
                    engineering, and project planning support to help clients
                    move from concept to construction with coordinated plans,
                    clear scopes of work, accurate documentation, and a well
                    defined execution strategy.
                  </p>
                </div>
              </div>
            </div>
            <div className="eb-infobox eb-infobox--electrical" ref={electricalBoxRef}>
              <div className="eb-infobox__item">
                <h3 className="eb-infobox__title">Electrical</h3>
                <p className="eb-infobox__body">
                  Our in house licensed electrical team provides commercial
                  electrical installations, repairs, upgrades, lighting,
                  panels, equipment connections, and complete electrical
                  systems.
                </p>
              </div>
            </div>
            <div className="eb-infobox eb-infobox--plumbing" ref={plumbingBoxRef}>
              <div className="eb-infobox__item">
                <h3 className="eb-infobox__title">Plumbing</h3>
                <p className="eb-infobox__body">
                  Plumbing team handles commercial plumbing installations,
                  repairs, piping, fixtures, system upgrades, and complete
                  plumbing solutions.
                </p>
              </div>
            </div>
            <div className="eb-infobox eb-infobox--solar" ref={solarBoxRef}>
              <div className="eb-infobox__item">
                <h3 className="eb-infobox__title">Solar Energy</h3>
                <p className="eb-infobox__body">
                  We design and install commercial solar systems that help
                  businesses reduce energy costs and improve long term energy
                  efficiency.
                </p>
              </div>
              <div className="eb-infobox__item">
                <h3 className="eb-infobox__title">Battery Storage</h3>
                <p className="eb-infobox__body">
                  Our commercial battery storage solutions provide backup
                  power, energy management, peak-demand reduction, and
                  greater control over energy costs.
                </p>
              </div>
            </div>
          </>
        }
      />

    </div>
  );
}
