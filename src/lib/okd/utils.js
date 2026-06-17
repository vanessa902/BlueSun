/**
 * Shared JS utilities for block and global scripts.
 *
 * Exports:
 * - `noop()` - no-op callback placeholder.
 * - `prefersReducedMotion()` - `prefers-reduced-motion: reduce` media query.
 * - `ready(fn)` - runs `fn` now or on `DOMContentLoaded`.
 * - `onEnterView(el, onEnter, options)` - enter-only observer helper.
 * - `getIntersectionLeaveDirection(entry)` - infer leave direction from observer entry.
 * - `onInView(el, { onEnter, onLeave }, options)` - enter/leave observer helper.
 * - `getOdometerStepPx(roller, digitCycles)` - pixel height per digit row for odometer GSAP `y` (Safari-safe).
 *
 * Marquee (GSAP + optional ScrollTrigger): see `marquee-advanced.js` next to this file —
 * `initMarqueeScrollDirection`, `initMarqueeWithOverflowCheck`.
 */

/**
 * No-op function for default callbacks and cleanup placeholders.
 *
 * @returns {void}
 */
export function noop() {}

/**
 * Whether the user prefers reduced motion (OS / browser accessibility setting).
 *
 * @returns {boolean}
 */
export function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Run callback once the DOM is ready.
 * Executes immediately if the document is already parsed.
 *
 * @param {() => void} fn
 * @returns {void}
 */
export function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

/**
 * Whether this document is the WordPress block editor page.
 *
 * @returns {boolean}
 */
export function isBlockEditorPreview() {
    const body = document.body;
    if (!body) {
        return false;
    }

    if (
        body.classList.contains("block-editor-page") ||
        body.classList.contains("block-editor-iframe__body")
    ) {
        return true;
    }

    // Block editor live preview often runs in an iframe under /wp-admin/.
    if (window.self !== window.top) {
        try {
            return window.location.pathname.includes("/wp-admin/");
        } catch (_error) {
            return true;
        }
    }

    return false;
}

/**
 * Resolve the global GSAP object and verify required methods.
 *
 * @param {string[]} requiredMethods
 * @returns {any|null}
 */
export function getGsap(requiredMethods = []) {
    const gsap = window.gsap;
    if (!gsap) {
        return null;
    }

    for (const method of requiredMethods) {
        if (typeof gsap[method] !== "function") {
            return null;
        }
    }

    return gsap;
}

/**
 * Whether SplitText with `.create()` is available globally.
 *
 * @returns {boolean}
 */
export function hasSplitText() {
    return Boolean(window.SplitText && typeof window.SplitText.create === "function");
}

/**
 * Whether ScrollTrigger with `.create()` is available globally.
 *
 * @returns {boolean}
 */
export function hasScrollTrigger() {
    return Boolean(window.ScrollTrigger && typeof window.ScrollTrigger.create === "function");
}

/**
 * Run initializer once on frontend, and re-run on editor preview reflows.
 *
 * - `init` should return `false` when a required dependency is missing and a retry is needed.
 * - On frontend this runs once with no observer overhead.
 * - In block editor preview it can retry and observe DOM mutations.
 *
 * @param {() => boolean|void} init
 * @param {{ retryUntil?: (() => boolean)|null, retryDelay?: number, maxRetries?: number }} options
 * @returns {void}
 */
export function runWithEditorPreviewSupport(init, options = {}) {
    if (typeof init !== "function") {
        return;
    }

    const { retryUntil = null, retryDelay = 120, maxRetries = 30 } = options;

    let rafId = null;
    let retries = 0;

    const scheduleInit = () => {
        if (rafId !== null) {
            return;
        }

        rafId = window.requestAnimationFrame(() => {
            rafId = null;

            const result = init();
            const needsRetry = typeof retryUntil === "function" ? !retryUntil() : result === false;

            if (needsRetry && retries < maxRetries) {
                retries += 1;
                window.setTimeout(scheduleInit, retryDelay);
            }
        });
    };

    scheduleInit();

    if (!isBlockEditorPreview()) {
        return;
    }

    window.addEventListener("load", scheduleInit, { once: true });

    if (typeof MutationObserver === "undefined" || !document.body) {
        return;
    }

    const observer = new MutationObserver(() => {
        scheduleInit();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * Run callback when element enters viewport.
 *
 * @param {Element} element
 * @param {(entry: IntersectionObserverEntry, observer: IntersectionObserver) => void} onEnter
 * @param {{ root?: Element|null, rootMargin?: string, threshold?: number|number[], once?: boolean, enteredClass?: string, enteredAttribute?: string|false, enteredAttributeValue?: string }} options
 * @returns {() => void} cleanup function
 */
export function onEnterView(element, onEnter, options = {}) {
    if (!(element instanceof Element) || typeof onEnter !== "function") {
        return noop;
    }

    const {
        once = true,
        root = null,
        rootMargin = "0px 0px -10% 0px",
        threshold = 0.2,
        enteredClass = "is-entered",
        enteredAttribute = "data-entered",
        enteredAttributeValue = "true",
    } = options;

    const markEntered = (target) => {
        if (target instanceof Element && enteredClass) {
            target.classList.add(enteredClass);
        }
        if (target instanceof Element && enteredAttribute) {
            target.setAttribute(enteredAttribute, enteredAttributeValue);
        }
    };

    const fallback = () => {
        markEntered(element);
        onEnter(
            {
                isIntersecting: true,
                target: element,
            },
            null,
        );
        return noop;
    };

    if (typeof window.IntersectionObserver === "undefined") {
        return fallback();
    }

    const observer = new IntersectionObserver(
        (entries, instance) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                markEntered(entry.target);
                onEnter(entry, instance);

                if (once) {
                    instance.unobserve(entry.target);
                }
            });
        },
        { root, rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
}

/**
 * When an element is not intersecting, infer whether it left above the root (scrolled past
 * downward) or below the root (scrolled back up). Works for viewport or a scroll root.
 *
 * @param {IntersectionObserverEntry} entry
 * @returns {"up"|"down"|"unknown"|null} `null` if still intersecting
 */
export function getIntersectionLeaveDirection(entry) {
    if (!entry || entry.isIntersecting) {
        return null;
    }

    const rect = entry.boundingClientRect;
    const root = entry.rootBounds;
    const top = root ? root.top : 0;
    const bottom = root ? root.bottom : typeof window !== "undefined" ? window.innerHeight : 0;

    if (rect.bottom <= top) {
        return "up";
    }
    if (rect.top >= bottom) {
        return "down";
    }

    return "unknown";
}

/**
 * Observe enter and leave (viewport intersection). Fires onEnter when intersecting becomes
 * true, onLeave when false. Optional enter marks match {@link onEnterView}.
 *
 * @param {Element} element
 * @param {{ onEnter?: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void, onLeave?: (entry: IntersectionObserverEntry, observer: IntersectionObserver, meta: { direction: ReturnType<typeof getIntersectionLeaveDirection> }) => void }} callbacks
 * @param {{ root?: Element|null, rootMargin?: string, threshold?: number|number[], enteredClass?: string, enteredAttribute?: string|false, enteredAttributeValue?: string, leaveClearsEntered?: boolean }} options
 * @returns {() => void} cleanup
 */
export function onInView(element, callbacks = {}, options = {}) {
    const { onEnter, onLeave } = callbacks;
    if (!(element instanceof Element)) {
        return noop;
    }
    if (typeof onEnter !== "function" && typeof onLeave !== "function") {
        return noop;
    }

    const {
        root = null,
        rootMargin = "0px 0px -10% 0px",
        threshold = 0.2,
        enteredClass = "is-entered",
        enteredAttribute = "data-entered",
        enteredAttributeValue = "true",
        leaveClearsEntered = false,
    } = options;

    const markEntered = (target) => {
        if (target instanceof Element && enteredClass) {
            target.classList.add(enteredClass);
        }
        if (target instanceof Element && enteredAttribute) {
            target.setAttribute(enteredAttribute, enteredAttributeValue);
        }
    };

    const clearEntered = (target) => {
        if (leaveClearsEntered && target instanceof Element && enteredClass) {
            target.classList.remove(enteredClass);
        }
        if (leaveClearsEntered && target instanceof Element && enteredAttribute) {
            target.removeAttribute(enteredAttribute);
        }
    };

    const runEnter = (entry, instance) => {
        markEntered(entry.target);
        if (typeof onEnter === "function") {
            onEnter(entry, instance);
        }
    };

    const runLeave = (entry, instance) => {
        clearEntered(entry.target);
        if (typeof onLeave === "function") {
            const direction = getIntersectionLeaveDirection(entry);
            onLeave(entry, instance, { direction });
        }
    };

    const fallback = () => {
        runEnter(
            {
                isIntersecting: true,
                target: element,
                boundingClientRect: element.getBoundingClientRect(),
                intersectionRect: element.getBoundingClientRect(),
                intersectionRatio: 1,
                rootBounds: null,
                time: 0,
            },
            null,
        );
        return noop;
    };

    if (typeof window.IntersectionObserver === "undefined") {
        return fallback();
    }

    /** Avoid firing leave on the initial callback when the element starts off-screen. */
    let hasIntersected = false;

    const observer = new IntersectionObserver(
        (entries, instance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    hasIntersected = true;
                    runEnter(entry, instance);
                } else if (hasIntersected) {
                    runLeave(entry, instance);
                }
            });
        },
        { root, rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
}

/**
 * Pixel height of one digit row inside an odometer roller (`\\n`-joined 0–9 strips).
 * Use this for GSAP `y` instead of `em` so the final transform matches the mask in Safari
 * (avoids sub-pixel drift between `translateY(em)` and line-box layout).
 *
 * @param {HTMLElement} roller
 * @param {number} [digitCycles=3] Must match JS `* _ODOMETER_DIGIT_CYCLES` (10 lines per cycle).
 * @returns {number|null}
 */
export function getOdometerStepPx(roller, digitCycles = 3) {
    if (!(roller instanceof HTMLElement)) {
        return null;
    }

    const cycles = Number.isFinite(digitCycles) && digitCycles > 0 ? digitCycles : 3;
    const lineCount = 10 * cycles;

    void roller.offsetHeight;
    const h = roller.getBoundingClientRect().height;

    if (!Number.isFinite(h) || h <= 0) {
        return null;
    }

    const step = h / lineCount;
    return Number.isFinite(step) && step > 0 ? step : null;
}
