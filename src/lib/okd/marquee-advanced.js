/**
 * GSAP marquee with optional ScrollTrigger direction + scroll-linked offset.
 * Markup: root `[data-marquee-scroll-direction-target]`, `[data-marquee-scroll-target]`,
 * `[data-marquee-collection-target]` (see Blockstudio docs / shared pattern).
 *
 * Data attributes (dataset): marqueeSpeed, marqueeDirection (left|right), marqueeDuplicate,
 * marqueeScrollSpeed. Also sets data-marquee-status on the root.
 */

import {
    getGsap,
    hasScrollTrigger,
    noop,
    prefersReducedMotion,
} from "./utils.js";

/** Multiplier on computed duration (higher = slower scroll). */
const MARQUEE_DURATION_SLOW_FACTOR = 2.75;

/**
 * Subtracted from the marquee root `clientWidth` when testing fit. Static row only if
 * `collection.scrollWidth` fits in that reduced width (+ {@link MARQUEE_OVERFLOW_FUDGE_PX}).
 * Larger value → marquee activates sooner (e.g. gutter / safe area).
 */
const MARQUEE_OVERFLOW_GUTTER_PX = 40;

/** Tiny px slack on the static “fits” comparison to avoid subpixel flicker. */
const MARQUEE_OVERFLOW_FUDGE_PX = 2;

/**
 * Restore the first collection to its original items (undoes {@link doubleFirstCollectionItems}).
 *
 * @param {HTMLElement} collection
 */
function resetFirstCollectionItemDoubling(collection) {
    if (!(collection instanceof HTMLElement)) {
        return;
    }
    if (collection.dataset.marqueeItemsDoubled !== "true") {
        return;
    }
    const items = [...collection.children];
    const half = Math.floor(items.length / 2);
    if (half < 1 || items.length !== half * 2) {
        delete collection.dataset.marqueeItemsDoubled;
        return;
    }
    items.slice(half).forEach((el) => {
        el.remove();
    });
    delete collection.dataset.marqueeItemsDoubled;
}

/**
 * Append one clone of each direct child so the strip is 2× longer (fewer loop glitches).
 *
 * @param {HTMLElement} collection
 */
function doubleFirstCollectionItems(collection) {
    if (!(collection instanceof HTMLElement)) {
        return;
    }
    if (collection.dataset.marqueeItemsDoubled === "true") {
        return;
    }
    const items = [...collection.children];
    if (items.length === 0) {
        return;
    }
    items.forEach((item) => {
        collection.appendChild(item.cloneNode(true));
    });
    collection.dataset.marqueeItemsDoubled = "true";
}

/**
 * @param {HTMLElement} marquee
 * @returns {() => void}
 */
export function initMarqueeScrollDirection(marquee) {
    if (!(marquee instanceof HTMLElement)) {
        return noop;
    }

    const marqueeContent = marquee.querySelector("[data-marquee-collection-target]");
    const marqueeScroll = marquee.querySelector("[data-marquee-scroll-target]");
    if (!marqueeContent || !marqueeScroll) {
        return noop;
    }

    const gsap = getGsap(["to", "set"]);
    if (!gsap) {
        return noop;
    }

    const ScrollTrigger = hasScrollTrigger() ? window.ScrollTrigger : null;

    const speedRaw = marquee.dataset.marqueeSpeed;
    const directionRaw = marquee.dataset.marqueeDirection;
    const duplicateRaw = marquee.dataset.marqueeDuplicate;
    const scrollSpeedRaw = marquee.dataset.marqueeScrollSpeed;

    const marqueeSpeedAttr = parseFloat(speedRaw);
    const marqueeDirectionAttr = directionRaw === "right" ? 1 : -1;
    const duplicateAmount = parseInt(duplicateRaw || "0", 10) || 0;
    const scrollSpeedAttr = parseFloat(scrollSpeedRaw);

    const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

    const contentWidth = marqueeContent.offsetWidth || 1;
    let marqueeSpeed =
        (Number.isFinite(marqueeSpeedAttr) ? marqueeSpeedAttr : 15) *
        (contentWidth / window.innerWidth) *
        speedMultiplier;

    if (!Number.isFinite(marqueeSpeed) || marqueeSpeed <= 0) {
        marqueeSpeed = 15;
    }

    marqueeSpeed *= MARQUEE_DURATION_SLOW_FACTOR;

    const scrollSpeed = Number.isFinite(scrollSpeedAttr) ? scrollSpeedAttr : 10;

    marqueeScroll.style.marginLeft = `${scrollSpeed * -1}%`;
    marqueeScroll.style.width = `${scrollSpeed * 2 + 100}%`;

    if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
            fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
    }

    const marqueeItems = marquee.querySelectorAll("[data-marquee-collection-target]");
    if (!marqueeItems.length) {
        return noop;
    }

    const animation = gsap
        .to(marqueeItems, {
            xPercent: -100,
            repeat: -1,
            duration: marqueeSpeed,
            ease: "none",
        })
        .totalProgress(0.5);

    gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
    animation.timeScale(marqueeDirectionAttr);
    animation.play();

    marquee.setAttribute("data-marquee-status", "normal");

    let stUpdate = null;
    let tl = null;

    if (ScrollTrigger) {
        stUpdate = ScrollTrigger.create({
            trigger: marquee,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                const isInverted = self.direction === 1;
                const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;
                animation.timeScale(currentDirection);
                marquee.setAttribute("data-marquee-status", isInverted ? "normal" : "inverted");
            },
        });

        tl = gsap.timeline({
            scrollTrigger: {
                trigger: marquee,
                start: "0% 100%",
                end: "100% 0%",
                scrub: 0,
            },
        });

        const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeed : -scrollSpeed;
        const scrollEnd = -scrollStart;
        tl.fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: "none" });
    }

    return () => {
        animation.kill();
        stUpdate?.kill();
        if (tl) {
            tl.scrollTrigger?.kill();
            tl.kill();
        }
        gsap.killTweensOf(marqueeItems);
        gsap.killTweensOf(marqueeScroll);
        gsap.set(marqueeItems, { clearProps: "all" });
        marqueeScroll.style.marginLeft = "";
        marqueeScroll.style.width = "";
    };
}

/**
 * Single collection: static layout if `scrollWidth` fits inside the root width (minus
 * {@link MARQUEE_OVERFLOW_GUTTER_PX} and plus {@link MARQUEE_OVERFLOW_FUDGE_PX}); otherwise marquee.
 * Re-runs on resize / image load.
 *
 * @param {HTMLElement} marquee
 * @returns {() => void}
 */
export function initMarqueeWithOverflowCheck(marquee) {
    if (!(marquee instanceof HTMLElement)) {
        return noop;
    }

    const marqueeScroll = marquee.querySelector("[data-marquee-scroll-target]");
    const firstCollection = marquee.querySelector("[data-marquee-collection-target]");
    if (!marqueeScroll || !firstCollection) {
        return noop;
    }

    let activeTeardown = noop;
    let ro = null;

    const clearAnimatedState = () => {
        activeTeardown();
        activeTeardown = noop;

        const gsap = getGsap(["killTweensOf", "set"]);
        if (gsap) {
            gsap.killTweensOf(marqueeScroll);
            const collections = marqueeScroll.querySelectorAll("[data-marquee-collection-target]");
            gsap.killTweensOf(collections);
            gsap.set(collections, { clearProps: "all" });
        }

        const children = [...marqueeScroll.children];
        children.forEach((child, index) => {
            if (index > 0) {
                child.remove();
            }
        });

        resetFirstCollectionItemDoubling(firstCollection);

        marqueeScroll.style.marginLeft = "";
        marqueeScroll.style.width = "";
    };

    const measureAndApply = () => {
        clearAnimatedState();

        if (prefersReducedMotion()) {
            marquee.classList.add("is-marquee-static");
            return;
        }

        marquee.classList.remove("is-marquee-static");

        const visible = marquee.clientWidth;
        const contentW = firstCollection.scrollWidth;
        const staticMaxWidth = visible - MARQUEE_OVERFLOW_GUTTER_PX + MARQUEE_OVERFLOW_FUDGE_PX;

        if (contentW <= staticMaxWidth) {
            marquee.classList.add("is-marquee-static");
            return;
        }

        marquee.classList.remove("is-marquee-static");
        doubleFirstCollectionItems(firstCollection);
        activeTeardown = initMarqueeScrollDirection(marquee);
    };

    const scheduleMeasure = () => {
        window.requestAnimationFrame(measureAndApply);
    };

    measureAndApply();

    firstCollection.querySelectorAll("img").forEach((img) => {
        if (img instanceof HTMLImageElement && !img.complete) {
            img.addEventListener("load", scheduleMeasure, { once: true });
        }
    });

    if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(scheduleMeasure);
        ro.observe(marquee);
    }

    window.addEventListener("load", scheduleMeasure, { once: true });

    return () => {
        ro?.disconnect();
        clearAnimatedState();
        marquee.classList.remove("is-marquee-static");
    };
}
