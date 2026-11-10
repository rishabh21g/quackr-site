"use client";
// Adapted from Arc UI LogoMarquee (MIT, © 2026 Elia Kuratli).
// Kept: duplicated list for a seamless loop (copy hidden from assistive tech), labelled region, masked edges,
// a real pause control with a polite status, and the reduced-motion layout (static, wrapped, centred).
// CSS module rewritten to Tailwind; the loop itself uses the shared `.marquee` / `.marquee-track` classes.

import { useId, useRef } from "react";
import { useInView } from "motion/react";
import {
  AmazonLogo,
  Car,
  DiscordLogo,
  FacebookLogo,
  Fire,
  GoogleLogo,
  HouseLine,
  InstagramLogo,
  OpenAiLogo,
  PaypalLogo,
  SnapchatLogo,
  SteamLogo,
  TelegramLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

// Phosphor has no Uber, Airbnb or Tinder marks, so those use a neutral glyph.
const APPS: { name: string; icon: Icon }[] = [
  { name: "Telegram", icon: TelegramLogo },
  { name: "WhatsApp", icon: WhatsappLogo },
  { name: "Discord", icon: DiscordLogo },
  { name: "Google", icon: GoogleLogo },
  { name: "Instagram", icon: InstagramLogo },
  { name: "TikTok", icon: TiktokLogo },
  { name: "OpenAI", icon: OpenAiLogo },
  { name: "Tinder", icon: Fire },
  { name: "Facebook", icon: FacebookLogo },
  { name: "X", icon: XLogo },
  { name: "Amazon", icon: AmazonLogo },
  { name: "PayPal", icon: PaypalLogo },
  { name: "Steam", icon: SteamLogo },
  { name: "Snapchat", icon: SnapchatLogo },
  { name: "Uber", icon: Car },
  { name: "Airbnb", icon: HouseLine },
];

function AppList({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className={cn(
        "flex shrink-0 items-center gap-3 pr-3",
        "motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-3 motion-reduce:px-5",
        duplicate && "motion-reduce:hidden",
      )}
    >
      {APPS.map(({ name, icon: Glyph }) => (
        <li
          key={name}
          className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-surface pl-3.5 pr-4 shadow-[0_1px_2px_rgba(22,23,28,0.04)] transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:border-line-strong hover:duration-[var(--hover-in)] active:border-line-strong"
        >
          <Glyph
            size={18}
            weight="fill"
            aria-hidden
            className="text-ink-2 transition-colors duration-[var(--hover-out)] group-hover:text-ink group-hover:duration-[var(--hover-in)]"
          />
          <span className="whitespace-nowrap text-[14px] font-medium text-ink-2 transition-colors duration-[var(--hover-out)] group-hover:text-ink group-hover:duration-[var(--hover-in)]">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A slow, endless strip of the apps people verify with Quackr. Hover or keyboard focus holds it still; reduced motion shows it static. */
export function WorksWith() {
  const titleId = useId();
  // House rule: nothing loops off screen. The strip only moves while it is in view.
  const stripRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(stripRef);

  return (
    <section aria-labelledby={titleId} className="overflow-hidden py-16 sm:py-24">
      <h2
        id={titleId}
        className="px-5 text-center font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-ink-3"
      >
        {/* Optical centring: cancel the trailing 0.12em of tracking. */}
        <span className="mr-[-0.12em]">Works with the apps you already use</span>
      </h2>

      <div
        ref={stripRef}
        role="region"
        aria-label="Apps you can verify with a Quackr number"
        className="marquee relative focus-within:[&_.marquee-track]:[animation-play-state:paused] mx-auto mt-8 max-w-[1280px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] motion-reduce:[mask-image:none] sm:[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]"
      >
        <div
          className="marquee-track flex w-max motion-reduce:w-auto motion-reduce:justify-center"
          style={!onScreen ? { animationPlayState: "paused" } : undefined}
        >
          <AppList />
          <AppList duplicate />
        </div>
      </div>

    </section>
  );
}
