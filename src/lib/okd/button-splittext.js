import {
    hasSplitText,
    prefersReducedMotion,
} from "./utils.js";

let buttonSplitScheduled = false;

/**
 * Wait for window load + document.fonts.ready + 2 rAFs so SplitText 3.14.2
 * finds `document.fonts.status === "loaded"` and doesn't log errors.
 *
 * @returns {Promise<void>}
 */
function whenReadyForButtonSplit() {
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

/**
 * SplitText may nest ignored nodes inside line wrappers. `position:absolute` on `.u-btn__arrow`
 * then uses that wrapper as its containing block (icon overlaps the label). Keep the arrow a
 * direct child of `.u-btn--1` so it matches pill `position:relative` and `inset-inline-end: 12px`.
 *
 * @param {HTMLElement} button
 */
function reparentArrowToButtonRoot(button) {
    const arrow = button.querySelector("[data-u-btn-no-split]");
    if (arrow && arrow.parentElement !== button) {
        button.appendChild(arrow);
    }
}

/**
 * Perform the actual button SplitText pass. Called only after fonts are ready.
 */
function applyButtonSplits() {
    if (!hasSplitText()) {
        return;
    }

    const offsetIncrement = 0.01;
    const buttons = document.querySelectorAll(".u-btn--1:not(.-dot-indicator)");

    buttons.forEach((button) => {
        if (button.dataset.buttonAnimateCharsReady === "true") {
            return;
        }

        const target = button.querySelector("[data-button-animate-chars], .btn_label") ?? button;

        const split = window.SplitText.create(target, {
            // Match scroll-text-reveal: avoid aria-label on hosts where it is prohibited (e.g. generic).
            aria: "none",
            charsClass: "btn-char",
            ignore: "[data-u-btn-no-split], .wpcf7-spinner",
            type: "chars",
        });

        if (split?.chars?.length) {
            split.chars.forEach((char, index) => {
                char.style.transitionDelay = `${index * offsetIncrement}s`;
            });
        }

        reparentArrowToButtonRoot(button);
        button.dataset.buttonAnimateCharsReady = "true";
    });
}

/**
 * SplitText setup for `.u-btn--1` hover character stagger.
 *
 * @returns {boolean} false when SplitText is unavailable and caller should retry.
 */
export function initButtonCharacterStagger() {
    if (prefersReducedMotion()) {
        return true;
    }

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return true;
    }

    if (!hasSplitText()) {
        return false;
    }

    if (!buttonSplitScheduled) {
        buttonSplitScheduled = true;
        whenReadyForButtonSplit().then(applyButtonSplits);
    }

    return true;
}
