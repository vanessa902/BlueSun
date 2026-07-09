"use client";

import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";

export default function AxionHeroShader() {
  return (
    <Shader className="axion-hero__shader">
      <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
      <ChromaFlow
        baseColor="#ffffff"
        upColor="#0066ff"
        downColor="#0066ff"
        leftColor="#0066ff"
        rightColor="#0066ff"
        momentum={13}
        radius={3.5}
      />
      <FlutedGlass
        shape="rounded"
        angle={31}
        frequency={8}
        softness={1}
        speed={0.15}
        refraction={4}
        aberration={0.61}
        lightAngle={-90}
        highlight={0.12}
        highlightSoftness={0}
      />
      <FilmGrain strength={0.05} />
    </Shader>
  );
}
