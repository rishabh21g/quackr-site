"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";

const CODES = [
  { app: "Telegram", code: "482917" },
  { app: "WhatsApp", code: "113904" },
  { app: "Discord", code: "760215" },
  { app: "Tinder", code: "559018" },
  { app: "OpenAI", code: "302846" },
];

/** A code chip whose digits roll to each new code, like a fresh SMS landing. Only runs while visible. */
export function OtpChip({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!visible || reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % CODES.length), 2600);
    return () => window.clearInterval(t);
  }, [visible, reduce]);

  const { app, code } = CODES[i];

  return (
    <div
      ref={ref}
      className={cn(
        "@container inline-flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-6 text-[12px]">
        <span className="font-medium text-ink-2">
          {app} code
        </span>
        <span className="inline-flex items-center gap-1.5 text-live">
          <span className="live-dot" />
          now
        </span>
      </div>
      {/* Size follows the chip's width so the code never overflows a narrow phone.
          Letter-spacing adds space after the last digit too; the negative margin cancels it so the code sits dead centre. */}
      <div className="rounded-[14px] bg-duck-soft px-3 py-2.5 text-center font-mono text-[clamp(20px,12cqw,30px)] font-semibold leading-none tracking-[0.14em] text-ink">
        <span className="mr-[-0.14em] inline-block">
          <SlotText value={`${code.slice(0, 3)} ${code.slice(3)}`} duration={0.8} stagger={0.06} />
        </span>
      </div>
    </div>
  );
}
