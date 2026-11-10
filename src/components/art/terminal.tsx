"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Line = { kind: "in" | "out" | "note"; text: string; code?: string };

const SCRIPT: Line[] = [
  { kind: "note", text: "agent › signing up for a test account" },
  { kind: "in", text: 'quackr.get_number({ country: "US" })' },
  { kind: "out", text: "+1 701 997 6600" },
  { kind: "in", text: "quackr.wait_for_sms({ timeout: 60 })" },
  { kind: "out", text: "Your code is ", code: "482917" },
];

/**
 * An agent using the Quackr MCP server: each line types out once in view, then the
 * whole thing loops. Reduced motion shows the finished transcript.
 */
export function Terminal({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (reduce || !visible) return;
    const current = SCRIPT[line];
    if (!current) {
      const t = window.setTimeout(() => {
        setLine(0);
        setChars(0);
      }, 2400);
      return () => window.clearTimeout(t);
    }
    const full = current.text.length + (current.code?.length ?? 0);
    if (chars < full) {
      // Inputs type character by character; outputs arrive whole after a short wait.
      const t = window.setTimeout(
        () => setChars(current.kind === "in" ? chars + 1 : full),
        current.kind === "in" ? 28 : 520,
      );
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLine(line + 1);
      setChars(0);
    }, 260);
    return () => window.clearTimeout(t);
  }, [line, chars, visible, reduce]);

  const shown = reduce ? SCRIPT.length : line;

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-[18px] border border-ink/90 bg-ink font-mono text-[12.5px] leading-[1.75] text-white/80 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 text-[11px] text-white/40">quackr-mcp</span>
      </div>
      <div className="min-h-[164px] px-4 py-3" aria-label="An AI agent requesting a number and reading the SMS code">
        {SCRIPT.map((l, i) => {
          if (i > shown) return null;
          const partial = i === shown && !reduce;
          if (partial && chars === 0 && l.kind !== "in") return null;
          const text = partial ? l.text.slice(0, chars) : l.text;
          const codeChars = partial ? Math.max(0, chars - l.text.length) : (l.code?.length ?? 0);
          return (
            <p key={i} className={l.kind === "note" ? "text-white/40" : ""}>
              {l.kind === "in" && <span className="text-white/40">› </span>}
              {l.kind === "out" && <span className="text-[var(--duck)]">← </span>}
              {text}
              {l.code && codeChars > 0 && (
                <span className="rounded-[4px] bg-[var(--duck)] px-1 font-semibold text-ink">{l.code.slice(0, codeChars)}</span>
              )}
              {partial && l.kind === "in" && <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-pulse bg-white/70" />}
            </p>
          );
        })}
      </div>
    </div>
  );
}
