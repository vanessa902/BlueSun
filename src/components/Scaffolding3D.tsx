"use client";

import { useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// model-viewer is a custom element registered at runtime; cast so JSX/TS accept it.
const ModelViewer = "model-viewer" as unknown as React.FC<
  React.HTMLAttributes<HTMLElement> & Record<string, unknown>
>;

/**
 * 3D scaffolding model rendered with Google's <model-viewer>. Sits on top of the
 * blueprint vector and can be dragged 360°. Auto-rotates when idle.
 */
export default function Scaffolding3D() {
  useEffect(() => {
    // Register the custom element on the client only.
    import("@google/model-viewer");
  }, []);

  return (
    <ModelViewer
      className="eb-bp-model"
      src={`${BASE}/scaffolding.glb`}
      alt="3D scaffolding model"
      camera-controls=""
      auto-rotate=""
      auto-rotate-delay="0"
      rotation-per-second="18deg"
      interaction-prompt="none"
      disable-zoom=""
      shadow-intensity="0.8"
      exposure="1.1"
      environment-image="neutral"
      camera-orbit="0deg 75deg 105%"
    />
  );
}
