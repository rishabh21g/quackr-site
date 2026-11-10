"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

/** Flag chip: tiny radius and a hairline so white flags don't vanish on white. */
export const FLAG = "shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(22,23,28,0.08)]";

/** Widgets loop only while visible; this keeps them from starting on a sliver. */
export const LIVE = { margin: "-10% 0px" } as const;

const noop = () => () => {};

/** True once hydrated, so server and first client render always match. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Reduced motion, but only after hydration, so server and first client render show the same thing. */
export function useSettledReduce() {
  const hydrated = useHydrated();
  return !!useReducedMotion() && hydrated;
}
