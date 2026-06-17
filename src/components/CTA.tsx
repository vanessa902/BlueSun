"use client";

import Reveal from "./Reveal";

export default function CTA() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-7xl px-6 py-28 text-center md:py-44"
    >
      <Reveal>
        <p className="mb-5 text-xs uppercase tracking-[0.4em] text-gold">
          Private Viewing
        </p>
        <h2 className="mx-auto max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          Begin a quiet conversation about your next home.
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mx-auto mt-6 max-w-md text-muted">
          Our advisors work with absolute discretion. Tell us what you&apos;re
          looking for and we&apos;ll open doors that aren&apos;t on the market.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <form
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            className="w-full rounded-full border border-line bg-transparent px-6 py-3.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-gold/60"
          />
          <button
            type="submit"
            className="rounded-full bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-background transition-transform hover:scale-[1.03]"
          >
            Request Access
          </button>
        </form>
      </Reveal>
    </section>
  );
}
