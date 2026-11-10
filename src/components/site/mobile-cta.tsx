"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ButtonLink } from "@/components/ui/button";
import { ease } from "@/lib/motion";

const SHOW_AFTER = 600;

/**
 * Sticky bottom CTA for phones (below md). Slides up once the visitor is ~600px in,
 * and steps aside while #pricing, the final CTA ([data-mobile-cta-hide]) or the footer is on screen, so it
 * never covers them and there is only ever one "Get a number" in view. Press darkens the button and drops it 1px.
 */
export function MobileCta() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = [
      document.getElementById("pricing"),
      ...Array.from(document.querySelectorAll<HTMLElement>("[data-mobile-cta-hide]")),
      document.querySelector<HTMLElement>("[data-site-footer]"),
    ].filter((el): el is HTMLElement => !!el);
    if (!targets.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setBlocked(visible.size > 0);
    });
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  const show = scrolled && !blocked;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mobile-cta"
          role="region"
          aria-label="Get a number"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 shadow-[0_-1px_2px_rgba(22,23,28,0.04)] pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden"
          initial={reduce ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "100%", transition: { duration: 0.2, ease: [...ease.standard] } }}
          transition={{ duration: 0.32, ease: [...ease.enter] }}
        >
          <div className="mx-auto flex max-w-[560px] items-center gap-3">
            <p className="min-w-0 flex-1 text-[14px] font-medium leading-[1.3] text-ink">Get the code, keep your number</p>
            <ButtonLink href="/signup" size="lg" arrow className="min-w-[44%] shrink-0 active:bg-ink-hover">
              Get a number
            </ButtonLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
