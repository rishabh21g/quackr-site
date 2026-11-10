import { cn } from "@/lib/cn";
import { Eyebrow } from "./eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
};

/**
 * Serif h2 with an optional mono eyebrow and a quiet subline.
 * Put an `<InlineIcon>` inside `title` for the icon-in-the-headline beat.
 */
export function SectionHeading({ eyebrow, title, sub, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-[720px] text-center" : "max-w-[640px]", className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="font-display text-[clamp(2rem,4.2vw,3.25rem)] font-normal leading-[1.06] tracking-[-0.025em] text-ink">
        {title}
      </h2>
      {sub && (
        <p
          className={cn(
            "mt-5 text-[17px] leading-[1.6] text-ink-2",
            align === "center" ? "mx-auto max-w-[520px]" : "max-w-[480px]",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/** A small framed icon that sits inline with headline text, at text size. */
export function InlineIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "relative -top-[0.06em] mx-[0.06em] inline-flex h-[0.82em] w-[0.82em] items-center justify-center rounded-[0.2em] border border-line-strong bg-surface align-middle text-ink shadow-[0_1px_2px_rgba(22,23,28,0.04)] [&>svg]:h-[0.56em] [&>svg]:w-[0.56em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
