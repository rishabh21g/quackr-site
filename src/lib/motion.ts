import type { Transition, Variants } from "motion/react";

/*
  Motion presets. Same feel as the CSS tokens in globals.css:
  enters ease out, presses are instant, nothing bounces more than once.
*/
export const ease = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0.2, 1],
} as const;

/** Presses, toggles, small state flips. */
export const snappy: Transition = { type: "spring", stiffness: 520, damping: 34, mass: 0.6 };

/** Panels, sheets, shared highlights. */
export const smooth: Transition = { type: "spring", stiffness: 260, damping: 30 };

/**
 * Scroll-in: a 12px rise and fade. The rise is a `transform` string rather than `y` on purpose: motion hands
 * opacity and transform to WAAPI (compositor thread), while `y` is stepped from JS every frame. Reveals fire mid-scroll,
 * so keeping them off the main thread is what keeps them smooth on phones.
 */
export const revealHidden = { opacity: 0, transform: "translateY(12px)" } as const;
// transitionEnd clears the transform once settled, so a revealed block doesn't keep a stacking context (y: 0 never did).
export const revealShown = { opacity: 1, transform: "translateY(0px)", transitionEnd: { transform: "none" } } as const;

export const reveal: Variants = {
  hidden: revealHidden,
  show: { ...revealShown, transition: { duration: 0.5, ease: ease.enter } },
};

/** Parent variant that staggers its `reveal` children. */
export function stagger(gap = 0.08, delay = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
}

/** Shared in-view options: fire once, a little before the element is fully on screen. */
export const inView = { once: true, margin: "0px 0px -12% 0px" } as const;
