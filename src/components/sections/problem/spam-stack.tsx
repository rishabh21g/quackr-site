"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ChatCircleText, PhoneIncoming } from "@phosphor-icons/react";
import { Mark } from "@/components/brand/logo";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { smooth } from "@/lib/motion";
import { Banner, LIVE, Num, flip, useSequence, useSettledReduce, type Mode } from "./shared";

/*
  A lock screen that fills with spam. Without Quackr, banners land one by one (newest on top, three on
  screen) and the weekly count climbs; after the first four, a new one keeps arriving every few seconds while
  the card is on screen. With Quackr, the stack folds into one calm banner and the count rolls to 0.
*/

const SPAM = [
  {
    call: true,
    title: (
      <>
        Unknown · <Num>+1 (877) 555-0132</Num>
      </>
    ),
    text: "Your car warranty is about to expire…",
  },
  { call: false, title: <Num>+1 (302) 555-0187</Num>, text: "Congrats! You've won a $500 gift card. Claim now" },
  { call: false, title: <Num>+1 (888) 555-0119</Num>, text: "USPS: your package is on hold, confirm address…" },
  { call: false, title: <Num>+1 (646) 555-0144</Num>, text: "Hi, is this Sam? Wrong number, but let's chat 😊" },
];

const H = 60; // banner height
const SLOT = H + 7; // banner + gap
const SHOWN = 3;
const TIMES = ["now", "2m ago", "7m ago"];
const BASE = 43; // this week, before the first one lands

/** The first four land quickly, then one more every few seconds. */
const delayFor = (step: number) => (step === 0 ? 500 : step < SPAM.length ? 850 : 3000);

export function SpamStack({ mode, delay = 0 }: { mode: Mode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, LIVE);
  const reduce = useSettledReduce();
  const safe = mode === "with";
  const step = useSequence(!safe, live && !reduce, Infinity, delayFor);
  const n = reduce ? SPAM.length : step;

  // Newest first: slot 0 is the top banner.
  const visible = Array.from({ length: Math.min(n, SHOWN) }, (_, slot) => n - 1 - slot);

  return (
    <div ref={ref} className="w-full max-w-[340px]" aria-hidden="true">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <span className="flex items-baseline gap-2">
          <span className="text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">9:41</span>
          <span className="text-[11.5px] text-ink-3">Lock screen</span>
        </span>
        <span className="inline-flex items-baseline gap-1 whitespace-nowrap text-[11.5px] text-ink-3">
          <SlotText
            value={safe ? 0 : BASE + n}
            duration={0.7}
            className={cn(
              "font-mono text-[12.5px] font-semibold transition-colors duration-[var(--dur-slow)]",
              safe ? "text-ink" : "text-danger",
            )}
          />
          this week
        </span>
      </div>

      <div className="relative" style={{ height: SLOT * (SHOWN - 1) + H }}>
        <AnimatePresence initial={false}>
          {visible.map((arrival, slot) => {
            const msg = SPAM[arrival % SPAM.length]!;
            return (
              <motion.div
                key={arrival}
                className="absolute inset-x-0 top-0"
                style={{ zIndex: SHOWN - slot }}
                initial={reduce ? false : { opacity: 0, y: -14, scale: 0.97 }}
                // With Quackr, every banner folds into the middle slot, the outer ones first.
                animate={safe ? { opacity: 0, y: SLOT, scale: 0.94 } : { opacity: 1, y: slot * SLOT, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                transition={safe ? flip(reduce, delay + (slot === 1 ? 0.06 : 0), 0.38) : reduce ? { duration: 0 } : smooth}
              >
                <Banner
                  className="h-[60px] content-center"
                  tile={msg.call ? <PhoneIncoming size={16} weight="duotone" /> : <ChatCircleText size={16} weight="duotone" />}
                  title={msg.title}
                  time={TIMES[slot]}
                >
                  {msg.text}
                </Banner>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.div
          className="absolute inset-x-0 top-0"
          style={{ zIndex: SHOWN + 1 }}
          initial={false}
          animate={safe ? { opacity: 1, y: SLOT, scale: 1 } : { opacity: 0, y: SLOT, scale: 0.96 }}
          transition={flip(reduce, safe ? delay + 0.24 : 0, 0.4)}
        >
          <Banner
            className="h-[60px] content-center"
            tileClassName="bg-duck-soft"
            tile={<Mark className="size-[20px]" />}
            title="Spam goes to your decoy"
            time="now"
          >
            <Num className="text-[12px] text-ink">0</Num> on your phone
          </Banner>
        </motion.div>
      </div>
    </div>
  );
}

export const SPAM_SR: Record<Mode, string> = {
  without:
    "A lock screen filling with spam: a car warranty robocall, a fake $500 gift card, a fake parcel text and a wrong-number scam. 47 this week.",
  with: "The spam stack folds into one calm notice: spam goes to your decoy number, 0 on your phone.",
};
