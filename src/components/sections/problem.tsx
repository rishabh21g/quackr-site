"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SnapRail } from "@/components/ui/snap-rail";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { BREACH_SR, BreachRecord } from "./problem/breach-record";
import { ModeSwitch } from "./problem/mode-switch";
import { useSettledReduce, type Mode } from "./problem/shared";
import { SIM_SR, SimChain } from "./problem/sim-chain";
import { SPAM_SR, SpamStack } from "./problem/spam-stack";

/*
  The problem as three pieces of evidence. Each card holds a tiny live widget that acts the threat out
  (a lock screen filling with spam, a leaked list with your row on it, a SIM swap knocking accounts over),
  then a serif title and one line. One switch flips all three to the Quackr version, staggered card by card.
  The section opens on "Without", and after about 4s on screen it flips to "With" once, unless the visitor
  has already used the switch, so it ends on the outcome we want them to remember.
*/

/** How long the cards are on screen before the one automatic flip to "With" (ms). */
const AUTO_FLIP_MS = 4200;
/** Each card starts its flip this much after the previous one (s). */
const CARD_STAGGER = 0.09;

const CAPTION: Record<Mode, string> = {
  without: "Every app gets your real number.",
  with: "Every app gets a decoy instead.",
};

type CardProps = {
  title: [string, string];
  body: string;
  widget: React.ReactNode;
  /** What the widget shows right now, for screen readers. */
  scene: string;
  /** md only: span both columns and lay out sideways. */
  wide?: boolean;
};

function Card({ title, body, widget, scene, wide }: CardProps) {
  return (
    <RevealItem className="h-full min-w-0">
      <article
        className={cn(
          "flex h-full flex-col rounded-[24px] border border-line bg-surface shadow-[0_1px_2px_rgba(22,23,28,0.04)]",
          wide && "md:flex-row lg:flex-col",
        )}
      >
        <div
          className={cn(
            "flex h-[300px] shrink-0 items-center justify-center overflow-hidden rounded-t-[23px] border-b border-line bg-paper/70 px-4 sm:h-[320px] sm:px-5",
            wide &&
              "md:w-[52%] md:rounded-tr-none md:rounded-bl-[23px] md:border-b-0 md:border-r lg:w-auto lg:rounded-tr-[23px] lg:rounded-bl-none lg:border-r-0 lg:border-b",
          )}
        >
          {widget}
        </div>
        <div className={cn("flex flex-1 flex-col px-6 pb-7 pt-6 sm:px-7", wide && "md:justify-center lg:justify-start")}>
          <h3 className="font-display text-[22px] font-normal leading-[1.18] tracking-[-0.02em] text-ink sm:text-[23px]">
            {title[0]}
            <br />
            {title[1]}
          </h3>
          <p className="mt-2.5 max-w-[34ch] text-[15px] leading-[1.55] text-ink-2">{body}</p>
          <p className="sr-only">{scene}</p>
        </div>
      </article>
    </RevealItem>
  );
}

export function Problem() {
  const reduce = useSettledReduce();
  const [mode, setMode] = useState<Mode>("without");
  const [touched, setTouched] = useState(false);
  const [autoFlipped, setAutoFlipped] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const onStage = useInView(stageRef, { amount: 0.4 });

  // One automatic flip to "With" after the cards have been on screen for a while. Leaving early restarts the wait.
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

          <Reveal group gap={0.1} className="mx-auto mt-8 max-w-[1120px] sm:mt-10">
            <SnapRail
              label="Why your real number is at risk"
              className="md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5 md:[&>div:nth-child(3)]:col-span-2 lg:[&>div:nth-child(3)]:col-span-1"
            >
              <Card
                title={["Spam calls and texts", "that never stop"]}
                body="One sign-up, and the robocalls start by the weekend."
                widget={<SpamStack mode={mode} delay={0} />}
                scene={SPAM_SR[mode]}
              />
              <Card
                title={["Leaked in a breach,", "then sold on"]}
                body="Your number lands in breach dumps and data broker lists."
                widget={<BreachRecord mode={mode} delay={CARD_STAGGER} />}
                scene={BREACH_SR[mode]}
              />
              <Card
                wide
                title={["Your real number,", "the key to everything"]}
                body="SIM swaps and account takeovers start with the number tied to your bank."
                widget={<SimChain mode={mode} delay={CARD_STAGGER * 2} />}
                scene={SIM_SR[mode]}
              />
            </SnapRail>
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
