"use client";

import { useEffect, useRef, type RefObject } from "react";

type Props = {
  src: string;
  trackRef: RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Scrollytelling video: instead of autoplaying, the video's currentTime is
 * driven by scroll progress across `trackRef` (a tall wrapper the video's
 * sticky-pinned section sits inside), so scrubbing the page scrubs the clip.
 */
export default function ScrollScrubVideo({ src, trackRef, className, style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let raf = 0;
    let destroyed = false;

    const reveal = () => {
      video.style.transition = "opacity 0.6s ease";
      video.style.opacity = "1";
    };

    // A <video> that's only ever seeked (never played) can stay blank in
    // several browsers — they don't decode/paint a frame until playback has
    // actually started once. A muted play-then-immediately-pause forces
    // that first paint; scrubbing via currentTime then works as expected.
    const primeFrame = () => {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.then(() => video.pause()).catch(() => {});
      }
      reveal();
    };

    // The browser can start loading (and finish loading) a <video src=...>
    // from the server-rendered HTML before hydration attaches this effect —
    // if "loadeddata" already fired by then, waiting for the event alone
    // means it never comes and the video stays invisible. Check the state
    // we already have first, and only fall back to the event otherwise.
    if (video.readyState >= 2) {
      primeFrame();
    } else {
      video.addEventListener("loadeddata", primeFrame, { once: true });
    }

    function tick() {
      if (destroyed) return;
      const track = trackRef.current;
      if (track && video && video.duration && isFinite(video.duration)) {
        const rect = track.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const progress =
          scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        const target = progress * video.duration;
        if (Math.abs(video.currentTime - target) > 0.03) {
          video.currentTime = target;
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", primeFrame);
    };
  }, [trackRef]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={{ opacity: 0, ...style }}
      src={src}
      muted
      playsInline
      preload="auto"
    />
  );
}
