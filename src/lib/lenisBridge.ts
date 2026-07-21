import type Lenis from "lenis";

// The home page owns the single Lenis smooth-scroll instance (see page.tsx).
// Components elsewhere in the tree that need to hijack scroll — e.g. to pin
// a section and step through it frame by frame — must pause Lenis's own
// scroll animation first, or its independent easing keeps carrying the page
// past the pinned section regardless of any preventDefault() they call.
export const lenisBridge: { current: Lenis | null } = { current: null };
