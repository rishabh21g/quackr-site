"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { SlotText } from "@/components/ui/slot-text";
import { ease } from "@/lib/motion";
import { LIVE, flip, useSequence, useSettledReduce, type Mode } from "./shared";

/*
  A leaked combo list. Without Quackr, a search highlight steps down the blurred rows and lands on yours:
  the row comes into focus, your real number turns danger, and the counts roll in. With Quackr, the same
  row shows an expired decoy on duck-soft, and the real number is nowhere on the card.
  Blur is never animated: each blurred piece is a static layer that crossfades with a sharp twin.
*/

const OTHERS = [
  { name: "Marta Kowal", email: "m.kowal84@yahoo.com", phone: "+1 312 555 0190" },
  { name: "Dev Patel", email: "devpatel.k@gmail.com", phone: "+1 646 555 0127" },
];
const YOU_AT = 2;
const ROW = 44;
const REAL = "+1 415 555 2271";
const DECOY = "+44 7700 900316";

/** Highlight on row 0, row 1, then yours; then the counts. */
const delayFor = (step: number) => [450, 260, 260, 480][step] ?? 0;
const STEPS = 4;

function OtherRow({ name, email, phone }: (typeof OTHERS)[number]) {
  return (
    <div className="relative flex h-[44px] items-center gap-3 border-t border-line px-3 first:border-t-0">
      <span className="min-w-0 flex-1 select-none blur-[3px]">
        <span className="block truncate text-[12.5px] font-medium leading-[16px] text-ink-2">{name}</span>
        <span className="block truncate text-[11px] leading-[15px] text-ink-3">{email}</span>
      </span>
      <span className="shrink-0 select-none font-mono text-[11.5px] tabular-nums text-ink-3 blur-[3px]">{phone}</span>
    </div>
  );
}

export function BreachRecord({ mode, delay = 0 }: { mode: Mode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, LIVE);
  const reduce = useSettledReduce();
  const safe = mode === "with";
  const step = useSequence(!safe, live && !reduce, STEPS, delayFor);
  const s = reduce ? STEPS : step;

  const found = safe || s >= 3;
  const counted = !safe && s >= 4;
  const hl = safe ? YOU_AT : s >= 1 ? Math.min(s - 1, YOU_AT) : -1;
  const fade = flip(reduce, 0, 0.3);

  const rows = [...OTHERS.slice(0, YOU_AT), null, ...OTHERS.slice(YOU_AT)];

  return (
    <div ref={ref} className="w-full max-w-[340px]" aria-hidden="true">
      <div className="mb-2 flex items-center justify-between gap-3 px-1 font-mono text-[11px] tabular-nums text-ink-3">
        <span className="truncate">combo_list_2025.csv</span>
        <span className="shrink-0">2.4M rows</span>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border border-line bg-surface shadow-[0_1px_2px_rgba(22,23,28,0.04)]">
        {/* the search highlight */}
        <motion.span
          className="absolute inset-x-0 top-0 bg-ink/[0.04] shadow-[inset_0_0_0_1px_rgba(22,23,28,0.08)]"
          style={{ height: ROW }}
          initial={false}
          animate={{ y: Math.max(hl, 0) * ROW, opacity: hl >= 0 ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.24, ease: ease.standard }}
        />

        {rows.map((row) =>
          row ? (
            <OtherRow key={row.email} {...row} />
          ) : (
            <div key="you" className="relative flex h-[44px] items-center gap-3 border-t border-line px-3">
              {/* your name and email: a static blurred copy crossfades with the sharp one */}
              <span className="grid min-w-0 flex-1">
                <motion.span
                  className="min-w-0 select-none blur-[3px] [grid-area:1/1]"
                  initial={false}
                  animate={{ opacity: found ? 0 : 0.85 }}
                  transition={fade}
                >
                  <span className="block truncate text-[12.5px] font-medium leading-[16px] text-ink">Sam Rivera</span>
                  <span className="block truncate text-[11px] leading-[15px] text-ink-3">sam.rivera@gmail.com</span>
                </motion.span>
                <motion.span className="min-w-0 [grid-area:1/1]" initial={false} animate={{ opacity: found ? 1 : 0 }} transition={fade}>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-medium leading-[16px] text-ink">Sam Rivera</span>
                    <span className="inline-flex h-4 shrink-0 items-center rounded-full border border-line-strong px-1.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.06em] text-ink-2">
                      <span className="mr-[-0.06em]">you</span>
                    </span>
                  </span>
                  <span className="block truncate text-[11px] leading-[15px] text-ink-3">sam.rivera@gmail.com</span>
                </motion.span>
              </span>

              {/* both states share one cell, so the column keeps the wider one's width */}
              <span className="grid shrink-0 justify-items-end text-right">
                <motion.span
                  className="grid justify-items-end [grid-area:1/1]"
                  initial={false}
                  animate={safe ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
                  transition={flip(reduce, safe ? delay : 0, 0.3)}
                >
                  {/* a blurred grey copy until your row is found, then the sharp red one */}
                  <motion.span
                    className="select-none blur-[3px] [grid-area:1/1]"
                    initial={false}
                    animate={{ opacity: found ? 0 : 0.85 }}
                    transition={fade}
                  >
                    <span className="block font-mono text-[11.5px] font-medium leading-[16px] tabular-nums text-ink-3">{REAL}</span>
                    <span className="block text-[10.5px] leading-[15px] text-ink-3">real number</span>
                  </motion.span>
                  <motion.span className="[grid-area:1/1]" initial={false} animate={{ opacity: found ? 1 : 0 }} transition={fade}>
                    <span className="block font-mono text-[11.5px] font-medium leading-[16px] tabular-nums text-danger">{REAL}</span>
                    <span className="block text-[10.5px] leading-[15px] text-ink-3">real number</span>
                  </motion.span>
                </motion.span>
                <motion.span
                  className="flex flex-col items-end [grid-area:1/1]"
                  initial={false}
                  animate={safe ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  transition={flip(reduce, safe ? delay + 0.12 : 0, 0.34)}
                >
                  <span className="rounded-[6px] bg-duck-soft px-1.5 font-mono text-[11.5px] font-medium leading-[16px] tabular-nums text-ink">
                    {DECOY}
                  </span>
                  <span className="block text-[10.5px] leading-[15px] text-ink-3">decoy · expired</span>
                </motion.span>
              </span>
            </div>
          ),
        )}
      </div>

      {/* footer: both lines share one cell */}
      <div className="mt-2.5 grid px-1 text-[11.5px] leading-[16px] text-ink-3">
        <motion.p
          className="[grid-area:1/1]"
          initial={false}
          animate={{ opacity: counted ? 1 : 0, y: counted ? 0 : safe ? -4 : 4 }}
          transition={flip(reduce, 0, 0.3)}
        >
          Found in <SlotText value={counted ? 3 : 0} duration={0.6} className="font-mono font-semibold text-ink" /> breaches · listed
          on <SlotText value={counted ? 12 : 0} duration={0.8} className="font-mono font-semibold text-ink" /> broker sites
        </motion.p>
        <motion.p
          className="[grid-area:1/1]"
          initial={false}
          animate={{ opacity: safe ? 1 : 0, y: safe ? 0 : 4 }}
          transition={flip(reduce, safe ? delay + 0.22 : 0, 0.34)}
        >
          Only the decoy leaked, and it no longer works.
        </motion.p>
      </div>
    </div>
  );
}

export const BREACH_SR: Record<Mode, string> = {
  without:
    "A leaked contact list with other people's rows blurred. Your row, Sam Rivera, shows your real number +1 415 555 2271. Found in 3 breaches, listed on 12 broker sites.",
  with: "The same leaked list, but your row shows only an expired decoy number, +44 7700 900316. Your real number appears nowhere.",
};
