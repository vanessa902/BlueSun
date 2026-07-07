"use client";

import { ArrowRight } from "lucide-react";

type Props = {
  label: string;
  variant: "dark" | "orange";
  block?: boolean;
};

export default function RollButton({ label, variant, block }: Props) {
  return (
    <button
      type="button"
      className={`axion-rollbtn axion-rollbtn--${variant}${block ? " axion-rollbtn--block" : ""}`}
    >
      <span className="axion-rollbtn__text">
        <span className="axion-rollbtn__roll">
          <span>{label}</span>
          <span aria-hidden="true">{label}</span>
        </span>
      </span>
      <span className="axion-rollbtn__arrow">
        <ArrowRight size={14} />
      </span>
    </button>
  );
}
