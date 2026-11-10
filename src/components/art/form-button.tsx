"use client";
// Adapted from Arc UI Button (MIT, © 2026 Elia Kuratli).
// Display-only, driven by props: a <span>, not a <button>, so the art never takes focus. Kept: a disabled button
// keeps its outlined shape and fades only its label ("a button that is off", not a grey slab), and the label
// crossfade (the new label rises 2px as it fades in, the old one fades out faster, no blur). The width spring is
// dropped because the button is full width. CSS module rewritten to Tailwind with Quackr tokens.

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/** off: disabled outline. ink: the primary action. quiet: done, steps back so the next field leads. */
export type FormButtonTone = "off" | "ink" | "quiet";

const tones: Record<FormButtonTone, string> = {
  off: "border-line bg-paper text-ink-3",
  ink: "border-ink bg-ink text-white",
  quiet: "border-line bg-surface text-ink-2",
};

type FormButtonDisplayProps = {
  tone: FormButtonTone;
  /** Changing the key crossfades the label. */
  labelKey: string;
  children: ReactNode;
  reduce?: boolean;
  className?: string;
};

export function FormButtonDisplay({ tone, labelKey, children, reduce = false, className }: FormButtonDisplayProps) {
  return (
    <span
      className={cn(
        "grid h-11 w-full place-items-center rounded-[14px] border text-[14px] font-medium transition-[background-color,border-color,color] duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
        tones[tone],
        className,
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={labelKey}
          className="col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1, ease: [...ease.standard] } }}
          transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [...ease.enter] }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
