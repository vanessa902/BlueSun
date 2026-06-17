"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

type Property = {
  name: string;
  location: string;
  price: string;
  image: string;
  span: string;
};

const properties: Property[] = [
  {
    name: "Villa Aurelia",
    location: "Lake Como, Italy",
    price: "€24,500,000",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    span: "md:col-span-7",
  },
  {
    name: "The Glass Pavilion",
    location: "Beverly Hills, USA",
    price: "$38,000,000",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    span: "md:col-span-5",
  },
  {
    name: "Casa del Mar",
    location: "Costa Brava, Spain",
    price: "€16,200,000",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80",
    span: "md:col-span-5",
  },
  {
    name: "Skyline Penthouse",
    location: "Dubai, UAE",
    price: "$29,750,000",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    span: "md:col-span-7",
  },
];

export default function Properties() {
  return (
    <section id="collections" className="mx-auto max-w-7xl px-6 py-28 md:py-40">
      <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">
            The Collection
          </p>
          <h2 className="max-w-xl font-display text-4xl leading-tight md:text-5xl">
            A portfolio of residences without equal
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <a
            href="#"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-muted transition-colors hover:text-foreground"
          >
            View all 42 properties
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {properties.map((p, i) => (
          <Reveal
            key={p.name}
            delay={i * 0.08}
            className={`group ${p.span}`}
          >
            <a href="#" className="block">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <h3 className="font-display text-2xl">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted">{p.location}</p>
                  </div>
                  <span className="text-sm tracking-wide text-gold-soft">
                    {p.price}
                  </span>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
