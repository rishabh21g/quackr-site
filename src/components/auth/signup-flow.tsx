"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, EnvelopeSimple } from "@phosphor-icons/react";
import { Duck } from "@/components/brand/duck";
import { CopyNumber } from "@/components/hero/copy-number";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ease, snappy } from "@/lib/motion";
import { GoogleButton, MorphSubmit, type SubmitStatus } from "./buttons";
import { FieldError, OrDivider, PasswordField, TextField } from "./field";
import { OtpBoxedInput, formatCountdown, useResendTimer } from "./otp-input";
import { PasswordMeter } from "./password-meter";
import { estimateStrength, validateEmail } from "./validate";

type Step = 1 | 2 | 3;
const STEPS = ["Account", "Verify email", "Your number"] as const;

/**
 * Demo sign-up: account → email code → first number. Nothing is sent anywhere; every
 * "request" is a timeout that flips local state.
 */
export function SignupFlow({ planTag }: { planTag?: ReactNode }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the new step's heading so screen readers and keyboards follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between gap-3">
        <StepIndicator step={step} />
        {planTag}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: reduce ? 0.12 : 0.26, ease: ease.standard }}
        >
          {step === 1 && (
            <AccountStep
              headingRef={headingRef}
              email={email}
              setEmail={setEmail}
              onDone={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <VerifyStep headingRef={headingRef} email={email} onBack={() => setStep(1)} onDone={() => setStep(3)} />
          )}
          {step === 3 && <DoneStep headingRef={headingRef} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Three segments; the current one stretches into a pill with a shared layout animation. */
function StepIndicator({ step }: { step: Step }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-3">
      <ol className="flex items-center gap-1.5" aria-label="Sign-up progress">
        {STEPS.map((label, index) => {
          const n = index + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} className="flex items-center" aria-current={state === "current" ? "step" : undefined}>
              <span className="sr-only">
                {label}
                {state === "done" ? ", done" : state === "current" ? ", current step" : ""}
              </span>
              <motion.span
                aria-hidden
                layout={!reduce}
                transition={snappy}
                className={cn(
                  "block h-1.5 rounded-full transition-colors duration-300",
                  state === "current" ? "w-8 bg-ink" : state === "done" ? "w-3 bg-ink" : "w-3 bg-line-strong",
                )}
              />
            </li>
          );
        })}
      </ol>
      <span aria-hidden className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3 tabular-nums">
        Step {step} of 3
      </span>
    </div>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

function StepHeading({ headingRef, id, title, sub }: { headingRef: HeadingRef; id?: string; title: string; sub: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1
        ref={headingRef}
        id={id}
        tabIndex={-1}
        className="font-display text-[clamp(2.25rem,6vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.025em] text-ink outline-none"
      >
        {title}
      </h1>
      <p className="text-[15px] leading-6 text-ink-2">{sub}</p>
    </header>
  );
}

/* ---------- Step 1: account ---------- */

function AccountStep({
  headingRef,
  email,
  setEmail,
  onDone,
}: {
  headingRef: HeadingRef;
  email: string;
  setEmail: (v: string) => void;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, terms: false });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const strength = estimateStrength(password);
  const passwordProblem = !password ? "Choose a password." : strength.short ? "Use at least 8 characters." : undefined;
  const emailError = touched.email ? validateEmail(email) : undefined;
  const passwordError = touched.password ? passwordProblem : undefined;
  const termsError = touched.terms && !terms ? "Accept the terms to continue." : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setTouched({ email: true, password: true, terms: true });
    if (validateEmail(email)) return emailRef.current?.focus();
    if (passwordProblem) return passwordRef.current?.focus();
    if (!terms) return termsRef.current?.focus();
    setStatus("loading");
    timer.current = window.setTimeout(onDone, 800);
  }

  return (
    <div className="flex flex-col gap-7">
      <StepHeading
        headingRef={headingRef}
        title="Create your account"
        sub="One account for every number you rent. It takes a minute, and you never share your real number."
      />

      <GoogleButton label="Sign up with Google" />
      <OrDivider />

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-label="Create an account with email">
        <TextField
          ref={emailRef}
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => email && setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
        />
        <PasswordField
          ref={passwordRef}
          label="Password"
          name="new-password"
          autoComplete="new-password"
          placeholder="Make it a good one"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => password && setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
          aria-describedby="signup-password-meter"
        >
          <PasswordMeter password={password} id="signup-password-meter" />
        </PasswordField>

        <div className="flex flex-col gap-1">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-[14px] leading-5 text-ink-2">
            <span className="relative mt-px flex h-5 w-5 shrink-0">
              <input
                ref={termsRef}
                type="checkbox"
                name="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                aria-invalid={termsError ? true : undefined}
                aria-describedby={termsError ? "signup-terms-error" : undefined}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-[6px] border border-line-strong bg-surface transition-colors duration-[var(--hover-out)] hover:border-ink/40 hover:duration-[var(--hover-in)] active:border-ink/40 checked:border-ink checked:bg-ink aria-[invalid=true]:border-danger"
              />
              <Check
                size={12}
                weight="bold"
                aria-hidden
                className="pointer-events-none absolute inset-0 m-auto scale-75 text-white opacity-0 transition-[opacity,scale] duration-[var(--hover-in)] ease-[var(--ease-enter)] peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
              />
            </span>
            <span>
              I agree to Quackr&apos;s <span className="font-medium text-ink">Terms</span> and{" "}
              <span className="font-medium text-ink">Privacy Policy</span>.
            </span>
          </label>
          <FieldError id="signup-terms-error" text={termsError} />
        </div>

        <MorphSubmit status={status} idleLabel="Create account" loadingLabel="Creating account" />
      </form>

      <p className="text-center text-[14px] text-ink-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-[var(--hover-out)] hover:decoration-ink hover:duration-[var(--hover-in)]"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

/* ---------- Step 2: email code ---------- */

const DEMO_FAIL = "000000";

function VerifyStep({
  headingRef,
  email,
  onBack,
  onDone,
}: {
  headingRef: HeadingRef;
  email: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [shakeKey, setShakeKey] = useState(0);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [resent, setResent] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const resend = useResendTimer(30, () => setResent(true));

  const verify = useCallback(
    (value: string) => {
      if (status !== "idle") return;
      if (value.length < 6) {
        setError("Enter all 6 digits.");
        setShakeKey((k) => k + 1);
        return;
      }
      if (value === DEMO_FAIL) {
        setError("That code didn't match. Try again or resend it.");
        setShakeKey((k) => k + 1);
        return;
      }
      setStatus("loading");
      timer.current = window.setTimeout(onDone, 800);
    },
    [onDone, status],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verify(code);
  }

  return (
    <div className="flex flex-col gap-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-line bg-surface text-ink shadow-[0_1px_2px_rgba(22,23,28,0.04)]">
        <EnvelopeSimple size={22} weight="duotone" aria-hidden />
      </span>
      <StepHeading
        headingRef={headingRef}
        id="signup-otp-label"
        title="Check your email"
        sub={
          <span id="signup-otp-hint">
            We sent a 6-digit code to <span className="font-medium break-all text-ink">{email || "your inbox"}</span>.
            Any 6 digits work in this demo; try 000000 to see an error.
          </span>
        }
      />

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-label="Verify your email">
        <OtpBoxedInput
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(undefined);
          }}
          onComplete={verify}
          autoFocus
          disabled={status !== "idle"}
          error={error}
          shakeKey={shakeKey}
          labelledBy="signup-otp-label"
          describedBy="signup-otp-hint"
        />
        <MorphSubmit status={status} idleLabel="Verify email" loadingLabel="Checking code" />
      </form>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[14px]">
        <button
          type="button"
          onClick={onBack}
          className="link-arrow-back -ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-2 font-medium text-ink-2 transition-colors duration-[var(--hover-out)] hover:bg-ink/[0.04] hover:text-ink hover:duration-[var(--hover-in)] active:translate-y-px active:bg-ink/[0.04]"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          Use a different email
        </button>
        <p className="text-ink-3" aria-live="polite">
          {resend.canResend ? (
            <button
              type="button"
              onClick={resend.resend}
              className="inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-[var(--hover-out)] hover:decoration-ink hover:duration-[var(--hover-in)]"
            >
              Resend code
            </button>
          ) : (
            <span className="inline-flex min-h-11 items-center font-mono text-[13px] tabular-nums">
              {resent ? "Sent again. " : ""}Resend in {formatCountdown(resend.remaining)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ---------- Step 3: first number ---------- */

function DoneStep({ headingRef }: { headingRef: HeadingRef }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col gap-7">
      <motion.div
        className="w-[104px] origin-bottom"
        initial={reduce ? false : { scale: 0.3, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        // Damping 20 (ζ≈0.55): one small overshoot and settle. 14 rang two or three times.
        transition={{ type: "spring", stiffness: 420, damping: 20, mass: 0.8, delay: 0.08 }}
      >
        <Duck grounded className="w-full" />
      </motion.div>

      <StepHeading
        headingRef={headingRef}
        title="You're in"
        sub="Your first free number is ready. Use it anywhere a sign-up asks for a phone, and the code lands here."
      />

      <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-3 shadow-[0_1px_2px_rgba(22,23,28,0.04)]">
        <div className="flex items-center justify-between px-1">
          <span className="inline-flex items-center rounded-full bg-duck-soft px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">
            <span className="mr-[-0.08em]">Decoy number</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-live">
            <span className="live-dot" aria-hidden />
            Live
          </span>
        </div>
        <CopyNumber display="+44 7700 900 461" value="+447700900461" />
      </div>

      <div className="flex flex-col gap-2">
        <ButtonLink href="/" size="lg" className="w-full">
          Go to dashboard (demo)
        </ButtonLink>
        <ButtonLink href="/" variant="ghost" size="lg" className="w-full">
          Back to site
        </ButtonLink>
      </div>
    </div>
  );
}
