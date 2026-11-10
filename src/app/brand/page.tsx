import type { Metadata } from "next";
import { Atmosphere, CloudBank } from "@/components/art/atmosphere";
import { OtpChip } from "@/components/art/otp-chip";
import { Terminal } from "@/components/art/terminal";
import { Logo, Mark, type MarkVariant } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = { title: "Quackr brand assets", robots: { index: false } };

const MARKS: { variant: MarkVariant; name: string; note: string }[] = [
  { variant: "bubble", name: "A · Talking duck", note: "Head is a chat bubble, beak is its tail. Says 'messages' and 'duck' at once. Default." },
  { variant: "monogram", name: "B · Monogram tile", note: "Geometric head on an ink tile. Best for app icon, favicon, avatar." },
  { variant: "clay", name: "C · Clay duck", note: "The soft mascot. For empty states, the hero perch, celebratory moments." },
];

const COLORS = [
  { name: "paper", v: "var(--paper)", job: "Page background" },
  { name: "surface", v: "var(--surface)", job: "Cards, fields" },
  { name: "ink", v: "var(--ink)", job: "Text, primary button" },
  { name: "ink-2", v: "var(--ink-2)", job: "Secondary text" },
  { name: "ink-3", v: "var(--ink-3)", job: "Meta text" },
  { name: "line", v: "var(--line)", job: "Borders" },
  { name: "duck", v: "var(--duck)", job: "Your decoy / the code. Only." },
  { name: "duck-soft", v: "var(--duck-soft)", job: "Code chip, copied state" },
  { name: "live", v: "var(--live)", job: "Code received / live" },
];

const MOTION = [
  ["Code drop", "SMS lands on the decoy every 3s; the code flashes duck-yellow for a beat."],
  ["Number provision", "CTA rolls the number digits into place, live dot turns green, first SMS lands."],
  ["Silent phone", "Your real phone only breathes. Contrast is the message."],
  ["Buttons", "Hover in 120ms, out 180ms, press 1px down instantly. Arrows nudge 2px."],
  ["Scroll reveal", "Headings rise 12px and fade; widgets start animating only when seen."],
  ["Flow lines", "Routes draw in on scroll, then codes travel along them."],
  ["Copy", "Copy icon morphs to a check, field flashes duck-soft."],
  ["Prices & stats", "Digits roll like slot reels, left to right, no overshoot."],
];

export default function BrandPage() {
  return (
    <main className="pb-32">
      <Container className="pt-16">
        <Eyebrow>Quackr · revamp assets</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.03em]">
          The pieces, before the page.
        </h1>
        <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-ink-2">
          Calm paper, ink type, and one colour that only ever means “your decoy number”. Serif headlines for trust,
          mono for the codes, because the codes are the product.
        </p>
      </Container>

      {/* logo */}
      <Section title="Logo">
        <div className="grid gap-4 md:grid-cols-3">
          {MARKS.map((m) => (
            <figure key={m.variant} className="rounded-[20px] border border-line bg-surface p-6">
              <div className="flex h-36 items-center justify-center gap-6">
                <Mark variant={m.variant} className="h-20 w-20" />
                <Mark variant={m.variant} className="h-8 w-8" />
                <Mark variant={m.variant} className="h-4 w-4" />
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <Logo variant={m.variant} />
                <figcaption className="mt-3 text-[13px] font-medium text-ink">{m.name}</figcaption>
                <p className="mt-1 text-[13px] leading-snug text-ink-3">{m.note}</p>
              </div>
            </figure>
          ))}
        </div>
      </Section>

      {/* colour */}
      <Section title="Colour · every colour has one job">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {COLORS.map((c) => (
            <div key={c.name} className="overflow-hidden rounded-[14px] border border-line bg-surface">
              <div className="h-16 border-b border-line" style={{ background: c.v }} />
              <div className="p-2.5">
                <p className="font-mono text-[12px] font-medium">{c.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-3">{c.job}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* type */}
      <Section title="Type">
        <div className="space-y-6 rounded-[20px] border border-line bg-surface p-6 sm:p-10">
          <div>
            <p className="font-mono text-[11px] text-ink-3">Fraunces (soft) · display · headlines only</p>
            <p className="mt-2 font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.03em]">
              Get the code. Keep your number.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] text-ink-3">Inter · UI and body</p>
            <p className="mt-2 max-w-[560px] text-[18px] leading-[1.6] text-ink-2">
              Disposable numbers for SMS verification. The code lands on your decoy in seconds, and your real number
              never leaves your pocket.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] text-ink-3">JetBrains Mono · numbers, codes, eyebrows</p>
            <p className="mt-2 font-mono text-[22px] font-medium tabular-nums">+1 701 997 6600 · 482 917</p>
          </div>
        </div>
      </Section>

      {/* art */}
      <Section title="Illustrations & live widgets">
        <div className="grid gap-4 lg:grid-cols-2">
          <Tile name="OtpChip · code roll">
            <OtpChip />
          </Tile>
          <Tile name="Terminal · MCP for agents">
            <Terminal className="max-w-[440px]" />
          </Tile>
          <Tile name="Atmosphere + CloudBank · the only soft effect" className="lg:col-span-2">
            <div className="relative h-[260px] w-full overflow-hidden rounded-[14px]">
              <Atmosphere />
              <CloudBank />
            </div>
          </Tile>
        </div>
      </Section>

      {/* motion */}
      <Section title="Micro-interactions">
        <ol className="grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2">
          {MOTION.map(([name, desc], i) => (
            <li key={name} className="flex gap-4 bg-surface p-5">
              <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[14px] font-medium text-ink">{name}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-3">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Container className="mt-20">
      <Eyebrow className="mb-5">{title}</Eyebrow>
      {children}
    </Container>
  );
}

function Tile({ name, className, children }: { name: string; className?: string; children: React.ReactNode }) {
  return (
    <figure className={`rounded-[20px] border border-line bg-surface p-6 ${className ?? ""}`}>
      <div className="flex min-h-[220px] items-center justify-center">{children}</div>
      <figcaption className="mt-4 border-t border-line pt-3 font-mono text-[11px] text-ink-3">{name}</figcaption>
    </figure>
  );
}
