"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { buttonClass } from "@/components/ui/button";

/** Google's G as one monochrome silhouette. Visual only: third-party marks stay ink. */
export function GoogleG({ className }: { className?: string }) {
  return (
    // data-no-nudge: a leading brand mark must not slide on hover like a trailing arrow (globals.css).
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" data-no-nudge="">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
    </svg>
  );
}

/**
 * Outline "Continue with Google". No OAuth here: it is a visual placeholder for the demo, so a click says so
 * instead of doing nothing (a press should always get an answer).
 */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [tried, setTried] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setTried(true)} className={buttonClass("outline", "lg", "w-full")}>
        <GoogleG className="h-[18px] w-[18px] text-ink-2" />
        {label}
      </button>
      <p aria-live="polite" className="text-center text-[13px] leading-5 text-ink-3 empty:hidden">
        {tried ? (
          <span className="block animate-[panel-in_180ms_var(--ease-enter)] motion-reduce:animate-none">
            Google sign-in isn&apos;t connected in this demo. Use email below.
          </span>
        ) : null}
      </p>
    </div>
  );
}

export type SubmitStatus = "idle" | "loading" | "done";

type MorphSubmitProps = {
  status: SubmitStatus;
  idleLabel: string;
  loadingLabel: string;
  doneLabel?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * The ink submit that morphs in place: label → spinner → check. The width never jumps because
 * the button is full width; only the content swaps, rising in and out.
 */
export function MorphSubmit({ status, idleLabel, loadingLabel, doneLabel, className, disabled }: MorphSubmitProps) {
  const reduce = useReducedMotion();
  const busy = status !== "idle";
  const content =
    status === "loading" ? (
      <>
        <CircleNotch size={18} weight="bold" aria-hidden className="animate-spin motion-reduce:animate-none" />
        {loadingLabel}
      </>
    ) : status === "done" ? (
      <>
        <Check size={18} weight="bold" aria-hidden />
        {doneLabel}
      </>
    ) : (
      idleLabel
    );

  return (
    <button
      type="submit"
      aria-disabled={busy || disabled || undefined}
      className={cn(buttonClass("ink", "lg", "w-full overflow-hidden"), busy && "pointer-events-none", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className="inline-flex items-center gap-2"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(2px)" }}
          transition={{ duration: reduce ? 0 : 0.22, ease: ease.standard }}
        >
          {content}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" role="status">
        {status === "loading" ? loadingLabel : status === "done" ? doneLabel : ""}
      </span>
    </button>
  );
}
