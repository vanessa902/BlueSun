"use client";

import type { ReactNode } from "react";

type Props = {
  variant: "light" | "dark";
  label: string;
  icon: ReactNode;
  width: number;
};

export default function ExpandButton({ variant, label, icon, width }: Props) {
  return (
    <div
      className={`axion-expand axion-expand--${variant}`}
      style={{ "--axion-expand-w": `${width}px` } as React.CSSProperties}
    >
      <span className="axion-expand__icon">{icon}</span>
      <span className="axion-expand__label">{label}</span>
    </div>
  );
}
