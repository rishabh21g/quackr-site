"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react";
import { AU, BR, CA, DE, ES, FR, GB, IN, NL, PL, SE, US } from "country-flag-icons/react/3x2";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type Country = {
  code: string;
  name: string;
  dial: string;
  Flag: typeof US;
  /** A sample number in local format, for demos. Not a real line. */
  sample: string;
  popular?: boolean;
};

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "+1", Flag: US, sample: "+1 701 997 6600", popular: true },
  { code: "GB", name: "United Kingdom", dial: "+44", Flag: GB, sample: "+44 7700 900 123", popular: true },
  { code: "CA", name: "Canada", dial: "+1", Flag: CA, sample: "+1 438 555 0142" },
  { code: "AU", name: "Australia", dial: "+61", Flag: AU, sample: "+61 491 570 156" },
  { code: "DE", name: "Germany", dial: "+49", Flag: DE, sample: "+49 1512 345 6789" },
  { code: "FR", name: "France", dial: "+33", Flag: FR, sample: "+33 6 12 34 56 78" },
  { code: "NL", name: "Netherlands", dial: "+31", Flag: NL, sample: "+31 6 1234 5678" },
  { code: "ES", name: "Spain", dial: "+34", Flag: ES, sample: "+34 612 34 56 78" },
  { code: "SE", name: "Sweden", dial: "+46", Flag: SE, sample: "+46 70 123 45 67" },
  { code: "PL", name: "Poland", dial: "+48", Flag: PL, sample: "+48 512 345 678" },
  { code: "BR", name: "Brazil", dial: "+55", Flag: BR, sample: "+55 11 91234 5678" },
  { code: "IN", name: "India", dial: "+91", Flag: IN, sample: "+91 98765 43210" },
];

type CountryPickerProps = {
  /** Controlled selection. Leave both unset to let the picker manage itself. */
  value?: Country;
  onChange?: (country: Country) => void;
  /** Where the dropdown opens from on wide screens. */
  align?: "start" | "center";
  className?: string;
};

/**
 * Country picker and primary CTA fused into one control, so the first action
 * on the page is a single, obvious step: pick where, then get a number.
 */
export function CountryPicker({ value, onChange, align = "start", className }: CountryPickerProps = {}) {
  const [internal, setInternal] = useState<Country>(COUNTRIES[0]);
  const selected = value ?? internal;
  const setSelected = (c: Country) => {
    setInternal(c);
    onChange?.(c);
  };
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function openList() {
    setQuery("");
    setActive(Math.max(0, COUNTRIES.indexOf(selected)));
    setOpen(true);
  }

  function choose(c: Country) {
    setSelected(c);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) choose(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  const SelectedFlag = selected.Flag;

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-[520px]", className)}>
      <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-2 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country: ${selected.name}`}
          onClick={() => (open ? setOpen(false) : openList())}
          className="flex h-12 flex-1 items-center gap-3 rounded-[14px] px-3 text-left transition-colors duration-[var(--hover-out)] hover:bg-paper hover:duration-[var(--hover-in)]"
        >
          <SelectedFlag className="h-[18px] w-[27px] shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(22,23,28,0.08)]" />
          <span className="flex-1 truncate text-[15px] font-medium text-ink">{selected.name}</span>
          <span className="font-mono text-[13px] text-ink-3">{selected.dial}</span>
          <CaretDown
            size={14}
            weight="bold"
            className={`text-ink-3 transition-transform duration-[var(--dur-slow)] ${open ? "rotate-180" : ""}`}
          />
        </button>

        <Link
          href={`/signup?country=${selected.code}`}
          className="btn-ink link-arrow inline-flex h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-[15px] font-medium"
        >
          Get a number
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+8px)] z-30 origin-top animate-[panel-in_120ms_var(--ease-enter)] overflow-hidden rounded-[18px] border border-line bg-surface text-left shadow-[0_1px_2px_rgba(22,23,28,0.06),0_24px_48px_-16px_rgba(22,23,28,0.25)] sm:right-auto sm:w-[340px]",
            align === "center" && "sm:left-1/2 sm:-translate-x-1/2",
          )}
        >
          <div className="flex items-center gap-2 border-b border-line px-3.5">
            <MagnifyingGlass size={16} className="text-ink-3" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${results[active].code}` : undefined}
              aria-autocomplete="list"
              placeholder="Search 30+ countries"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              className="h-11 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
            />
          </div>

          <ul id={listId} role="listbox" aria-label="Countries" className="max-h-[280px] overflow-y-auto p-1.5">
            {results.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-ink-3">No country found</li>}
            {results.map((c, i) => {
              const Flag = c.Flag;
              const isSelected = c.code === selected.code;
              return (
                <li
                  key={c.code}
                  id={`${listId}-${c.code}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActive(i)}
                  onClick={() => choose(c)}
                  className={`flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2 text-[14px] ${
                    i === active ? "bg-paper" : ""
                  }`}
                >
                  <Flag className="h-[14px] w-[21px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(22,23,28,0.08)]" />
                  <span className="flex-1 text-ink">{c.name}</span>
                  {c.popular && !query && (
                    <span className="rounded-full bg-duck-soft px-2 py-0.5 text-[11px] font-medium text-ink-2">Popular</span>
                  )}
                  <span className="w-10 text-right font-mono text-[12px] text-ink-3">{c.dial}</span>
                  <Check size={14} weight="bold" className={isSelected ? "text-ink" : "invisible"} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
