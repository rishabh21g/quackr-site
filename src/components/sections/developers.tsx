"use client";
// Adapted from Arc UI Tabs, CopyButton and CodeBlock (MIT, © 2026 Elia Kuratli) and Opensource UI CopyButton (MIT, © 2026 Bidyut Kundu).
// Arc: roving-tab keyboard model, gliding layoutId selection, direction-aware panels, clipboard fallback and status region,
// lightweight tokenizer. Opensource UI: stacked label cell so the button never changes width. Rewritten to Tailwind.

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from "motion/react";
import { Check, Copy, WarningCircle } from "@phosphor-icons/react";
import { InkSpotlight } from "@/components/art/ink-spotlight";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { ease, smooth, snappy } from "@/lib/motion";

/* ---------- Snippets ---------- */

type Snippet = { id: string; label: string; file: string; lang: "shell" | "json"; code: string };

const SNIPPETS: Snippet[] = [
  {
    id: "rest",
    label: "REST",
    file: "get-a-code.sh",
    lang: "shell",
    code: `# Rent a US number for this test run
curl https://api.quackr.io/v1/numbers \\
  -H "Authorization: Bearer $QUACKR_KEY" \\
  -d country=US

# Wait for the SMS and read the code
curl https://api.quackr.io/v1/numbers/num_8f2k/sms?wait=60

{ "from": "Telegram", "code": "482917" }`,
  },
  {
    id: "mcp",
    label: "MCP",
    file: "mcp.json",
    lang: "json",
    code: `{
  "mcpServers": {
    "quackr": {
      "command": "npx",
      "args": ["-y", "@quackr/mcp"],
      "env": { "QUACKR_KEY": "qk_live_..." }
    }
  }
}

// Tools your agent gets: get_number, wait_for_sms, release_number`,
  },
  {
    id: "webhook",
    label: "Webhook",
    file: "POST /hooks/quackr",
    lang: "json",
    code: `{
  "event": "sms.received",
  "number": "+1 701 997 6600",
  "from": "Telegram",
  "text": "Your Telegram code is 482917",
  "code": "482917",
  "received_at": "2026-11-10T09:41:07Z"
}

// Signed with Quackr-Signature. Retried until you answer 200.`,
  },
];

/* ---------- Highlighting (Arc CodeBlock tokenizer, restrained palette) ---------- */

type Kind = "comment" | "string" | "property" | "keyword" | "number" | "punctuation" | "flag";

const tokenPattern =
  /(?<=^|\s)#[^\n]*|(?<=^|\s)\/\/[^\n]*|"(?:\\.|[^"\\])*"|(?<=\s)-{1,2}[A-Za-z]+\b|\$[A-Z_]+|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][\w-]*\b|[{}[\]();,:=?\\]/gm;

const CLASS: Record<Kind, string> = {
  comment: "text-white/50",
  string: "text-duck/90",
  property: "text-white/90",
  keyword: "text-white/90",
  number: "text-white/90",
  punctuation: "text-white/50",
  flag: "text-white/55",
};

/** The code that matters gets the same chip as in the terminal art. */
const CODE = "482917";

function kindOf(value: string, source: string, index: number): Kind | undefined {
  if (value.startsWith("#") || value.startsWith("//")) return "comment";
  if (value.startsWith('"')) return /^\s*:/.test(source.slice(index + value.length)) ? "property" : "string";
  if (value.startsWith("-")) return "flag";
  if (value.startsWith("$")) return "keyword";
  if (/^\d/.test(value)) return "number";
  if (value === "curl" || value === "true" || value === "false" || value === "null") return "keyword";
  if (/^[{}[\]();,:=?\\]$/.test(value)) return "punctuation";
  return undefined;
}

function highlight(code: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of code.matchAll(tokenPattern)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (cursor < index) parts.push(code.slice(cursor, index));
    const kind = kindOf(value, code, index);
    const key = `${index}-${value}`;
    if (value === `"${CODE}"`) {
      parts.push(
        <span key={key} className="text-duck/90">
          &quot;<span className="mi-code-chip rounded-[4px] bg-duck px-1 font-semibold text-ink">{CODE}</span>&quot;
        </span>,
      );
    } else {
      parts.push(kind ? <span key={key} className={CLASS[kind]}>{value}</span> : <Fragment key={key}>{value}</Fragment>);
    }
    cursor = index + value.length;
  }
  if (cursor < code.length) parts.push(code.slice(cursor));
  return parts;
}

/* ---------- Copy button ---------- */

type CopyState = "idle" | "copied" | "error";

/** Async Clipboard API, falling back to a hidden textarea where it is missing or refused. Rejects only when both fail. */
async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall through to the legacy path.
  }
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus?.({ preventScroll: true });
  if (!ok) throw new Error("Copy failed");
}

const LABELS: Record<CopyState, string> = { idle: "Copy", copied: "Copied", error: "Failed" };

function CopyButton({ value }: { value: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  async function copy() {
    if (timer.current) window.clearTimeout(timer.current);
    try {
      await writeClipboard(value);
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
        transition: { duration: 0.16, ease: ease.standard },
      };

  return (
    <>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label="Copy code"
        data-state={state}
        className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 sm:px-3.5 text-[13px] font-medium text-white/70 transition-[background-color,color,transform] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:bg-white/[0.08] hover:text-white hover:duration-[var(--hover-in)] active:translate-y-px active:bg-white/[0.08] active:duration-[var(--dur-instant)] focus-visible:outline-white pointer-fine:h-9"
      >
        <span className="relative grid h-4 w-4 place-items-center" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.span key={state} className="absolute inset-0 grid place-items-center" {...swap}>
              {state === "copied" ? (
                <Check size={15} weight="bold" className="text-duck" />
              ) : state === "error" ? (
                <WarningCircle size={15} weight="bold" className="text-danger" />
              ) : (
                <Copy size={15} weight="bold" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* All three words share one grid cell, so the button keeps the widest width and never jumps. */}
        <span className="hidden text-left sm:grid" aria-hidden="true">
          {(Object.keys(LABELS) as CopyState[]).map((s) => (
            <span
              key={s}
              className={cn(
                "col-start-1 row-start-1 transition-opacity ease-[var(--ease-standard)] motion-reduce:transition-none",
                state === s ? "opacity-100 delay-75 duration-200" : "opacity-0 duration-100",
                s === "copied" && "text-white",
              )}
            >
              {LABELS[s]}
            </span>
          ))}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Code copied" : state === "error" ? "Could not copy the code" : ""}
      </span>
    </>
  );
}

/* ---------- Tabbed code panel ---------- */

const panelMotion: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 8 }),
  center: { opacity: 1, x: 0, transition: { opacity: { duration: 0.2, ease: ease.enter }, x: smooth } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -6, transition: { duration: 0.08, ease: ease.standard } }),
};
const panelFade: Variants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: 0.08 } },
  exit: { opacity: 0, x: 0, transition: { duration: 0.08 } },
};

function CodePanel() {
  const base = useId();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const snippet = SNIPPETS[active]!;

  function select(next: number, focus = false) {
    if (next === active) return;
    setDir(next > active ? 1 : -1);
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  }

  // Radix-style automatic activation: arrows move focus and select, wrapping at the ends; Home/End jump.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = SNIPPETS.length;
    const map: Record<string, number> = {
      ArrowRight: (active + 1) % n,
      ArrowLeft: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next, true);
  }

  return (
    // `mi-code-panel`: while the copy button says "Copied", the code chip in the snippet flashes once (globals.css).
    // On the ink band: a slightly lighter surface, a white/10 hairline and a black drop so it lifts off the band.
    <div className="mi-code-panel min-w-0 overflow-hidden rounded-[20px] border border-white/10 bg-[color:color-mix(in_srgb,var(--ink),white_4.5%)] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_60px_-30px_rgba(0,0,0,0.65)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 py-2 pl-2 pr-2">
        <LayoutGroup id={base}>
          <div
            role="tablist"
            aria-label="Integration examples"
            onKeyDown={onKeyDown}
            className="relative isolate flex items-center gap-0.5 rounded-[14px] bg-white/[0.05] p-1"
          >
            {SNIPPETS.map((s, i) => {
              const selected = i === active;
              return (
                <button
                  key={s.id}
                  ref={(node) => {
                    tabs.current[i] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${base}-tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`${base}-panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={cn(
                    "relative inline-grid h-11 min-w-[4.5rem] place-items-center rounded-[10px] px-3 text-[13px] font-medium transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] focus-visible:outline-white pointer-fine:h-8 sm:min-w-[5rem]",
                    selected ? "text-white" : "text-white/60 hover:text-white/85 active:text-white/85",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="selection"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-[10px] border border-white/10 bg-white/[0.09]"
                      transition={reduce ? { duration: 0 } : snappy}
                    />
                  )}
                  {s.label}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        {/* Keyed by snippet: switching tabs resets "Copied", so the label never describes the wrong code. */}
        <CopyButton key={snippet.id} value={snippet.code} />
      </div>

      <div className="relative min-h-[330px]">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.div
            key={snippet.id}
            role="tabpanel"
            id={`${base}-panel-${snippet.id}`}
            aria-labelledby={`${base}-tab-${snippet.id}`}
            tabIndex={0}
            custom={dir}
            variants={reduce ? panelFade : panelMotion}
            initial="enter"
            animate="center"
            exit="exit"
            className="rounded-b-[19px] focus-visible:outline-offset-[-4px] focus-visible:outline-white"
          >
            <p className="px-5 pt-4 font-mono text-[11px] text-white/50">{snippet.file}</p>
            <pre className="overflow-x-auto px-5 pb-6 pt-3 font-mono text-[12.5px] leading-[1.75] [font-variant-ligatures:none] [tab-size:2]">
              <code>{highlight(snippet.code)}</code>
            </pre>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

const POINTS = [
  { title: "REST API", text: "Rent a number, then poll or wait for its SMS." },
  { title: "MCP server", text: "Agents get numbers and read codes as tools." },
  { title: "Webhooks on every SMS", text: "Signed, retried, with the code parsed out." },
];

export function Developers() {
  return (
    // The page's one dark beat: an ink band inset from the viewport edge with large soft corners, so it reads as a
    // premium card section rather than a hard full-bleed stripe. Everything inside is re-coloured for dark.
    <section id="developers" className="px-2.5 py-8 sm:px-4 sm:py-12 lg:px-6">
      <InkSpotlight
        className="mx-auto max-w-[1440px] rounded-[28px] py-20 text-white/70 sm:rounded-[36px] sm:py-28 lg:rounded-[40px] lg:py-32"
        tintClassName="inset-x-0 bottom-0 h-[55%] lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-[12%] lg:h-[76%] lg:w-[58%]"
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
            <Reveal>
              {/* Mirrors <SectionHeading align="left">, with paper/white tones for the dark band. */}
              <div className="max-w-[640px]">
                <Eyebrow className="mb-4 text-white/60">For developers &amp; agents</Eyebrow>
                <h2 className="font-display text-[clamp(2rem,4.2vw,3.25rem)] font-normal leading-[1.06] tracking-[-0.025em] text-paper">
                  Codes in your tests. Numbers for your agents.
                </h2>
                <p className="mt-5 max-w-[480px] text-[17px] leading-[1.6] text-white/70">
                  Rent a number and read the SMS from code. Your test suite and your agents get real codes, and nobody
                  has to pick up a phone.
                </p>
              </div>
              <ul className="mt-8 space-y-3.5">
                {POINTS.map((p) => (
                  <li key={p.title} className="flex items-start gap-3 text-[15px] leading-[1.5]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-paper">
                      <Check size={11} weight="bold" aria-hidden="true" />
                    </span>
                    <span className="text-white/70">
                      <span className="font-medium text-paper">{p.title}.</span> {p.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink
                  href="#"
                  variant="ink"
                  arrow
                  className="bg-paper text-ink hover:bg-white/85 focus-visible:outline-white"
                >
                  Get an API key
                </ButtonLink>
                <ButtonLink
                  href="#developers"
                  variant="outline"
                  className="border-white/15 bg-white/[0.04] text-paper hover:border-white/30 hover:bg-white/[0.08] active:bg-white/[0.08] focus-visible:outline-white"
                >
                  Read the API docs
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <CodePanel />
            </Reveal>
          </div>
        </Container>
      </InkSpotlight>
    </section>
  );
}
