"use client";

import { Children, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type SnapRailProps = {
  children: React.ReactNode;
  /** Classes for the md+ layout (usually a grid). Below md the rail scrolls sideways. */
  className?: string;
  /** Width of each slide on mobile. The default lets the next card peek in. */
  slideClassName?: string;
  /** Accessible name for the rail, e.g. "Plans". */
  label: string;
  /** Slide to start on (e.g. the highlighted plan). */
  initial?: number;
};

/**
 * Mobile: a horizontal, snap-scrolling rail where the next card peeks in, with
 * pagination dots that follow the swipe. md and up: renders `className` as-is (a grid).
 * Swiping sideways keeps big things big on a phone instead of stacking a long column.
 */
export function SnapRail({ children, className, slideClassName, label, initial = 0 }: SnapRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [active, setActive] = useState(initial);

  // Start on `initial` without animating, only when the rail is actually scrollable (mobile).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !initial || rail.scrollWidth <= rail.clientWidth) return;
    const el = rail.children[initial] as HTMLElement | undefined;
    if (el) rail.scrollLeft = el.offsetLeft - rail.offsetLeft - 20;
  }, [initial]);

  // The slide most in view is the active dot.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root: rail, threshold: 0.6 },
    );
    Array.from(rail.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [slides.length]);

  function go(i: number) {
    const rail = railRef.current;
    const el = rail?.children[i] as HTMLElement | undefined;
    if (!rail || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left: el.offsetLeft - rail.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <div
        ref={railRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        className={cn(
          // mobile rail: bleeds to the screen edge, keeps the page gutter as scroll padding
          "-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 [&::-webkit-scrollbar]:hidden",
          // md+: hand over to the caller's grid
          "md:mx-0 md:overflow-visible md:px-0 md:pb-0",
          className,
        )}
      >
        {slides.map((child, i) => (
          <div
            key={i}
            data-index={i}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={cn("w-[84%] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none", slideClassName)}
          >
            {child}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-4 flex justify-center md:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              /* 44px-tall hit area; the negative margin keeps the row at its 24px visual height. */
              className="-my-2.5 flex h-11 items-center px-[5px]"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-[width,background-color] duration-[var(--dur-slow)] ease-[var(--ease-standard)]",
                  i === active ? "w-5 bg-ink" : "w-1.5 bg-line-strong",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
