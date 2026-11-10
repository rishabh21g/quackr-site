"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Logo } from "@/components/brand/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { smooth } from "@/lib/motion";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Numbers", href: "#numbers" },
  { label: "Developers", href: "#developers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Sticky nav. Transparent at the top; after a few pixels of scroll it gains a
 * paper backdrop and a hairline. The link for the section in view gets a soft pill.
 */
export function SiteNav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Cheap per-frame check: React skips the render unless the boolean flips.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // The active link is the section crossing a line 45% down the viewport. An IntersectionObserver with a zero-height
  // root at that line replaces measuring every section with getBoundingClientRect on each scroll frame, which forced
  // a synchronous layout per frame while scrolling.
  useEffect(() => {
    const els = LINKS.map((l) => document.querySelector(l.href)).filter((el): el is Element => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const crossing = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) crossing.add(e.target);
          else crossing.delete(e.target);
        }
        // Last in page order wins, matching the old "last section past the line" rule.
        const hit = els.filter((el) => crossing.has(el)).at(-1);
        setActive(hit ? `#${hit.id}` : null);
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // While the menu is open: lock page scroll and move focus into the sheet (not a link, so no ring flashes on a tap); on close, hand focus back to the toggle.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      menuRef.current?.focus({ preventScroll: true });
      return () => {
        document.body.style.overflow = overflow;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      // Hand focus back only if it was in the menu (it's about to unmount) or already lost to the body.
      const el = document.activeElement;
      if (!el || el === document.body || menuRef.current?.contains(el)) toggleRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Close the menu if the viewport grows past the breakpoint where it is hidden, so the scroll lock can't stick.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  const iconSwap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, rotate: -90 },
        animate: { opacity: 1, rotate: 0 },
        exit: { opacity: 0, rotate: 90 },
        transition: { duration: 0.16, ease: [0.2, 0, 0, 1] as const },
      };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-[var(--dur-slow)]",
        // Below md the bar is near-opaque paper with no backdrop-filter: blurring everything that scrolls under a
        // sticky bar re-renders that blur every frame, which phones can't keep up with.
        scrolled || open
          ? "border-line/80 bg-paper/95 md:bg-paper/85 md:backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        className={cn(
          // The bar is in flow, so animating its height reflows the whole page each frame; phones get one snap instead.
          "mx-auto flex max-w-[1200px] items-center gap-6 px-5 duration-[var(--dur-slow)] sm:px-8 md:transition-[height]",
          scrolled ? "h-14" : "h-16",
        )}
        aria-label="Main"
      >
        <Link href="/" aria-label="Quackr home" className="shrink-0">
          <Logo />
        </Link>

        <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href} className="relative">
              {active === l.href && (
                <motion.span
                  layoutId="nav-active"
                  transition={reduce ? { duration: 0 } : smooth}
                  className="absolute inset-0 rounded-full bg-ink/[0.05]"
                />
              )}
              <a
                href={l.href}
                className={cn(
                  "relative inline-flex h-9 items-center rounded-full px-3.5 text-[14px] transition-colors duration-[var(--hover-out)] hover:text-ink hover:duration-[var(--hover-in)]",
                  active === l.href ? "text-ink" : "text-ink-2",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <Link href="/login" className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}>
            Log in
          </Link>
          <Link href="/signup" className={buttonClass("ink", "sm", "hidden sm:inline-flex")}>
            Get a number
            <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:bg-ink/[0.04] hover:duration-[var(--hover-in)] active:translate-y-px active:bg-ink/[0.06] active:duration-[var(--dur-instant)] lg:hidden"
          >
            <AnimatePresence initial={false}>
              <motion.span key={open ? "x" : "list"} className="absolute inset-0 grid place-items-center" aria-hidden {...iconSwap}>
                {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* The sheet and its scrim are absolutely positioned under the bar, so opening the menu never shifts the page. */}
      <AnimatePresence>
        {open && (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full h-[100dvh] bg-ink/20 backdrop-blur-[2px] lg:hidden"
          />
        )}
        {open && (
          <motion.div
            key="sheet"
            id="mobile-menu"
            ref={menuRef}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            className="absolute inset-x-0 top-full rounded-b-[24px] outline-none border-t border-line bg-paper px-5 pb-6 pt-2 shadow-[0_24px_48px_-16px_rgba(22,23,28,0.18)] lg:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="-mx-2 flex h-12 items-center rounded-[10px] px-2 font-display text-[22px] tracking-[-0.02em] text-ink transition-colors duration-[var(--hover-out)] ease-[var(--ease-standard)] active:bg-ink/[0.04] active:duration-[var(--dur-instant)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/login" className={buttonClass("outline", "lg")}>
                Log in
              </Link>
              <Link href="/signup" className={buttonClass("ink", "lg")}>
                Get a number
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
