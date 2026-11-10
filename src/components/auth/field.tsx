"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/**
 * h-12 field shell: line border, surface fill, hover goes to line-strong. Focus: the global 2px ink ring, but it
 * settles in (transparent at 4px offset → ink at 2px over --hover-in) instead of snapping on, and the border firms up.
 * Reduced motion: the ring appears instantly.
 */
export const fieldClass =
  "h-12 w-full rounded-[14px] border border-line bg-surface px-4 text-[15px] text-ink outline-2 outline-offset-4 outline-transparent placeholder:text-ink-3 transition-[border-color,background-color,outline-color,outline-offset] duration-[var(--hover-out)] ease-[var(--ease-standard)] hover:border-line-strong hover:duration-[var(--hover-in)] focus-visible:border-ink/40 focus-visible:outline-ink focus-visible:outline-offset-2 focus-visible:duration-[var(--hover-in)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none aria-[invalid=true]:border-danger/60 aria-[invalid=true]:hover:border-danger aria-[invalid=true]:focus-visible:outline-danger";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  /** Shown in danger under the field and wired up with aria-describedby. */
  error?: string;
  /** Quiet helper copy, also tied to the field. */
  hint?: ReactNode;
  /** Something to render to the right of the label (e.g. a "Forgot password?" link). */
  labelAside?: ReactNode;
  id?: string;
};

/** Message row under a field: opens softly, reads through aria-describedby. */
export function FieldError({ id, text }: { id: string; text?: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {text ? (
        <motion.p
          key="error"
          id={id}
          className="flex items-center gap-1.5 overflow-hidden text-[13px] leading-5 text-danger"
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -2 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: ease.enter }}
        >
          <WarningCircle size={14} weight="bold" aria-hidden className="shrink-0" />
          {text}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function useFieldIds(id: string | undefined, error?: string, hint?: ReactNode, extra?: string) {
  const generated = useId();
  const controlId = id ?? generated;
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null, extra].filter(Boolean).join(" ") || undefined;
  return { controlId, errorId, hintId, describedBy };
}

/** Labelled text field with inline error. */
export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, labelAside, id, className, ...props },
  ref,
) {
  const { controlId, errorId, hintId, describedBy } = useFieldIds(id, error, hint, props["aria-describedby"]);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-5 items-center justify-between gap-3">
        <label htmlFor={controlId} className="text-[14px] font-medium text-ink">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        {...props}
        ref={ref}
        id={controlId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass, className)}
      />
      <FieldError id={errorId} text={error} />
      {hint ? (
        <div id={hintId} className="text-[13px] leading-5 text-ink-3">
          {hint}
        </div>
      ) : null}
    </div>
  );
});

/**
 * Password field with a show/hide toggle. The toggle keeps one name and flips aria-pressed,
 * the same model as Arc UI's PasswordStrength reveal button.
 */
export const PasswordField = forwardRef<HTMLInputElement, FieldProps & { children?: ReactNode }>(
  function PasswordField({ label, error, hint, labelAside, id, className, children, ...props }, ref) {
    const { controlId, errorId, hintId, describedBy } = useFieldIds(id, error, hint, props["aria-describedby"]);
    const [visible, setVisible] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex min-h-5 items-center justify-between gap-3">
          <label htmlFor={controlId} className="text-[14px] font-medium text-ink">
            {label}
          </label>
          {labelAside}
        </div>
        <div className="relative">
          <input
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            {...props}
            ref={ref}
            id={controlId}
            type={visible ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(fieldClass, "pr-12", className)}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label="Show password"
            aria-pressed={visible}
            aria-controls={controlId}
            className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center rounded-[12px] text-ink-3 transition-colors duration-[var(--hover-out)] hover:text-ink hover:duration-[var(--hover-in)] active:translate-y-px active:text-ink"
          >
            {visible ? <EyeSlash size={18} weight="bold" aria-hidden /> : <Eye size={18} weight="bold" aria-hidden />}
          </button>
        </div>
        {children}
        <FieldError id={errorId} text={error} />
        {hint ? (
          <div id={hintId} className="text-[13px] leading-5 text-ink-3">
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);

/** "or" between the social button and the email form. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label="or">
      <span className="h-px flex-1 bg-line" />
      <span aria-hidden className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
        <span className="mr-[-0.12em]">or</span>
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
