"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ease, reveal } from "@/lib/motion";
import { BREACH_SR, BreachRecord } from "./problem/breach-record";
import { ModeSwitch } from "./problem/mode-switch";
import { useSettledReduce, type Mode } from "./problem/shared";
import { SIM_SR, SimChain } from "./problem/sim-chain";
import { SPAM_SR, SpamStack } from "./problem/spam-stack";

/*
  The problem as three exhibits in one ruled panel. Each column states the threat first (mono index, serif
  title, one line), then shows it as a tiny live widget on a paper strip underneath: a lock screen filling with
  spam, a leaked list with your row on it, a SIM swap knocking accounts over. On lg the columns share rows
  (subgrid), so the titles line up and the paper strips form one band. On md each exhibit is a row (text left,
  widget right); on phones they simply stack.
  One switch flips all three to the Quackr version, staggered column by column. The section opens on
  "Without", and after about 4s on screen it flips to "With" once, unless the visitor has already used the
  switch, so it ends on the outcome we want them to remember.
*/

/** How long the panel is on screen before the one automatic flip to "With" (ms). */
const AUTO_FLIP_MS = 4200;
/** Each exhibit starts its flip this much after the previous one (s). */
const STAGGER = 0.09;

const CAPTION: Record<Mode, string> = {
  without: "Every app gets your real number.",
  with: "Every app gets a decoy instead.",
};

type ExhibitProps = {
  index: string;
  label: string;
  title: [string, string];
  body: string;
  widget: React.ReactNode;
  /** What the widget shows right now, for screen readers. */
  scene: string;
};

function Exhibit({ index, label, title, body, widget, scene }: ExhibitProps) {
  return (
    <motion.article
      variants={reveal}
      className="grid min-w-0 border-t border-line first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:row-span-2 lg:grid-cols-1 lg:grid-rows-subgrid lg:border-t-0 lg:border-l lg:first:border-l-0"
    >
      <div className="flex flex-col px-5 pb-5 pt-6 sm:px-7 sm:pt-7 md:justify-center md:py-8 lg:justify-start lg:pb-7 lg:pt-7">
        <p className="flex items-baseline gap-2.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-ink-3">
          <span className="tabular-nums text-ink">{index}</span>
          <span className="mr-[-0.12em]">{label}</span>
        </p>
        <h3 className="mt-4 font-display text-[21px] font-normal leading-[1.18] tracking-[-0.02em] text-ink sm:text-[23px]">
          {title[0]}
          <br />
          {title[1]}
        </h3>
        <p className="mt-2 max-w-[36ch] text-[15px] leading-[1.55] text-ink-2">{body}</p>
        <p className="sr-only">{scene}</p>
      </div>
      {/* sized to the widget; on lg the three strips share one row, so they read as a single band */}
      <div className="flex items-center justify-center border-t border-line bg-paper/70 px-4 py-5 sm:px-6 sm:py-6 md:border-l md:border-t-0 lg:border-l-0 lg:border-t">
        {widget}
      </div>
    </motion.article>
  );
}

export function Problem() {
  const reduce = useSettledReduce();
  const [mode, setMode] = useState<Mode>("without");
  const [touched, setTouched] = useState(false);
  const [autoFlipped, setAutoFlipped] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const onStage = useInView(stageRef, { amount: 0.4 });

  // One automatic flip to "With" after the panel has been on screen for a while. Leaving early restarts the wait.
  useEffect(() => {
    if (!onStage || touched || autoFlipped) return;
    const id = window.setTimeout(() => {
      setMode("with");
      setAutoFlipped(true);
    }, AUTO_FLIP_MS);
    return () => window.clearTimeout(id);
  }, [onStage, touched, autoFlipped]);

  const choose = (next: Mode) => {
    setTouched(true);
    setMode(next);
  };

  return (
    <section id="why" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading title="Every sign-up wants your number." sub="And once it's out, it's out forever." />
        </Reveal>

        <div ref={stageRef}>
          <Reveal delay={0.06} className="mt-10 flex flex-col items-center sm:mt-12">
            <ModeSwitch value={mode} onValueChange={choose} reduce={reduce} />
            {/* the visible caption swaps in place; the sr-only twin is the polite announcement */}
            <p aria-hidden="true" className="relative mt-3 grid h-5 w-full max-w-[420px] justify-items-center overflow-hidden text-[13px] leading-5 text-ink-3">
              <AnimatePresence initial={false}>
                <motion.span
                  key={mode}
                  className="[grid-area:1/1]"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.26, ease: ease.enter }}
                >
                  {CAPTION[mode]}
                </motion.span>
              </AnimatePresence>
            </p>
            <p className="sr-only" aria-live="polite">
              {mode === "with" ? "With Quackr" : "Without Quackr"}: {CAPTION[mode]}
            </p>
          </Reveal>

          <Reveal
            group
            gap={0.1}
            aria-label="Why your real number is at risk"
            role="group"
            className="mx-auto mt-8 grid max-w-[1120px] overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_1px_2px_rgba(22,23,28,0.04)] sm:mt-10 lg:grid-cols-3 lg:grid-rows-[auto_auto]"
          >
            <Exhibit
              index="01"
              label="Spam"
              title={["Spam calls and texts", "that never stop"]}
              body="One sign-up, and the robocalls start by the weekend."
              widget={<SpamStack mode={mode} delay={0} />}
              scene={SPAM_SR[mode]}
            />
            <Exhibit
              index="02"
              label="Breaches"
              title={["Leaked in a breach,", "then sold on"]}
              body="Your number lands in breach dumps and data broker lists."
              widget={<BreachRecord mode={mode} delay={STAGGER} />}
              scene={BREACH_SR[mode]}
            />
            <Exhibit
              index="03"
              label="Takeovers"
              title={["Your real number,", "the key to everything"]}
              body="SIM swaps and account takeovers start with the number tied to your bank."
              widget={<SimChain mode={mode} delay={STAGGER * 2} />}
              scene={SIM_SR[mode]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-14 max-w-[560px] text-center font-display text-[clamp(1.375rem,2.6vw,1.75rem)] font-normal leading-[1.25] tracking-[-0.02em] text-ink-3 sm:mt-16">
            Quackr gives them a number. <span className="text-ink">Just not yours.</span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
