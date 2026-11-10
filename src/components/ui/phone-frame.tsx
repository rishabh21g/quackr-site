// Adapted from Opensource UI PhoneMockupCard (MIT, © Bidyut Kundu).
// Kept: iPhone 15 proportions, thin uniform bezel, Dynamic Island, side buttons, home indicator.
// Changed: Quackr finishes (paper, graphite) alongside the originals, a paper screen, width set by className,
// and an optional status bar so every phone on the page tells the same time.

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const FINISHES = {
  paper: { frame: "bg-[#e6e2d9]", button: "bg-[#d9d4c9]" },
  graphite: { frame: "bg-[#2e2f35]", button: "bg-[#26272c]" },
  white: { frame: "bg-[#e4e4e8]", button: "bg-[#d8d8de]" },
  titanium: { frame: "bg-[#9a9590]", button: "bg-[#8f8a85]" },
} as const;

export type PhoneFinish = keyof typeof FINISHES;

type PhoneFrameProps = ComponentPropsWithoutRef<"div"> & {
  finish?: PhoneFinish;
  /** Show 9:41 and the signal/battery glyphs beside the island. */
  statusBar?: boolean;
  /** Classes for the screen (the area inside the bezel). */
  screenClassName?: string;
};

/**
 * An iPhone-proportioned frame (70.6 × 146.6 mm). Set the width with className; the height follows.
 * Children fill the screen; leave ~44px at the top for the island and status bar.
 */
export const PhoneFrame = forwardRef<HTMLDivElement, PhoneFrameProps>(function PhoneFrame(
  { finish = "paper", statusBar = true, className, screenClassName, children, ...props },
  ref,
) {
  const f = FINISHES[finish];
  return (
    <div
      ref={ref}
      data-finish={finish}
      className={cn("relative aspect-[70.6/146.6] w-[256px] rounded-[2.9rem] p-[2px]", f.frame, className)}
      {...props}
    >
      {/* side buttons: mute, volume up, volume down, power */}
      <span aria-hidden className={cn("absolute -left-[2px] top-[15.5%] h-[3.2%] w-[2px] rounded-l-sm", f.button)} />
      <span aria-hidden className={cn("absolute -left-[2px] top-[21%] h-[7.2%] w-[2px] rounded-l-sm", f.button)} />
      <span aria-hidden className={cn("absolute -left-[2px] top-[30.5%] h-[7.2%] w-[2px] rounded-l-sm", f.button)} />
      <span aria-hidden className={cn("absolute -right-[2px] top-[23%] h-[11.5%] w-[2px] rounded-r-sm", f.button)} />

      <div className="relative h-full w-full overflow-hidden rounded-[2.8rem] bg-[#0d0d0f]">
        <div className={cn("absolute inset-[3.5px] overflow-hidden rounded-[2.6rem] bg-paper", screenClassName)}>
          {statusBar && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[38px] items-center justify-between px-[26px] text-[12px] font-semibold tabular-nums text-ink"
            >
              <span>9:41</span>
              <span className="flex items-center gap-1">
                {/* signal */}
                <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor">
                  <rect x="0" y="7" width="2.6" height="3" rx=".6" />
                  <rect x="4" y="5" width="2.6" height="5" rx=".6" />
                  <rect x="8" y="2.5" width="2.6" height="7.5" rx=".6" />
                  <rect x="12" y="0" width="2.6" height="10" rx=".6" />
                </svg>
                {/* battery */}
                <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
                  <rect x=".5" y=".5" width="18" height="10" rx="3" stroke="currentColor" opacity=".4" />
                  <rect x="2" y="2" width="13" height="7" rx="1.6" fill="currentColor" />
                  <rect x="20" y="3.5" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".4" />
                </svg>
              </span>
            </div>
          )}

          <div className="relative h-full w-full">{children}</div>

          {/* Dynamic Island */}
          <div aria-hidden className="absolute left-1/2 top-[10px] z-30 h-[22px] w-[72px] -translate-x-1/2 rounded-full bg-[#0d0d0f]">
            <span className="absolute right-[6px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-[#6a90c8]/25" />
          </div>
          {/* home indicator */}
          <div aria-hidden className="absolute bottom-[6px] left-1/2 z-30 h-[4px] w-[34%] -translate-x-1/2 rounded-full bg-ink/25" />
        </div>
      </div>
    </div>
  );
});
