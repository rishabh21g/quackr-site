"use client";
// Adapted from Arc UI PhoneInput (MIT, © 2026 Elia Kuratli).
// Display-only, driven by props. Kept: one shell with one border, the country trigger (flag, calling code, chevron)
// behind a hairline divider, the flag layer that rolls in the direction of the list (a country further down rises
// from below and unblurs), and the faint guide that shows the number in the country's shape. Dropped: the listbox,
// search, typing and E.164 output. The trigger keeps a fixed width instead of springing, so nothing reflows mid-scroll.
// CSS module rewritten to Tailwind with Quackr tokens; lucide swapped for Phosphor.

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

export type PhoneCountry = {
  /** ISO 3166-1 alpha-2, e.g. "GB". */
  iso: string;
  /** Calling code without the plus. */
  dial: string;
  /** Position in the (alphabetical) country list; sets the roll direction. */
  order: number;
  Flag: ComponentType<{ className?: string }>;
};

/** Arc's layer roll: the incoming country rises from the list direction and unblurs, the outgoing one leaves the other way. */
const layer: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: `${dir * 0.6}em`, filter: "blur(2px)" }),
  rest: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  exit: (dir: number) => ({ opacity: 0, y: `${dir * -0.5}em`, filter: "blur(1px)", transition: { duration: 0.12, ease: [...ease.standard] } }),
};
const fade: Variants = { enter: { opacity: 0 }, rest: { opacity: 1, y: 0, filter: "none" }, exit: { opacity: 0, transition: { duration: 0 } } };

const FLAG = "h-[12px] w-[18px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(22,23,28,0.08)]";

type PhoneFieldDisplayProps = {
  country: PhoneCountry;
  /** The number area: a guide, a value, or both. */
  children: ReactNode;
  /** Focus look: the border firms up to ink, as Arc's `.control:has(:focus)`. */
  focused?: boolean;
  reduce?: boolean;
  className?: string;
};

export function PhoneFieldDisplay({ country, children, focused = false, reduce = false, className }: PhoneFieldDisplayProps) {
  // Roll direction from the previous country, kept in state so it's known during render (Arc keeps it in state too).
  const [roll, setRoll] = useState({ iso: country.iso, order: country.order, dir: 1 });
  if (roll.iso !== country.iso) {
    setRoll({ iso: country.iso, order: country.order, dir: Math.sign(country.order - roll.order) || 1 });
  }
  const { Flag } = country;

  return (
    <div
      className={cn(
        "flex h-12 min-w-0 items-stretch rounded-[14px] border bg-surface transition-colors duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
        focused ? "border-ink" : "border-line-strong",
        className,
      )}
    >
      {/* the trigger: flag + calling code + chevron, a hairline divider on its right edge */}
      <span className="relative flex shrink-0 items-center gap-1.5 pl-3 pr-2.5 after:absolute after:inset-y-3 after:right-0 after:w-px after:bg-line">
        <span className="relative h-5 w-[50px] overflow-hidden">
          <AnimatePresence initial={false} custom={roll.dir}>
            <motion.span
              key={country.iso}
              className="absolute inset-0 flex items-center gap-1.5"
              custom={roll.dir}
              variants={reduce ? fade : layer}
              initial="enter"
              animate="rest"
              exit="exit"
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      y: { type: "spring", visualDuration: 0.28, bounce: 0 },
                      opacity: { duration: 0.2, ease: [...ease.enter] },
                      filter: { duration: 0.22, ease: [...ease.enter] },
                    }
              }
            >
              <Flag className={FLAG} />
              <span className="font-mono text-[13px] font-medium tabular-nums text-ink">+{country.dial}</span>
            </motion.span>
          </AnimatePresence>
        </span>
        <CaretDown size={12} weight="bold" className="text-ink-3" />
      </span>

      {/* the number and its guide share one box */}
      <span className="flex min-w-0 flex-1 items-center overflow-hidden px-2.5">{children}</span>
    </div>
  );
}
