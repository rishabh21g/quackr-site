"use client";
// Adapted from Opensource UI ProgressRingCard (MIT, © 2026 Bidyut Kundu).
// Adapted from Arc UI Switch and Countdown (MIT, © 2026 Elia Kuratli). Radix removed, CSS module rewritten to Tailwind.

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView, type Transition } from "motion/react";
import { ArrowClockwise, Check, LockSimple, SimCard } from "@phosphor-icons/react";
import { US } from "country-flag-icons/react/3x2";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { FLAG, LIVE, useSettledReduce } from "./shared";

/*
  A private number as an eSIM you own: the number, a ring of days left that drains when
  it scrolls in, a live countdown, Renew (the ring refills on a spring and the days roll
  back to 30) and an auto-renew switch whose caption answers what happens next.
*/

const TERM = 30;
const DAY = 86400;
const START = 22 * DAY + 14 * 3600 + 6 * 60 + 31; // seconds left on the rental
const R = 24;
const CIRC = 2 * Math.PI * R;
const DONE_FOR = 2600;

/** Critically damped, like Arc's switch glide: lands on the value it reports. */
const glide: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };
const refill: Transition = { type: "spring", visualDuration: 0.75, bounce: 0 };
const drain: Transition = { duration: 1.1, ease: ease.standard, delay: 0.15 };

function clock(total: number) {
  const d = Math.floor(total / DAY);
  const h = Math.floor((total % DAY) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d}d ${p(h)}:${p(m)}:${p(s)}`;
}

/** Words rise in and the old ones lift away (Arc's Swap), or just change under reduced motion. */
function Swap({ id, text, reduce, className }: { id: string; text: string; reduce: boolean; className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={id}
          className="block truncate"
          initial={reduce ? false : { opacity: 0, y: "0.5em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.5em", transition: { duration: 0.16 } }}
          transition={{ duration: 0.26, ease: ease.enter }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** A tiny SIM chip: contacts drawn in duck, because this number is your decoy. */
function SimChip() {
  return (
    <svg viewBox="0 0 34 26" className="h-[24px] w-[32px] shrink-0" aria-hidden="true">
      <rect x="0.75" y="0.75" width="32.5" height="24.5" rx="5" fill="var(--duck-soft)" stroke="var(--duck-deep)" strokeWidth="1.2" />
      <path d="M12 1v8M22 1v8M12 17v8M22 17v8M1 13h9M24 13h9" stroke="var(--duck-deep)" strokeWidth="1.1" />
      <rect x="10" y="9" width="14" height="8" rx="2.5" fill="none" stroke="var(--duck-deep)" strokeWidth="1.1" />
    </svg>
  );
}

export function PrivateSim() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { ...LIVE, once: true });
  const live = useInView(ref, LIVE);
  const reduce = useSettledReduce();
  const [left, setLeft] = useState(START);
  const [renewals, setRenewals] = useState(0);
  const [done, setDone] = useState(false);
  const [auto, setAuto] = useState(true);
  const [pressed, setPressed] = useState(false);
  const doneTimer = useRef<number | undefined>(undefined);
  const ring = useAnimationControls();
  const labelId = useId();
  const captionId = useId();

  // The clock ticks only while the card is on screen.
  useEffect(() => {
    if (!live || reduce) return;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [live, reduce]);

  useEffect(() => () => window.clearTimeout(doneTimer.current), []);

  // The ring starts full and drains to what's left once seen; the day count rolls with it.
  const days = seen || reduce ? Math.ceil(left / DAY) : TERM;

  function renew() {
    setLeft(TERM * DAY);
    setRenewals((n) => n + 1);
    window.clearTimeout(doneTimer.current);
    // Let the arrow finish its turn, then confirm, then settle back to Renew.
    doneTimer.current = window.setTimeout(
      () => {
        setDone(true);
        doneTimer.current = window.setTimeout(() => setDone(false), DONE_FOR);
      },
      reduce ? 0 : 420,
    );
    if (!reduce) void ring.start({ scale: [1, 1.08, 1], transition: { duration: 0.5, times: [0, 0.35, 1], ease: ease.standard } });
  }

  const releaseSwitch = () => setPressed(false);
  const stretch = pressed && !reduce ? 4 : 0;

  return (
    <div
      ref={ref}
      className="@container w-full max-w-[340px] rounded-[20px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-2 text-[12px] text-ink-3">
          <SimCard size={15} weight="duotone" className="shrink-0 text-ink-2" />
          <US className={cn(FLAG, "h-[12px] w-[18px]")} aria-hidden="true" />
          <span className="truncate">United States</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-duck-deep/30 bg-duck-soft py-0.5 pl-1.5 pr-2 text-[11px] font-medium leading-[16px] text-ink">
          <LockSimple size={11} weight="bold" className="-mt-px" />
          Private
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 whitespace-nowrap font-mono text-[clamp(17px,7.4cqw,22px)] font-medium leading-none tracking-tight tabular-nums text-ink">
          +1 415 555 0192
        </p>
        <SimChip />
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
        <motion.div animate={ring} className="relative h-[52px] w-[52px] shrink-0 sm:h-[58px] sm:w-[58px]">
          <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="30" cy="30" r={R} fill="none" stroke="var(--line)" strokeWidth="5" />
            <motion.circle
              cx="30"
              cy="30"
              r={R}
              fill="none"
              stroke="var(--duck-deep)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={false}
              animate={{ strokeDashoffset: CIRC * (1 - days / TERM) }}
              transition={reduce ? { duration: 0 } : renewals ? refill : drain}
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center leading-none" aria-hidden="true">
            <SlotText value={days} className="font-mono text-[15px] font-semibold text-ink" duration={renewals ? 0.7 : 1.1} />
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-ink-3">
              <span className="mr-[-0.08em]">days</span>
            </span>
          </span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <Swap
            id={done ? "done" : "own"}
            text={done ? "Renewed · 30 days" : "Yours for 30 days"}
            reduce={reduce}
            className="text-[13px] font-medium leading-[18px] text-ink"
          />
          <p className="mt-0.5 truncate font-mono text-[11.5px] tabular-nums text-ink-3">{clock(left)} left</p>
        </div>

        <button
          type="button"
          onClick={renew}
          className="inline-flex h-10 min-w-[88px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-[12px] font-medium text-ink transition-[background-color,border-color] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:border-ink/30 hover:bg-paper hover:duration-[var(--hover-in)] active:translate-y-px"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {done ? (
              <motion.span
                key="check"
                className="flex"
                initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
                transition={glide}
              >
                <Check size={13} weight="bold" />
              </motion.span>
            ) : (
              <motion.span
                key="renew"
                className="flex"
                initial={false}
                animate={{ rotate: reduce ? 0 : -360 * renewals, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={reduce ? { duration: 0 } : { type: "spring", visualDuration: 0.6, bounce: 0.2 }}
              >
                <ArrowClockwise size={13} weight="bold" />
              </motion.span>
            )}
          </AnimatePresence>
          {done ? "Renewed" : "Renew"}
        </button>
      </div>

      {/* Auto-renew: the whole row is the switch, so the target is big. */}
      <button
        type="button"
        role="switch"
        aria-checked={auto}
        aria-labelledby={labelId}
        aria-describedby={captionId}
        onClick={() => setAuto((a) => !a)}
        onPointerDown={(e) => e.button === 0 && setPressed(true)}
        onPointerUp={releaseSwitch}
        onPointerLeave={releaseSwitch}
        onPointerCancel={releaseSwitch}
        onKeyDown={(e) => e.key === " " && setPressed(true)}
        onKeyUp={releaseSwitch}
        onBlur={releaseSwitch}
        className="group/sw -mx-2 mt-2 flex min-h-11 w-[calc(100%+16px)] items-center gap-3 rounded-[10px] px-2 text-left transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:bg-paper hover:duration-[var(--hover-in)]"
      >
        <span className="min-w-0 flex-1">
          <span id={labelId} className="block text-[12.5px] font-medium leading-[17px] text-ink">
            Auto-renew
          </span>
          <span id={captionId} className="block text-[11.5px] leading-[16px] text-ink-3">
            <Swap
              id={auto ? "on" : "off"}
              text={auto ? `Renews itself in ${days} days` : `Ends in ${days} days. We'll remind you`}
              reduce={reduce}
            />
          </span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "relative flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
            auto ? "bg-ink" : "bg-line-strong",
          )}
        >
          {/* The thumb stretches like a held finger, keeps its far edge anchored, then glides. */}
          <motion.span
            className="block h-4 rounded-full bg-surface shadow-[0_1px_2px_rgba(22,23,28,0.2)]"
            initial={false}
            animate={{ x: auto ? 16 - stretch : 0, width: 16 + stretch }}
            transition={reduce ? { duration: 0 } : glide}
          />
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {done ? "Renewed. 30 days left." : ""}
      </span>
    </div>
  );
}
