"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CloudBank, EmberGlow } from "@/components/art/atmosphere";
import { OtpChip } from "@/components/art/otp-chip";
import { Duck } from "@/components/brand/duck";
import { CountryPicker } from "@/components/hero/country-picker";
import { Container } from "@/components/ui/container";
import { PhoneFrame } from "@/components/ui/phone-frame";
import { Reveal } from "@/components/ui/reveal";

/**
 * The cinematic close: soft light, a bank of clouds, and a small phone rising out of them
 * with the duck perched on top. Hand-built (Arc's cta-section is a card layout, not a scene).
 *
 * No overflow-hidden on any ancestor of the CountryPicker: the section clips only on the x axis,
 * and the phone clips itself, so the dropdown can fall over the phone freely.
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    // data-mobile-cta-hide: the sticky mobile CTA steps aside here, so only one "Get a number" is on screen.
    <section ref={ref} data-mobile-cta-hide className="relative isolate overflow-x-clip pt-24 sm:pt-32">
      {/* starts ~240px above the section and fades in, so the warmth dissolves out of the FAQ */}
      <EmberGlow className="-top-60 -z-10" />

      <Container className="relative">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.03em] text-ink">
            Your number is nobody&rsquo;s business.
          </h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[17px] leading-[1.6] text-ink-2 sm:text-[18px]">
            Get a decoy in seconds. Keep the real one to yourself.
          </p>
        </Reveal>

        {/* z-20 keeps the open country list above the phone and clouds. */}
        <Reveal delay={0.1} className="relative z-20 mt-10 flex justify-center">
          <CountryPicker />
        </Reveal>
      </Container>

      {/* The phone rises out of the clouds. This wrapper clips the phone's lower half, not the picker. */}
      <div className="relative mt-14 h-[340px] sm:mt-16 sm:h-[380px]">
        <div aria-hidden className="absolute inset-x-0 top-0 mx-auto h-full w-[260px] overflow-hidden sm:w-[280px]">
          {/* will-change: y tracks scroll every frame; its own layer makes that a compositor move, not a repaint of the phone. */}
          <motion.div style={reduce ? undefined : { y }} className="absolute inset-x-[10px] top-[56px] will-change-transform">
            <Duck grounded className="absolute -top-[52px] left-1/2 h-[64px] w-[68px] -translate-x-1/2" />
            <PhoneFrame finish="paper" className="w-full shadow-[var(--shadow-phone)]">
              <div className="px-3 pt-[50px]">
                <div className="flex items-center justify-between px-1 font-mono text-[11px] tabular-nums text-ink-3">
                  <span>Inbox</span>
                  <span>+46 70 •••• 18</span>
                </div>
                <OtpChip className="mt-3 w-full" />
              </div>
            </PhoneFrame>
          </motion.div>
        </div>
        <CloudBank className="z-10 h-[130px] sm:h-[150px]" />
      </div>
    </section>
  );
}
