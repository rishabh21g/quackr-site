"use client";
// Adapted from Arc UI FaqSection + Accordion (MIT, © 2026 Elia Kuratli). CSS modules rewritten to Tailwind; Radix swapped for the block's own button + region ARIA.

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, ChatCircle, Plus } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ease, smooth, snappy } from "@/lib/motion";

type Item = { q: string; a: ReactNode };

const ITEMS: Item[] = [
  {
    q: "What is a temporary phone number?",
    a: "A real mobile number you give an app instead of your own. The verification code lands in your Quackr inbox in seconds, and the app never sees your personal number.",
  },
  {
    q: "Are free numbers really free?",
    a: "Yes, no card needed. Free numbers are shared and public, so anyone can read the codes sent to them, and they rotate often. Use them for low-stakes sign ups. For an account you'll log into again, get a private number.",
  },
  {
    q: "Why didn't I receive an SMS?",
    a: "Some apps block numbers that many people have already used, which happens most with free public numbers. Try another number, or use a single use or private number. If a paid code never arrives, you're refunded automatically.",
  },
  {
    q: "Is this legal? Are these real numbers?",
    a: "Yes. They're real mobile numbers from licensed carriers, and receiving SMS on a number you rent is legal in the countries we serve. Using them for fraud or to break a service's rules isn't, and our acceptable use policy says so.",
  },
  {
    q: "How long do I keep a private number?",
    a: "30 days from purchase, with unlimited incoming SMS. Renew any time before it ends and you keep the same number, so you can log back in to that account later.",
  },
  {
    q: "Which countries can I get a number in?",
    a: "30+ countries, including the US, UK, Canada, Australia, Germany, France, the Netherlands, Spain, Sweden, Poland, Brazil and India. Open the country picker to see what's in stock right now.",
  },
  {
    q: "Can my AI agent use it?",
    a: (
      <>
        Yes. The API and MCP server let an agent request a number, wait for the SMS and read the code, with no human
        copy and paste.{" "}
        <a href="#developers" className="font-medium text-ink underline decoration-line-strong underline-offset-[4px] transition-[text-decoration-color] duration-[var(--hover-out)] hover:decoration-ink hover:duration-[var(--hover-in)]">
          Read the API docs
        </a>
        .
      </>
    ),
  },
];

/** Height follows the content on a spring that never overshoots; closed panels leave the accessibility tree once collapsed. */
const panel: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: { height: smooth, opacity: { duration: 0.22, ease: [...ease.enter] } } },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { height: smooth, opacity: { duration: 0.12, ease: [...ease.standard] } } },
};
/** The answer settles down into place as the panel opens. */
const content: Variants = {
  open: { y: 0, transition: smooth },
  closed: { y: -6, transition: { duration: 0.12, ease: [...ease.standard] } },
};
const panelStill: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: { duration: 0 } },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { duration: 0 } },
};
const contentStill: Variants = { open: { y: 0, transition: { duration: 0 } }, closed: { y: 0, transition: { duration: 0 } } };

/** Arrow keys, Home and End move between the questions of one list. */
function onListKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-faq-trigger]"));
  const index = triggers.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? triggers.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length;
  triggers[next]?.focus();
}

export function Faq() {
  const baseId = useId();
  const reduced = !!useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-20">
          {/* The Reveal sits inside the sticky column so the column itself can still stick. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
            <SectionHeading align="left" eyebrow="FAQ" title="Questions, answered." />
            <a
              href="/contact"
              className="link-arrow mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-ink-2 underline-offset-[5px] transition-colors duration-[var(--hover-out)] hover:text-ink hover:underline hover:duration-[var(--hover-in)]"
            >
              <ChatCircle size={18} weight="duotone" className="text-ink" aria-hidden />
              Still stuck? Talk to us
              <ArrowRight size={14} weight="bold" aria-hidden />
            </a>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
          <ul className="border-t border-line" onKeyDown={onListKeyDown}>
            {ITEMS.map((item, i) => {
              const isOpen = open === i;
              const qId = `${baseId}-q${i}`;
              const aId = `${baseId}-a${i}`;
              return (
                <li key={item.q} className="border-b border-line">
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={qId}
                      data-faq-trigger=""
                      aria-expanded={isOpen}
                      aria-controls={aId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-[16px] font-medium leading-[1.4] text-ink transition-colors duration-[var(--hover-out)] hover:text-ink-2 hover:duration-[var(--hover-in)] sm:min-h-[76px] sm:text-[17px]"
                    >
                      <span>{item.q}</span>
                      <motion.span
                        aria-hidden
                        // Hover: the closed circle darkens its edge and glyph. Press: 1px down, instant (touch gets the same).
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-[var(--hover-out)] group-hover:duration-[var(--hover-in)] group-active:translate-y-px ${
                          isOpen
                            ? "border-ink bg-ink text-white"
                            : "border-line-strong bg-surface text-ink-3 group-hover:border-ink/30 group-hover:text-ink group-active:border-ink/30 group-active:text-ink"
                        }`}
                        initial={false}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={reduced ? { duration: 0 } : snappy}
                      >
                        <Plus size={14} weight="bold" />
                      </motion.span>
                    </button>
                  </h3>
                  <motion.div
                    id={aId}
                    role="region"
                    aria-labelledby={qId}
                    className="overflow-hidden"
                    initial={false}
                    animate={isOpen ? "open" : "closed"}
                    variants={reduced ? panelStill : panel}
                  >
                    <motion.div variants={reduced ? contentStill : content} className="max-w-[62ch] pb-6 pr-10 text-[15px] leading-[1.65] text-ink-2 sm:pr-14 sm:text-[16px]">
                      {item.a}
                    </motion.div>
                  </motion.div>
                </li>
              );
            })}
          </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
