"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { ArrowRight, Check, CheckCircle, Cube, DeviceMobile, LockSimple } from "@phosphor-icons/react";
import { GB, US } from "country-flag-icons/react/3x2";
import { Mark } from "@/components/brand/logo";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { FormButtonDisplay } from "./form-button";
import { OtpDisplay } from "./otp-field";
import { PhoneFieldDisplay, type PhoneCountry } from "./phone-field";

/*
  "The swap": one generic sign-up card, told in beats. The parent owns the beat (its playback once the card is on
  screen); this card only renders it. Every slot is always rendered, so the card never changes size between beats.
  Only opacity, transform and filter move.

  scene 0 · pick a country   0 rest: the field is focused and wants your real number
                             1 the country rolls from +1 to +44
                             2 your real number is struck out, blurred and locked: "Stays on your phone"
  scene 1 · get a number     3 the decoy rolls into the field over the guide
                             4 "Send code" switches on
  scene 2 · the code lands   5 the SMS drops over the card's top edge, the button steps back
                             6–11 the code boxes fill, one digit per beat
                             12 verified
*/

export type SwapStep = 0 | 1 | 2;
/** The last beat. Beats run 0…SWAP_LAST. */
export const SWAP_LAST = 12;
/** Which scene a beat belongs to. */
export const stepOfBeat = (beat: number): SwapStep => (beat <= 2 ? 0 : beat <= 4 ? 1 : 2);
/** Each scene's finished beat: what a click or reduced motion shows. */
export const SETTLED_BEAT = [2, 4, SWAP_LAST] as const;

const COUNTRY_GB: PhoneCountry = { iso: "GB", dial: "44", order: 0, Flag: GB };
const COUNTRY_US: PhoneCountry = { iso: "US", dial: "1", order: 1, Flag: US };
/** Guides in each country's shape, then the decoy itself. Same length per country, so the reels line up. */
const GUIDE_US = "201 555 0123";
const GUIDE_GB = "7400 123456";
const DECOY = "7700 900316";
const CODE = "482917";
const REAL = "+1 415 555 2271";

/** How present each part of the card is per scene: [your number, phone field, button, code]. The scene's subject leads. */
const PRESENCE: Record<SwapStep, readonly [number, number, number, number]> = {
  0: [1, 1, 0.5, 0.45],
  1: [0.62, 1, 1, 0.45],
  2: [0.7, 0.55, 0.55, 1],
};

const subscribe = () => () => {};
/** Reduced motion, but only after hydration, so the server and the first client render agree. */
export function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

const tw = (reduce: boolean, duration = 0.3, delay = 0): Transition =>
  reduce ? { duration: 0 } : { duration, delay, ease: [...ease.standard] };

export function SignupSwap({ beat, className }: { beat: number; className?: string }) {
  const reduce = useReducedFlag();
  const b = Math.max(0, Math.min(SWAP_LAST, Math.round(beat)));
  const scene = stepOfBeat(b);
  const [rowP, fieldP, buttonP, codeP] = PRESENCE[scene];

  const picked = b >= 1;
  const locked = b >= 2;
  const decoy = b >= 3;
  const sent = b >= 5;
  const filled = Math.max(0, Math.min(CODE.length, b - 5));
  const verified = b >= SWAP_LAST;
  const status = verified ? "verified" : sent ? "arrived" : "waiting";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full rounded-[24px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6 md:p-5 lg:p-6",
        className,
      )}
    >
      {/* the SMS: only in scene 2, dropping over the card's top edge like a notification over the app */}
      <motion.div
        className="pointer-events-none absolute inset-x-2.5 top-2.5 z-10 flex items-center gap-3 rounded-[18px] border border-line bg-surface px-3 py-2.5 shadow-[var(--shadow-card)] sm:inset-x-3.5 sm:top-3.5"
        initial={false}
        animate={sent ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -10, scale: 0.98 }}
        transition={
          reduce ? { duration: 0 } : sent ? { type: "spring", visualDuration: 0.45, bounce: 0.14 } : tw(false, 0.2)
        }
      >
        <Mark className="size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 text-[11px] leading-4 text-ink-3">
            <span className="truncate">
              Quackr · to <span className="font-mono tabular-nums">+44 {DECOY}</span>
            </span>
            <span className="shrink-0">now</span>
          </div>
          <p className="mt-0.5 text-[13px] leading-5 text-ink">
            Your code is{" "}
            <span
              className={cn(
                "whitespace-nowrap rounded-[6px] bg-duck-soft px-1.5 py-px font-mono font-medium tabular-nums",
                sent && "mi-code-flash",
              )}
            >
              482 917
            </span>
          </p>
        </div>
      </motion.div>

      {/* the app asking */}
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-line bg-paper text-ink-2 sm:size-9">
          <Cube size={17} weight="duotone" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-5 tracking-[-0.01em] text-ink">Verify your phone</p>
          <p className="mt-0.5 hidden text-[12px] leading-4 text-ink-3 sm:block">We&apos;ll text you a 6-digit code.</p>
        </div>
      </div>

      {/* your real number: what the form wants, and what never goes in */}
      <motion.div
        className="mt-3.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-[14px] border border-line bg-paper px-3.5 py-1.5 sm:mt-5 sm:py-2 lg:gap-y-1 lg:py-2.5"
        initial={false}
        animate={{ opacity: rowP }}
        transition={tw(reduce, 0.35)}
      >
        <p className="col-start-1 row-start-1 flex min-w-0 items-center gap-1.5 text-[12px] font-medium leading-4 text-ink-2">
          <DeviceMobile size={14} weight="bold" className="shrink-0" />
          <span className="truncate">Your number</span>
        </p>
        <p className="relative col-span-2 row-start-2 w-fit font-mono text-[15px] leading-5 tabular-nums sm:leading-6 text-ink lg:col-span-1">
          <motion.span
            className="block"
            initial={false}
            animate={locked ? { opacity: 0.5, filter: "blur(2.5px)" } : { opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            transition={tw(reduce, 0.4, locked ? 0.25 : 0)}
          >
            {REAL}
          </motion.span>
          <motion.span
            className="absolute inset-x-[-3px] top-1/2 h-[1.5px] origin-left rounded-full bg-ink-2"
            initial={false}
            animate={{ scaleX: locked ? 1 : 0 }}
            transition={tw(reduce, 0.35)}
          />
        </p>
        <motion.span
          className="col-start-2 row-start-1 inline-flex h-6 items-center gap-1 justify-self-end rounded-full border border-line-strong bg-surface pl-2 pr-2.5 text-[12px] font-medium leading-none text-ink lg:row-span-2"
          initial={false}
          animate={locked ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
          transition={tw(reduce, 0.3, locked ? 0.35 : 0)}
        >
          <LockSimple size={12} weight="fill" className="shrink-0" />
          <span className="whitespace-nowrap">Stays on your phone</span>
        </motion.span>
      </motion.div>

      {/* the phone field: the country rolls, then the decoy rolls in over the guide */}
      <motion.div className="mt-3 sm:mt-4" initial={false} animate={{ opacity: fieldP }} transition={tw(reduce, 0.35)}>
        <p className="mb-1.5 hidden text-[13px] font-medium leading-4 text-ink sm:block">Phone number</p>
        <PhoneFieldDisplay country={picked ? COUNTRY_GB : COUNTRY_US} focused={b <= 4} reduce={reduce}>
          <span className="relative inline-flex min-w-0 items-center gap-1.5 rounded-[8px] py-0.5 pl-1 pr-1.5">
            <motion.span
              className="absolute inset-0 rounded-[8px] bg-duck-soft"
              initial={false}
              animate={{ opacity: decoy ? 1 : 0 }}
              transition={tw(reduce, 0.3)}
            />
            <motion.span
              className="relative grid size-3.5 shrink-0 place-items-center"
              initial={false}
              animate={decoy ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              transition={tw(reduce, 0.3)}
            >
              <Mark className="size-3.5" />
            </motion.span>
            <SlotText
              value={decoy ? DECOY : picked ? GUIDE_GB : GUIDE_US}
              duration={0.5}
              stagger={0.03}
              spins={0}
              className={cn(
                "relative font-mono text-[14px] font-medium transition-colors duration-[var(--dur-slow)] motion-reduce:transition-none",
                decoy ? "text-ink" : "text-ink-3/55",
              )}
            />
          </span>
        </PhoneFieldDisplay>
      </motion.div>

      {/* send code: off, then on, then it steps back once the code is on its way */}
      <motion.div className="mt-2.5 sm:mt-3" initial={false} animate={{ opacity: buttonP }} transition={tw(reduce, 0.35)}>
        <FormButtonDisplay tone={sent ? "quiet" : b === 4 ? "ink" : "off"} labelKey={sent ? "sent" : "send"} reduce={reduce}>
          {sent ? (
            <>
              Code sent
              <Check size={14} weight="bold" />
            </>
          ) : (
            <>
              Send code
              {b === 4 && <ArrowRight size={14} weight="bold" />}
            </>
          )}
        </FormButtonDisplay>
      </motion.div>

      {/* the code: the hero of scene 2 */}
      <motion.div className="mt-3.5 sm:mt-5" initial={false} animate={{ opacity: codeP }} transition={tw(reduce, 0.35)}>
        <p className="mb-1.5 hidden text-[13px] font-medium leading-4 text-ink sm:block">Verification code</p>
        <OtpDisplay value={CODE.slice(0, filled)} cursor={sent && filled < CODE.length ? filled : null} reduce={reduce} />

        <div className="relative mt-2 h-6 sm:mt-3">
          <StatusLine on={status === "waiting"} reduce={reduce}>
            <span className="text-[12px] text-ink-3">The code goes to your Quackr number</span>
          </StatusLine>
          <StatusLine on={status === "arrived"} reduce={reduce}>
            <span className="text-[12px] text-ink-2">
              Code arrived in <span className="font-mono tabular-nums">4.8s</span>
            </span>
          </StatusLine>
          <StatusLine on={status === "verified"} reduce={reduce}>
            <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-live-soft pl-1 pr-2.5 text-[12px] font-medium text-ink">
              <CheckCircle size={16} weight="fill" className="text-live" />
              Verified
            </span>
            <span className="truncate text-[12px] text-ink-2">Your real number was never sent</span>
          </StatusLine>
        </div>
      </motion.div>
    </div>
  );
}

function StatusLine({ on, reduce, children }: { on: boolean; reduce: boolean; children: React.ReactNode }) {
  return (
    <motion.p
      className="absolute inset-0 flex min-w-0 items-center gap-2"
      initial={false}
      animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }}
      transition={tw(reduce, on ? 0.3 : 0.15, on ? 0.08 : 0)}
    >
      {children}
    </motion.p>
  );
}
