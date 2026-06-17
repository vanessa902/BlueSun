"use client";

import { useEffect, useRef } from "react";

type HlsVideoProps = {
  /** HLS playlist (.m3u8). Falls back gracefully when HLS is unavailable. */
  src: string;
  /** Optional progressive fallback (.mp4) for browsers without HLS support. */
  fallbackSrc?: string;
  poster?: string;
  className?: string;
};

/**
 * Full-bleed background video that streams via HLS.js, with adaptive bitrate —
 * the technique used by premium hero sections. Safari plays HLS natively, other
 * browsers use HLS.js, and anything else degrades to the mp4 fallback.
 */
export default function HlsVideo({
  src,
  fallbackSrc,
  poster,
  className,
}: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any;

    const tryPlay = () => {
      // Autoplay can be rejected; ignore the promise rejection silently.
      video.play().catch(() => {});
    };

    // Native HLS (Safari / iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
      return () => {
        destroyed = true;
        video.removeEventListener("loadedmetadata", tryPlay);
      };
    }

    // HLS.js for everyone else
    import("hls.js").then(({ default: Hls }) => {
      if (destroyed) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      } else if (fallbackSrc) {
        video.src = fallbackSrc;
        tryPlay();
      }
    });

    return () => {
      destroyed = true;
      if (hls) hls.destroy();
    };
  }, [src, fallbackSrc]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
    />
  );
}
