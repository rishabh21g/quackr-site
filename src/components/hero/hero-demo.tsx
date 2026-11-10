"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { COUNTRIES, CountryPicker, type Country } from "./country-picker";
import { PhoneDemo } from "./phone-demo";

// Swap the last four digits so "a different number" visibly changes.
function shuffleTail(n: string) {
  const tail = String(1000 + Math.floor(Math.random() * 9000));
  return n.replace(/\d{4}$|\d{2} \d{2}$/, (m) => (m.includes(" ") ? `${tail.slice(0, 2)} ${tail.slice(2)}` : tail));
}

/**
 * Interactive half of the hero. Picking a country rolls the decoy number into that
 * country's format, so the first click on the page already shows the product.
 */
export function HeroDemo() {
  const reduce = useReducedMotion();
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [number, setNumber] = useState(COUNTRIES[0].sample);

  function choose(c: Country) {
    setCountry(c);
    setNumber(c.sample);
  }

  const popular = COUNTRIES.filter((c) => c.popular);

  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24, ease: [0, 0, 0.2, 1] }}
        className="mt-9 flex flex-col items-center"
      >
        <CountryPicker value={country} onChange={choose} align="center" />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-ink-3">
          <span className="flex items-center gap-1.5">
            Popular:
            {popular.map((c) => {
              const Flag = c.Flag;
              const active = c.code === country.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => choose(c)}
                  aria-pressed={active}
                  className={`relative inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] transition-colors duration-[var(--hover-out)] hover:duration-[var(--hover-in)] active:translate-y-px ${
                    active ? "border-ink/25 bg-surface text-ink" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
                  }`}
                >
                  <Flag className="h-[11px] w-[16px] rounded-[2px] shadow-[0_0_0_1px_rgba(22,23,28,0.08)]" />
                  {c.code}
                </button>
              );
            })}
          </span>
          <span aria-hidden className="hidden h-4 w-px bg-line-strong sm:block" />
          <Link
            href="/signup?plan=free"
            className="link-arrow inline-flex h-8 items-center gap-1 font-medium text-ink-2 transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:text-ink hover:duration-[var(--hover-in)]"
          >
            <span className="mi-underline">Or try a free number</span>
            <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.36, ease: [0, 0, 0.2, 1] }}
        className="mt-2 w-full sm:mt-4"
      >
        <PhoneDemo number={number} onRefresh={() => setNumber((n) => shuffleTail(n))} />
      </motion.div>
    </>
  );
}
