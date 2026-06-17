/**
 * MPA page transition: full-height flex columns, staggered scaleY (0→1 exit, 1→0 enter).
 * Three columns below lg, six from lg up — keep in sync with `page-transition.scss` ($bp-lg-up).
 */

import {
    getGsap,
    isBlockEditorPreview,
    prefersReducedMotion,
    ready,
} from "./utils.js";

const STORAGE_KEY = "okdPageTx";
const DURATION = 0.55;
const STAGGER = 0.08;
const EASE = "power3.inOut";

/**
 * Fires once per full page load: curtain enter finished, or no curtain / reduced motion / editor.
 * `scroll-text-reveal.js` uses this for above-the-fold copy (`data-okd-str-wait-pt`).
 *
 * @returns {void}
 */
function notifyPageTransitionIdle() {
    if (typeof window === "undefined") {
        return;
    }
    if (window.__okdPageTransitionIdle) {
        return;
    }
    window.__okdPageTransitionIdle = true;
    window.dispatchEvent(new CustomEvent("okd:page-transition-idle", { bubbles: true }));
}

/** Matches `scss/breakpoints.scss` $bp-lg-up (min-width). */
const DESKTOP_MIN_PX = 1025;
const COL_COUNT_DESKTOP = 6;
const COL_COUNT_MOBILE = 3;

/**
 * @returns {HTMLElement | null}
 */
function getOverlay() {
    return document.getElementById("okd-page-transition");
}

/**
 * @returns {HTMLElement[]}
 */
function getColumns() {
    const root = getOverlay();
    if (!root) {
        return [];
    }
    return Array.from(root.querySelectorAll(".okd-page-transition__col"));
}

/**
 * Same-origin navigation with curtain: respect prefers-reduced-motion and the theme’s `is-reduced-motion` class (set in header before paint).
 *
 * @returns {boolean}
 */
function userAllowsPageTransitionMotion() {
    if (typeof document === "undefined") {
        return false;
    }
    if (document.documentElement.classList.contains("is-reduced-motion")) {
        return false;
    }
    return !prefersReducedMotion();
}

/**
 * @param {HTMLElement[]} all
 * @returns {{ animated: HTMLElement[], rest: HTMLElement[] }}
 */
function splitColumnsByViewport(all) {
    const desktop =
        typeof window.matchMedia === "function" &&
        window.matchMedia(`(min-width: ${DESKTOP_MIN_PX}px)`).matches;
    const n = desktop ? COL_COUNT_DESKTOP : COL_COUNT_MOBILE;
    const capped = Math.min(n, all.length);
    return {
        animated: all.slice(0, capped),
        rest: all.slice(capped),
    };
}

/**
 * @param {HTMLAnchorElement} anchor
 * @returns {boolean}
 */
function isEligibleLink(anchor) {
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return false;
    }

    const hrefAttr = anchor.getAttribute("href");
    if (
        !hrefAttr ||
        hrefAttr.startsWith("#") ||
        hrefAttr.startsWith("javascript:") ||
        hrefAttr.startsWith("mailto:") ||
        hrefAttr.startsWith("tel:")
    ) {
        return false;
    }

    let url;
    try {
        url = new URL(anchor.href, window.location.href);
    } catch (_error) {
        return false;
    }

    if (url.origin !== window.location.origin) {
        return false;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return false;
    }

    return true;
}

function resetOverlayState() {
    const overlay = getOverlay();
    const cols = getColumns();
    if (overlay) {
        overlay.classList.remove("is-active");
    }
    document.documentElement.classList.remove("okd-pt-entering");
    const gsap = getGsap(["set"]);
    if (gsap && cols.length) {
        gsap.set(cols, { scaleY: 0, transformOrigin: "center top" });
    } else {
        cols.forEach((col) => {
            col.style.removeProperty("transform");
        });
    }
}

/**
 * @param {string} href
 */
function navigateTo(href) {
    try {
        sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (_error) {
        // Private mode / disabled storage — still navigate.
    }
    window.location.assign(href);
}

function runExitAnimation(href) {
    const gsap = getGsap(["to", "set"]);
    const overlay = getOverlay();
    const all = getColumns();
    const { animated } = splitColumnsByViewport(all);

    if (!overlay || animated.length < 1 || !gsap) {
        navigateTo(href);
        return;
    }

    overlay.classList.add("is-active");
    gsap.set(all, { scaleY: 0, transformOrigin: "center top" });
    gsap.to(animated, {
        scaleY: 1,
        duration: DURATION,
        ease: EASE,
        stagger: STAGGER,
        transformOrigin: "center top",
        onComplete: () => navigateTo(href),
    });
}

function runEnterAnimation() {
    if (!userAllowsPageTransitionMotion()) {
        resetOverlayState();
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (_error) {
            // ignore
        }
        notifyPageTransitionIdle();
        return;
    }

    const gsap = getGsap(["to", "set"]);
    const overlay = getOverlay();
    const all = getColumns();
    const { animated, rest } = splitColumnsByViewport(all);

    if (!overlay || animated.length < 1 || !gsap) {
        resetOverlayState();
        notifyPageTransitionIdle();
        return;
    }

    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (_error) {
        // ignore
    }

    overlay.classList.add("is-active");
    gsap.set(animated, { scaleY: 1, transformOrigin: "center bottom" });
    if (rest.length) {
        gsap.set(rest, { scaleY: 0, transformOrigin: "center top" });
    }

    /* Drop the CSS hook after transforms are committed so the first paint cannot sit between rules and GSAP. */
    requestAnimationFrame(() => {
        document.documentElement.classList.remove("okd-pt-entering");
        gsap.to(animated, {
            scaleY: 0,
            duration: DURATION,
            ease: EASE,
            stagger: STAGGER,
            transformOrigin: "center bottom",
            onComplete: () => {
                overlay.classList.remove("is-active");
                gsap.set(all, { scaleY: 0, transformOrigin: "center top" });
                notifyPageTransitionIdle();
            },
        });
    });
}

function onDocumentClick(event) {
    if (!userAllowsPageTransitionMotion() || isBlockEditorPreview()) {
        return;
    }

    const anchor = event.target?.closest?.("a[href]") ?? null;
    if (!(anchor instanceof HTMLAnchorElement) || !isEligibleLink(anchor)) {
        return;
    }

    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return;
    }

    event.preventDefault();
    runExitAnimation(anchor.href);
}

export function initPageTransition() {
    if (isBlockEditorPreview() || !getOverlay()) {
        notifyPageTransitionIdle();
        return;
    }

    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => {
        if (!userAllowsPageTransitionMotion()) {
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch (_error) {
                // ignore
            }
            document.documentElement.classList.remove("okd-pt-entering");
            resetOverlayState();
        }
    });

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            resetOverlayState();
        }
    });

    document.addEventListener("click", onDocumentClick, true);

    ready(() => {
        if (!userAllowsPageTransitionMotion()) {
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch (_error) {
                // ignore
            }
            document.documentElement.classList.remove("okd-pt-entering");
            resetOverlayState();
            notifyPageTransitionIdle();
            return;
        }

        let pending = false;
        try {
            pending = sessionStorage.getItem(STORAGE_KEY) === "1";
        } catch (_error) {
            pending = false;
        }

        if (pending) {
            runEnterAnimation();
            return;
        }

        document.documentElement.classList.remove("okd-pt-entering");
        notifyPageTransitionIdle();
    });
}
