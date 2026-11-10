"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  AmazonLogo,
  DiscordLogo,
  GlobeHemisphereWest,
  GoogleLogo,
  IdentificationCard,
  SteamLogo,
  TelegramLogo,
  UsersThree,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Atmosphere } from "@/components/art/atmosphere";
import { Duck } from "@/components/brand/duck";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

type Sms = { id: number; app: string; Icon: Icon; text: string; code: string };

const APPS: { app: string; Icon: Icon; text: string }[] = [
  { app: "Telegram", Icon: TelegramLogo, text: "Login code" },
  { app: "WhatsApp", Icon: WhatsappLogo, text: "Your code is" },
  { app: "Discord", Icon: DiscordLogo, text: "Verification code" },
  { app: "Google", Icon: GoogleLogo, text: "G-code" },
  { app: "Steam", Icon: SteamLogo, text: "Steam Guard" },
  { app: "Amazon", Icon: AmazonLogo, text: "Your OTP" },
];

/** Deterministic 6-digit code per message id, so server and client agree on the first paint. */
function codeFor(id: number) {
  const n = (id * 7919 + 104729) % 1_000_000;
  return String(n).padStart(6, "0").replace(/(\d{3})(\d{3})/, "$1 $2");
}

function message(id: number): Sms {
  const a = APPS[id % APPS.length]!;
  return { id, ...a, code: codeFor(id + 3) };
}

const VISIBLE = 4;
// Newest first.
const INITIAL = [3, 2, 1, 0].map(message);

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** The right-hand panel on auth pages: a quiet promise and a decoy phone that keeps getting codes. */
export function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-surface px-10 pb-9 pt-12 xl:px-14">
      <Atmosphere className="top-[22%]" intensity={0.9} />

      <div className="relative">
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-ink-3">Private by default</p>
        <p className="mt-4 max-w-[440px] font-display text-[clamp(2.25rem,3.4vw,3rem)] font-normal leading-[1.04] tracking-[-0.025em] text-ink">
          Get the code. Keep your number.
        </p>
        <p className="mt-4 max-w-[380px] text-[15px] leading-6 text-ink-2">
          Sign up anywhere with a decoy. The code lands in seconds, and your real phone stays quiet.
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center pb-8 pt-14">
        <DecoyPhone />
      </div>

      <ul className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-ink-2">
        <li className="inline-flex items-center gap-1.5">
          <UsersThree size={16} weight="duotone" aria-hidden className="text-ink-3" />
          <span className="font-mono tabular-nums text-ink">3M+</span> users
        </li>
        <li aria-hidden className="text-line-strong">·</li>
        <li className="inline-flex items-center gap-1.5">
          <GlobeHemisphereWest size={16} weight="duotone" aria-hidden className="text-ink-3" />
          <span className="font-mono tabular-nums text-ink">30+</span> countries
        </li>
        <li aria-hidden className="text-line-strong">·</li>
        <li className="inline-flex items-center gap-1.5">
          <IdentificationCard size={16} weight="duotone" aria-hidden className="text-ink-3" />
          No ID needed
        </li>
      </ul>
    </div>
  );
}

function DecoyPhone() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedFlag();
  const [list, setList] = useState<Sms[]>(INITIAL);

  // A new code every 3s, only while the phone is on screen and motion is allowed.
  useEffect(() => {
    if (!inView || reduce) return;
    const timer = window.setInterval(() => {
      setList((prev) => [message(prev[0]!.id + 1), ...prev].slice(0, VISIBLE));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [inView, reduce]);

  return (
    <figure ref={ref} className="relative w-full max-w-[280px]" aria-label="A Quackr decoy number receiving verification codes">
      <Duck grounded className="absolute -top-[46px] right-5 z-10 w-[68px] drop-shadow-[0_6px_10px_rgba(22,23,28,0.12)]" />

      <div className="rounded-[38px] border border-line-strong/70 bg-surface p-2 shadow-[var(--shadow-phone)]">
        <div className="flex h-[360px] flex-col overflow-hidden rounded-[30px] bg-paper">
          <div aria-hidden className="mx-auto mt-3 h-[20px] w-[80px] rounded-full bg-ink" />

          <div className="px-4 pt-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-duck-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">
                <Duck className="h-3.5 w-3.5" />
                <span className="mr-[-0.06em]">Decoy number</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-live">
                <span className="live-dot" aria-hidden />
                Live
              </span>
            </div>
            <p className="mt-3 rounded-[10px] border border-line bg-surface px-3 py-2.5 font-mono text-[16px] font-medium tracking-tight text-ink tabular-nums">
              +1 701 997 6600
            </p>
          </div>

          <div className="mt-4 flex items-baseline justify-between px-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Inbox</p>
            <p className="text-[11px] text-ink-3">Updates automatically</p>
          </div>

          <ul
            aria-live="off"
            className="relative mx-3 mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent_98%)]"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((sms, index) => (
                <SmsRow key={sms.id} sms={sms} latest={index === 0} reduce={reduce} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </figure>
  );
}

function SmsRow({ sms, latest, reduce }: { sms: Sms; latest: boolean; reduce: boolean }) {
  const { Icon } = sms;
  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, ease: ease.standard }}
      className="shrink-0 rounded-[14px] border border-line bg-surface px-3 py-2.5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-2">
        {/* third-party marks stay monochrome */}
        <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-paper text-ink-2">
          <Icon size={14} weight="fill" aria-hidden />
        </span>
        <span className="text-[12px] font-semibold text-ink">{sms.app}</span>
        <span className="ml-auto text-[11px] text-ink-3">now</span>
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] leading-6 text-ink-2">
        {sms.text}
        <span
          className={cn(
            "rounded-[6px] px-1.5 py-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink transition-colors duration-700",
            latest && !reduce ? "bg-duck" : "bg-duck-soft",
          )}
        >
          {sms.code}
        </span>
      </p>
    </motion.li>
  );
}
