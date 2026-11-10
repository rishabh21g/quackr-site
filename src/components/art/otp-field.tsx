"use client";
// Adapted from Arc UI OtpInput (MIT, © 2026 Elia Kuratli), with the filled look of Opensource UI OtpBoxedInput
// (MIT, © 2026 Bidyut Kundu), the same look as src/components/auth/otp-input.tsx.
// Display-only, driven by props: no inputs, so nothing in the art can take focus. Kept from Arc: one ring for the
// whole row that glides to the slot being filled, and digits that rise into their slot and unblur. Kept from OSUI:
// filled slots go duck-soft, because a code is the one place duck belongs. CSS module rewritten to Tailwind.

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/** Gap between slots (px). The ring's travel is computed from it, so keep the class below in sync. */
const GAP = 8;

type OtpDisplayProps = {
  /** Digits shown so far, left to right. */
  value: string;
  length?: number;
  /** Slot the ring sits on, or null to hide it. */
  cursor?: number | null;
  reduce?: boolean;
  className?: string;
};

export function OtpDisplay({ value, length = 6, cursor = null, reduce = false, className }: OtpDisplayProps) {
  const ringAt = cursor === null ? 0 : Math.max(0, Math.min(length - 1, cursor));

  return (
    <div className={cn("relative flex gap-2", className)}>
      {Array.from({ length }, (_, i) => {
        const char = value[i] ?? "";
        return (
          <span
            key={i}
            className={cn(
              "relative grid h-11 min-w-0 flex-1 sm:h-12 place-items-center overflow-hidden rounded-[12px] border transition-[background-color,border-color] duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
              char ? "border-duck-deep/45 bg-duck-soft" : "border-line bg-surface",
            )}
          >
            <AnimatePresence initial={false}>
              {char ? (
                <motion.span
                  key={char}
                  className="absolute inset-0 grid place-items-center font-mono text-[22px] font-medium leading-none tabular-nums text-ink"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.9, transition: { duration: 0.1, ease: [...ease.standard] } }}
                  transition={reduce ? { duration: 0 } : { duration: 0.26, ease: [...ease.enter] }}
                >
                  {char}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
        );
      })}

      {/* Arc's single ring: same size as a slot, translated by whole slots so it glides instead of jumping. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 rounded-[12px] border-[1.5px] border-ink transition-[transform,opacity] duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - ${(length - 1) * GAP}px) / ${length})`,
          transform: `translateX(calc(${ringAt} * (100% + ${GAP}px)))`,
          opacity: cursor === null ? 0 : 1,
        }}
      />
    </div>
  );
}
