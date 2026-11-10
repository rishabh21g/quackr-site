import { cn } from "@/lib/cn";

/**
 * Mono, uppercase section label. Sits above a SectionHeading.
 * Tracking also adds space after the last letter; the inner span's negative margin
 * cancels it so a centred eyebrow is truly centred.
 */
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-ink-3", className)}>
      <span className="mr-[-0.12em]">{children}</span>
    </p>
  );
}
