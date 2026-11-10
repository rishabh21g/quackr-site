// Strength scoring adapted from Arc UI PasswordStrength (MIT, © 2026 Elia Kuratli).

/** Returns an error message, or undefined when the address looks deliverable. */
export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "That email doesn't look right. Check for typos.";
  return undefined;
}

export type PasswordRule = { id: string; label: string; test: (password: string) => boolean };

/** Arc's built-in rules: length, mixed case, number, symbol. */
export const passwordRules: PasswordRule[] = [
  { id: "length", label: "12+ characters", test: (p) => Array.from(p).length >= 12 },
  { id: "case", label: "Upper and lowercase", test: (p) => /\p{Ll}/u.test(p) && /\p{Lu}/u.test(p) },
  { id: "number", label: "A number", test: (p) => /\p{N}/u.test(p) },
  { id: "symbol", label: "A symbol", test: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
];

export type Strength = { level: 0 | 1 | 2 | 3 | 4; label: string; met: string[]; short?: boolean };

const LEVELS = ["Weak", "Fair", "Good", "Strong"] as const;

/** One step per share of rules met; held at the first step while shorter than 8 characters. */
export function estimateStrength(password: string, rules: PasswordRule[] = passwordRules): Strength {
  if (!password) return { level: 0, label: "", met: [] };
  const met = rules.filter((rule) => rule.test(password)).map((rule) => rule.id);
  if (Array.from(password).length < 8) return { level: 1, label: "Too short", met, short: true };
  const level = Math.min(4, Math.max(1, Math.round((met.length / rules.length) * 4))) as 1 | 2 | 3 | 4;
  return { level, label: LEVELS[level - 1], met };
}
