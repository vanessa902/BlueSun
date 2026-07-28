"use client";

import { useRef } from "react";
import ScrollVideoShowcase from "@/components/ScrollVideoShowcase";
import "../app/markets-infobox.css";

// Cache-buster: GitHub Pages/browsers can keep serving a stale copy of this
// video under its unchanged filename after a swap. Bump this to the file's
// own content hash (`md5sum public/markets-showcase.mp4 | cut -c1-10`)
// every time the video changes.
const VIDEO_CACHE_BUST = "7e6d409d62";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
// Same fade-in/hold/fade-out shape as the Commercial Construction section's
// card timing, in video frames (this usage takes ScrollVideoShowcase's
// default pxPerFrame, so no custom "scrolls" unit is needed here).
const FADE_FRAMES = 10;

// Opening exterior establishing shot, right at the start of the first clip
// (frame ~12 of 722, hence 0.017) — a slow zoom on the house facade, holds
// through frame ~125, fading out well before Electrical's wireframe scene
// starts (frame ~140 below), not overlapping it.
const WINDOWS_SCENE_START_FRAC = 0.017;
const WINDOWS_HOLD_FRAMES = 93;

// Electrical panel + glass-wireframe moment in the first clip (frame ~140
// of 722, hence 0.194) — located by extracting and eyeballing frames.
// Holds 40 frames, fading out before the wireframe breaks apart into the
// next interior shot.
const ELECTRICAL_SCENE_START_FRAC = 0.194;
const ELECTRICAL_HOLD_FRAMES = 40;

// Rooftop solar + battery-storage aerial, near the end of the first clip
// (frame ~300 of 722, hence 0.415) — the cyan line runs from the panels
// down to the battery unit on the lower deck. Holds until the clip cuts to
// the second clip's exterior shot (~frame 361), fading out right at that
// boundary so it doesn't bleed into the next scene. Shared by both the
// Battery Storage and Residential Solar cards — same scene, one for the
// panels, one for the battery unit it feeds — just positioned apart on
// screen (see .markets-infobox--solar in markets-infobox.css).
const BATTERY_SCENE_START_FRAC = 0.415;
const BATTERY_HOLD_FRAMES = 40;

// Second clip's own opening exterior shot (frame ~365 of 722, hence 0.506)
// — the lit roofline overhang over the glass facade, right after the cut
// from the first clip. Holds 25 frames, fading out before the blue
// structural wireframe forms over the facade in the next moment.
const ROOFING_SCENE_START_FRAC = 0.506;
const ROOFING_HOLD_FRAMES = 25;

// Kitchen ceiling ductwork/pipe wireframe, later in the second clip (frame
// ~505 of 722, hence 0.699) — forms up close then pulls back to a wide
// shot with the chandelier and plants visible. Holds 55 frames, fading out
// right before the cut to the next, more distant exterior shot.
const HVAC_SCENE_START_FRAC = 0.699;
const HVAC_HOLD_FRAMES = 55;

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
        sceneOpacity(frame, total, BATTERY_SCENE_START_FRAC, BATTERY_HOLD_FRAMES)
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
      objectFit="cover"
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
