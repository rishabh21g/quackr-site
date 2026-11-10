import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { HorizonGlow } from "@/components/art/atmosphere";
import { Container } from "@/components/ui/container";
import { HeroDemo } from "./hero-demo";

/*
  The 5-second job of this section, in reading order:
  1. Chip      → it's live, it's big (30+ countries, 3M+ people)
  2. Headline  → the benefit in six words
  3. Subline   → what it is, how fast, what you keep
  4. Action    → pick a country (the decoy number reacts), get a number; free as the zero-risk option
  5. Visual    → proof: codes land on the decoy, the real phone stays quiet
*/
export function Hero() {
  return (
    <section className="relative isolate overflow-x-clip pt-14 sm:pt-20">
      {/* dawn behind the phones; starts below the headline so the copy sits on clean paper */}
      <HorizonGlow className="-bottom-40 -z-10 h-[78%] sm:h-[72%]" />
      <Container className="flex flex-col items-center text-center">
        <Link
          href="/signup?plan=free"
          className="hero-in group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3 text-[13px] text-ink-2 shadow-[0_1px_2px_rgba(22,23,28,0.04)] transition-colors duration-[var(--hover-out)] hover:border-line-strong hover:text-ink hover:duration-[var(--hover-in)]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-live-soft px-2 py-0.5 text-[12px] font-medium text-live">
            <span className="live-dot" />
            Live
          </span>
          <span className="sm:hidden">30+ countries · 3M+ people</span>
          <span className="hidden sm:inline">Numbers in 30+ countries, trusted by 3M+ people</span>
          <ArrowRight
            size={12}
            weight="bold"
            className="text-ink-3 transition-transform duration-[var(--hover-out)] group-hover:translate-x-0.5 group-hover:text-ink group-hover:duration-[var(--hover-in)]"
          />
        </Link>

        <h1
          className="hero-in mt-7 font-display text-[clamp(2.9rem,7.4vw,5.6rem)] font-normal leading-[0.98] tracking-[-0.035em] text-ink"
          style={{ animationDelay: "80ms" }}
        >
          Get the code.
          <br />
          Keep <em className="mx-[0.06em] font-normal italic [font-variation-settings:'SOFT'_100,'WONK'_1]">your</em> number.
        </h1>

        <p
          className="hero-in mt-6 max-w-[520px] text-[17px] leading-[1.6] text-ink-2 sm:text-[18px]"
          style={{ animationDelay: "160ms" }}
        >
          Disposable phone numbers for SMS verification. The code lands on your decoy in seconds, and your real number
          never leaves your pocket.
        </p>

        <HeroDemo />
      </Container>
    </section>
  );
}
