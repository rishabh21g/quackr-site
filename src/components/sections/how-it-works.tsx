"use client";
// Adapted from Arc UI Stepper (MIT, © 2026 Elia Kuratli).
// Kept: the active-step marker (a track that stays put, a fill along it). CSS module rewritten to Tailwind. Here the
// fill is the story's progress as it plays.

import { useEffect, useEffectEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { Timer } from "@phosphor-icons/react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { SETTLED_BEAT, SignupSwap, stepOfBeat, useReducedFlag, type SwapStep } from "@/components/art/signup-swap";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SlotText } from "@/components/ui/slot-text";
import { InlineIcon, SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { inView, reveal, stagger } from "@/lib/motion";

const STEPS = [
  {
    title: "Pick a country",
    body: "Choose from 30+ countries, or start with a free public number.",
    tag: "30+ countries",
    scene: "A sign-up form asks for a phone number. You pick a country instead, and your real number stays on your phone.",
  },
  {
    title: "Get a number",
    body: "A fresh number is yours in a second. No ID, no SIM, no contract.",
    tag: "Instant · no ID",
    scene: "A Quackr number, +44 7700 900316, rolls into the phone field and Send code switches on.",
  },
  {
    title: "The code lands",
    body: "The SMS shows up in your Quackr inbox, live. Paste it into any sign-up.",
    tag: "SMS · auto-refresh",
    scene: "The text with code 482 917 lands, fills the code boxes, and the sign-up is verified. Your real number was never sent.",
  },
];

/*
  The story runs on one timeline value, 0 → 1, the same on every screen size.
  Once the stage is on screen it plays on its own, at a steady pace: step 1, 2, 3, each owning a third-ish of the
  timeline with its beats landing at fixed points inside, and the active step's rule filling as it goes. It ends on
  "Verified" and stays there; it doesn't loop, so the finished card sits still beside the CTA.
  It pauses while the stage is off screen or the tab is hidden, and picks up where it left off.
  Clicking a step jumps to that step's start and plays on from there to the end.
  Reduced motion: no timeline; the finished scene shows, or the clicked step's finished scene.
*/

/** Timeline point at which each beat lands. Index 0 is beat 1. */
const BEAT_AT = [0.06, 0.16, 0.3, 0.45, 0.6, 0.66, 0.69, 0.72, 0.75, 0.78, 0.81, 0.86] as const;
/** Each step's stretch of the timeline. Its rule fills across it. The last 10% is the hold on "Verified". */
const SEGMENTS = [
  [0, 0.3],
  [0.3, 0.6],
  [0.6, 0.9],
] as const;
/** Where playback stops: the end of the last step, just after "Verified". */
const END = SEGMENTS[2][1];
/** Seconds per whole timeline, so each step plays for 3s and the story takes 9s. */
const PACE = 10;
/** The stage counts as on screen while it crosses the middle 40% of the viewport, whatever its height. */
const STAGE_VIEW = { margin: "-30% 0px -30% 0px" } as const;

function beatAt(p: number) {
  let beat = 0;
  while (beat < BEAT_AT.length && p >= BEAT_AT[beat]!) beat += 1;
  return beat;
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
/** The tab is showing. True on the server and during hydration. */
function usePageVisible() {
  return useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);
}

/** Three numbered steps beside the sign-up card. One timeline drives both, so the card and the list never disagree. */
export function HowItWorks() {
  const reduce = useReducedFlag();

  const uid = useId();
  const cardId = `${uid}-card`;
  const stageRef = useRef<HTMLDivElement>(null);
  const statRef = useRef<HTMLParagraphElement>(null);
  // The stat rolls from ~0s to ~5s once it scrolls into view (static under reduced motion), like the stats band.
  const statSeen = useInView(statRef, inView);
  const stageSeen = useInView(stageRef, STAGE_VIEW);
  const pageVisible = usePageVisible();
  const live = stageSeen && pageVisible && !reduce;

  /** The story's timeline. Only beat changes reach React; the rules read it directly. */
  const timeline = useMotionValue(0);
  const [beat, setBeat] = useState(0);
  const [picked, setPicked] = useState<SwapStep | null>(null);
  /** The current playback. Null until the stage is first seen. */
  const playback = useRef<AnimationPlaybackControls | null>(null);

  // setBeat with an unchanged beat is a no-op, so frames inside a beat never re-render.
  useMotionValueEvent(timeline, "change", (v) => setBeat(beatAt(v)));

  /** Play from a point on the timeline to the end, paused straight away if the stage isn't live. */
  function playFrom(at: number) {
    playback.current?.stop();
    timeline.jump(at);
    const controls = animate(timeline, END, { duration: (END - at) * PACE, ease: "linear" });
    if (!live) controls.pause();
    playback.current = controls;
  }

  // Start the first time the stage is seen; after that, pause and resume with it. A finished story stays finished.
  const onLive = useEffectEvent((on: boolean) => {
    const controls = playback.current;
    if (!controls) {
      if (on) playFrom(0);
      return;
    }
    if (controls.state === "finished") return;
    if (on) controls.play();
    else controls.pause();
  });
  useEffect(() => {
    onLive(live);
  }, [live]);
  useEffect(() => () => playback.current?.stop(), []);

  function pick(step: SwapStep) {
    if (reduce) return setPicked(step);
    playFrom(SEGMENTS[step][0]);
  }

  const shownBeat = reduce ? SETTLED_BEAT[picked ?? 2] : beat;
  const step = stepOfBeat(shownBeat);

  return (
    <section id="how" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="How it works"
            title={
              <>
                Three steps, about{" "}
                <InlineIcon>
                  <Timer weight="bold" />
                </InlineIcon>{" "}
                ten seconds
              </>
            }
            sub="Nothing to install and nothing to verify. Your real number never enters the picture."
          />
        </Reveal>
      </Container>

      {/* the stage: the card, then the steps beside it (md+) or under it */}
      <div
        ref={stageRef}
        // The sticky mobile CTA steps aside here: the steps have their own CTAs.
        data-mobile-cta-hide
        className="mt-10 sm:mt-14 lg:mt-16"
      >
        <Container className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-20 xl:gap-28">
          <Reveal>
            <figure id={cardId} aria-label="Sign-up preview" className="mx-auto max-w-[440px] md:mx-0">
              <SignupSwap beat={shownBeat} />
              <figcaption className="sr-only" aria-live="polite">
                Step {step + 1} of 3. {STEPS[step]!.scene}
              </figcaption>
            </figure>
          </Reveal>

          {/* the steps: under the card, they line up with it */}
          <div className="mx-auto w-full max-w-[440px] md:mx-0 md:max-w-none lg:max-w-[500px]">
            <motion.ol initial={reduce ? false : "hidden"} whileInView="show" viewport={inView} variants={stagger(0.08)}>
              {STEPS.map((item, idx) => {
                const i = idx as SwapStep;
                const on = i === step;
                const bodyId = `${uid}-step-${i}`;
                return (
                  <motion.li
                    key={item.title}
                    variants={reveal}
                    data-active={on || undefined}
                    className="group relative py-6 pl-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink sm:pl-6 lg:py-5"
                  >
                    <StepRule
                      timeline={timeline}
                      range={SEGMENTS[i]}
                      active={on}
                      still={reduce ? (i <= step ? 1 : 0) : undefined}
                    />

                    {/* number, title and tag share one baseline; the body sits under the title */}
                    <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-y-1.5 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
                      <span
                        aria-hidden
                        className={cn(
                          "font-mono text-[13px] font-medium tabular-nums transition-colors duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
                          on ? "text-ink" : "text-ink-3",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-[18px] font-medium leading-6 tracking-[-0.01em] sm:text-[19px]">
                          {/* the whole row is the hit area; the button carries the name and state */}
                          <button
                            type="button"
                            onClick={() => pick(i)}
                            aria-current={on ? "step" : undefined}
                            aria-controls={cardId}
                            aria-describedby={bodyId}
                            className={cn(
                              "cursor-pointer text-left transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] after:absolute after:inset-0 after:content-[''] hover:duration-[var(--hover-in)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none",
                              on ? "text-ink" : "text-ink-2 group-hover:text-ink",
                            )}
                          >
                            <span className="sr-only">Step {i + 1}: </span>
                            {item.title}
                          </button>
                        </h3>
                        <span className="font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.1em] text-ink-3">
                          {item.tag}
                        </span>
                      </div>
                      <p
                        id={bodyId}
                        className={cn(
                          "col-start-2 max-w-[42ch] text-[15px] leading-[1.55] transition-colors duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
                          on ? "text-ink-2" : "text-ink-3",
                        )}
                      >
                        {item.body}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ol>

            {/* CTAs and the stat line start where the step text starts */}
            <Reveal delay={0.2} className="mt-4 pl-[3.25rem] sm:pl-[3.75rem]">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                <ButtonLink href="/signup" size="lg" arrow>
                  Get a number
                </ButtonLink>
                <ButtonLink href="/signup?plan=free" variant="ghost" size="lg">
                  Try a free number
                </ButtonLink>
              </div>
              <p ref={statRef} className="mt-5 flex items-center gap-2 text-[13px] leading-5 text-ink-3">
                <Timer size={14} weight="bold" aria-hidden className="shrink-0 text-ink-2" />
                <span>
                  <span className="font-mono font-medium tabular-nums text-ink">
                    <span className="sr-only">~5s</span>
                    <span aria-hidden="true">
                      <SlotText value={statSeen || reduce ? "~5s" : "~0s"} duration={0.9} />
                    </span>
                  </span>{" "}
                  median time from request to code
                </span>
              </p>
            </Reveal>
          </div>
        </Container>
      </div>
    </section>
  );
}

/** Arc's stepper marker: the track stays, the fill follows the step's stretch of the timeline. No re-render per frame. */
function StepRule({
  timeline,
  range,
  active,
  still,
}: {
  timeline: MotionValue<number>;
  range: readonly [number, number];
  active: boolean;
  /** Reduced motion: a fixed fill instead of the timeline. */
  still?: number;
}) {
  const fill = useTransform(timeline, [range[0], range[1]], [0, 1]);
  return (
    <span aria-hidden className="absolute inset-y-6 left-0 w-[2px] overflow-hidden rounded-full bg-line lg:inset-y-5">
      <motion.span
        className={cn(
          "absolute inset-0 origin-top rounded-full transition-colors duration-[var(--dur-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
          active ? "bg-ink" : "bg-ink-3/40",
        )}
        style={{ scaleY: still ?? fill }}
      />
    </span>
  );
}
