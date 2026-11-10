"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, WarningCircle } from "@phosphor-icons/react";

type CopyState = "idle" | "copied" | "error";

/** Async Clipboard API, falling back to a hidden textarea where it is missing or refused. Rejects only when both fail. */
async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall through to the legacy path.
  }
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus?.({ preventScroll: true });
  if (!ok) throw new Error("Copy failed");
}

/** The copy affordance users hit most: icon morphs to a check and says so, or says it failed. */
export function CopyNumber({
  display,
  value,
  compact = false,
}: {
  display: React.ReactNode;
  value: string;
  /** Icon-only affordance, for tight spaces like the phone mockup. */
  compact?: boolean;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    if (timer.current) window.clearTimeout(timer.current);
    let next: CopyState = "copied";
    try {
      await writeClipboard(value);
    } catch {
      next = "error";
    }
    setState(next);
    timer.current = window.setTimeout(() => setState("idle"), next === "error" ? 2200 : 1600);
  }

  const label = state === "copied" ? `Copied ${value}` : state === "error" ? `Could not copy ${value}. Press Command C to copy it.` : `Copy ${value}`;

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={label}
      data-state={state}
      className={`group flex w-full min-w-0 flex-1 items-center justify-between gap-2 rounded-[14px] border py-2.5 ${compact ? "pl-3 pr-2.5" : "px-3"} text-left transition-[background-color,border-color,transform] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] active:translate-y-px active:duration-[var(--dur-instant)] ${
        state === "copied"
          ? "border-duck-deep/40 bg-duck-soft"
          : state === "error"
            ? "border-danger/40 bg-surface"
            : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <span className={`truncate font-mono font-medium tabular-nums tracking-tight text-ink ${compact ? "text-[14px]" : "text-[15px]"}`}>{display}</span>
      <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-3" aria-live="polite">
        {state === "copied" ? (
          <>
            <Check size={14} weight="bold" className="text-ink" aria-hidden />
            <span className={compact ? "sr-only" : "text-ink"}>Copied</span>
          </>
        ) : state === "error" ? (
          <>
            <WarningCircle size={14} weight="bold" className="text-danger" aria-hidden />
            <span className={compact ? "sr-only" : "text-danger"}>Press ⌘C</span>
          </>
        ) : (
          <>
            <Copy size={14} className="transition-colors group-hover:text-ink" aria-hidden />
            <span className={compact ? "sr-only" : "sr-only sm:not-sr-only"}>Copy</span>
          </>
        )}
      </span>
    </button>
  );
}
