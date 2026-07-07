"use client";

import { useRef, useCallback } from "react";

type Props = {
  src: string | string[];
  className?: string;
  style?: React.CSSProperties;
};

export default function FadingVideo({ src, className, style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const srcIndexRef = useRef(0);
  const sources = Array.isArray(src) ? src : [src];

  const handleLoadedData = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.style.transition = "opacity 0.5s ease";
    v.style.opacity = "1";
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const remaining = v.duration - v.currentTime;
    if (remaining <= 0.55 && v.style.opacity !== "0") {
      v.style.transition = "opacity 0.55s ease";
      v.style.opacity = "0";
    }
  }, []);

  const handleEnded = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (sources.length > 1) {
      srcIndexRef.current = (srcIndexRef.current + 1) % sources.length;
      v.src = sources[srcIndexRef.current];
    } else {
      v.currentTime = 0;
      v.play();
    }
    setTimeout(() => {
      v.style.transition = "opacity 0.5s ease";
      v.style.opacity = "1";
    }, 50);
  }, [sources]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      className={className}
      style={{ opacity: 0, ...style }}
      src={sources[0]}
      autoPlay
      muted
      playsInline
      preload="auto"
      onLoadedData={handleLoadedData}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
}
