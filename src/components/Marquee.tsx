const items = [
  "Lake Como",
  "Beverly Hills",
  "Dubai",
  "Saint-Tropez",
  "Aspen",
  "Mykonos",
  "Monaco",
  "Malibu",
];

/**
 * Infinite marquee driven by the ported okd engine (marquee-advanced.js):
 * `data-marquee-*` attributes + the documented target structure. <OkdMotion>
 * picks up `[data-marquee-scroll-direction-target]` and animates it with GSAP
 * (loop + scroll-velocity direction flip + scroll-linked offset).
 */
export default function Marquee() {
  return (
    <section className="border-y border-line py-8">
      <div
        data-marquee-scroll-direction-target
        data-marquee-speed="18"
        data-marquee-direction="left"
        data-marquee-scroll-speed="4"
      >
        <div data-marquee-scroll-target>
          <div data-marquee-collection-target>
            {items.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 px-5 font-display text-3xl italic text-muted md:text-4xl"
              >
                {item}
                <span className="not-italic text-gold">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
