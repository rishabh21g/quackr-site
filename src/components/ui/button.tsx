import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

type Variant = "ink" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "link-arrow inline-flex select-none items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:duration-[var(--hover-in)] active:translate-y-px active:duration-[var(--dur-instant)]";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-white hover:bg-ink-hover",
  ghost: "text-ink-2 hover:bg-ink/[0.04] hover:text-ink",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink/30",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-full px-4 text-[14px]",
  md: "h-11 rounded-[14px] px-5 text-[15px]",
  lg: "h-12 rounded-[14px] px-6 text-[15px]",
};

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Append the standard trailing arrow (16px, bold). It nudges 2px right on hover via `link-arrow`. */
  arrow?: boolean;
  children: React.ReactNode;
};

/** The one button style family. Hover arrives fast and leaves slow; press is instant. */
export function ButtonLink({ href, variant = "ink", size = "md", className, arrow = false, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
      {arrow && <ArrowRight size={16} weight="bold" aria-hidden />}
    </Link>
  );
}

export function buttonClass(variant: Variant = "ink", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
