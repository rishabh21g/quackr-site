"use client";
// Message layout adapted from Opensource UI DiscordChatCard (MIT, © 2026 Bidyut Kundu). Arc's testimonial-stage is Pro, so the typing-then-arrive timeline is hand-built.

import { useRef, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { Star, StarHalf } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { ease, inView } from "@/lib/motion";

type Message = {
  name: string;
  initials: string;
  context: string;
  time: string;
  quote: string;
  side: "left" | "right";
  tilt: number;
  avatar: string;
  code?: { app: string; value: string };
};

// Fictional people, written for the landing page.
const MESSAGES: Message[] = [
  {
    name: "Maya Rios",
    initials: "MR",
    context: "Indie dev",
    time: "09:41",
    quote: "I run our signup flow on a Quackr number every release. The code lands before my own phone would have buzzed.",
    side: "left",
    tilt: -1.2,
    avatar: "bg-line-strong text-ink",
  },
  {
    name: "Daniel Koh",
    initials: "DK",
    context: "Growth lead",
    time: "10:02",
    quote: "Six regional accounts, one private number each, renewed monthly. No more SIM cards in a desk drawer.",
    side: "right",
    tilt: 1.4,
    avatar: "bg-ink text-white",
  },
  {
    name: "Tomás Lind",
    initials: "TL",
    context: "Community mod",
    time: "11:17",
    quote: "Picked Sweden, hit get a number, switched tabs. It was already there.",
    side: "left",
    tilt: 0.8,
    avatar: "bg-line text-ink-2",
    code: { app: "Telegram", value: "482 917" },
  },
  {
    name: "Priya Shah",
    initials: "PS",
    context: "Privacy nerd",
    time: "12:30",
    quote: "Dating apps, shops, that one forum. None of them have my real number anymore, and the spam calls stopped.",
    side: "right",
    tilt: -1.5,
    avatar: "border border-line-strong bg-paper text-ink-2",
  },
  {
    name: "Hana Weiss",
    initials: "HW",
    context: "AI agent builder",
    time: "14:05",
    quote: "My agent asks the MCP server for a number, reads the code and finishes the sign up. I just watch the logs.",
    side: "left",
    tilt: 1,
    avatar: "bg-ink/[0.08] text-ink",
  },
];

/*
  The conversation timeline. Each message gets "typing…" dots for a beat, then the bubble arrives
  from its own side. Everything is finite and runs once, when the list scrolls into view.
*/
const START = 0.1;
const GAP = 0.62;
const TYPING = 0.45;
const typingAt = (i: number) => START + i * GAP;
const arriveAt = (i: number) => typingAt(i) + TYPING;

/** Parent: no orchestration of its own; every child carries its explicit delay. */
const list: Variants = { hidden: {}, show: {} };

type Cue = { i: number; side: Message["side"] };

/** Each bubble pops in like a message arriving: a short rise from its own side and a small scale. */
const arrive: Variants = {
  hidden: ({ side }: Cue) => ({ opacity: 0, y: 18, x: side === "left" ? -10 : 10, scale: 0.94 }),
  show: ({ i }: Cue) => ({
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 30,
      mass: 0.7,
      delay: arriveAt(i),
      opacity: { duration: 0.25, ease: [...ease.enter], delay: arriveAt(i) },
    },
  }),
};

/** The avatar shows up with the typing dots, so "someone is writing" reads before the words do. */
const avatarIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: (i: number) => ({ opacity: 1, scale: 1, transition: { duration: 0.2, ease: [...ease.enter], delay: typingAt(i) } }),
};

/** The typing bubble fades in, holds, and hands over to the message (a 0.1s overlap). */
const typing: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0.9, 1, 1, 0.96],
    transition: { duration: TYPING + 0.1, times: [0, 0.2, 0.8, 1], ease: "linear", delay: typingAt(i) },
  }),
};

/** Three dots brighten in turn, once. No infinite loop: the whole indicator lives for half a second. */
const dot: Variants = {
  hidden: { opacity: 0.3 },
  show: ({ i, d }: { i: number; d: number }) => ({
    opacity: [0.3, 1, 0.3],
    transition: { duration: 0.32, ease: "easeInOut", delay: typingAt(i) + 0.06 + d * 0.1 },
  }),
};

function Rating() {
  return (
    <div className="mt-7 flex items-center justify-center gap-3">
      <span role="img" aria-label="Rated 4.8 out of 5" className="flex items-center gap-0.5 text-ink">
        {[0, 1, 2, 3].map((i) => (
          <Star key={i} size={18} weight="fill" aria-hidden />
        ))}
        <StarHalf size={18} weight="fill" aria-hidden />
      </span>
      <span className="font-mono text-[14px] font-medium tabular-nums text-ink">4.8</span>
      <span className="text-[14px] text-ink-3">average from 3M+ users</span>
    </div>
  );
}

function Avatar({ m }: { m: Message }) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-medium", m.avatar)}
    >
      {m.initials}
    </span>
  );
}

/**
 * The bubble. Its tilt (gentler on phones) straightens on hover or press. The code chip flashes duck once
 * when `flashDelay` is set, i.e. when the message has just arrived.
 */
function Figure({ m, flashDelay }: { m: Message; flashDelay?: number }) {
  const right = m.side === "right";
  return (
    <figure
      style={{ "--tilt": `${m.tilt}deg` } as CSSProperties}
      className={cn(
        "min-w-0 max-w-[440px] rounded-[20px] border border-line bg-surface px-4 py-3.5 shadow-[0_1px_2px_rgba(22,23,28,0.04)] sm:px-5 sm:py-4",
        "rotate-[calc(var(--tilt)*0.6)] transition-[rotate] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:rotate-0 hover:duration-[var(--hover-in)] active:rotate-0 motion-reduce:transition-none sm:rotate-(--tilt) sm:hover:rotate-0 sm:active:rotate-0",
        right ? "rounded-br-[6px]" : "rounded-bl-[6px]",
      )}
    >
      <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px]">
        <span className="font-medium text-ink">{m.name}</span>
        <span className="text-ink-3">{m.context}</span>
        <time className="ml-auto pl-2 font-mono text-[11px] tabular-nums text-ink-3">{m.time}</time>
      </figcaption>
      <blockquote className="mt-1.5 text-[15px] leading-[1.55] text-ink-2">{m.quote}</blockquote>
      {m.code && (
        <div className="mt-3 inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-[10px] border border-line bg-paper py-1.5 pl-3 pr-1.5 text-[12px]">
          <span className="text-ink-2">{m.code.app} code</span>
          <span
            className={cn(
              "whitespace-nowrap rounded-[8px] bg-duck-soft px-2 py-0.5 font-mono text-[14px] font-semibold tracking-[0.14em] text-ink tabular-nums",
              flashDelay !== undefined && "mi-code-flash",
            )}
            style={flashDelay !== undefined ? { animationDelay: `${flashDelay}s` } : undefined}
          >
            <span className="mr-[-0.14em]">{m.code.value}</span>
          </span>
        </div>
      )}
    </figure>
  );
}

/** Static bubble row (reduced motion). */
function Bubble({ m }: { m: Message }) {
  return (
    <div className={cn("flex items-end gap-3", m.side === "right" && "flex-row-reverse")}>
      <Avatar m={m} />
      <Figure m={m} />
    </div>
  );
}

/** Animated row: avatar and typing dots first, then the message replaces the dots. */
function ArrivingBubble({ m, i, seen }: { m: Message; i: number; seen: boolean }) {
  const right = m.side === "right";
  return (
    <div className={cn("flex items-end gap-3", right && "flex-row-reverse")}>
      <motion.span variants={avatarIn} custom={i} className="shrink-0">
        <Avatar m={m} />
      </motion.span>
      <div className="relative min-w-0">
        <motion.span
          aria-hidden
          variants={typing}
          custom={i}
          className={cn(
            "absolute bottom-0 flex h-9 items-center gap-1 rounded-[18px] border border-line bg-surface px-3.5 shadow-[0_1px_2px_rgba(22,23,28,0.04)]",
            right ? "right-0 rounded-br-[6px]" : "left-0 rounded-bl-[6px]",
          )}
        >
          {[0, 1, 2].map((d) => (
            <motion.span key={d} variants={dot} custom={{ i, d }} className="size-1.5 rounded-full bg-ink-3" />
          ))}
        </motion.span>
        <motion.div
          variants={arrive}
          custom={{ i, side: m.side }}
          style={{ transformOrigin: right ? "bottom right" : "bottom left" }}
        >
          <Figure m={m} flashDelay={seen ? arriveAt(i) + 0.15 : undefined} />
        </motion.div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  // Same trigger as whileInView below, so the code chip's flash lines up with its bubble's arrival.
  const seen = useInView(listRef, inView);

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="From the inbox" title="3 million people stopped handing out their number." />
          <Rating />
        </Reveal>

        {reduce ? (
          <ul className="mx-auto mt-14 flex max-w-[640px] flex-col gap-5">
            {MESSAGES.map((m) => (
              <li key={m.name}>
                <Bubble m={m} />
              </li>
            ))}
          </ul>
        ) : (
          <motion.ul
            ref={listRef}
            className="mx-auto mt-14 flex max-w-[640px] flex-col gap-5"
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            {MESSAGES.map((m, i) => (
              <li key={m.name}>
                <ArrivingBubble m={m} i={i} seen={seen} />
              </li>
            ))}
          </motion.ul>
        )}
      </Container>
    </section>
  );
}
