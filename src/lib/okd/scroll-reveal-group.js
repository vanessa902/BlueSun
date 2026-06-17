/**
 * Sitewide scroll-reveal orchestrator for grouped sequencing.
 *
 * Markup: add `data-okd-scroll-reveal-group` to a wrapper and any descendant carrying
 * `data-okd-scroll-reveal` or `data-okd-scroll-text-reveal` is automatically claimed and
 * sequenced in DOM order when the group enters the viewport.
 *
 * Marking happens synchronously on init so the solo `scroll-reveal.js` and `scroll-text-reveal.js`
 * inits skip claimed children. Tween prep (especially SplitText prep for grouped text reveals)
 * may be async, so the group's ScrollTrigger is created only after all prep promises resolve.
 *
 * Configuration on the group element:
 *   - `data-okd-srg-stagger`     (default 0.12)
 *   - `data-okd-srg-start`       (default `top 85%`, auto-clamped)
 *   - `data-okd-srg-end`         (optional)
 *   - `data-okd-srg-wait-pt`     (defer until `okd:page-transition-idle`)
 *   - `data-okd-srg-disable`     ("mobile,tablet,desktop")
 *   - `data-okd-srg-once`        (default true; set `="false"` to repeat)
 *   - `data-okd-srg-markers`     (debug)
 *   - `data-okd-srg-claim`       (CSS selector list — claim descendants that don't carry
 *                                 `data-okd-scroll-reveal[-text]` themselves; useful for plugin
 *                                 output like CF7 fields. Each match is treated as a plain reveal
 *                                 and gets `data-okd-scroll-reveal` injected synchronously so the
 *                                 base CSS hides them before paint.)
 *
 * Per-child opt-out: `data-okd-sr-skip-group` (or `data-okd-str-skip-group`) on the descendant.
 * Nested groups: a descendant inside a closer `data-okd-scroll-reveal-group` is owned by the
 * deepest group only (no double-claim).
 */

import { prepareGroupedReveal } from "./scroll-reveal.js";
import { prepareGroupedTextReveal } from "./scroll-text-reveal.js";
import {
    getGsap,
    hasScrollTrigger,
    isBlockEditorPreview,
    onEnterView,
    prefersReducedMotion,
} from "./utils.js";

/** @type {Array<() => void>} */
const cleanups = [];
/**
 * Prepared entries owned by the current init pass. Tracked separately from `cleanups` so destroy
 * can dispose tweens + revert SplitText splits even when prep work happened in another module
 * (`scroll-reveal.js` / `scroll-text-reveal.js`). Without this, a re-init left orphaned splits in
 * the DOM and a subsequent `SplitText.create()` would nest into them.
 *
 * @type {Array<{ tween: any, dispose: () => void }>}
 */
const activeEntries = [];
let initGeneration = 0;

const DEFAULTS = {
    stagger: 0.12,
    start: "top 85%",
    end: null,
    once: true,
    markers: false,
};

const DISABLE_BREAKPOINTS = {
    mobile: "(max-width: 479px)",
    tablet: "(max-width: 991px)",
    desktop: "(min-width: 992px)",
};

/**
 * @returns {void}
 */
export function destroyOkdScrollRevealGroup() {
    while (activeEntries.length) {
        const entry = activeEntries.pop();
        try {
            entry.dispose();
        } catch (_e) {
            /* ignore */
        }
    }
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
 * @returns {boolean}
 */
function isGroupDisabledForViewport(el) {
    const raw = el.getAttribute("data-okd-srg-disable");
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
 * @param {HTMLElement} group
 * @returns {{ stagger: number, start: string, end: string|null, once: boolean, markers: boolean }}
 */
function getGroupConfig(group) {
    return {
        stagger: parseFloatAttr(group.dataset.okdSrgStagger, DEFAULTS.stagger),
        start: group.dataset.okdSrgStart || DEFAULTS.start,
        end: group.dataset.okdSrgEnd || DEFAULTS.end,
        once: parseBoolAttr(group, "data-okd-srg-once", DEFAULTS.once),
        markers: group.dataset.okdSrgMarkers === "true",
    };
}

/**
 * @param {string} start
 * @returns {string}
 */
function clampStart(start) {
    const s = (start || "").trim();
    if (!s) {
        return "clamp(top 85%)";
    }
    if (s.startsWith("clamp(")) {
        return s;
    }
    return `clamp(${s})`;
}

/**
 * Walk `group` in DOM order and return descendants that should be sequenced.
 * Skips descendants that live inside a closer (more specific) group container so each
 * eligible child belongs to exactly one group.
 *
 * Honors `data-okd-srg-claim` (CSS selector list): matching descendants that don't already
 * carry `data-okd-scroll-reveal[-text]` are picked up and treated as plain reveals. The
 * single combined `querySelectorAll` keeps the result in DOM order so claimed children
 * sequence inline with their text-reveal / plain-reveal siblings.
 *
 * @param {HTMLElement} group
 * @returns {Array<{ el: HTMLElement, kind: "plain" | "text" }>}
 */
function collectGroupChildren(group) {
    /** @type {Array<{ el: HTMLElement, kind: "plain" | "text" }>} */
    const children = [];

    const claimSelector = (group.getAttribute("data-okd-srg-claim") || "").trim();
    let selector = "[data-okd-scroll-reveal], [data-okd-scroll-text-reveal]";
    if (claimSelector) {
        selector += `, ${claimSelector}`;
    }

    /** @type {NodeListOf<Element>} */
    let candidates;
    try {
        candidates = group.querySelectorAll(selector);
    } catch (_e) {
        // Bad claim selector — fall back to base selector so the rest of the group still works.
        candidates = group.querySelectorAll(
            "[data-okd-scroll-reveal], [data-okd-scroll-text-reveal]",
        );
    }

    candidates.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        if (
            node.hasAttribute("data-okd-sr-skip-group") ||
            node.hasAttribute("data-okd-str-skip-group")
        ) {
            return;
        }
        const owningGroup = node.closest("[data-okd-scroll-reveal-group]");
        if (owningGroup !== group) {
            return;
        }

        if (node.hasAttribute("data-okd-scroll-text-reveal")) {
            children.push({ el: node, kind: "text" });
            return;
        }
        // Either has `data-okd-scroll-reveal` or matched the claim selector — both run as plain.
        children.push({ el: node, kind: "plain" });
    });

    return children;
}

/**
 * Mark each grouped child with the dataset key the solo init code reads to skip it.
 *
 * Claimed plain children (matched via `data-okd-srg-claim`) won't have `data-okd-scroll-reveal`
 * yet; we add it here so the base CSS rule (`[data-okd-scroll-reveal]:not(.is-okd-sr-revealed)`)
 * hides them before paint and so the prep function can read its config from `data-okd-sr-*`.
 *
 * @param {Array<{ el: HTMLElement, kind: "plain" | "text" }>} children
 * @returns {void}
 */
function markGroupedChildren(children) {
    children.forEach(({ el, kind }) => {
        if (kind === "text") {
            el.dataset.okdStrGrouped = "1";
            return;
        }
        if (!el.hasAttribute("data-okd-scroll-reveal")) {
            el.setAttribute("data-okd-scroll-reveal", "");
        }
        el.dataset.okdSrGrouped = "1";
    });
}

/**
 * Reveal everything in the group instantly (reduced-motion, no GSAP, etc.).
 *
 * @param {Array<{ el: HTMLElement, kind: "plain" | "text" }>} children
 * @returns {void}
 */
function revealAllImmediately(children) {
    children.forEach(({ el, kind }) => {
        if (kind === "text") {
            el.style.visibility = "visible";
            el.classList.remove("is-okd-str-split");
        } else {
            el.classList.add("is-okd-sr-revealed");
        }
    });
}

/**
 * Wait for `okd:page-transition-idle` if the group requested it via `data-okd-srg-wait-pt`.
 *
 * @param {HTMLElement} group
 * @returns {Promise<void>}
 */
function waitForPageTransition(group) {
    if (!group.hasAttribute("data-okd-srg-wait-pt")) {
        return Promise.resolve();
    }
    if (window.__okdPageTransitionIdle) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        const handler = () => resolve();
        window.addEventListener("okd:page-transition-idle", handler, { once: true });
        registerCleanup(() => {
            window.removeEventListener("okd:page-transition-idle", handler);
        });
    });
}

/**
 * Play prepared tweens with cumulative stagger between siblings. Uses `.restart()` so the same
 * sequence can replay on re-entry when `data-okd-srg-once="false"`.
 *
 * `gsap.delayedCall()` schedules the play side-effect cleanly without mutating the tween's own
 * delay/startTime.
 *
 * @param {Array<{ entry: { tween: any, dispose: () => void } }>} prepped
 * @param {number} stagger
 * @param {any} gsap
 * @returns {void}
 */
function playGroupedSequence(prepped, stagger, gsap) {
    prepped.forEach(({ entry }, i) => {
        const delay = Math.max(0, stagger * i);
        const fire = () => {
            if (typeof entry.tween.restart === "function") {
                entry.tween.restart();
            } else {
                entry.tween.play(0);
            }
        };
        if (delay > 0 && typeof gsap?.delayedCall === "function") {
            gsap.delayedCall(delay, fire);
        } else {
            fire();
        }
    });
}

/**
 * Reverse all prepared tweens (for `once="false"` repeat case on leave-back).
 *
 * @param {Array<{ entry: { tween: any, dispose: () => void } }>} prepped
 * @returns {void}
 */
function reverseGroupedSequence(prepped) {
    prepped.forEach(({ entry }) => {
        if (typeof entry.tween.reverse === "function") {
            entry.tween.reverse();
        }
    });
}

/**
 * @param {HTMLElement} group
 * @param {Array<{ el: HTMLElement, kind: "plain" | "text", entry: { tween: any, dispose: () => void } }>} prepped
 * @param {ReturnType<typeof getGroupConfig>} config
 * @param {any} gsap
 * @returns {void}
 */
function attachGroupTrigger(group, prepped, config, gsap) {
    if (!prepped.length) {
        return;
    }

    const playOnce = { fired: false };
    const playSequence = () => {
        if (playOnce.fired && config.once) {
            return;
        }
        playOnce.fired = true;
        playGroupedSequence(prepped, config.stagger, gsap);
    };

    if (hasScrollTrigger()) {
        /** @type {Record<string, unknown>} */
        const stConfig = {
            trigger: group,
            start: () => clampStart(config.start),
            invalidateOnRefresh: true,
            markers: config.markers,
        };
        if (config.end) {
            stConfig.end = config.end;
        }
        if (config.once) {
            stConfig.once = true;
            stConfig.onEnter = playSequence;
        } else {
            stConfig.onEnter = playSequence;
            stConfig.onEnterBack = playSequence;
            stConfig.onLeaveBack = () => reverseGroupedSequence(prepped);
        }

        const st = window.ScrollTrigger.create(stConfig);
        registerCleanup(() => st.kill());

        /**
         * `once: true` only fires `onEnter` on a scroll-state transition. For groups already in
         * view at load (clamped start = scroll position 0), force-play after layout settles.
         */
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                st.refresh();
                if (typeof window.ScrollTrigger?.update === "function") {
                    window.ScrollTrigger.update();
                }
                if (!playOnce.fired) {
                    const rect = group.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        playSequence();
                    }
                }
            });
        });

        return;
    }

    // No ScrollTrigger — IntersectionObserver fallback.
    const unobserve = onEnterView(group, playSequence, {
        once: config.once,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.05,
    });
    registerCleanup(unobserve);
}

/**
 * @param {HTMLElement} group
 * @param {Array<{ el: HTMLElement, kind: "plain" | "text" }>} children
 * @param {number} gen
 * @returns {Promise<void>}
 */
async function setupGroup(group, children, gen) {
    if (!children.length) {
        return;
    }

    const config = getGroupConfig(group);

    if (isGroupDisabledForViewport(group)) {
        revealAllImmediately(children);
        return;
    }

    const gsap = getGsap(["set", "to", "fromTo"]);
    if (!gsap) {
        revealAllImmediately(children);
        return;
    }

    await waitForPageTransition(group);
    if (gen !== initGeneration) {
        return;
    }

    const prepPromises = children.map((child) =>
        Promise.resolve(
            child.kind === "text"
                ? prepareGroupedTextReveal(child.el)
                : prepareGroupedReveal(child.el),
        ).then((entry) => (entry ? { ...child, entry } : null)),
    );

    const settled = await Promise.all(prepPromises);
    if (gen !== initGeneration) {
        return;
    }

    /** @type {Array<{ el: HTMLElement, kind: "plain" | "text", entry: { tween: any, dispose: () => void } }>} */
    const prepped = settled.filter(
        /** @returns {x is { el: HTMLElement, kind: "plain" | "text", entry: { tween: any, dispose: () => void } }} */
        (x) => x !== null,
    );

    // Track entries so destroy() can dispose tweens + revert splits owned by this pass.
    prepped.forEach(({ entry }) => {
        activeEntries.push(entry);
    });

    attachGroupTrigger(group, prepped, config, gsap);
}

/**
 * Initialize all `[data-okd-scroll-reveal-group]` containers.
 *
 * Phase 1 (synchronous): mark all eligible descendants with `data-okd-(s[rt])-grouped="1"` so
 * the solo inits skip them.
 *
 * Phase 2 (async per group): wait for page-transition idle if requested, prep tweens (which may
 * await `whenReadyForSplitText()` for text reveals), then create the group's ScrollTrigger.
 *
 * @returns {boolean} false when GSAP is not yet available (retry in editor).
 */
export function initOkdScrollRevealGroup() {
    const gen = ++initGeneration;
    destroyOkdScrollRevealGroup();

    const groups = Array.from(document.querySelectorAll("[data-okd-scroll-reveal-group]")).filter(
        (g) => g instanceof HTMLElement,
    );

    if (!groups.length) {
        return true;
    }

    // Phase 1: synchronous marking. Must happen BEFORE the solo inits run so they skip our
    // children. We mark even when GSAP is missing — the solo inits would then also bail and we
    // fall back to revealing immediately in setupGroup() / revealAllImmediately().
    /** @type {Array<{ group: HTMLElement, children: Array<{ el: HTMLElement, kind: "plain" | "text" }> }>} */
    const groupData = groups.map((group) => {
        const children = collectGroupChildren(group);
        markGroupedChildren(children);
        return { group, children };
    });

    if (prefersReducedMotion() || isBlockEditorPreview()) {
        groupData.forEach(({ children }) => {
            revealAllImmediately(children);
        });
        return true;
    }

    groupData.forEach(({ group, children }) => {
        setupGroup(group, children, gen).catch((err) => {
            if (typeof console !== "undefined" && typeof console.warn === "function") {
                console.warn("[okd-scroll-reveal-group] setup failed:", err);
            }
        });
    });

    return true;
}

if (typeof window !== "undefined") {
    window.okdScrollRevealGroup = window.okdScrollRevealGroup || {
        destroy: destroyOkdScrollRevealGroup,
        init: initOkdScrollRevealGroup,
        refresh() {
            destroyOkdScrollRevealGroup();
            initOkdScrollRevealGroup();
        },
    };
}
