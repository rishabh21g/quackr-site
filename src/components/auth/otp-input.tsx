"use client";
// Adapted from Opensource UI OtpBoxedInput (MIT, © 2026 Bidyut Kundu).

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

function sanitizeChar(char: string): string | null {
  const next = char.slice(0, 1);
  return /^\d$/.test(next) ? next : null;
}

function sanitizeValue(raw: string, length: number): string {
  return raw.replace(/\D/g, "").slice(0, length);
}

/** OSUI's field logic, unchanged in behaviour: auto-advance, backspace to previous, arrows, paste fills. */
function useOtpField({
  length,
  value,
  disabled,
  autoFocus,
  onChange,
  onComplete,
}: {
  length: number;
  value: string;
  disabled: boolean;
  autoFocus: boolean;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}) {
  const current = sanitizeValue(value, length);
  const digits = Array.from({ length }, (_, index) => current[index] ?? "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const completedRef = useRef("");

  const focusAt = useCallback(
    (index: number) => {
      const node = inputRefs.current[Math.max(0, Math.min(length - 1, index))];
      if (!node) return;
      node.focus();
      node.select();
    },
    [length],
  );

  const commit = useCallback(
    (next: string) => {
      const sanitized = sanitizeValue(next, length);
      onChange(sanitized);
      if (sanitized.length === length && sanitized !== completedRef.current) {
        completedRef.current = sanitized;
        onComplete?.(sanitized);
      }
      if (sanitized.length < length) completedRef.current = "";
    },
    [length, onChange, onComplete],
  );

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const frame = requestAnimationFrame(() => focusAt(0));
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, disabled, focusAt]);

  const setDigit = useCallback(
    (index: number, char: string | null) => {
      const next = [...digits];
      next[index] = char ?? "";
      commit(next.join(""));
    },
    [commit, digits],
  );

  const handleChange = useCallback(
    (index: number, event: FormEvent<HTMLInputElement>) => {
      if (disabled) return;
      const raw = event.currentTarget.value;
      // iOS/Android one-time-code autofill drops the whole code into one box.
      if (raw.length > 1) {
        const sanitized = sanitizeValue(raw, length);
        commit(sanitized);
        focusAt(Math.min(sanitized.length, length - 1));
        return;
      }
      const char = sanitizeChar(raw);
      if (!char) {
        event.currentTarget.value = digits[index] ?? "";
        return;
      }
      setDigit(index, char);
      if (index < length - 1) focusAt(index + 1);
    },
    [commit, digits, disabled, focusAt, length, setDigit],
  );

  const handleKeyDown = useCallback(
    (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const key = event.key;
      if (key === "ArrowLeft") return void (event.preventDefault(), focusAt(index - 1));
      if (key === "ArrowRight") return void (event.preventDefault(), focusAt(index + 1));
      if (key === "Home") return void (event.preventDefault(), focusAt(0));
      if (key === "End") return void (event.preventDefault(), focusAt(length - 1));
      if (key === "Backspace") {
        event.preventDefault();
        if (digits[index]) return setDigit(index, null);
        if (index > 0) {
          setDigit(index - 1, null);
          focusAt(index - 1);
        }
        return;
      }
      if (key === "Delete") {
        event.preventDefault();
        setDigit(index, null);
        return;
      }
      // Typing over a filled box replaces it and moves on.
      if (key.length === 1 && digits[index]) {
        const char = sanitizeChar(key);
        if (char) {
          event.preventDefault();
          setDigit(index, char);
          if (index < length - 1) focusAt(index + 1);
        }
      }
    },
    [digits, disabled, focusAt, length, setDigit],
  );

  const handlePaste = useCallback(
    (index: number, event: ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      event.preventDefault();
      const pasted = event.clipboardData.getData("text");
      // A full code always fills from the first box, wherever the caret was.
      const full = sanitizeValue(pasted, length);
      const start = full.length === length ? 0 : index;
      const sanitized = sanitizeValue(pasted, length - start);
      if (!sanitized) return;
      const next = [...digits];
      for (let offset = 0; offset < sanitized.length; offset += 1) next[start + offset] = sanitized[offset] ?? "";
      commit(next.join("").slice(0, length));
      focusAt(Math.min(start + sanitized.length, length - 1));
    },
    [commit, digits, disabled, focusAt, length],
  );

  const setInputRef = useCallback(
    (index: number) => (node: HTMLInputElement | null) => {
      inputRefs.current[index] = node;
    },
    [],
  );

  return { digits, focusAt, handleChange, handleKeyDown, handlePaste, setInputRef };
}

/** OSUI's resend cooldown. */
export function useResendTimer(initialSeconds: number, onResend?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const canResend = remaining <= 0;

  useEffect(() => {
    if (canResend) return;
    const timer = window.setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [canResend]);

  const resend = useCallback(() => {
    if (!canResend) return;
    onResend?.();
    setRemaining(initialSeconds);
  }, [canResend, initialSeconds, onResend]);

  return { remaining, canResend, resend };
}

export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

type OtpBoxedInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Danger message under the boxes. A new message (or a bumped shakeKey) shakes the row once. */
  error?: string;
  shakeKey?: number;
  labelledBy?: string;
  describedBy?: string;
  className?: string;
};

/**
 * Six large mono boxes. The focused box gets an ink border; filled boxes go duck-soft because a code
 * is the one place duck belongs.
 */
export function OtpBoxedInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = false,
  error,
  shakeKey = 0,
  labelledBy,
  describedBy,
  className,
}: OtpBoxedInputProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const otp = useOtpField({ length, value, disabled, autoFocus, onChange, onComplete });

  // The refused code shakes on x keyframes, like a phone lock screen.
  useEffect(() => {
    if (!shakeKey || reduce || !scope.current) return;
    animate(scope.current, { x: [0, -10, 9, -7, 5, -3, 0] }, { duration: 0.45, ease: "easeOut" });
  }, [shakeKey, reduce, animate, scope]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        ref={scope}
        role="group"
        aria-labelledby={labelledBy}
        aria-describedby={[describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        className="grid grid-cols-6 gap-2 sm:gap-2.5"
      >
        {otp.digits.map((digit, index) => {
          const active = activeIndex === index;
          return (
            <div
              key={index}
              className={cn(
                "relative transition-transform duration-[var(--hover-out)] ease-[var(--ease-standard)] motion-reduce:transition-none",
                active && "z-10 scale-[1.04]",
              )}
            >
              <input
                ref={otp.setInputRef(index)}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                name={index === 0 ? "one-time-code" : undefined}
                pattern="[0-9]*"
                maxLength={length}
                value={digit}
                disabled={disabled}
                aria-label={`Digit ${index + 1} of ${length}`}
                aria-invalid={error ? true : undefined}
                onChange={(event) => otp.handleChange(index, event)}
                onKeyDown={(event) => otp.handleKeyDown(index, event)}
                onPaste={(event) => otp.handlePaste(index, event)}
                onFocus={(event) => {
                  setActiveIndex(index);
                  event.currentTarget.select();
                }}
                onBlur={() => setActiveIndex(null)}
                className={cn(
                  "h-14 w-full rounded-[14px] border-[1.5px] text-center font-mono text-[26px] font-medium tabular-nums text-ink caret-transparent outline-none transition-[border-color,background-color] duration-[var(--hover-out)] ease-[var(--ease-standard)] sm:h-16 sm:text-[30px]",
                  error
                    ? "border-danger/60 bg-danger-soft/50"
                    : digit
                      ? "border-duck-deep/45 bg-duck-soft"
                      : "border-line bg-surface hover:border-line-strong",
                  "focus:border-ink",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              />
              {active && !digit ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-7 w-0.5 -translate-y-1/2 animate-pulse rounded-full bg-ink motion-reduce:animate-none"
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p
        id={errorId}
        role={error ? "alert" : undefined}
        className={cn("flex min-h-5 items-center gap-1.5 text-[13px] leading-5", error ? "text-danger" : "text-ink-3")}
      >
        {error ? (
          <>
            <WarningCircle size={14} weight="bold" aria-hidden className="shrink-0" />
            {error}
          </>
        ) : (
          "Paste the code or type each digit."
        )}
      </p>
    </div>
  );
}
