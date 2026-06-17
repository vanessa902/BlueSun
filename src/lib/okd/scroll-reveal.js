/**
 * Sitewide ScrollTrigger plain-element reveal.
 *
 * Markup: add `data-okd-scroll-reveal` to any element (button, image wrapper, card).
 * Optional tuning via `data-okd-sr-*` attributes — see plan / scroll-reveal.scss for the API.
 *
 * `data-okd-sr-wait-pt` defers init until `okd:page-transition-idle` (mirrors the text reveal).
 * Elements claimed by a parent `[data-okd-scroll-reveal-group]` carry `data-okd-sr-grouped="1"`
 * (set by `scroll-reveal-group.js` BEFORE this module runs) and are skipped here so the group
 * orchestrator can sequence them inside its own timeline.
 *
 * Falls back to IntersectionObserver when GSAP / ScrollTrigger are missing.
 */

import {
    getGsap,
    hasScrollTrigger,
    isBlockEditorPreview,
    onEnterView,
    prefersReducedMotion,
} from "./utils.js";

/** @type {Array<() => void>} */
const cleanups = [];

/** Bumps on each init so deferred work from a prior pass cannot register tweens. */
let initGeneration = 0;

const DEFAULTS = {
    /** Loose enough that copy already on screen at load still qualifies; override per element. */
    start: "top 90%",
    end: null,
    duration: 0.65,
    delay: 0,
    ease: "power3.out",
    y: 20,
    x: 0,
    once: true,
    markers: false,
};

const DISABLE_BREAKPOINTS = {
    mobile: "(max-width: 479px)",
    tablet: "(max-width: 991px)",
    desktop: "(min-width: 992px)",
};

/**
 * Tear down all instances (ScrollTriggers, tweens, observers).
 *
 * @returns {void}
 */
export function destroyOkdScrollReveal() {
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
function isSrDisabledForViewport(el) {
    const raw = el.getAttribute("data-okd-sr-disable");
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
 * @param {string|undefined|null} raw
 * @param {number} fallback
 * @returns {number}
 */
function parseFloatAttr(raw, fallback) {
    if (raw == null || raw === "") {
        return fallback;
    }
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * Parse a boolean-ish attribute. Presence (`""`) means true; explicit `"false"` / `"0"` means false.
 *
 * @param {HTMLElement} el
 * @param {string} attr
 * @param {boolean} fallback
 * @returns {boolean}
 */
function parseBoolAttr(el, attr, fallback) {
    if (!el.hasAttribute(attr)) {
        return fallback;
    }
    const raw = el.getAttribute(attr);
    if (raw == null) {
        return fallback;
    }
    const v = raw.trim().toLowerCase();
    if (v === "" || v === "true" || v === "1") {
        return true;
    }
    if (v === "false" || v === "0") {
        return false;
    }
    return fallback;
}

/**
 * @param {HTMLElement} el
 * @returns {{
 *   start: string,
 *   end: string|null,
 *   duration: number,
 *   delay: number,
 *   ease: string,
 *   y: number,
 *   x: number,
 *   once: boolean,
 *   markers: boolean,
 *   triggerSelector: string|null,
 * }}
 */
function getConfig(el) {
    return {
        start: el.dataset.okdSrStart || DEFAULTS.start,
        end: el.dataset.okdSrEnd || DEFAULTS.end,
        duration: parseFloatAttr(el.dataset.okdSrDuration, DEFAULTS.duration),
        delay: parseFloatAttr(el.dataset.okdSrDelay, DEFAULTS.delay),
        ease: el.dataset.okdSrEase || DEFAULTS.ease,
        y: parseFloatAttr(el.dataset.okdSrY, DEFAULTS.y),
        x: parseFloatAttr(el.dataset.okdSrX, DEFAULTS.x),
        once: parseBoolAttr(el, "data-okd-sr-once", DEFAULTS.once),
        markers: el.dataset.okdSrMarkers === "true",
        triggerSelector: el.dataset.okdSrTrigger || null,
    };
}

/**
 * @param {HTMLElement} el
 * @param {string|null} triggerSelector
 * @returns {HTMLElement}
 */
function resolveTriggerElement(el, triggerSelector) {
    if (triggerSelector) {
        const fromClosest = el.closest(triggerSelector);
        if (fromClosest instanceof HTMLElement) {
            return fromClosest;
        }
    }
    return el;
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
 * @param {HTMLElement} el
 * @returns {void}
 */
function markRevealed(el) {
    el.classList.add("is-okd-sr-revealed");
}

/**
 * @param {HTMLElement} el
 * @returns {void}
 */
function markDisabled(el) {
    el.classList.add("is-okd-sr-disabled");
}

/**
 * @param {HTMLElement} el
 * @param {any} gsap
 * @returns {{ onStart: () => void, onComplete: () => void, onReverseComplete: () => void }}
 */
function buildTweenCallbacks(el, gsap) {
    return {
        onStart: () => {
            el.dispatchEvent(
                new CustomEvent("okd-scroll-reveal-enter", {
                    bubbles: true,
                    detail: { element: el },
                }),
            );
        },
        onComplete: () => {
            markRevealed(el);
            gsap.set(el, { clearProps: "transform,opacity,visibility" });
            el.dispatchEvent(
                new CustomEvent("okd-scroll-reveal-complete", {
                    bubbles: true,
                    detail: { element: el },
                }),
            );
        },
        onReverseComplete: () => {
            el.classList.remove("is-okd-sr-revealed");
        },
    };
}

/**
 * Solo path: tween + inline `scrollTrigger` config. Mirrors the pattern in
 * `scroll-text-reveal.js`'s `runSplitScrollReveal`.
 *
 * @param {HTMLElement} el
 * @param {HTMLElement} triggerEl
 * @param {ReturnType<typeof getConfig>} config
 * @param {any} gsap
 * @returns {void}
 */
function runScrollReveal(el, triggerEl, config, gsap) {
    /** @type {Record<string, unknown>} */
    const scrollTrigger = {
        trigger: triggerEl,
        start: () => clampStart(config.start),
        invalidateOnRefresh: true,
        markers: config.markers,
    };
    if (config.end) {
        scrollTrigger.end = config.end;
    }
    if (config.once) {
        scrollTrigger.once = true;
    } else {
        scrollTrigger.toggleActions = "play none none reverse";
    }

    const callbacks = buildTweenCallbacks(el, gsap);
    const tween = gsap.fromTo(
        el,
        { autoAlpha: 0, x: config.x, y: config.y },
        {
            autoAlpha: 1,
            delay: config.delay,
            duration: config.duration,
            ease: config.ease,
            scrollTrigger,
            x: 0,
            y: 0,
            ...callbacks,
        },
    );

    registerCleanup(() => tween.kill());

    /**
     * `once: true` only fires `onEnter` on a scroll-state transition. For elements already in
     * the viewport at load, `clamp()` pins start to scroll position 0, so `progress` stays at 0
     * and `onEnter` never fires. Force-play after layout settles if the element is already in view.
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
 * Build a paused tween for a grouped plain reveal — the orchestrator (`scroll-reveal-group.js`)
 * plays it via `gsap.delayedCall()` inside its sequence. No ScrollTrigger is created here.
 *
 * Returns `null` when the element is disabled (reduced motion / editor preview / off /
 * breakpoint disable / GSAP missing).
 *
 * @param {HTMLElement} el
 * @returns {{ tween: any, dispose: () => void } | null}
 */
export function prepareGroupedReveal(el) {
    if (!(el instanceof HTMLElement)) {
        return null;
    }
    if (prefersReducedMotion() || isBlockEditorPreview()) {
        markDisabled(el);
        return null;
    }
    if (el.dataset.okdSrOff === "true" || isSrDisabledForViewport(el)) {
        markDisabled(el);
        return null;
    }

    const gsap = getGsap(["set", "fromTo"]);
    if (!gsap) {
        markDisabled(el);
        return null;
    }

    const config = getConfig(el);
    const callbacks = buildTweenCallbacks(el, gsap);
    const tween = gsap.fromTo(
        el,
        { autoAlpha: 0, x: config.x, y: config.y },
        {
            autoAlpha: 1,
            duration: config.duration,
            ease: config.ease,
            paused: true,
            x: 0,
            y: 0,
            ...callbacks,
        },
    );

    const dispose = () => tween.kill();
    registerCleanup(dispose);
    return { tween, dispose };
}

/**
 * IntersectionObserver fallback (no ScrollTrigger).
 *
 * @param {HTMLElement} el
 * @param {HTMLElement} triggerEl
 * @param {ReturnType<typeof getConfig>} config
 * @param {any} gsap
 * @returns {void}
 */
function runFallbackReveal(el, triggerEl, config, gsap) {
    const callbacks = buildTweenCallbacks(el, gsap);
    const tween = gsap.fromTo(
        el,
        { autoAlpha: 0, x: config.x, y: config.y },
        {
            autoAlpha: 1,
            delay: config.delay,
            duration: config.duration,
            ease: config.ease,
            paused: true,
            x: 0,
            y: 0,
            ...callbacks,
        },
    );

    const unobserve = onEnterView(
        triggerEl,
        () => {
            tween.play();
        },
        {
            once: config.once,
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.05,
        },
    );

    registerCleanup(() => {
        unobserve();
        tween.kill();
    });
}

/**
 * Initialize all `[data-okd-scroll-reveal]` elements in the document.
 *
 * Skips elements claimed by a `[data-okd-scroll-reveal-group]` (those carry
 * `data-okd-sr-grouped="1"` set by `scroll-reveal-group.js`).
 *
 * @returns {boolean} false when GSAP is not yet available (retry in editor).
 */
export function initOkdScrollReveal() {
    const gen = ++initGeneration;
    destroyOkdScrollReveal();

    const nodes = document.querySelectorAll("[data-okd-scroll-reveal]");
    if (!nodes.length) {
        return true;
    }

    if (prefersReducedMotion() || isBlockEditorPreview()) {
        nodes.forEach((n) => {
            if (n instanceof HTMLElement) {
                markDisabled(n);
            }
        });
        return true;
    }

    const gsap = getGsap(["set", "to", "fromTo"]);
    if (!gsap) {
        nodes.forEach((n) => {
            if (n instanceof HTMLElement) {
                markDisabled(n);
            }
        });
        return false;
    }

    const canST = hasScrollTrigger();

    /**
     * @param {HTMLElement} node
     * @returns {void}
     */
    const processNode = (node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        if (node.dataset.okdSrGrouped === "1") {
            return;
        }
        if (node.dataset.okdSrOff === "true" || isSrDisabledForViewport(node)) {
            markDisabled(node);
            return;
        }

        const config = getConfig(node);
        const triggerEl = resolveTriggerElement(node, config.triggerSelector);

        if (canST) {
            runScrollReveal(node, triggerEl, config, gsap);
            return;
        }
        runFallbackReveal(node, triggerEl, config, gsap);
    };

    /** @type {HTMLElement[]} */
    const deferredPt = [];
    /** @type {HTMLElement[]} */
    const immediate = [];

    nodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        if (node.dataset.okdSrGrouped === "1") {
            return;
        }
        if (node.hasAttribute("data-okd-sr-wait-pt")) {
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

    return true;
}

if (typeof window !== "undefined") {
    window.okdScrollReveal = window.okdScrollReveal || {
        destroy: destroyOkdScrollReveal,
        init: initOkdScrollReveal,
        refresh() {
            destroyOkdScrollReveal();
            initOkdScrollReveal();
        },
    };
}
