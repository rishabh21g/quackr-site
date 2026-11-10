"use client";
// Adapted from Arc UI BillingToggle (MIT, © 2026 Elia Kuratli), via the port in sections/pricing.tsx.
// Kept: a radiogroup of two pills with roving tabindex, arrow/Home/End keys, and a thumb that glides without
// overshoot. Changed: the thumb is a shared-layout element instead of a measured one, so no effect sets state.

import { useId, useRef, type KeyboardEvent } from "react";
import { motion, type Transition } from "motion/react";
import { Mark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";
import type { Mode } from "./shared";

const OPTIONS: { value: Mode; label: string }[] = [
  { value: "without", label: "Without Quackr" },
  { value: "with", label: "With Quackr" },
];

/** Critically damped, like the billing toggle: lands without overshoot. */
const glide: Transition = { type: "spring", visualDuration: 0.34, bounce: 0 };

type ModeSwitchProps = {
  value: Mode;
  onValueChange: (mode: Mode) => void;
  reduce: boolean;
  className?: string;
};

export function ModeSwitch({ value, onValueChange, reduce, className }: ModeSwitchProps) {
  const thumbId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const k = event.key;
    const step = k === "ArrowRight" || k === "ArrowDown" ? 1 : k === "ArrowLeft" || k === "ArrowUp" ? -1 : 0;
    const target = k === "Home" ? 0 : k === "End" ? OPTIONS.length - 1 : step ? (index + step + OPTIONS.length) % OPTIONS.length : -1;
    if (target < 0) return;
    event.preventDefault();
    onValueChange(OPTIONS[target]!.value);
    refs.current[target]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Show the problem without or with Quackr"
      className={cn("relative isolate inline-flex items-center rounded-full border border-line bg-ink/[0.04] p-1 text-[13.5px] sm:text-[14px]", className)}
    >
      {OPTIONS.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-3.5 font-medium sm:px-4 transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] active:translate-y-px",
              selected ? "cursor-default text-ink" : "cursor-pointer text-ink-3 hover:text-ink-2",
            )}
          >
            {selected && (
              <motion.span
                layoutId={thumbId}
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-surface shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(22,23,28,0.06)]"
                transition={reduce ? { duration: 0 } : glide}
              />
            )}
            {option.value === "with" && (
              <Mark className={cn("size-[18px] transition-[filter,opacity] duration-[var(--dur-slow)]", !selected && "opacity-60 grayscale")} />
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
