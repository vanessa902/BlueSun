"use client";

import { useEffect } from "react";

/**
 * Boots the ported "okd" motion engine (Cipher Digital style):
 * exposes GSAP + ScrollTrigger + SplitText on `window` (the modules read globals),
 * then runs every initializer and the marquee setup. Lenis smooth-scroll + the
 * GSAP ticker are already wired by <SmoothScroll>, so we don't create a second one.
 */
export default function OkdMotion() {
  useEffect(() => {
    let mounted = true;
    const cleanups: Array<() => void> = [];

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);
      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger, SplitText);

      const w = window as unknown as Record<string, unknown>;
      w.gsap = gsap;
      w.ScrollTrigger = ScrollTrigger;
      w.SplitText = SplitText;

      const [
        { initOkdScrollRevealGroup, destroyOkdScrollRevealGroup },
        { initOkdScrollReveal, destroyOkdScrollReveal },
        { initOkdScrollTextReveal, destroyOkdScrollTextReveal },
        { initButtonCharacterStagger },
        { initPageTransition },
        { initMarqueeWithOverflowCheck },
      ] = await Promise.all([
        import("@/lib/okd/scroll-reveal-group.js"),
        import("@/lib/okd/scroll-reveal.js"),
        import("@/lib/okd/scroll-text-reveal.js"),
        import("@/lib/okd/button-splittext.js"),
        import("@/lib/okd/page-transition.js"),
        import("@/lib/okd/marquee-advanced.js"),
      ]);
      if (!mounted) return;

      // Order matters: the group orchestrator must mark its children before the
      // solo reveal/text-reveal inits run, so they skip claimed elements.
      initOkdScrollRevealGroup();
      initOkdScrollReveal();
      initOkdScrollTextReveal();
      initButtonCharacterStagger();
      initPageTransition();

      document
        .querySelectorAll<HTMLElement>("[data-marquee-scroll-direction-target]")
        .forEach((m) => cleanups.push(initMarqueeWithOverflowCheck(m)));

      cleanups.push(
        destroyOkdScrollRevealGroup,
        destroyOkdScrollReveal,
        destroyOkdScrollTextReveal,
      );
    })();

    return () => {
      mounted = false;
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          /* ignore */
        }
      });
    };
  }, []);

  return null;
}
