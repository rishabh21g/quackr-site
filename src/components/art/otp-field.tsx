"use client";
// Adapted from Opensource UI OtpUnderlineInput (MIT, © 2026 Bidyut Kundu) and Arc UI OtpInput (MIT, © 2026 Elia Kuratli).
// Display-only, driven by props: no inputs, so nothing in the art can take focus. Deliberately not the six boxes of
// src/components/auth/otp-input.tsx. Kept from OSUI: the code sits on hairline rules instead of in boxes, and the active
// rule is ink and scales out from its centre. Kept from Arc: one indicator for the whole code that glides slot to slot
// (here the ink rule plus a caret), and digits that rise into their slot. Added: one field shell like the phone field
// above it, the code grouped 3 + 3 around a dash so it reads like the SMS ("482 917"), and on completion each group
// drops into a duck-soft chip, the same chip the SMS shows. CSS module rewritten to Tailwind; Arc's blur dropped, so
// only transform and opacity move.

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/** Width of the dash between the two groups (px). The indicator's travel is computed from it. */
const DASH = 20;

type OtpDisplayProps = {
  /** Digits shown so far, left to right. */
  value: string;
  length?: number;
  /** Slot the caret sits on, or null to hide it. */
  cursor?: number | null;
  /** The finished look (each group in a duck chip). Defaults to: every digit in and no caret. */
  complete?: boolean;
  reduce?: boolean;
  className?: string;
};

export function OtpDisplay({ value, length = 6, cursor = null, complete, reduce = false, className }: OtpDisplayProps) {
  const split = Math.ceil(length / 2);
  const done = complete ?? (value.length >= length && cursor === null);
  // Hidden, the indicator parks on the last digit so it fades out in place instead of sliding home.
  const at = Math.max(0, Math.min(length - 1, cursor ?? value.length - 1));
  const groups = [
    Array.from({ length: split }, (_, i) => i),
    Array.from({ length: length - split }, (_, i) => split + i),
  ];

  return (
    <div
      className={cn(
        "flex h-11 items-stretch rounded-[14px] border bg-surface px-2 transition-colors duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none sm:h-12 sm:px-2.5",
        cursor !== null ? "border-ink" : "border-line-strong",
        className,
      )}
    >
      <div className="relative flex min-w-0 flex-1 items-stretch">
        {groups.map((group, g) => (
          <div key={g} className="contents">
            {g > 0 && (
              <span aria-hidden className="grid shrink-0 place-items-center" style={{ width: DASH }}>
                <span
                  className={cn(
                    "h-[1.5px] w-2 rounded-full transition-colors duration-[var(--dur-slow)] motion-reduce:transition-none",
                    done ? "bg-ink-2" : "bg-ink-3/45",
                  )}
                />
              </span>
            )}
            <div className="relative flex min-w-0 items-stretch" style={{ flex: `${group.length} 1 0%` }}>
              {/* the chip the group drops into once the code is complete: the SMS's own duck chip */}
              <motion.span
                aria-hidden
                className="absolute inset-x-0 inset-y-1.5 origin-left rounded-[8px] bg-duck-soft"
                initial={false}
                animate={done ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.6 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : done
                      ? { duration: 0.34, delay: g * 0.06, ease: [...ease.enter] }
                      : { duration: 0.15, ease: [...ease.standard] }
                }
              />
              {group.map((i) => (
                <Slot key={i} char={value[i] ?? ""} done={done} reduce={reduce} />
              ))}
            </div>
          </div>
        ))}

        {/* Arc's single indicator: one slot wide, moved by whole slots (plus the dash past the split) so it glides. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 transition-[transform,opacity] duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none"
          style={{
            width: `calc((100% - ${DASH}px) / ${length})`,
            transform: `translateX(calc(${at} * 100% + ${at >= split ? DASH : 0}px))`,
            opacity: cursor === null ? 0 : 1,
          }}
        >
          <motion.span
            className="absolute left-1/2 top-1/2 -ml-px h-[22px] w-[2px] -translate-y-1/2 rounded-full bg-ink"
            initial={false}
            animate={cursor === null || reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
            transition={
              cursor === null || reduce
                ? { duration: 0 }
                : { duration: 1.05, times: [0, 0.5, 0.55, 1], repeat: Infinity, ease: "linear" }
            }
          />
          <span
            className={cn(
              "absolute inset-x-1.5 bottom-2 h-[1.5px] rounded-full bg-ink transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] motion-reduce:transition-none sm:bottom-2.5",
              cursor === null ? "scale-x-0" : "scale-x-100",
            )}
          />
        </span>
      </div>
    </div>
  );
}

/** One digit on its rule. The digit rises up a short track clipped by the slot; the rule turns duck once it holds a digit. */
function Slot({ char, done, reduce }: { char: string; done: boolean; reduce: boolean }) {
  return (
    <span className="relative grid min-w-0 flex-1 place-items-center overflow-hidden">
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-1.5 bottom-2 h-px rounded-full transition-[background-color,opacity] duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none sm:bottom-2.5",
          char ? "bg-duck-deep" : "bg-line-strong",
          done && "opacity-0",
        )}
      />
      <AnimatePresence initial={false}>
        {char ? (
          <motion.span
            key={char}
            className="absolute inset-0 grid place-items-center font-mono text-[21px] font-medium leading-none tabular-nums text-ink sm:text-[22px]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "70%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-40%", transition: { duration: 0.12, ease: [...ease.standard] } }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [...ease.enter] }}
          >
            {char}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
