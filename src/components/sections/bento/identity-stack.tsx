"use client";
// Adapted from Opensource UI CreditCardGlass (MIT, © 2026 Bidyut Kundu).
// Kept: the card's layout (chip and tier on top, number, then holder, expiry and network mark along the bottom).
// Dropped: the gradient body and the blurred teal/cyan glows; the card is flat ink with a hairline.
// Adapted from Arc UI PasswordField reveal toggle (MIT, © 2026 Elia Kuratli).

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Mark } from "@/components/brand/logo";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { useSettledReduce } from "./shared";

/*
  Quackr ID as one card: a virtual card printed with the identity it belongs to (holder
  "Dove 42", the dove.42@quackr.id alias). The number is masked; the eye shows it for a few
  seconds, then it masks itself again. The card itself never moves.
*/

const NUMBER = "4821 6604 1937 7390";
const MASKED = "•••• •••• •••• 7390";
const HIDE_AFTER = 6000;

export function IdentityStack() {
  const reduce = useSettledReduce();
  const [shown, setShown] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  function toggle() {
    window.clearTimeout(hideTimer.current);
    const next = !shown;
    setShown(next);
    // Like a banking app: the number masks itself again after a few seconds.
    if (next) hideTimer.current = window.setTimeout(() => setShown(false), HIDE_AFTER);
  }

  return (
    <div
      className={cn(
        // Sits flat and still: no hover or pointer motion on the card itself.
        "@container relative aspect-[1.586/1] w-full max-w-[296px] rounded-[20px] bg-ink text-paper",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),var(--shadow-card)]",
      )}
    >
      <div className="flex h-full flex-col justify-between p-[clamp(14px,6.5cqw,20px)]">
        {/* Top: chip and tier, the reveal toggle on the right. */}
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-2.5 pt-0.5">
            <span aria-hidden="true" className="block h-[22px] w-[30px] rounded-[6px] bg-duck-soft/90" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">Virtual</span>
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={shown}
            aria-label={shown ? "Hide card number" : "Show card number"}
            className="-m-2.5 flex h-11 w-11 items-center justify-center rounded-full text-paper/70 transition-[color,background-color] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:bg-paper/10 hover:text-paper hover:duration-[var(--hover-in)] active:translate-y-px focus-visible:outline-paper"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={shown ? "hide" : "show"}
                initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {shown ? <EyeSlash size={17} weight="bold" /> : <Eye size={17} weight="bold" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* Bottom: number, then holder, expiry and the Quackr mark where a network logo would sit. */}
        <div>
          <p className="whitespace-nowrap font-mono text-[clamp(13px,6.4cqw,18px)] font-medium leading-tight tracking-[0.08em] tabular-nums text-paper">
            <span className="sr-only">Card number {shown ? NUMBER : "hidden, ending 7390"}</span>
            <span aria-hidden="true">
              <SlotText value={shown ? NUMBER : MASKED} duration={0.5} stagger={0.018} spins={0} align="start" />
            </span>
          </p>

          <div className="mt-[clamp(10px,5cqw,16px)] flex items-start gap-4">
            <span className="min-w-0">
              <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-paper/45">Holder</span>
              <span className="block text-[12px] font-medium tracking-[0.04em]">Dove 42</span>
              <span className="block truncate font-mono text-[10px] text-paper/50">dove.42@quackr.id</span>
            </span>
            <span className="shrink-0">
              <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-paper/45">Exp</span>
              <span className="block font-mono text-[12px] tabular-nums">09/29</span>
            </span>
            <Mark className="ml-auto h-8 w-8 shrink-0 self-end" />
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {shown ? "Card number shown" : ""}
      </span>
    </div>
  );
}
