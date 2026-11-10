"use client";
// Adapted from Arc UI PasswordStrength (MIT, © 2026 Elia Kuratli). CSS module rewritten to Tailwind.

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { ease, smooth } from "@/lib/motion";
import { estimateStrength, passwordRules } from "./validate";

/**
 * Four segments that fill left to right while a new password is typed. Ink for a usable password,
 * danger while it is weak or too short. Scoring happens on the device; nothing is sent anywhere.
 */
export function PasswordMeter({ password, id }: { password: string; id?: string }) {
  const reduce = useReducedMotion();
  const strength = estimateStrength(password);
  const weak = strength.level === 1;

  // Remember the previous level so a pasted password fills as a left-to-right wave (Arc's behaviour).
  const [track, setTrack] = useState({ level: strength.level, previous: strength.level });
  if (track.level !== strength.level) setTrack({ level: strength.level, previous: track.level });

  const missing = passwordRules.filter((rule) => !strength.met.includes(rule.id)).map((rule) => rule.label.toLowerCase());

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div
          role="meter"
          aria-label="Password strength"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={strength.level}
          aria-valuetext={strength.level ? strength.label : "No password yet"}
          className="grid flex-1 grid-cols-4 gap-1.5"
        >
          {[0, 1, 2, 3].map((index) => {
            const on = index < strength.level;
            const wave = on ? index - track.previous : track.previous - 1 - index;
            return (
              <span key={index} className="relative h-1.5 overflow-hidden rounded-full bg-line">
                <motion.span
                  className={cn("absolute inset-0 rounded-full transition-colors duration-200", weak ? "bg-danger" : "bg-ink")}
                  initial={false}
                  animate={{ x: on ? "0%" : "-101%" }}
                  transition={reduce ? { duration: 0 } : { ...smooth, delay: Math.max(0, wave) * (on ? 0.05 : 0.03) }}
                />
              </span>
            );
          })}
        </div>
        <span aria-hidden className={cn("relative h-5 w-[68px] text-right font-mono text-[12px] leading-5", weak ? "text-danger" : "text-ink-2")}>
          <AnimatePresence mode="popLayout" initial={false}>
            {strength.level ? (
              <motion.span
                key={strength.label}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: reduce ? 0 : 0.2, ease: ease.enter }}
              >
                {strength.label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
      <p id={id} className="text-[13px] leading-5 text-ink-3">
        {!password
          ? "Use 12+ characters with a number and a symbol."
          : missing.length
            ? `Add ${missing.join(", ")}.`
            : "Nice. That one would take a while to guess."}
      </p>
    </div>
  );
}
