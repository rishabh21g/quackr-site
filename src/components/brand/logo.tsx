import { useId } from "react";
import { cn } from "@/lib/cn";
import { Duck } from "./duck";

export type MarkVariant = "bubble" | "monogram" | "clay";

type MarkProps = { variant?: MarkVariant; className?: string; title?: string };

/**
 * Brand marks. All three share one idea: the duck is the one who talks (receives
 * the code) so you don't have to.
 * - bubble:   the duck's head is a chat bubble and its beak is the bubble's tail
 * - monogram: geometric duck head on an ink tile, for app icons and favicons
 * - clay:     the soft illustrated duck, for mascot moments
 */
export function Mark({ variant = "bubble", className, title }: MarkProps) {
  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };

  if (variant === "clay") return <Duck className={className} title={title} />;

  if (variant === "monogram") {
    return (
      <svg viewBox="0 0 40 40" className={className} {...a11y}>
        <rect width="40" height="40" rx="11" fill="var(--ink)" />
        <circle cx="22" cy="19" r="10" fill="var(--duck)" />
        <path d="M13 21.5 L5.5 24.5 L13.5 27.5 Q15 24.5 13 21.5Z" fill="#F59E2B" />
        <circle cx="20" cy="16.5" r="2" fill="var(--ink)" />
        <path d="M11 33 H29" stroke="var(--duck)" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
      </svg>
    );
  }

  return <BubbleMark className={className} a11y={a11y} />;
}

function BubbleMark({ className, a11y }: { className?: string; a11y: Record<string, unknown> }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y}>
      <defs>
        <radialGradient id={`${id}-b`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFE680" />
          <stop offset="1" stopColor="#FFCC1F" />
        </radialGradient>
      </defs>
      {/* head = bubble */}
      <circle cx="23" cy="18" r="14" fill={`url(#${id}-b)`} stroke="var(--ink)" strokeWidth="1.6" />
      {/* beak = bubble tail */}
      <path
        d="M11.6 25.6 L3.5 35 L17.2 30.4"
        fill="#F59E2B"
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="20.5" cy="14.5" r="2.3" fill="var(--ink)" />
      <circle cx="21.3" cy="13.7" r="0.75" fill="#fff" />
    </svg>
  );
}

/** Mark + lowercase serif wordmark. */
export function Logo({
  variant = "bubble",
  className,
  size = "md",
}: {
  variant?: MarkVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = { sm: ["h-6 w-6", "text-[19px]"], md: ["h-8 w-8", "text-[24px]"], lg: ["h-12 w-12", "text-[36px]"] }[size];
  return (
    // Baseline-aligned: the svg's bottom edge sits on the text baseline, then drops 20% so the bubble's
    // bottom (y 32 of 40) lands on it and the beak hangs below like the q's descender.
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <Mark variant={variant} className={cn(s[0], "translate-y-[20%]")} />
      <span className={cn("font-display font-medium leading-none tracking-[-0.03em] text-ink", s[1])}>quackr</span>
    </span>
  );
}
