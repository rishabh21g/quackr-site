"use client";
// Adapted from Arc UI BillingToggle (MIT, © 2026 Elia Kuratli). CSS module rewritten to Tailwind; card grid informed by Opensource UI TogglePricingCards.

import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "motion/react";
import { Check, Star } from "@phosphor-icons/react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

type Billing = "monthly" | "yearly";

type Plan = {
  name: string;
  blurb: string;
  /** Price string per billing period, without the currency sign. */
  price: Record<Billing, string>;
  lead?: string;
  period: string;
  /** Small line under the price, per billing period. */
  note: Record<Billing, string>;
  features: string[];
  cta: { label: string; href: string; variant: "ink" | "outline" };
  popular?: boolean;
};

// Illustrative prices for the landing page. Real pricing comes from billing before launch.
// Order matters: the popular plan sits in the centre on md+; on mobile it moves to the top of the stack.
const PLANS: Plan[] = [
  {
    name: "Free",
    blurb: "Shared public numbers for quick, low-stakes sign ups.",
    price: { monthly: "0", yearly: "0" },
    period: "forever",
    note: { monthly: "No card needed", yearly: "No card needed" },
    features: ["Shared public numbers", "Codes visible to everyone", "Numbers rotate often"],
    cta: { label: "Try a free number", href: "/signup?plan=free", variant: "outline" },
  },
  {
    name: "Private number",
    blurb: "Your own number for accounts you'll log into again.",
    price: { monthly: "9.99", yearly: "7.99" },
    period: "/mo",
    note: { monthly: "Billed monthly", yearly: "Billed $95.88 yearly" },
    features: ["Your own number for 30 days", "Unlimited incoming SMS", "Renew any time, keep the number"],
    cta: { label: "Get a number", href: "/signup", variant: "ink" },
    popular: true,
  },
  {
    name: "Single use",
    blurb: "A private number for one verification, then it's gone.",
    lead: "from",
    price: { monthly: "0.50", yearly: "0.50" },
    period: "/code",
    note: { monthly: "Refunded if no code arrives", yearly: "Refunded if no code arrives" },
    features: ["Private number, one code", "Only you see the SMS", "Auto refund if no code arrives"],
    cta: { label: "Get one code", href: "/signup", variant: "outline" },
  },
];

const OPTIONS: { value: Billing; label: string; badge?: string; activeBadge?: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", badge: "Save 20%", activeBadge: "You save $24" },
];

/** Critically damped: the pill glides and lands without overshoot. */
const glide: Transition = { type: "spring", visualDuration: 0.34, bounce: 0 };

const swap: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(2px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" }, transition: { duration: 0.22, ease: [...ease.enter] } },
  gone: { opacity: 0, y: "-0.45em", filter: "blur(2px)", transition: { duration: 0.14, ease: [...ease.standard] } },
};
const still: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0 } }, gone: { opacity: 0, transition: { duration: 0 } } };

/** Text that swaps in place. Every candidate sits in one grid cell, so the box keeps the width of the longest one. */
function StableSwap({ text, candidates, reduced }: { text: string; candidates: string[]; reduced: boolean }) {
  return (
    <span className="relative inline-grid justify-items-start overflow-y-clip">
      {[...new Set(candidates)].map((c) => (
        <span key={c} className="invisible [grid-area:1/1]" aria-hidden="true">
          {c}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          className="inline-block [grid-area:1/1]"
          variants={reduced ? still : swap}
          initial="hidden"
          animate="shown"
          exit="gone"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Billing period switch: one pill glides between the options; the savings tag rewrites itself once chosen. */
function BillingToggle({ value, onValueChange }: { value: Billing; onValueChange: (v: Billing) => void }) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [thumb, setThumb] = useState<{ x: number; width: number } | null>(null);
  const selectedIndex = Math.max(0, OPTIONS.findIndex((o) => o.value === value));

  const measure = useCallback(() => {
    const node = refs.current[selectedIndex];
    if (!node) return;
    setThumb((cur) =>
      cur && cur.x === node.offsetLeft && cur.width === node.offsetWidth ? cur : { x: node.offsetLeft, width: node.offsetWidth },
    );
  }, [selectedIndex]);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const k = event.key;
    const step = k === "ArrowRight" || k === "ArrowDown" ? 1 : k === "ArrowLeft" || k === "ArrowUp" ? -1 : 0;
    const target = k === "Home" ? 0 : k === "End" ? OPTIONS.length - 1 : step ? (index + step + OPTIONS.length) % OPTIONS.length : -1;
    if (target < 0) return;
    event.preventDefault();
    onValueChange(OPTIONS[target].value);
    refs.current[target]?.focus();
  };

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label="Billing period"
      className="relative isolate inline-flex items-center rounded-full border border-line bg-ink/[0.04] p-1 text-[14px]"
    >
      {thumb && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-0 top-1 -z-10 rounded-full bg-surface shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(22,23,28,0.06)]"
          initial={false}
          animate={{ x: thumb.x, width: thumb.width }}
          transition={reduced ? { duration: 0 } : glide}
        />
      )}
      {OPTIONS.map((option, index) => {
        const selected = index === selectedIndex;
        const badgeText = selected ? (option.activeBadge ?? option.badge) : option.badge;
        const candidates = [option.badge, option.activeBadge].filter((t): t is string => !!t);
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 font-medium transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)]",
              option.badge && "pr-1.5",
              selected ? "cursor-default text-ink" : "cursor-pointer text-ink-3 hover:text-ink-2",
            )}
          >
            {selected && !thumb && (
              <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-surface shadow-[0_0_0_1px_var(--line)]" />
            )}
            <span>{option.label}</span>
            {badgeText && (
              <span
                className={cn(
                  "inline-flex h-8 items-center rounded-full px-2.5 font-mono text-[12px] tabular-nums transition-colors duration-[var(--dur-slow)]",
                  selected ? "bg-duck-soft text-ink" : "bg-ink/[0.05] text-ink-2",
                )}
              >
                <StableSwap text={badgeText} candidates={candidates} reduced={reduced} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const reduced = !!useReducedMotion();
  const note = plan.note[billing];
  const notes = [...new Set(Object.values(plan.note))];
  // On yearly, a plan whose price actually drops shows the monthly price struck through beside it.
  const was = billing === "yearly" && plan.price.yearly !== plan.price.monthly ? plan.price.monthly : null;

  return (
    <article
      className={cn(
        // Hover lifts 2px and deepens the edge, the same as the bento tiles. Static under reduced motion.
        "relative flex h-full flex-col rounded-[24px] border bg-surface p-6 transition-[box-shadow,border-color] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] motion-reduce:transition-none sm:p-8",
        plan.popular
          ? "border-ink shadow-[var(--shadow-card)]"
          : "border-line shadow-[0_1px_2px_rgba(22,23,28,0.04)] hover:border-line-strong hover:shadow-[var(--shadow-card)]",
      )}
    >
      {/* The tab sits on the ink border, so it reads as part of the card rather than a label squeezed beside the name. */}
      {plan.popular && (
        <span className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink py-1 pl-2.5 pr-3 text-[12px] font-medium text-paper shadow-[0_2px_8px_rgba(22,23,28,0.18)]">
          <Star size={11} weight="fill" aria-hidden />
          Most popular
        </span>
      )}
      <h3 className="text-[16px] font-medium text-ink">{plan.name}</h3>
      <p className="mt-2 text-[14px] leading-[1.55] text-ink-2">{plan.blurb}</p>

      <div className="mt-6 flex flex-wrap items-end gap-x-2 gap-y-1 sm:mt-7">
        {plan.lead && <span className="pb-[0.3em] text-[14px] text-ink-3">{plan.lead}</span>}
        <span className="font-mono text-[44px] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums md:text-[36px] lg:text-[44px]">
          <span className="mr-0.5 align-top text-[0.55em] text-ink-2">$</span>
          <SlotText value={plan.price[billing]} duration={0.7} stagger={0.06} />
        </span>
        <span className="pb-[0.3em] text-[14px] text-ink-3">{plan.period}</span>
        <AnimatePresence initial={false}>
          {was && (
            <motion.s
              key="was"
              className="pb-[0.3em] font-mono text-[14px] tabular-nums text-ink-3 decoration-ink-3/70"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.22, ease: [...ease.enter], delay: reduced ? 0 : 0.2 } }}
              exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12, ease: [...ease.standard] } }}
            >
              <span className="sr-only">was </span>${was}
            </motion.s>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-2 text-[13px] text-ink-3">
        {notes.length > 1 ? <StableSwap text={note} candidates={notes} reduced={reduced} /> : note}
      </p>

      <ul className="mt-6 space-y-3 border-t border-line pt-5 sm:mt-7 sm:pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-ink-2">
            <Check size={16} weight="bold" className="mt-[1px] shrink-0 text-ink" aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7 sm:pt-8">
        <ButtonLink href={plan.cta.href} variant={plan.cta.variant} size="lg" className="w-full" arrow={plan.cta.variant === "ink"}>
          {plan.cta.label}
        </ButtonLink>
      </div>
    </article>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Pay for the code, not a contract."
            sub="Start free, pay per code when it matters, or keep a number of your own."
          />
        </Reveal>

        <Reveal delay={0.06} className="mt-10 flex justify-center">
          <BillingToggle value={billing} onValueChange={setBilling} />
        </Reveal>

        {/* Mobile: one column, popular plan on top. md+: three columns, popular raised in the centre. */}
        <Reveal
          group
          gap={0.08}
          className="mx-auto mt-12 grid max-w-[440px] gap-4 md:max-w-[1080px] md:grid-cols-3 md:items-stretch lg:gap-5"
        >
          {PLANS.map((plan) => (
            <RevealItem key={plan.name} className={cn("h-full", plan.popular && "-order-1 md:order-none md:-translate-y-2")}>
              <PlanCard plan={plan} billing={billing} />
            </RevealItem>
          ))}
        </Reveal>

        <p className="mt-10 text-center text-[14px] text-ink-3">All plans: no ID, no app, cancel any time.</p>
      </Container>
    </section>
  );
}
