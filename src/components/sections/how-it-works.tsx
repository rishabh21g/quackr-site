"use client";
// Adapted from Arc UI Stepper (MIT, © 2026 Elia Kuratli).
// Kept: the active-step marker (a track that stays put, a fill along it). CSS module rewritten to Tailwind. Here the
// fill is the story's progress: scroll on desktop, the scene's playback on smaller screens.

import { useEffect, useEffectEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { Timer } from "@phosphor-icons/react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
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
  The story runs on one timeline value, 0 → 1.
  Desktop (lg+): the section is a 280vh track with a sticky stage. The timeline is the track's scroll progress, from
  the moment the stage pins under the 56px nav ("start 56px") to the moment it unpins ("end end"), so about 180vh of
  scroll tells the whole story. Each step owns a third-ish of it and its beats land at fixed points inside.
  Smaller screens: the step crossing a line just under the card plays its stretch of the timeline once, over a
  second or two. Reduced motion: no timeline; the finished scene shows, or the clicked step's finished scene.
*/

/** Nav height when scrolled (px). The stage pins under it. */
const NAV = 56;
/** Timeline point at which each beat lands. Index 0 is beat 1. */
const BEAT_AT = [0.06, 0.16, 0.3, 0.45, 0.6, 0.66, 0.69, 0.72, 0.75, 0.78, 0.81, 0.86] as const;
/** Each step's stretch of the timeline. Its rule fills across it. The last 10% holds on "Verified". */
const SEGMENTS = [
  [0, 0.3],
  [0.3, 0.6],
  [0.6, 0.9],
] as const;
/** Where a click scrolls to: just past the step's last beat, so its scene is finished. */
const SETTLE_AT = [0.24, 0.54, 0.95] as const;
/** Smaller screens: where a step's playback stops, and how long it takes (s). */
const PLAY_TO = [0.299, 0.599, 0.92] as const;
const PLAY_FOR = [1.6, 1.3, 2.6] as const;

function beatAt(p: number) {
  let beat = 0;
  while (beat < BEAT_AT.length && p >= BEAT_AT[beat]!) beat += 1;
  return beat;
}

const DESKTOP = "(min-width: 1024px)";
function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(DESKTOP);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
/** lg+, but false on the server and during hydration, so the first render is the same everywhere. */
function useDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => false);
}

type Mode = "static" | "scroll" | "view";

/** Three numbered steps beside the sign-up card. One timeline drives both, so the card and the list never disagree. */
export function HowItWorks() {
  const reduce = useReducedFlag();
  const desktop = useDesktop();
  const mode: Mode = reduce ? "static" : desktop ? "scroll" : "view";

  const uid = useId();
  const cardId = `${uid}-card`;
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const statRef = useRef<HTMLParagraphElement>(null);
  // The stat rolls from ~0s to ~5s once it scrolls into view (static under reduced motion), like the stats band.
  const statSeen = useInView(statRef, inView);

  /** The story's timeline. Only beat changes reach React; the rules read it directly. */
  const timeline = useMotionValue(0);
  const [beat, setBeat] = useState(0);
  const [picked, setPicked] = useState<SwapStep | null>(null);
  const playback = useRef<{ step: SwapStep; controls: AnimationPlaybackControls } | null>(null);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: [`start ${NAV}px`, "end end"] });
  const { scrollY } = useScroll();

  /** Smaller screens: play one step's stretch of the timeline, from its start. */
  function play(step: SwapStep, again = false) {
    if (!again && playback.current?.step === step) return;
    playback.current?.controls.stop();
    timeline.jump(SEGMENTS[step][0]);
    const controls = animate(timeline, PLAY_TO[step], { duration: PLAY_FOR[step], ease: "linear" });
    playback.current = { step, controls };
  }

  /** Smaller screens: the active step is the last one whose top has crossed a line just under the card. */
  function followLine() {
    const card = cardRef.current;
    if (!card) return;
    const vh = window.innerHeight;
    // Phones: the card is pinned on top, so the line sits under it. Tablets: card and steps sit side by side.
    const line = window.innerWidth < 768 ? Math.max(card.getBoundingClientRect().bottom + 16, vh * 0.55) : vh * 0.6;
    if (line > vh) return;
    let current = -1;
    stepRefs.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) current = i;
    });
    if (current >= 0) play(current as SwapStep);
  }

  // setBeat with an unchanged beat is a no-op, so scrolling inside a beat never re-renders.
  useMotionValueEvent(timeline, "change", (v) => setBeat(beatAt(v)));
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (mode === "scroll") timeline.set(v);
  });
  useMotionValueEvent(scrollY, "change", () => {
    if (mode === "view") followLine();
  });

  const onModeChange = useEffectEvent((next: Mode) => {
    playback.current?.controls.stop();
    playback.current = null;
    if (next === "scroll") timeline.set(scrollYProgress.get());
    if (next === "view") followLine();
  });
  useEffect(() => {
    onModeChange(mode);
    return () => playback.current?.controls.stop();
  }, [mode]);

  function pick(step: SwapStep) {
    if (mode === "static") return setPicked(step);
    if (mode === "view") return play(step, true);
    // Desktop: scroll to the point on the track where that step's scene is finished; the beats in between play on the way.
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const start = top - NAV;
    const end = top + track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + SETTLE_AT[step] * Math.max(0, end - start), behavior: "smooth" });
  }

  const shownBeat = mode === "static" ? SETTLED_BEAT[picked ?? 2] : beat;
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

      {/* the track: tall on desktop so scroll can tell the story; normal height everywhere else */}
      <div
        ref={trackRef}
        // The sticky mobile CTA steps aside here: the card is pinned on top and the steps have their own CTAs.
        data-mobile-cta-hide
        className="relative mt-10 sm:mt-14 lg:mt-2 lg:h-[280vh] lg:motion-reduce:mt-16 lg:motion-reduce:h-auto"
      >
        <div className="lg:sticky lg:top-14 lg:flex lg:h-[calc(100svh-3.5rem)] lg:items-center lg:motion-reduce:static lg:motion-reduce:block lg:motion-reduce:h-auto">
          <Container className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-20 xl:gap-28">
            {/* the card: pinned on top on phones (not on short screens, not with reduced motion) */}
            <div
              ref={cardRef}
              className="sticky top-14 z-10 -mx-5 bg-paper px-5 pb-3 pt-3 motion-reduce:static sm:-mx-8 sm:px-8 md:static md:mx-0 md:bg-transparent md:p-0 [@media(max-height:620px)]:static"
            >
              <Reveal>
                <figure id={cardId} aria-label="Sign-up preview" className="mx-auto max-w-[440px] md:mx-0">
                  <SignupSwap beat={shownBeat} />
                  <figcaption className="sr-only" aria-live="polite">
                    Step {step + 1} of 3. {STEPS[step]!.scene}
                  </figcaption>
                </figure>
              </Reveal>
            </div>

            {/* the steps */}
            <div className="lg:max-w-[500px]">
              <motion.ol initial={reduce ? false : "hidden"} whileInView="show" viewport={inView} variants={stagger(0.08)}>
                {STEPS.map((item, idx) => {
                  const i = idx as SwapStep;
                  const on = i === step;
                  const bodyId = `${uid}-step-${i}`;
                  return (
                    <motion.li
                      key={item.title}
                      ref={(el) => {
                        stepRefs.current[i] = el;
                      }}
                      variants={reveal}
                      data-active={on || undefined}
                      className="group relative py-6 pl-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink sm:pl-6 lg:py-5"
                    >
                      <StepRule
                        timeline={timeline}
                        range={SEGMENTS[i]}
                        active={on}
                        still={mode === "static" ? (i <= step ? 1 : 0) : undefined}
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
