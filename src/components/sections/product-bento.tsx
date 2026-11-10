"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { DE, FR, GB, US } from "country-flag-icons/react/3x2";
import { Terminal } from "@/components/art/terminal";
import { Container } from "@/components/ui/container";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { IdentityStack } from "./bento/identity-stack";
import { PrivateSim } from "./bento/private-sim";
import { FLAG, LIVE, useSettledReduce } from "./bento/shared";
import { WorldCoverage } from "./bento/world-coverage";

/*
  The product in five tiles. Each tile carries one tiny live widget that acts the
  feature out, then a serif title, one line, and a link. Widgets only run while
  they are on screen and show a still end state under reduced motion.
  Below md the tiles stack in a single column.
*/

/* ---------- a) Free public numbers ---------- */

const PUBLIC = [
  { id: "us", Flag: US, number: "+1 201 555 0148" },
  { id: "gb", Flag: GB, number: "+44 7700 900 461" },
  { id: "de", Flag: DE, number: "+49 1521 0938 772" },
  { id: "fr", Flag: FR, number: "+33 6 44 21 90 18" },
];
/** Which row gets the next SMS, in turn. */
const NEXT = [2, 0, 3, 1];
const RESET_EVERY = 4; // seconds between new messages

/** The figure (set in mono) and the words around it (set in sans). */
function ago(s: number): [figure: string | null, words: string] {
  if (s < 2) return [null, "just now"];
  return [s < 60 ? `${s}s` : `${Math.floor(s / 60)}m`, "ago"];
}

function PublicNumbers() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, LIVE);
  const reduce = useSettledReduce();
  const [feed, setFeed] = useState({ ages: [12, 38, 0, 51], fresh: 2, tick: 0, turn: 0 });

  useEffect(() => {
    if (!live || reduce) return;
    const id = window.setInterval(() => {
      setFeed((f) => {
        const tick = f.tick + 1;
        const ages = f.ages.map((a) => a + 1);
        if (tick % RESET_EVERY !== 0) return { ...f, ages, tick };
        const turn = (f.turn + 1) % NEXT.length;
        const fresh = NEXT[turn]!;
        ages[fresh] = 0;
        return { ages, fresh, tick, turn };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [live, reduce]);

  // Newest message on top; rows glide when one jumps the queue.
  const order = PUBLIC.map((row, i) => ({ ...row, i, age: feed.ages[i]! })).sort((a, b) => a.age - b.age);

  return (
    <div ref={ref} className="w-full max-w-[360px]" aria-hidden="true">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="text-[12px] font-medium text-ink-2">Public inbox</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-3">
          <span className="live-dot" />
          Live
        </span>
      </div>
      <ul className="space-y-1.5">
        {order.map(({ id, Flag, number, i, age }) => {
          const isFresh = i === feed.fresh && age < 2;
          return (
            <motion.li
              key={id}
              layout={reduce ? false : "position"}
              transition={{ duration: 0.45, ease: ease.standard }}
              className="relative flex items-center gap-3 overflow-hidden rounded-[10px] border border-line bg-surface px-3 py-2.5 shadow-[0_1px_2px_rgba(22,23,28,0.04)]"
            >
              <AnimatePresence>
                {isFresh && (
                  <motion.span
                    key={feed.turn}
                    className="absolute inset-0 bg-duck-soft"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.2, ease: ease.standard } }}
                    transition={{ duration: 0.18 }}
                  />
                )}
              </AnimatePresence>
              <Flag className={cn(FLAG, "relative h-[14px] w-[21px]")} />
              <span className="relative min-w-0 flex-1">
                <span className="block truncate font-mono text-[13px] font-medium tabular-nums text-ink">{number}</span>
                <span className="block text-[11.5px] text-ink-3">
                  {/* only the figure is mono; a mono space next to Inter reads as a double gap */}
                  last SMS{" "}
                  {ago(age)[0] && <span className="font-mono tabular-nums">{ago(age)[0]}</span>} {ago(age)[1]}
                </span>
              </span>
              <AnimatePresence>
                {isFresh && (
                  <motion.span
                    className="relative inline-flex items-center gap-1.5 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink"
                    initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6 } }}
                  >
                    <span className="live-dot" />
                    New SMS
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Tile shell ---------- */

type TileProps = {
  title: string;
  line: string;
  href: string;
  widget: React.ReactNode;
  tall?: boolean;
  className?: string;
};

function Tile({ title, line, href, widget, tall, className }: TileProps) {
  return (
    <RevealItem className={cn("h-full min-w-0", className)}>
      <article className="group/tile flex h-full flex-col rounded-[24px] border border-line bg-surface">
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-t-[23px] border-b border-line bg-paper/70 px-4 py-6 sm:px-6",
            // Every tile is the same height in the mobile stack; the grid sets its own rhythm from md.
            tall ? "h-[300px] sm:h-[320px]" : "h-[300px] sm:h-[320px] md:h-[280px]",
          )}
        >
          {widget}
        </div>
        <div className="flex flex-1 flex-col px-6 pb-4 pt-6 sm:px-7">
          <h3 className="font-display text-[24px] font-normal leading-[1.15] tracking-[-0.02em] text-ink">{title}</h3>
          <p className="mt-2 max-w-[440px] text-[15px] leading-[1.55] text-ink-2">{line}</p>
          <Link
            href={href}
            className="link-arrow mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-2 text-[14px] font-medium text-ink"
          >
            <span className="mi-underline">Learn more</span>
            <span className="sr-only"> about {title.toLowerCase()}</span>
            <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
        </div>
      </article>
    </RevealItem>
  );
}

export function ProductBento() {
  return (
    <section id="numbers" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What you get"
            title="One duck. Every kind of number."
            sub="Free numbers for a quick sign-up, private ones for accounts you keep, and an API for when the one signing up is your agent."
          />
        </Reveal>

        <Reveal
          group
          className={cn(
            "mt-14 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-6 lg:gap-5",
            "lg:[&>div:nth-child(-n+2)]:col-span-3 lg:[&>div:nth-child(n+3)]:col-span-2 md:[&>div:nth-child(5)]:col-span-2",
          )}
        >
            <Tile
              tall
              title="Free public numbers"
              line="Shared inboxes that refresh all day. Good for a quick sign-up you won't come back to."
              href="/signup?plan=free"
              widget={<PublicNumbers />}
            />
            <Tile
              tall
              title="Private numbers"
              line="A number only you can read, for the accounts you plan to keep."
              href="/signup"
              widget={<PrivateSim />}
            />
            <Tile
              title="30+ countries"
              line="Local numbers in the US, UK, Europe and beyond, so apps accept them."
              href="/signup"
              widget={<WorldCoverage />}
            />
            <Tile
              title="Quackr ID"
              line="Private email, cards and a vault, under one identity."
              href="/signup"
              widget={<IdentityStack />}
            />
            <Tile
              title="MCP server for agents"
              line="Your agent gets a number and reads the code. No humans in the loop."
              href="#developers"
              widget={<Terminal className="max-w-[460px]" />}
            />
        </Reveal>
      </Container>
    </section>
  );
}
