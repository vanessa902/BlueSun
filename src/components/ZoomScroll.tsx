"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const layers = [
  {
    layer: 3,
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    className: "h-[42vh] w-[60vw] md:h-[55vh] md:w-[42vw]",
  },
  {
    layer: 2,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
    className:
      "h-[26vh] w-[34vw] -translate-x-[120%] translate-y-[40%] md:h-[34vh] md:w-[24vw]",
  },
  {
    layer: 1,
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
    className:
      "h-[26vh] w-[34vw] translate-x-[120%] -translate-y-[40%] md:h-[34vh] md:w-[24vw]",
  },
];

export default function ZoomScroll() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // --- 1. Layered 3D zoom (pinned) ---
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".zoom-container",
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 1,
          },
        })
        .to(
          ".zoom-item[data-layer='3']",
          { opacity: 1, z: 800, ease: "power1.inOut" },
          0
        )
        .to(
          ".zoom-item[data-layer='2']",
          { opacity: 1, z: 600, ease: "power1.inOut" },
          0
        )
        .to(
          ".zoom-item[data-layer='1']",
          { opacity: 1, z: 400, ease: "power1.inOut" },
          0
        )
        .to(".heading", { opacity: 1, z: 50, ease: "power1.inOut" }, 0);

      // --- 2. Word-by-word opacity reveal (pinned) ---
      const splitLetters = SplitText.create(".opacity-reveal", {
        type: "chars,words",
      });
      gsap.set(splitLetters.chars, { opacity: 0.2 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".section-stick",
            pin: true,
            start: "center center",
            end: "+=1500",
            scrub: 1,
          },
        })
        .to(splitLetters.chars, {
          opacity: 1,
          duration: 1,
          ease: "none",
          stagger: 1,
        })
        .to({}, { duration: 10 })
        .to(".opacity-reveal", { opacity: 0, scale: 1.2, duration: 50 });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      {/* 3D layered zoom */}
      <section
        className="zoom-container relative flex h-[100svh] items-center justify-center overflow-hidden bg-background"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2 className="heading pointer-events-none absolute z-10 max-w-3xl px-6 text-center font-display text-4xl leading-tight opacity-0 md:text-6xl">
            Step inside, one layer at a time
          </h2>

          {layers.map((l) => (
            <div
              key={l.layer}
              data-layer={l.layer}
              className={`zoom-item absolute overflow-hidden rounded-2xl opacity-0 ${l.className}`}
            >
              <Image
                src={l.image}
                alt={`Residence layer ${l.layer}`}
                fill
                sizes="60vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Word-by-word reveal */}
      <section className="section-stick flex min-h-[100svh] items-center justify-center px-6">
        <p className="opacity-reveal max-w-4xl text-center font-display text-3xl leading-snug md:text-5xl">
          Some homes are bought. The rare ones are remembered — for the light at
          dawn, the silence of the hills, and the feeling that you have finally
          arrived.
        </p>
      </section>
    </div>
  );
}
