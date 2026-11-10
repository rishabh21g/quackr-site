"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { ButtonLink } from "@/components/ui/button";
import { ease } from "@/lib/motion";
import { GoogleButton, MorphSubmit, type SubmitStatus } from "./buttons";
import { OrDivider, PasswordField, TextField } from "./field";
import { validateEmail } from "./validate";

/** Demo login. Nothing leaves the page: submit only flips local state. */
export function LoginForm() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [resetNote, setResetNote] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const emailError = touched.email ? validateEmail(email) : undefined;
  const passwordError = touched.password && !password ? "Enter your password." : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setTouched({ email: true, password: true });
    if (validateEmail(email)) return emailRef.current?.focus();
    if (!password) return passwordRef.current?.focus();
    setStatus("loading");
    timer.current = window.setTimeout(() => setStatus("done"), 750);
  }

  const done = status === "done";

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(2.25rem,6vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.025em] text-ink">
          Welcome back
        </h1>
        <p className="text-[15px] leading-6 text-ink-2">Log in to read your codes and manage your numbers.</p>
      </header>

      <GoogleButton />
      <OrDivider />

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-label="Log in with email">
        <TextField
          ref={emailRef}
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          disabled={done}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => email && setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
        />
        <PasswordField
          ref={passwordRef}
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          disabled={done}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          labelAside={
            <button
              type="button"
              onClick={() => setResetNote(true)}
              className="-my-3 py-3 text-[13px] font-medium text-ink-2 underline-offset-4 transition-colors duration-[var(--hover-out)] hover:text-ink hover:underline hover:duration-[var(--hover-in)]"
            >
              Forgot password?
            </button>
          }
        />
        <p aria-live="polite" className="-mt-2 text-[13px] leading-5 text-ink-3 empty:hidden">
          {resetNote ? (
            <span className="block animate-[panel-in_180ms_var(--ease-enter)] motion-reduce:animate-none">
              This is a demo, so no reset email goes out. Any password works.
            </span>
          ) : null}
        </p>

        <MorphSubmit status={status} idleLabel="Log in" loadingLabel="Signing in" doneLabel="Signed in (demo)" />

        <AnimatePresence initial={false}>
          {done && (
            <motion.div
              key="home"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: ease.enter, delay: reduce ? 0 : 0.15 }}
            >
              <ButtonLink href="/" variant="outline" size="lg" className="w-full">
                Back to the home page
                <ArrowRight size={16} weight="bold" aria-hidden />
              </ButtonLink>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="text-center text-[14px] text-ink-2">
        New here?{" "}
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-[var(--hover-out)] hover:decoration-ink hover:duration-[var(--hover-in)]"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
