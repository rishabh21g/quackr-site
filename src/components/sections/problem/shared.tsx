"use client";
// Banner adapted from Opensource UI AppleNotificationBanner (MIT, © 2026 Bidyut Kundu).
// Kept: the iOS banner grid (app tile spanning two rows, title + time, a clamped message). Changed: no image,
// no dismiss button or trigger, Quackr tokens instead of neutral-*, and motion is driven by the widgets.

import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotion, type Transition } from "motion/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

export type Mode = "without" | "with";

/** Widgets play only while visible; this keeps them from starting on a sliver. */
export const LIVE = { margin: "-10% 0px" } as const;

const noop = () => () => {};

/** Reduced motion, but only after hydration, so the server and the first client render match. */
export function useSettledReduce() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/**
 * A step counter for a widget's "Without" story. It counts up while `play` and `live` are both true, waiting
 * `delayFor(step)` ms before each step, and starts again from 0 each time `play` turns back on.
 * `delayFor` must be stable (define it at module level). Timers only run on the client, so SSR always renders step 0.
 */
export function useSequence(play: boolean, live: boolean, total: number, delayFor: (step: number) => number) {
  const [seq, setSeq] = useState({ play, step: 0 });
  let step = seq.step;
  // Adjust state while rendering (not in an effect) when the mode flips.
  if (seq.play !== play) {
    step = play ? 0 : seq.step;
    setSeq({ play, step });
  }

  useEffect(() => {
    if (!play || !live || step >= total) return;
    const id = window.setTimeout(() => setSeq((s) => ({ ...s, step: s.step + 1 })), delayFor(step));
    return () => window.clearTimeout(id);
  }, [play, live, step, total, delayFor]);

  return step;
}

/** The flip between states: a calm glide, or nothing under reduced motion. */
export function flip(reduce: boolean, delay = 0, duration = 0.42): Transition {
  return reduce ? { duration: 0 } : { duration, ease: ease.standard, delay };
}

/** Numbers inside a banner title. */
export function Num({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[11.5px] font-medium tabular-nums", className)}>{children}</span>;
}

type BannerProps = {
  tile: React.ReactNode;
  tileClassName?: string;
  title: React.ReactNode;
  time?: string;
  children: React.ReactNode;
  /** Clamp the message to one line (fixed-height stacks) or two. */
  lines?: 1 | 2;
  className?: string;
};

/** An iOS-style notification banner, scaled down for a widget. */
export function Banner({ tile, tileClassName, title, time, children, lines = 1, className }: BannerProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[30px_minmax(0,1fr)] items-start gap-x-2.5 rounded-[14px] border border-line bg-surface px-3 py-2.5 shadow-[0_1px_2px_rgba(22,23,28,0.04)]",
        className,
      )}
    >
      <span
        className={cn(
          "row-span-2 mt-px flex size-[30px] items-center justify-center rounded-[8px] bg-ink/[0.05] text-ink-2",
          tileClassName,
        )}
      >
        {tile}
      </span>
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-[12.5px] font-semibold leading-[17px] text-ink">{title}</p>
        {time && <span className="shrink-0 text-[11px] leading-[17px] text-ink-3">{time}</span>}
      </div>
      <p
        className={cn(
          "min-w-0 text-[12.5px] leading-[17px] text-ink-2",
          lines === 1 ? "truncate" : "line-clamp-2",
        )}
      >
        {children}
      </p>
    </div>
  );
}
