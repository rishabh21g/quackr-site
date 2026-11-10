"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Bank,
  CaretRight,
  ChatCircleText,
  Check,
  DeviceMobile,
  EnvelopeSimple,
  InstagramLogo,
  LockSimple,
  LockSimpleOpen,
  type Icon,
} from "@phosphor-icons/react";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { Banner, LIVE, flip, useSequence, useSettledReduce, type Mode } from "./shared";

/*
  A SIM swap, then the dominoes. Without Quackr, the bank's "SIM moved" text drops in and the four accounts
  tied to your number unlock one after another, left to right, while the count climbs to 4. With Quackr,
  the text gives way to a calm "nothing to take" card with a green check, and every lock closes again.
*/

const CHAIN: { label: string; Glyph: Icon }[] = [
  { label: "Phone", Glyph: DeviceMobile },
  { label: "Bank", Glyph: Bank },
  { label: "Email", Glyph: EnvelopeSimple },
  { label: "Socials", Glyph: InstagramLogo },
];

/** The text lands, a beat, then one lock every 450ms. */
const delayFor = (step: number) => (step === 0 ? 500 : step === 1 ? 750 : 450);
const STEPS = 1 + CHAIN.length;

function Chip({ label, Glyph, open, reduce, delay }: { label: string; Glyph: Icon; open: boolean; reduce: boolean; delay: number }) {
  // Opening happens on the domino's beat; closing waits for this chip's turn in the switch stagger.
  const wait = open ? 0 : delay;
  return (
    <motion.div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[12px] border bg-surface px-1 pb-2 pt-2.5 transition-[border-color] duration-[var(--dur-slow)]",
        open ? "border-danger/35" : "border-line",
      )}
      style={{ transitionDelay: `${wait}s` }}
      initial={false}
      animate={open && !reduce ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.36, ease: ease.standard }}
    >
      <Glyph size={18} weight="duotone" className="text-ink-2" />
      <span className="max-w-full truncate text-[11px] font-medium leading-[14px] text-ink">{label}</span>
      {/* both locks share one cell and cross-fade, so there is never an empty beat */}
      <span className="grid size-[14px] place-items-center">
        <motion.span
          className="flex text-ink-3 [grid-area:1/1]"
          initial={false}
          animate={{ opacity: open ? 0 : 1, y: open ? -3 : 0 }}
          transition={flip(reduce, wait, 0.24)}
        >
          <LockSimple size={12} weight="bold" />
        </motion.span>
        <motion.span
          className="flex text-danger [grid-area:1/1]"
          initial={false}
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : 3 }}
          transition={flip(reduce, wait, 0.24)}
        >
          <LockSimpleOpen size={12} weight="bold" />
        </motion.span>
      </span>
    </motion.div>
  );
}

export function SimChain({ mode, delay = 0 }: { mode: Mode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, LIVE);
  const reduce = useSettledReduce();
  const safe = mode === "with";
  const step = useSequence(!safe, live && !reduce, STEPS, delayFor);
  const s = reduce ? STEPS : step;

  const texted = !safe && s >= 1;
  const taken = safe ? 0 : Math.max(0, Math.min(s - 1, CHAIN.length));

  return (
    <div ref={ref} className="@container w-full max-w-[340px]" aria-hidden="true">
      {/* the bank text and the calm card share one cell */}
      <div className="grid">
        <motion.div
          className="[grid-area:1/1]"
          initial={false}
          animate={texted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: safe ? 0 : -12, scale: safe ? 0.97 : 0.98 }}
          transition={texted && !reduce ? { type: "spring", stiffness: 380, damping: 30 } : flip(reduce, delay, 0.3)}
        >
          <Banner tile={<ChatCircleText size={16} weight="duotone" />} title="Your bank" time="now" lines={2}>
            Your SIM was moved to a new device. Not you? Call us now.
          </Banner>
        </motion.div>
        <motion.div
          className="[grid-area:1/1]"
          initial={false}
          animate={safe ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={flip(reduce, safe ? delay + 0.16 : 0, 0.38)}
        >
          <Banner tileClassName="bg-live-soft text-live" tile={<Check size={15} weight="bold" />} title="All locked" lines={2}>
            Your real number isn&apos;t on any account.
          </Banner>
        </motion.div>
      </div>

      <div className="mt-4 flex items-stretch gap-1.5">
        {CHAIN.map(({ label, Glyph }, i) => (
          <div key={label} className="contents">
            {i > 0 && <CaretRight size={10} weight="bold" className="hidden shrink-0 self-center text-ink-3/70 @min-[280px]:block" />}
            <Chip
              label={label}
              Glyph={Glyph}
              open={i < taken}
              reduce={reduce}
              // locks close right to left once the switch flips
              delay={delay + 0.22 + (CHAIN.length - 1 - i) * 0.06}
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11.5px] leading-[16px] text-ink-3">
        <SlotText value={taken} duration={0.5} className="font-mono font-semibold text-ink" />{" "}
        of 4 accounts taken over
      </p>
    </div>
  );
}

export const SIM_SR: Record<Mode, string> = {
  without:
    "A text from your bank: your SIM was moved to a new device. Then your phone, bank, email and social accounts unlock one after another. 4 of 4 accounts taken over.",
  with: "All locked: your real number isn't on any account, so a SIM swap reaches nothing. 0 of 4 accounts taken over.",
};
