"use client";
// Adapted from Arc UI StatsBand (MIT, © 2026 Elia Kuratli). "Divided" hairline layout and in-view count-up, rewritten to Tailwind.

import { useRef, useSyncExternalStore } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Broadcast, GlobeHemisphereWest, Lightning, UsersThree, type Icon as PhosphorIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { inView as inViewOptions } from "@/lib/motion";

type Stat = {
  Icon: PhosphorIcon;
  value: string;
  caption: string;
  /** One line of supporting detail, revealed on hover (always shown on touch screens). Facts stated elsewhere on the page. */
  detail: string;
  /** Static green dot before the detail: only for the "online now" cell. */
  live?: boolean;
  /** Cell borders for the 2x2 grid on small screens and the single row on lg. */
  edges: string;
  highlight?: boolean;
};

const STATS: Stat[] = [
  { Icon: UsersThree, value: "3M+", caption: "People keeping their real number private", detail: "Rated 4.8 out of 5", edges: "" },
  {
    Icon: Lightning,
    value: "<5s",
    caption: "Median time for a code to land",
    detail: "Refunded if no code arrives",
    edges: "border-l",
    highlight: true,
  },
  { Icon: GlobeHemisphereWest, value: "30+", caption: "Countries with local numbers", detail: "US, UK, DE, SE and more", edges: "border-t lg:border-t-0 lg:border-l" },
  { Icon: Broadcast, value: "24/7", caption: "Numbers online and receiving", detail: "Live now", live: true, edges: "border-l border-t lg:border-t-0" },
];

const noop = () => () => {};
/** Reduced motion, but only after hydration, so server and first client render show the same text. */
function useSettledReduce() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Every digit starts at zero and rolls to its value; symbols and letters stay put, so nothing shifts. */
const zeroed = (v: string) => v.replace(/\d/g, "0");

/**
 * Four headline numbers in one ruled strip. The numbers roll in once the band is in view
 * (static under reduced motion). The delivery cell carries the duck tint: it is about the code.
 * Hovering a cell tints it and fades in one line of detail; on touch screens the detail is simply always shown.
 */
export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, inViewOptions);
  const reduce = useSettledReduce();
  const show = seen || reduce;

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div ref={ref}>
          <Reveal group gap={0.09} className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
            {STATS.map(({ Icon, value, caption, detail, live, edges, highlight }, i) => (
              <RevealItem
                key={value}
                className={cn(
                  "group flex min-w-0 flex-col border-line px-4 py-7 transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] sm:px-8 sm:py-10",
                  edges,
                  highlight ? "bg-duck-soft/60 hover:bg-duck-soft/90" : "hover:bg-ink/[0.02]",
                )}
              >
                <Icon size={20} weight="duotone" className="text-ink" aria-hidden="true" />
                <p className="mt-5 font-display text-[clamp(2.25rem,4.4vw,3.25rem)] font-normal leading-none tracking-[-0.025em] text-ink">
                  <span className="sr-only">{value}</span>
                  <span aria-hidden="true">
                    <SlotText value={show ? value : zeroed(value)} duration={0.9 + i * 0.12} />
                  </span>
                </p>
                <p className="mt-3 max-w-[200px] text-[14px] leading-[1.45] text-ink-2">{caption}</p>
                <p className="mt-auto inline-flex items-center gap-1.5 pt-3 font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.1em] text-ink-3 opacity-0 translate-y-1 transition-[opacity,translate] duration-[var(--hover-out)] ease-[var(--ease-standard)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:duration-[var(--hover-in)] pointer-coarse:translate-y-0 pointer-coarse:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-opacity">
                  {live && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-live" />}
                  {detail}
                </p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
