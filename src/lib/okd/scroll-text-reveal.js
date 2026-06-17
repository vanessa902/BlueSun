/**
 * Sitewide ScrollTrigger + SplitText line/word/char reveal.
 *
 * Markup: add `data-okd-scroll-text-reveal` to the element that contains the text to split
 * (usually a heading or paragraph). Optional tuning via `data-okd-str-*` attributes.
 *
 * `data-okd-str-wait-pt` defers init until `okd:page-transition-idle` (GSAP curtain off or absent).
 *
 * Elements claimed by a parent `[data-okd-scroll-reveal-group]` carry `data-okd-str-grouped="1"`
 * and are skipped here — `prepareGroupedTextReveal()` (called by the group orchestrator) builds
 * a paused tween instead, which the orchestrator sequences inside its own timeline.
 *
 * Requires GSAP + ScrollTrigger + SplitText (registered in global-scripts.js). When SplitText
 * is missing, falls back to a one-shot fade/slide via IntersectionObserver.
 */

import {
    getGsap,
    hasScrollTrigger,
    hasSplitText,
    isBlockEditorPreview,
    onEnterView,
    prefersReducedMotion,
} from "./utils.js";

/** @type {Array<() => void>} */
const cleanups = [];

/** Bumps on each init so async `fonts.ready` from a prior pass cannot register tweens. */
let initGeneration = 0;

/**
 * `document.fonts.ready` alone often fires before SplitText’s own “fonts loaded” gate (console:
 * “SplitText called before fonts loaded”). Wait for window `load` + two rAFs so layout/webfonts match.
 *
 * @returns {Promise<void>}
 */
function whenReadyForSplitText() {
    const fonts =
        document.fonts && typeof document.fonts.ready?.then === "function"
            ? document.fonts.ready.catch(() => {})
            : Promise.resolve();

    const loaded =
        document.readyState === "complete"
            ? Promise.resolve()
            : new Promise((resolve) => {
                  window.addEventListener("load", resolve, { once: true });
              });

    return Promise.all([fonts, loaded]).then(
        () =>
            new Promise((resolve) => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(resolve);
                });
            }),
    );
}

const DEFAULTS = {
    type: "lines",
    /** Looser than 80% so copy already on screen at load still qualifies; override with `data-okd-str-start`. */
    start: "top 90%",
    end: null,
    scrub: false,
    ease: "power3.out",
    yPercent: 118,
    markers: false,
};

/** Duration + stagger when not overridden per element. */
const TYPE_DEFAULTS = {
    lines: { duration: 0.72, stagger: 0.1 },
    words: { duration: 0.55, stagger: 0.06 },
    chars: { duration: 0.4, stagger: 0.015 },
};

const DISABLE_BREAKPOINTS = {
    mobile: "(max-width: 479px)",
    tablet: "(max-width: 991px)",
    desktop: "(min-width: 992px)",
};

/**
 * Tear down all instances (ScrollTriggers, tweens, SplitText, observers).
 *
 * @returns {void}
 */
export function destroyOkdScrollTextReveal() {
    while (cleanups.length) {
        const fn = cleanups.pop();
        try {
            fn();
        } catch (_e) {
            /* ignore */
        }
    }
}

/**
 * @param {() => void} fn
 * @returns {void}
 */
function registerCleanup(fn) {
    if (typeof fn === "function") {
        cleanups.push(fn);
    }
}

/**
 * Lenis/Locomotive call `ScrollTrigger.update` on scroll only; after new ScrollTriggers are
 * created, refresh + update once so elements already in view get a correct progress (no nudge).
 *
 * @returns {void}
 */
function scheduleScrollTriggerSync() {
    if (
        typeof window.ScrollTrigger === "undefined" ||
        typeof window.ScrollTrigger.refresh !== "function"
    ) {
        return;
    }
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            window.ScrollTrigger.refresh();
            if (typeof window.ScrollTrigger.update === "function") {
                window.ScrollTrigger.update();
            }
        });
    });
}

/**
 * @param {HTMLElement} el
 * @returns {boolean}
 */
function isStrDisabledForViewport(el) {
    const raw = el.getAttribute("data-okd-str-disable");
    if (!raw) {
        return false;
    }
    return raw.split(",").some((token) => {
        const key = token.trim();
        const q = DISABLE_BREAKPOINTS[key];
        return q && window.matchMedia(q).matches;
    });
}

/**
 * @param {string} raw
 * @returns {boolean|number}
 */
function parseScrub(raw) {
    if (raw == null || raw === "") {
        return false;
    }
    if (raw === "true") {
        return true;
    }
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : false;
}

/**
 * @param {HTMLElement} el
 * @returns {{
 *   type: string,
 *   start: string,
 *   end: string|null,
 *   scrub: boolean|number,
 *   duration: number,
 *   ease: string,
 *   stagger: number,
 *   yPercent: number,
 *   markers: boolean,
 *   triggerSelector: string|null,
 * }}
 */
function getConfig(el) {
    const type = el.dataset.okdStrType || DEFAULTS.type;
    const preset = TYPE_DEFAULTS[type] || TYPE_DEFAULTS.lines;

    const hasDuration = el.hasAttribute("data-okd-str-duration");
    const hasStagger = el.hasAttribute("data-okd-str-stagger");
    const hasYPercent = el.hasAttribute("data-okd-str-y-percent");

    return {
        type: type === "words" || type === "chars" ? type : "lines",
        start: el.dataset.okdStrStart || DEFAULTS.start,
        end: el.dataset.okdStrEnd || DEFAULTS.end,
        scrub: parseScrub(el.dataset.okdStrScrub),
        duration: hasDuration ? parseFloat(el.dataset.okdStrDuration) : preset.duration,
        ease: el.dataset.okdStrEase || DEFAULTS.ease,
        stagger: hasStagger ? parseFloat(el.dataset.okdStrStagger) : preset.stagger,
        yPercent: hasYPercent ? parseFloat(el.dataset.okdStrYPercent) : DEFAULTS.yPercent,
        markers: el.dataset.okdStrMarkers === "true",
        triggerSelector: el.dataset.okdStrTrigger || null,
        /** When set, split/animate matching descendants instead of the host node (trigger stays the host unless `data-okd-str-trigger` overrides). */
        innerTargetSelector: el.getAttribute("data-okd-str-target"),
    };
}

/**
 * @param {HTMLElement} textEl
 * @param {string|null} triggerSelector
 * @returns {HTMLElement}
 */
function resolveTriggerElement(textEl, triggerSelector) {
    if (triggerSelector) {
        const fromClosest = textEl.closest(triggerSelector);
        if (fromClosest instanceof HTMLElement) {
            return fromClosest;
        }
    }
    return textEl;
}

/**
 * @param {string} start
 * @returns {string}
 */
function clampStart(start) {
    const s = (start || "").trim();
    if (!s) {
        return "clamp(top 92%)";
    }
    if (s.startsWith("clamp(")) {
        return s;
    }
    return `clamp(${s})`;
}

/**
 * Split + initial state setup, shared by `runSplitScrollReveal()` and
 * `prepareGroupedTextReveal()`.
 *
 * @param {HTMLElement} textEl
 * @param {ReturnType<typeof getConfig>} config
 * @param {any} gsap
 * @returns {{ list: HTMLElement[], split: any } | null}
 */
function setupSplitInitialState(textEl, config, gsap) {
    gsap.set(textEl, { autoAlpha: 0, visibility: "visible" });

    const typesToSplit =
        config.type === "lines"
            ? ["lines"]
            : config.type === "words"
              ? ["lines", "words"]
              : ["lines", "words", "chars"];

    const split = window.SplitText.create(textEl, {
        // `aria: "auto"` adds aria-label on the host — invalid on generic roles (div); use "none" (GSAP SplitText docs).
        aria: "none",
        charsClass: "okd-str-char",
        deepSlice: true,
        linesClass: "okd-str-line++",
        mask: "lines",
        tag: "span",
        type: typesToSplit.join(","),
        wordsClass: "okd-str-word",
    });

    const targets = split[config.type];
    const list = targets ? (Array.isArray(targets) ? targets : Array.from(targets)) : [];

    if (!list.length) {
        gsap.set(textEl, { autoAlpha: 1 });
        if (typeof split.revert === "function") {
            split.revert();
        }
        return null;
    }

    textEl.classList.add("is-okd-str-split");

    gsap.set(list, {
        force3D: true,
        yPercent: config.yPercent,
    });
    gsap.set(textEl, { autoAlpha: 1 });

    return { list, split };
}

/**
 * Run SplitText + ScrollTrigger path.
 *
 * We intentionally avoid `autoSplit: true` + `onSplit`: SplitText 3.14.2 defers
 * the initial split (and thus `onSplit`) when `document.fonts.status !== "loaded"`,
 * which leaves text at `autoAlpha: 0` indefinitely. Since `whenReadyForSplitText`
 * already waits for load + fonts + 2 rAFs before calling this function, we can
 * split synchronously via the returned instance.
 *
 * @param {HTMLElement} textEl
 * @param {HTMLElement} triggerEl
 * @param {ReturnType<typeof getConfig>} config
 * @param {any} gsap
 * @returns {void}
 */
function runSplitScrollReveal(textEl, triggerEl, config, gsap) {
    const prep = setupSplitInitialState(textEl, config, gsap);
    if (!prep) {
        return;
    }
    const { list, split } = prep;

    const scrollTrigger = {
        trigger: triggerEl,
        start: () => clampStart(config.start),
        invalidateOnRefresh: true,
        markers: config.markers,
        onEnter: () => {
            triggerEl.dispatchEvent(
                new CustomEvent("okd-scroll-text-reveal-enter", {
                    bubbles: true,
                    detail: { element: textEl },
                }),
            );
        },
    };
    if (config.end) {
        scrollTrigger.end = config.end;
    }
    if (config.scrub) {
        scrollTrigger.scrub = config.scrub;
    } else {
        scrollTrigger.once = true;
    }

    const tween = gsap.to(list, {
        duration: config.duration,
        ease: config.ease,
        force3D: true,
        scrollTrigger,
        stagger: config.stagger,
        yPercent: 0,
        onComplete: () => {
            triggerEl.dispatchEvent(
                new CustomEvent("okd-scroll-text-reveal-complete", {
                    bubbles: true,
                    detail: { element: textEl },
                }),
            );
        },
    });

    registerCleanup(() => {
        tween.kill();
        if (typeof split.revert === "function") {
            split.revert();
        }
    });

    /**
     * ScrollTrigger `once: true` only fires `onEnter` on a scroll state
     * transition (before-start → after-start). For elements already in the
     * viewport at load, `clamp()` pins start to scroll-position 0, so
     * `progress` stays exactly 0 — `onEnter` never fires. After layout
     * settles, check the trigger's bounding rect and force-play if it's
     * already within the viewport threshold.
     */
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            const st = tween.scrollTrigger;
            if (!st) {
                return;
            }
            st.refresh();
            if (typeof window.ScrollTrigger?.update === "function") {
                window.ScrollTrigger.update();
            }
            if (tween.progress() === 0) {
                const rect = triggerEl.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    tween.play();
                }
            }
        });
    });
}

/**
 * Build a paused tween for a grouped text reveal — the orchestrator (`scroll-reveal-group.js`)
 * inserts it into its master timeline. No ScrollTrigger is created here.
 *
 * Resolves to `null` when the element is disabled (reduced motion / editor preview / off /
 * breakpoint disable / GSAP missing / SplitText missing AND we have no graceful split path).
 *
 * @param {HTMLElement} textEl
 * @returns {Promise<{ tween: any, dispose: () => void } | null>}
 */
export async function prepareGroupedTextReveal(textEl) {
    if (!(textEl instanceof HTMLElement)) {
        return null;
    }
    if (textEl.dataset.okdScrollTextReveal === "off") {
        textEl.style.visibility = "visible";
        return null;
    }
    if (prefersReducedMotion() || isBlockEditorPreview()) {
        textEl.style.visibility = "visible";
        textEl.classList.remove("is-okd-str-split");
        return null;
    }
    if (isStrDisabledForViewport(textEl)) {
        textEl.style.visibility = "visible";
        return null;
    }

    const gsap = getGsap(["set", "to", "fromTo"]);
    if (!gsap) {
        textEl.style.visibility = "visible";
        return null;
    }

    await whenReadyForSplitText();

    const config = getConfig(textEl);
    const canSplit = hasSplitText();

    if (!canSplit) {
        gsap.set(textEl, { autoAlpha: 0, visibility: "visible" });
        const tween = gsap.fromTo(
            textEl,
            { autoAlpha: 0, y: 20 },
            {
                autoAlpha: 1,
                duration: Math.min(0.85, config.duration + 0.15),
                ease: config.ease,
                paused: true,
                y: 0,
                onStart: () => {
                    textEl.dispatchEvent(
                        new CustomEvent("okd-scroll-text-reveal-enter", {
                            bubbles: true,
                            detail: { element: textEl },
                        }),
                    );
                },
                onComplete: () => {
                    textEl.dispatchEvent(
                        new CustomEvent("okd-scroll-text-reveal-complete", {
                            bubbles: true,
                            detail: { element: textEl },
                        }),
                    );
                },
            },
        );
        const dispose = () => tween.kill();
        registerCleanup(dispose);
        return { tween, dispose };
    }

    const prep = setupSplitInitialState(textEl, config, gsap);
    if (!prep) {
        return null;
    }
    const { list, split } = prep;

    const tween = gsap.to(list, {
        duration: config.duration,
        ease: config.ease,
        force3D: true,
        paused: true,
        stagger: config.stagger,
        yPercent: 0,
        onStart: () => {
            textEl.dispatchEvent(
                new CustomEvent("okd-scroll-text-reveal-enter", {
                    bubbles: true,
                    detail: { element: textEl },
                }),
            );
        },
        onComplete: () => {
            textEl.dispatchEvent(
                new CustomEvent("okd-scroll-text-reveal-complete", {
                    bubbles: true,
                    detail: { element: textEl },
                }),
            );
        },
    });

    const dispose = () => {
        tween.kill();
        if (typeof split.revert === "function") {
            split.revert();
        }
    };
    registerCleanup(dispose);
    return { tween, dispose };
}

/**
 * IntersectionObserver fallback (no ScrollTrigger and/or no SplitText).
 *
 * @param {HTMLElement} textEl
 * @param {HTMLElement} triggerEl
 * @param {ReturnType<typeof getConfig>} config
 * @param {any} gsap
 * @param {{ split?: boolean }} options
 * @returns {void}
 */
function runFallbackReveal(textEl, triggerEl, config, gsap, options = {}) {
    const doSplit = Boolean(options.split) && hasSplitText();

    const play = () => {
        triggerEl.dispatchEvent(
            new CustomEvent("okd-scroll-text-reveal-enter", {
                bubbles: true,
                detail: { element: textEl },
            }),
        );

        if (doSplit) {
            const typesToSplit =
                config.type === "lines"
                    ? ["lines"]
                    : config.type === "words"
                      ? ["lines", "words"]
                      : ["lines", "words", "chars"];

            const split = window.SplitText.create(textEl, {
                aria: "none",
                charsClass: "okd-str-char",
                deepSlice: true,
                linesClass: "okd-str-line++",
                mask: "lines",
                tag: "span",
                type: typesToSplit.join(","),
                wordsClass: "okd-str-word",
            });

            const targets = split[config.type];
            const list = targets ? (Array.isArray(targets) ? targets : Array.from(targets)) : [];
            if (!list.length) {
                gsap.set(textEl, { autoAlpha: 1 });
                return;
            }
            textEl.classList.add("is-okd-str-split");
            gsap.set(textEl, { autoAlpha: 1 });
            const tween = gsap.fromTo(
                list,
                { autoAlpha: 0, force3D: true, yPercent: config.yPercent },
                {
                    autoAlpha: 1,
                    duration: config.duration,
                    ease: config.ease,
                    force3D: true,
                    onComplete: () => {
                        triggerEl.dispatchEvent(
                            new CustomEvent("okd-scroll-text-reveal-complete", {
                                bubbles: true,
                                detail: { element: textEl },
                            }),
                        );
                    },
                    stagger: config.stagger,
                    yPercent: 0,
                },
            );
            registerCleanup(() => {
                tween.kill();
                if (typeof split.revert === "function") {
                    split.revert();
                }
            });
            return;
        }

        gsap.set(textEl, { autoAlpha: 0, visibility: "visible" });
        const tween = gsap.fromTo(
            textEl,
            { autoAlpha: 0, y: 20 },
            {
                autoAlpha: 1,
                duration: Math.min(0.85, config.duration + 0.15),
                ease: config.ease,
                y: 0,
                onComplete: () => {
                    triggerEl.dispatchEvent(
                        new CustomEvent("okd-scroll-text-reveal-complete", {
                            bubbles: true,
                            detail: { element: textEl },
                        }),
                    );
                },
            },
        );
        registerCleanup(() => {
            tween.kill();
        });
    };

    gsap.set(textEl, { autoAlpha: 0, visibility: "visible" });

    const unobserve = onEnterView(
        triggerEl,
        () => {
            play();
        },
        {
            once: true,
            rootMargin: "0px 0px -18% 0px",
            threshold: 0.01,
        },
    );
    registerCleanup(unobserve);
}

/**
 * Initialize all `[data-okd-scroll-text-reveal]` elements in the document.
 *
 * @returns {boolean} false when GSAP is not yet available (retry in editor).
 */
export function initOkdScrollTextReveal() {
    const gen = ++initGeneration;
    destroyOkdScrollTextReveal();

    if (prefersReducedMotion() || isBlockEditorPreview()) {
        document.querySelectorAll("[data-okd-scroll-text-reveal]").forEach((n) => {
            if (n instanceof HTMLElement) {
                n.style.visibility = "visible";
                n.classList.remove("is-okd-str-split");
            }
        });
        return true;
    }

    const nodes = document.querySelectorAll("[data-okd-scroll-text-reveal]");
    if (!nodes.length) {
        return true;
    }

    const gsap = getGsap(["set", "to", "fromTo"]);
    if (!gsap) {
        nodes.forEach((n) => {
            if (n instanceof HTMLElement) {
                n.style.visibility = "visible";
            }
        });
        return false;
    }

    const canST = hasScrollTrigger();
    const canSplit = hasSplitText();

    /**
     * @param {HTMLElement} node
     * @returns {void}
     */
    const processNode = (node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        if (node.dataset.okdStrGrouped === "1") {
            return;
        }
        if (node.dataset.okdScrollTextReveal === "off") {
            gsap.set(node, { autoAlpha: 1, clearProps: "visibility" });
            return;
        }
        if (isStrDisabledForViewport(node)) {
            gsap.set(node, { autoAlpha: 1, clearProps: "visibility" });
            return;
        }

        const config = getConfig(node);
        const triggerEl = resolveTriggerElement(node, config.triggerSelector);

        let textEls = [node];
        if (config.innerTargetSelector) {
            const found = Array.from(node.querySelectorAll(config.innerTargetSelector)).filter(
                (el) => el instanceof HTMLElement,
            );
            if (found.length) {
                textEls = found;
            } else {
                if (typeof console !== "undefined" && typeof console.warn === "function") {
                    console.warn(
                        "[okd-scroll-text-reveal] No elements for data-okd-str-target:",
                        config.innerTargetSelector,
                    );
                }
                return;
            }
        }

        textEls.forEach((textEl) => {
            if (canST && canSplit) {
                runSplitScrollReveal(textEl, triggerEl, config, gsap);
                return;
            }

            runFallbackReveal(textEl, triggerEl, config, gsap, { split: canSplit });
        });
    };

    const runAfterFonts = () => {
        if (gen !== initGeneration) {
            return;
        }

        /** @type {HTMLElement[]} */
        const deferredPt = [];
        /** @type {HTMLElement[]} */
        const immediate = [];

        nodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
                return;
            }
            if (node.hasAttribute("data-okd-str-wait-pt")) {
                deferredPt.push(node);
            } else {
                immediate.push(node);
            }
        });

        immediate.forEach(processNode);
        if (immediate.length > 0) {
            scheduleScrollTriggerSync();
        }

        if (deferredPt.length) {
            const runDeferred = () => {
                if (gen !== initGeneration) {
                    return;
                }
                deferredPt.forEach(processNode);
                scheduleScrollTriggerSync();
            };
            if (window.__okdPageTransitionIdle) {
                runDeferred();
            } else {
                window.addEventListener("okd:page-transition-idle", runDeferred, { once: true });
                registerCleanup(() => {
                    window.removeEventListener("okd:page-transition-idle", runDeferred);
                });
            }
        }
    };

    whenReadyForSplitText().then(() => {
        if (gen !== initGeneration) {
            return;
        }
        runAfterFonts();
    });

    let resizeTimer = 0;
    let lastW = window.innerWidth;
    const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            if (window.matchMedia("(hover: none)").matches && window.innerWidth === lastW) {
                return;
            }
            lastW = window.innerWidth;
            if (canST && window.ScrollTrigger) {
                window.ScrollTrigger.refresh();
            }
        }, 250);
    };
    window.addEventListener("resize", onResize, { passive: true });
    registerCleanup(() => {
        window.removeEventListener("resize", onResize);
        window.clearTimeout(resizeTimer);
    });

    return true;
}

if (typeof window !== "undefined") {
    window.okdScrollTextReveal = window.okdScrollTextReveal || {
        destroy: destroyOkdScrollTextReveal,
        init: initOkdScrollTextReveal,
        refresh() {
            destroyOkdScrollTextReveal();
            initOkdScrollTextReveal();
        },
    };
}
