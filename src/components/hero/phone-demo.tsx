"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  AmazonLogo,
  ArrowsClockwise,
  BellSlash,
  CheckCircle,
  DiscordLogo,
  LockSimple,
  ShieldCheck,
  SteamLogo,
  TelegramLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useInView,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Atmosphere } from "@/components/art/atmosphere";
import { Duck } from "@/components/brand/duck";
import { PhoneFrame } from "@/components/ui/phone-frame";
import { SlotText } from "@/components/ui/slot-text";
import { cn } from "@/lib/cn";
import { CopyNumber } from "./copy-number";

// Newest first: index 0 is the one arriving at the top.
const MESSAGES = [
  { app: "Telegram", Icon: TelegramLogo, before: "Login code:", code: "48291", after: "Do not give this code to anyone." },
  { app: "WhatsApp", Icon: WhatsappLogo, before: "Your WhatsApp code:", code: "113-904", after: "" },
  { app: "Discord", Icon: DiscordLogo, before: "Your verification code is", code: "760215", after: "" },
  { app: "Steam", Icon: SteamLogo, before: "Steam Guard code:", code: "K7RQ2", after: "" },
  { app: "Amazon", Icon: AmazonLogo, before: "is your Amazon OTP.", code: "559 018", after: "", codeFirst: true },
];

/*
  The CSS feed (globals.css .sms-feed) lands a card every 3s. With delays of -3s × index,
  card i lands at t = 15 - 3i, so the arrival order is 0, 4, 3, 2, 1. The proof chip and
  counters below tick on the same 3s beat, so they always talk about the card that just landed.
*/
const ARRIVALS = [0, 4, 3, 2, 1].map((i) => MESSAGES[i].app);
const DELIVERY = ["2.8", "1.9", "3.4", "2.2", "4.1"];
const BEAT = 3000;

const BLANK = (n: string) => n.replace(/\d/g, "0");

/**
 * The one picture of the product. A decoy phone keeps receiving codes while your
 * real phone, tilted behind it, stays silent. The decoy's number rolls into place
 * on load and again whenever the visitor picks a new country.
 *
 * Small things to notice: the phones drift with the cursor at two depths, the duck
 * hops each time a code lands (and quacks on hover), the proof chip names the app
 * that just texted, and the decoy's count climbs while the real phone stays at zero.
 */
export function PhoneDemo({ number, onRefresh }: { number: string; onRefresh?: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Phones settle from a tilt as the hero scrolls away, like Popcorn's pair.
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const decoyRotate = useTransform(scrollYProgress, [0.25, 0.75], [-5, -1.5]);
  const realRotate = useTransform(scrollYProgress, [0.25, 0.75], [7, 3]);
  const lift = useTransform(scrollYProgress, [0.25, 0.75], [0, -36]);

  // Cursor parallax: the decoy (closer) moves more than the real phone (further back).
  const px = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const decoyX = useTransform(px, (v) => v * 14);
  const decoyY = useTransform([lift, py], ([l, v]: number[]) => l + v * 10);
  // As the hero scrolls away the real phone slides in behind the decoy, so the pair closes up.
  const converge = useTransform(scrollYProgress, [0.25, 0.75], [0, -28]);
  const realX = useTransform([px, converge], ([v, c]: number[]) => v * -7 + c);
  // Chips sit "nearer" than the phones, so they drift up faster: cheap depth.
  const chipFar = useTransform(scrollYProgress, [0.2, 0.8], [0, -90]);
  const chipNear = useTransform(scrollYProgress, [0.2, 0.8], [0, -50]);
  const realY = useTransform([lift, py], ([l, v]: number[]) => l * 0.8 + v * -5);

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  // Provision beat: the number starts as zeros, rolls in, and only then goes live.
  // Timers only; the reduced-motion path derives its state instead of setting it.
  const [rolled, setRolled] = useState(() => BLANK(number));
  const [liveFor, setLiveFor] = useState<string | null>(null);
  useEffect(() => {
    if (reduce) return;
    const roll = window.setTimeout(() => setRolled(number), 350);
    const on = window.setTimeout(() => setLiveFor(number), 1500);
    return () => {
      window.clearTimeout(roll);
      window.clearTimeout(on);
    };
  }, [number, reduce]);
  const shown = reduce ? number : rolled;
  const live = !!reduce || liveFor === number;

  // One beat per landed SMS.
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setBeat((b) => b + 1), BEAT);
    return () => window.clearInterval(t);
  }, [reduce]);
  const app = ARRIVALS[beat % ARRIVALS.length];
  const secs = DELIVERY[beat % DELIVERY.length];

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto h-[660px] w-full max-w-[1100px] [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] sm:h-[740px]"
    >
      <Atmosphere className="top-6" />

      {/* real phone, behind */}
      <motion.figure
        style={reduce ? { rotate: 4 } : { rotate: realRotate, x: realX, y: realY }}
        className="absolute left-1/2 top-[146px] hidden w-[236px] translate-x-[18%] sm:block"
        aria-label="Your real phone stays quiet"
      >
        <RealPhone live={live} beat={beat} count={12 + beat} />
      </motion.figure>

      {/* decoy phone, in front. Top padding keeps the perched duck inside the mask while it lifts. */}
      <motion.figure
        style={reduce ? { rotate: -2 } : { rotate: decoyRotate, x: decoyX, y: decoyY }}
        className="absolute left-1/2 top-[110px] z-10 w-[292px] -translate-x-1/2 sm:-translate-x-[92%]"
        aria-label="Your Quackr decoy number receiving verification codes"
      >
        <PerchedDuck beat={beat} />
        <DecoyPhone shown={shown} value={number} live={live} onRefresh={onRefresh} count={12 + beat} />
      </motion.figure>

      {/* floating proof chips, synced to the feed */}
      <FloatChip className="right-[calc(50%+282px)] top-[240px] hidden lg:flex" delay={0} drift={reduce ? undefined : chipFar}>
        <CheckCircle size={16} weight="fill" className="text-live" />
        <span className="text-ink-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={app}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-block font-medium text-ink"
            >
              {app}
            </motion.span>
          </AnimatePresence>{" "}
          code in
        </span>
        <span className="font-mono font-semibold text-ink">
          <SlotText value={`${secs}s`} duration={0.5} stagger={0.04} spins={0} />
        </span>
      </FloatChip>
      <FloatChip className="left-[calc(50%+262px)] top-[390px] hidden lg:flex" delay={1.4} drift={reduce ? undefined : chipNear}>
        <LockSimple size={15} weight="bold" className="text-ink" />
        <span className="text-ink-2">Your real number:</span>
        <span className="font-medium text-ink">never shared</span>
      </FloatChip>
    </div>
  );
}

/** The duck hops a little every time a code lands, and says hi on hover. */
function PerchedDuck({ beat }: { beat: number }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [hover, setHover] = useState(false);
  // Touch screens have no hover, so the duck greets once when it scrolls into view.
  const seenRef = useRef<HTMLDivElement>(null);
  const seen = useInView(seenRef, { once: true, amount: 0.8 });
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches);
  const [greeted, setGreeted] = useState(false);
  useEffect(() => {
    if (!touch || !seen || reduce) return;
    const show = window.setTimeout(() => setGreeted(true), 900);
    const hide = window.setTimeout(() => setGreeted(false), 2600);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [touch, seen, reduce]);

  useEffect(() => {
    if (reduce || beat === 0 || !scope.current) return;
    animate(scope.current, { y: [0, -9, 0], rotate: [0, -6, 0] }, { duration: 0.45, ease: [0.2, 0, 0, 1] });
  }, [beat, reduce, animate, scope]);

  return (
    <div
      ref={seenRef}
      className="absolute -top-[52px] left-7 z-20"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div ref={scope} style={{ transformOrigin: "50% 90%" }}>
        <Duck grounded className="w-[80px] drop-shadow-[0_6px_10px_rgba(22,23,28,0.12)]" />
      </div>
      <AnimatePresence>
        {(hover || greeted) && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
            className="absolute -top-7 left-[64px] origin-bottom-left whitespace-nowrap rounded-full rounded-bl-[4px] border border-line bg-surface px-2.5 py-1 font-display text-[14px] italic text-ink shadow-[var(--shadow-card)]"
          >
            quack!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatChip({
  className,
  delay,
  drift,
  children,
}: {
  className?: string;
  delay: number;
  /** Scroll-linked offset; the outer layer carries it so the idle bob keeps running inside. */
  drift?: MotionValue<number>;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div style={drift ? { y: drift } : undefined} className={cn("absolute z-20", className)}>
    <motion.div
      aria-hidden
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: 0.8 + delay * 0.3 },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface/90 px-3.5 py-2 text-[13px] shadow-[var(--shadow-card)] backdrop-blur",
      )}
    >
      {children}
    </motion.div>
    </motion.div>
  );
}

function RealPhone({ live, beat, count }: { live: boolean; beat: number; count: number }) {
  const reduce = useReducedMotion();
  return (
    <>
      {/* graphite frame: the sealed phone you keep to yourself; lock screens show no status-bar clock */}
      <PhoneFrame finish="graphite" statusBar={false} className="group/real w-full shadow-[var(--shadow-phone)]">
        <div className="flex h-full flex-col items-center px-4 pt-[52px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-3">
            <LockSimple size={10} weight="bold" />
            Private
          </span>
          <p className="mt-4 font-display text-[52px] font-normal leading-none tracking-[-0.03em] text-ink/80">9:41</p>
          <p className="mt-1.5 text-[12px] text-ink-3">Tuesday, November 10</p>

          {/* the number apps never saw: stays blurred, sharpens slightly on hover to show it's yours */}
          <div className="mt-6 w-full rounded-[14px] border border-line bg-surface/70 px-3 py-2.5 text-left">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">Your number</p>
            <p className="mt-0.5 font-mono text-[13px] font-medium text-ink/80 blur-[3px] transition-[filter] duration-[var(--hover-out)] group-hover/real:blur-[1.5px] group-hover/real:duration-[var(--hover-in)]">
              +1 415 555 2271
            </p>
            <p className="mt-1 text-[10px] text-ink-3">Shared with 0 apps</p>
          </div>

          {/* the shield: each code that lands on the decoy sends a ripple here, the proof it never reached this phone */}
          <div className="mt-auto flex flex-col items-center text-center">
            <div className="relative flex h-[88px] w-[88px] items-center justify-center">
              {!reduce &&
                [0, 1].map((ring) => (
                  <motion.span
                    key={`${beat}-${ring}`}
                    aria-hidden
                    initial={{ scale: 0.55, opacity: beat === 0 ? 0 : 0.55 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 1.4, delay: ring * 0.22, ease: [0.2, 0, 0, 1] }}
                    className="absolute inset-0 rounded-full border border-live/50"
                  />
                ))}
              <span aria-hidden className="absolute inset-[18px] rounded-full bg-live-soft" />
              <motion.span
                key={reduce ? "lock" : `lock-${beat}`}
                initial={reduce || beat === 0 ? false : { scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 22 }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-live/30 bg-surface text-live shadow-[0_1px_2px_rgba(22,23,28,0.06)]"
              >
                <ShieldCheck size={19} weight="fill" />
              </motion.span>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink">
              <span className="live-dot" />
              Shield on
            </p>
            <p className="mt-1 text-balance text-[11px] leading-snug text-ink-3">
              <SlotText value={count} duration={0.5} stagger={0.04} spins={0} className="font-mono text-ink-2" /> sign-ups kept off
              this phone today
            </p>
          </div>

          <p className="mb-7 mt-5 inline-flex items-center gap-1.5 text-[11px] text-ink-3">
            <BellSlash size={13} />
            <span className="font-mono text-ink-2">0</span> {live ? "new messages" : "messages"}
          </p>
        </div>
      </PhoneFrame>
      <figcaption className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-ink-3">
        <LockSimple size={13} weight="bold" />
        Your real number, private
      </figcaption>
    </>
  );
}

function DecoyPhone({
  shown,
  value,
  live,
  onRefresh,
  count,
}: {
  shown: string;
  value: string;
  live: boolean;
  onRefresh?: () => void;
  count: number;
}) {
  return (
    <PhoneFrame finish="paper" className="w-full shadow-[var(--shadow-phone)]">
      <div className="flex h-full flex-col pb-5">
        <div className="px-4 pt-[48px]">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-duck-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">
              <Duck className="h-3.5 w-3.5" />
              <span className="mr-[-0.06em]">Decoy number</span>
            </span>
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-[var(--dur-slow)]",
                live ? "text-live" : "text-ink-3",
              )}
              aria-live="polite"
            >
              {live ? <span className="live-dot" /> : <span className="h-2 w-2 rounded-full bg-line-strong" />}
              {live ? "Live" : "Connecting"}
            </span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                aria-label="Get a different number"
                title="Get a different number"
                className="group relative -mr-1 flex h-8 w-8 items-center after:absolute after:-inset-1.5 after:rounded-full after:content-[''] justify-center rounded-full text-ink-3 transition-colors duration-[var(--hover-out)] hover:bg-ink/[0.05] hover:text-ink hover:duration-[var(--hover-in)] active:translate-y-px"
              >
                <ArrowsClockwise
                  size={14}
                  weight="bold"
                  className="transition-transform duration-[var(--dur-slow)] group-active:rotate-180"
                />
              </button>
            )}
          </div>
          <CopyNumber
            display={<SlotText value={shown} duration={0.9} stagger={0.045} />}
            value={value.replace(/\s/g, "")}
            compact
          />
        </div>

        <div className="mt-4 flex items-baseline justify-between px-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Inbox</p>
          <p className="text-[11px] text-ink-3">
            <SlotText value={count} duration={0.5} stagger={0.04} spins={0} className="font-mono text-ink-2" /> codes today
          </p>
        </div>

        <div className="sms-feed mx-3 mt-2 min-h-0 flex-1" aria-live="off">
          {MESSAGES.map((m, i) => (
            <SmsCard key={m.app} index={i} {...m} />
          ))}
        </div>
        <ListeningRow />
      </div>
    </PhoneFrame>
  );
}

/** A quiet "still listening" line under the feed, so the inbox never looks finished. */
function ListeningRow() {
  const reduce = useReducedMotion();
  return (
    <div className="mx-3 mt-1 flex items-center gap-2 rounded-2xl border border-dashed border-line-strong/70 px-3 py-2.5 text-[12px]">
      <span className="flex gap-[3px]" aria-hidden>
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="h-1 w-1 rounded-full bg-ink-3"
            animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.18 }}
          />
        ))}
      </span>
      <motion.span
        className="bg-[linear-gradient(90deg,var(--ink-3)_0%,var(--ink-3)_40%,var(--ink)_50%,var(--ink-3)_60%,var(--ink-3)_100%)] bg-[length:250%_100%] bg-clip-text text-transparent"
        animate={reduce ? undefined : { backgroundPositionX: ["100%", "-150%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      >
        Listening for the next code
      </motion.span>
    </div>
  );
}

function SmsCard({
  index,
  app,
  Icon,
  before,
  code,
  after,
  codeFirst,
}: (typeof MESSAGES)[number] & { index: number }) {
  const codeEl = (
    <span className="sms-code whitespace-nowrap rounded-[6px] px-1.5 py-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink">
      {code}
    </span>
  );

  return (
    <article
      className="sms-card rounded-2xl border border-line bg-surface px-3 py-2.5 shadow-[var(--shadow-card)]"
      style={{ "--i": index } as CSSProperties}
    >
      <header className="flex items-center gap-2">
        {/* third-party marks stay monochrome so they never outshout the brand */}
        <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-paper text-ink-2">
          <Icon size={14} weight="fill" />
        </span>
        <span className="text-[12px] font-semibold text-ink">{app}</span>
        <span className="ml-auto text-[11px] text-ink-3">now</span>
      </header>
      <p className="mt-1.5 line-clamp-1 text-[13px] leading-6 text-ink-2">
        {codeFirst ? (
          <>
            {codeEl} {before}
          </>
        ) : (
          <>
            {before} {codeEl} {after}
          </>
        )}
      </p>
    </article>
  );
}
