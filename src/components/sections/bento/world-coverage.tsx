"use client";
// Adapted from Arc UI StatsBand (map visual) (MIT, © 2026 Elia Kuratli). CSS module rewritten to Tailwind.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { AU, BR, CA, DE, ES, GB, ID, IN, JP, MX, NG, US, ZA } from "country-flag-icons/react/3x2";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { FLAG, LIVE, useSettledReduce } from "./shared";
import { WORLD, nearestLand, worldLand } from "./world-land";

/*
  30+ countries as a dotted world map. Land is an equirectangular dot grid (Arc's
  embedded mask), with a duck pin on each country we sell numbers in. While the map is
  on screen, one pin at a time "takes a code": it pings and its tooltip shows the
  country and a sample number. Pointing at a pin or a flag takes over the tooltip.
*/

type Country = {
  id: string;
  name: string;
  number: string;
  Flag: typeof US;
  lon: number;
  lat: number;
};

const COUNTRIES: Country[] = [
  { id: "us", name: "United States", number: "+1 415 555 0192", Flag: US, lon: -98, lat: 39 },
  { id: "gb", name: "United Kingdom", number: "+44 7700 900 461", Flag: GB, lon: -2, lat: 54 },
  { id: "jp", name: "Japan", number: "+81 90 5550 1234", Flag: JP, lon: 138, lat: 36 },
  { id: "br", name: "Brazil", number: "+55 11 95021 4410", Flag: BR, lon: -50, lat: -12 },
  { id: "de", name: "Germany", number: "+49 1521 0938 772", Flag: DE, lon: 10, lat: 51 },
  { id: "in", name: "India", number: "+91 98100 55012", Flag: IN, lon: 78, lat: 21 },
  { id: "ca", name: "Canada", number: "+1 604 555 0137", Flag: CA, lon: -106, lat: 56 },
  { id: "za", name: "South Africa", number: "+27 71 555 0186", Flag: ZA, lon: 25, lat: -29 },
  { id: "au", name: "Australia", number: "+61 412 555 018", Flag: AU, lon: 134, lat: -25 },
  { id: "es", name: "Spain", number: "+34 612 40 77 18", Flag: ES, lon: -4, lat: 40 },
  { id: "mx", name: "Mexico", number: "+52 55 5103 2244", Flag: MX, lon: -102, lat: 23 },
  { id: "ng", name: "Nigeria", number: "+234 803 555 0174", Flag: NG, lon: 8, lat: 9 },
  { id: "id", name: "Indonesia", number: "+62 812 5550 1932", Flag: ID, lon: 113, lat: -3 },
];

/** Flags in the coverage pill (indices into COUNTRIES). */
const PILL = [0, 1, 4, 2, 5, 3];
const MORE = 30 - PILL.length;

const CELL_W = 100 / WORLD.columns;
const CELL_H = 100 / WORLD.rows;

/** Pin positions in % of the map box, snapped to land. Computed once, so the server render is stable. */
const PINS = COUNTRIES.map((c) => {
  const cell = nearestLand(c.lon, c.lat);
  const x = cell % WORLD.columns;
  const y = Math.floor(cell / WORLD.columns);
  return { cell, left: (x + 0.5) * CELL_W, top: (y + 0.5) * CELL_H };
});
const PIN_CELLS = new Set(PINS.map((p) => p.cell));

/** Every land dot as one path of tiny circles: lighter than a thousand <circle>s. */
const LAND_PATH = worldLand
  .map((land, i) => {
    if (!land || PIN_CELLS.has(i)) return "";
    const cx = (i % WORLD.columns) + 0.5;
    const cy = Math.floor(i / WORLD.columns) + 0.5;
    return `M${cx - 0.3} ${cy}a.3 .3 0 1 0 .6 0a.3 .3 0 1 0-.6 0`;
  })
  .join("");

const STEP_MS = 2600;

export function WorldCoverage() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, LIVE);
  const reduce = useSettledReduce();
  const [auto, setAuto] = useState(0);
  const [pointed, setPointed] = useState<number | null>(null);
  const active = pointed ?? auto;

  // One pin at a time takes a code, only while visible and nobody is pointing.
  useEffect(() => {
    if (!live || reduce || pointed !== null) return;
    const id = window.setInterval(() => setAuto((i) => (i + 1) % COUNTRIES.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [live, reduce, pointed]);

  const point = (i: number) => setPointed(i);
  const release = () => {
    // Carry on from where the pointer left, so the tour doesn't jump back.
    if (pointed !== null) setAuto(pointed);
    setPointed(null);
  };

  const pin = PINS[active]!;
  const country = COUNTRIES[active]!;
  const below = pin.top < 40;
  const side = pin.left < 22 ? "start" : pin.left > 78 ? "end" : "mid";
  const pinging = live && !reduce;

  return (
    <div ref={ref} className="flex w-full max-w-[400px] flex-col items-center gap-5">
      <div className="relative aspect-[80/30] w-full">
        <svg viewBox={`0 0 ${WORLD.columns} ${WORLD.rows}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d={LAND_PATH} fill="var(--ink)" opacity={0.2} />
        </svg>

        <ul className="absolute inset-0" aria-label="Countries with Quackr numbers">
          {COUNTRIES.map((c, i) => {
            const p = PINS[i]!;
            const on = i === active;
            return (
              <li key={c.id} className="absolute" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
                <button
                  type="button"
                  aria-label={`${c.name}, sample number ${c.number}`}
                  onPointerEnter={() => point(i)}
                  onPointerLeave={release}
                  onFocus={() => point(i)}
                  onBlur={release}
                  className="absolute left-0 top-0 flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                >
                  <span className="relative block h-[7px] w-[7px]">
                    {pinging && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-0 rounded-full bg-duck",
                          on
                            ? "animate-[ping-soft_1.3s_cubic-bezier(0,0,0.2,1)_infinite]"
                            : "animate-[ping-soft_3.2s_cubic-bezier(0,0,0.2,1)_infinite]",
                        )}
                        style={on ? undefined : { animationDelay: `${-((i * 0.53) % 3.2)}s` }}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 rounded-full border transition-[transform,background-color] duration-[var(--hover-out)] ease-[var(--ease-standard)] motion-reduce:transition-none",
                        on ? "scale-[1.45] border-ink bg-duck-deep" : "border-duck-deep bg-duck",
                      )}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Tooltip for the active pin. Flips below near the top, hugs the edge near the sides. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            aria-hidden="true"
            className="pointer-events-none absolute z-10"
            style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            initial={reduce ? false : { opacity: 0, y: below ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.16 } }}
            transition={{ duration: 0.26, ease: ease.enter }}
          >
            <div
              className={cn(
                "absolute flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-line bg-surface px-2.5 py-1.5 shadow-[var(--shadow-card)]",
                below ? "top-[12px]" : "bottom-[12px]",
                side === "start" && "-left-3",
                side === "end" && "-right-3",
                side === "mid" && "left-0 -translate-x-1/2",
              )}
            >
              <country.Flag className={cn(FLAG, "h-[11px] w-[16px]")} />
              <span className="text-[11.5px] font-medium text-ink">{country.name}</span>
              <span className="font-mono text-[11.5px] tabular-nums text-ink-2">{country.number}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Coverage pill: the same countries as flags. Pointing at one lights its pin. */}
      <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-1.5 pr-3 shadow-[0_1px_2px_rgba(22,23,28,0.04)]">
        <span className="inline-flex items-center gap-0.5 pr-1">
          {PILL.map((i) => {
            const c = COUNTRIES[i]!;
            return (
              <button
                key={c.id}
                type="button"
                aria-label={`Show ${c.name}`}
                onPointerEnter={() => point(i)}
                onPointerLeave={release}
                onFocus={() => point(i)}
                onBlur={release}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-[background-color,translate] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] motion-reduce:transition-none",
                  i === active ? "-translate-y-0.5 bg-duck-soft" : "hover:bg-paper",
                )}
              >
                <c.Flag aria-hidden="true" className={cn(FLAG, "h-[13px] w-[20px]")} />
              </button>
            );
          })}
        </span>
        <span className="font-mono text-[12px] font-medium tabular-nums text-ink-2">+{MORE}</span>
        <span className="sr-only"> more countries</span>
      </div>
    </div>
  );
}
