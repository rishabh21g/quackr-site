"use client";
// Adapted from Opensource UI StackedCardsEffect + CreditCardGlass (MIT, © 2026 Bidyut Kundu).
// Adapted from Arc UI PasswordField reveal toggle (MIT, © 2026 Elia Kuratli).

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { EnvelopeSimple, Eye, EyeSlash, Key, LockSimple, LockSimpleOpen } from "@phosphor-icons/react";
import { Mark } from "@/components/brand/logo";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { LIVE, useSettledReduce } from "./shared";

/*
  Quackr ID as a wallet: three layers of one identity, stacked and tilted. The vault and
  the email alias peek out above the virtual card. Hover (or focus inside, or scrolling
  it into view on touch screens) straightens the stack and fans the layers out so each
  shows its second line. The card number is masked; the eye shows it for a few seconds.
*/

const NUMBER = "4821 6604 1937 7390";
const MASKED = "•••• •••• •••• 7390";
const CVC = "318";
const HIDE_AFTER = 6000;

/** Shared transition: arrives fast, leaves slow, nothing on reduced motion. */
const MOVE =
  "transition-[translate,rotate,scale] duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none";

export function IdentityStack() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { ...LIVE, once: true });
  const reduce = useSettledReduce();
  const [shown, setShown] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  // Touch screens have no hover, so the stack fans out by itself once it's on screen.
  useEffect(() => {
    if (!seen || !window.matchMedia("(hover: none)").matches) return;
    const id = window.setTimeout(() => setTouchOpen(true), reduce ? 0 : 500);
    return () => window.clearTimeout(id);
  }, [seen, reduce]);

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
      ref={ref}
      data-open={touchOpen || undefined}
      className="group/id relative h-[200px] w-full max-w-[292px]"
    >
      <div
        className={cn(
          "absolute inset-0 -rotate-[4deg] group-hover/tile:rotate-0 group-focus-within/id:rotate-0 group-data-[open]/id:rotate-0 group-hover/tile:duration-[var(--hover-in)]",
          MOVE,
        )}
      >
        {/* Layer 3: the vault (back). */}
        <div
          className={cn(
            "absolute inset-x-[16px] top-0 h-[120px] rounded-[16px] border border-line bg-paper px-3 pt-1.5 shadow-[0_1px_2px_rgba(22,23,28,0.04)]",
            "group-hover/tile:-translate-y-[28px] group-hover/tile:-rotate-[2deg] group-focus-within/id:-translate-y-[28px] group-data-[open]/id:-translate-y-[28px] group-data-[open]/id:-rotate-[2deg]",
            MOVE,
          )}
        >
          <div className="flex h-[20px] items-center gap-2">
            <Key size={14} weight="duotone" className="shrink-0 text-ink" />
            <span className="text-[12px] font-medium text-ink">Vault</span>
            <span className="ml-auto font-mono text-[11.5px] tabular-nums text-ink-3">12 logins</span>
          </div>
          <div className="flex h-[18px] items-center gap-2 text-[11.5px] text-ink-3">
            <span className="relative h-[13px] w-[13px] shrink-0">
              <LockSimple
                size={13}
                weight="bold"
                className="absolute inset-0 transition-opacity duration-[var(--hover-out)] group-hover/tile:opacity-0 group-data-[open]/id:opacity-0"
              />
              <LockSimpleOpen
                size={13}
                weight="bold"
                className="absolute inset-0 text-ink opacity-0 transition-opacity duration-[var(--hover-out)] group-hover/tile:opacity-100 group-data-[open]/id:opacity-100"
              />
            </span>
            <span className="font-mono tracking-[0.18em]">••••••••••</span>
            <span className="ml-auto">telegram.org</span>
          </div>
        </div>

        {/* Layer 2: the private email alias (middle). */}
        <div
          className={cn(
            "absolute inset-x-[8px] top-[30px] h-[120px] rounded-[18px] border border-line bg-surface px-3 pt-1.5 shadow-[0_1px_2px_rgba(22,23,28,0.04)]",
            "group-hover/tile:-translate-y-[14px] group-hover/tile:-rotate-[1deg] group-focus-within/id:-translate-y-[14px] group-data-[open]/id:-translate-y-[14px] group-data-[open]/id:-rotate-[1deg]",
            MOVE,
          )}
        >
          <div className="flex h-[20px] items-center gap-2">
            <EnvelopeSimple size={14} weight="duotone" className="shrink-0 text-ink" />
            <span className="truncate font-mono text-[12px] font-medium text-ink">dove.42@quackr.id</span>
            <span className="ml-auto shrink-0 rounded-full bg-paper px-1.5 py-px text-[10.5px] text-ink-3">alias</span>
          </div>
          <div className="flex h-[18px] items-center gap-2 text-[11.5px] text-ink-3">
            <span>Forwards to your inbox</span>
            <span className="ml-auto font-mono tabular-nums">38 blocked</span>
          </div>
        </div>

        {/* Layer 1: the virtual card (front). */}
        <div
          className={cn(
            "@container absolute inset-x-0 bottom-0 h-[140px] rounded-[20px] bg-ink p-4 text-paper shadow-[var(--shadow-card)]",
            "group-hover/tile:translate-y-[6px] group-focus-within/id:translate-y-[6px] group-data-[open]/id:translate-y-[6px]",
            MOVE,
          )}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="block h-[18px] w-[26px] rounded-[5px] bg-duck-soft/90" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">Virtual card</span>
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-pressed={shown}
              aria-label={shown ? "Hide card number" : "Show card number"}
              className="-m-2 flex h-11 w-11 items-center justify-center rounded-full text-paper/70 transition-[color,background-color] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:bg-paper/10 hover:text-paper hover:duration-[var(--hover-in)] active:translate-y-px focus-visible:outline-paper"
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

          <p className="mt-3 whitespace-nowrap font-mono text-[clamp(12px,6.2cqw,16px)] font-medium leading-tight tracking-[0.08em] tabular-nums text-paper">
            <span className="sr-only">Card number {shown ? NUMBER : "hidden, ending 7390"}</span>
            <span aria-hidden="true">
              <SlotText value={shown ? NUMBER : MASKED} duration={0.5} stagger={0.018} spins={0} align="start" />
            </span>
          </p>

          <div className="mt-3 flex items-end gap-4">
            <span>
              <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-paper/45">Holder</span>
              <span className="block text-[11.5px] font-medium tracking-[0.04em]">Dove 42</span>
            </span>
            <span>
              <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-paper/45">Exp</span>
              <span className="block font-mono text-[11.5px] tabular-nums">09/29</span>
            </span>
            <span>
              <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-paper/45">CVC</span>
              <span className="block font-mono text-[11.5px] tabular-nums" aria-hidden="true">
                <SlotText value={shown ? CVC : "•••"} duration={0.5} spins={0} align="start" />
              </span>
            </span>
            <Mark className="ml-auto h-7 w-7" />
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {shown ? "Card number shown" : ""}
      </span>
    </div>
  );
}
