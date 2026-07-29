"use client";

import { useRef } from "react";
import ScrollVideoShowcase from "@/components/ScrollVideoShowcase";
import "../app/markets-infobox.css";

// Cache-buster: GitHub Pages/browsers can keep serving a stale copy of this
// video under its unchanged filename after a swap. Bump this to the file's
// own content hash (`md5sum public/markets-showcase.mp4 | cut -c1-10`)
// every time the video changes.
const VIDEO_CACHE_BUST = "7a27b73d67";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
// Same fade-in/hold/fade-out shape as the Commercial Construction section's
// card timing, in video frames (this usage takes ScrollVideoShowcase's
// default pxPerFrame, so no custom "scrolls" unit is needed here).
const FADE_FRAMES = 10;

// Dedicated title-only lead-in before the video starts advancing, matching
// the Commercial Construction showcase above. Without it the title would play
// out over the video's own opening frames, and since it sits at top: 12vh
// while the cards sit as high as top: 6%, the two would be on screen together
// and overlap — the first card is due at frame 84 of 362, well inside the
// ~218 frames the title takes. Spending the first few scrolls on the title
// instead means it has fully faded before the video advances at all.
//
// 4 scrolls at this component's 5px/frame works out to the same 400px of
// scroll the commercial showcase spends on its own intro at 7px/frame, so
// the two read as the same beat.
const INTRO_SCROLLS = 4;

// Scene marks for the clip, located by extracting frames and eyeballing them
// (the contact sheets step through it every 0.5s). The clip runs 15.08s =
// 362 frames at 24fps, and its beats are: exterior establishing (0-72), the
// window wireframe at the entrance (84-120), a warm interior (132-156), the
// electrical panel and its conduit wireframe (162-198), a wireframed wall
// unit (210-222), the roof panel tilting open (228-246), the solar array
// revealed (252-276), and a closing window wireframe at sunset (288-348).
//
// Fractions rather than raw frame numbers because sceneOpacity multiplies by
// the total the player reports, so these survive a re-encode that shifts the
// frame count slightly.
//
// Cards are spaced so each gets the scene to itself, with only a few frames
// of crossfade where two beats butt up against each other. The card copy is
// unchanged from the previous clip — these marks re-point it at the moments
// in this one.

// Window wireframe forming over the entrance glazing (frame 84).
const WINDOWS_SCENE_START_FRAC = 0.232;
const WINDOWS_HOLD_FRAMES = 26;

// The warm living/kitchen interior (frame 134). No mechanical detail on
// screen here, which is why the comfort-led HVAC card sits over it rather
// than over one of the wireframe beats.
const HVAC_SCENE_START_FRAC = 0.370;
const HVAC_HOLD_FRAMES = 16;

// Electrical panel with the dense conduit wireframe branching off it
// (frame 166) — the clearest single moment in the clip.
const ELECTRICAL_SCENE_START_FRAC = 0.459;
const ELECTRICAL_HOLD_FRAMES = 26;

// Wall-mounted unit picked out by its own wireframe rectangle (frame 208),
// reading as the inverter/battery beside the panel.
const BATTERY_SCENE_START_FRAC = 0.575;
const BATTERY_HOLD_FRAMES = 8;

// The roof panel tilting open (frame 228). Short by necessity — the move
// only lasts about 18 frames before the panels underneath are revealed.
const ROOFING_SCENE_START_FRAC = 0.630;
const ROOFING_HOLD_FRAMES = 8;

// Solar array on the roof, held through the aerial pull-back (frame 252).
const SOLAR_SCENE_START_FRAC = 0.696;
const SOLAR_HOLD_FRAMES = 34;

function sceneOpacity(frame: number, total: number, startFrac: number, holdFrames: number) {
  const start = total * startFrac;
  const fadeInEnd = start + FADE_FRAMES;
  const holdEnd = fadeInEnd + holdFrames;
  const fadeOutEnd = holdEnd + FADE_FRAMES;
  return Math.min(seg(frame, start, fadeInEnd), 1 - seg(frame, holdEnd, fadeOutEnd));
}

/**
 * Residential services showcase — the markets-showcase.mp4 scrollytelling
 * video with six service cards revealed over their matching scenes.
 *
 * Previously lived on the Our Markets page; moved here to sit directly below
 * the Commercial Construction showcase, so the home page runs the commercial
 * story straight into the residential one.
 */
export default function MarketsShowcaseSection() {
  const windowsBoxRef = useRef<HTMLDivElement>(null);
  const electricalBoxRef = useRef<HTMLDivElement>(null);
  const batteryBoxRef = useRef<HTMLDivElement>(null);
  const solarBoxRef = useRef<HTMLDivElement>(null);
  const roofingBoxRef = useRef<HTMLDivElement>(null);
  const hvacBoxRef = useRef<HTMLDivElement>(null);

  function handleVideoFrame(frame: number, total: number) {
    if (windowsBoxRef.current) {
      windowsBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, WINDOWS_SCENE_START_FRAC, WINDOWS_HOLD_FRAMES)
      );
    }
    if (electricalBoxRef.current) {
      electricalBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, ELECTRICAL_SCENE_START_FRAC, ELECTRICAL_HOLD_FRAMES)
      );
    }
    if (batteryBoxRef.current) {
      batteryBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, BATTERY_SCENE_START_FRAC, BATTERY_HOLD_FRAMES)
      );
    }
    if (solarBoxRef.current) {
      solarBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, SOLAR_SCENE_START_FRAC, SOLAR_HOLD_FRAMES)
      );
    }
    if (roofingBoxRef.current) {
      roofingBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, ROOFING_SCENE_START_FRAC, ROOFING_HOLD_FRAMES)
      );
    }
    if (hvacBoxRef.current) {
      hvacBoxRef.current.style.opacity = String(
        sceneOpacity(frame, total, HVAC_SCENE_START_FRAC, HVAC_HOLD_FRAMES)
      );
    }
  }

  return (
    <ScrollVideoShowcase
      videoFile={`markets-showcase.mp4?v=${VIDEO_CACHE_BUST}`}
      titleLines={["Residential", "Construction"]}
      objectFit="cover"
      /* Without this the frame would shrink to 80vh to make room above for
         the title (see .eb-scrollvideo--has-title); fullBleed keeps it at
         the full 100vh it already filled and overlays the title instead,
         same as the commercial showcase. */
      fullBleed
      introScrolls={INTRO_SCROLLS}
      onFrame={handleVideoFrame}
      overlay={
        <>
          <div className="markets-infobox markets-infobox--windows" ref={windowsBoxRef}>
            <h3 className="markets-infobox__title">Windows</h3>
            <p className="markets-infobox__body">
              Our energy efficient window solutions improve home comfort,
              appearance, insulation, security, and overall energy
              performance.
            </p>
          </div>
          <div className="markets-infobox" ref={electricalBoxRef}>
            <h3 className="markets-infobox__title">Electrical Services</h3>
            <p className="markets-infobox__body">
              We offer residential electrical services including panel
              upgrades, wiring, lighting installation, troubleshooting, and
              system upgrades to ensure your home is safe, efficient, and up
              to code.
            </p>
          </div>
          <div className="markets-infobox markets-infobox--battery" ref={batteryBoxRef}>
            <h3 className="markets-infobox__title">Battery Storage</h3>
            <p className="markets-infobox__body">
              BlueSun installs residential battery systems that provide backup
              power, energy independence, and better control over when and how
              electricity is used.
            </p>
          </div>
          <div className="markets-infobox markets-infobox--solar" ref={solarBoxRef}>
            <h3 className="markets-infobox__title">Residential Solar</h3>
            <p className="markets-infobox__body">
              Our residential solar systems help homeowners reduce electricity
              costs, improve energy efficiency, and gain greater control over
              their power.
            </p>
          </div>
          <div className="markets-infobox markets-infobox--roofing" ref={roofingBoxRef}>
            <h3 className="markets-infobox__title">Residential Roofing</h3>
            <p className="markets-infobox__body">
              We install, repair, and replace residential roofing systems
              using dependable materials and quality workmanship designed to
              protect your home.
            </p>
          </div>
          <div className="markets-infobox markets-infobox--hvac" ref={hvacBoxRef}>
            <h3 className="markets-infobox__title">Residential HVAC</h3>
            <p className="markets-infobox__body">
              BlueSun provides HVAC installation, replacement, repair, and
              maintenance to keep homes comfortable and energy efficient
              throughout the year.
            </p>
          </div>
        </>
      }
    />
  );
}
