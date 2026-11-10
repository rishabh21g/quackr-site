import { useId } from "react";

type DuckProps = {
  className?: string;
  /** Adds a soft contact shadow under the duck, for the larger "clay" uses. */
  grounded?: boolean;
  title?: string;
};

/**
 * The decoy duck. Soft "clay" shading comes from radial gradients and a sheen,
 * not from a 3D library, so it stays crisp and costs nothing to load.
 */
export function Duck({ className, grounded = false, title }: DuckProps) {
  const id = useId();
  const body = `${id}-body`;
  const wing = `${id}-wing`;
  const beak = `${id}-beak`;
  const blur = `${id}-blur`;

  return (
    <svg
      viewBox="0 0 120 112"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <radialGradient id={body} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#FFEA8A" />
          <stop offset="0.55" stopColor="#FFD43B" />
          <stop offset="1" stopColor="#F2B705" />
        </radialGradient>
        <radialGradient id={wing} cx="30%" cy="20%" r="90%">
          <stop offset="0" stopColor="#FFD84F" />
          <stop offset="1" stopColor="#E9A800" />
        </radialGradient>
        <linearGradient id={beak} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFA552" />
          <stop offset="1" stopColor="#F07A1E" />
        </linearGradient>
        <filter id={blur} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {grounded && (
        <ellipse cx="62" cy="104" rx="40" ry="4.5" fill="#16171c" opacity="0.14" filter={`url(#${blur})`} />
      )}

      {/* body + tail */}
      <path
        d="M22 68C22 54 40 50 58 52C76 54 88 47 100 37C104 34 109 37 108 42C106 59 105 73 93 85C83 95 65 99 49 97C33 95 22 83 22 68Z"
        fill={`url(#${body})`}
      />
      {/* wing */}
      <path
        d="M52 67C60 59 78 59 87 65C83 78 69 84 57 80C50 77 48 71 52 67Z"
        fill={`url(#${wing})`}
      />
      {/* head */}
      <circle cx="40" cy="37" r="22" fill={`url(#${body})`} />
      {/* clay sheen */}
      <ellipse cx="32" cy="25" rx="7" ry="4" fill="#fff" opacity="0.45" transform="rotate(-20 32 25)" />
      <ellipse cx="44" cy="60" rx="9" ry="3.5" fill="#fff" opacity="0.25" transform="rotate(-8 44 60)" />
      {/* beak */}
      <path d="M21 38C13 37 6 41 6 46C6 50 13 52 21 50C25 49 25 39 21 38Z" fill={`url(#${beak})`} />
      <path d="M8 46C12 47 17 47 22 46" stroke="#D9661A" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* eye */}
      <circle cx="34" cy="32" r="3.8" fill="#16171c" />
      <circle cx="35.2" cy="30.8" r="1.25" fill="#fff" />
      {/* cheek */}
      <ellipse cx="44" cy="43" rx="4" ry="2.4" fill="#FF9E7A" opacity="0.35" />
    </svg>
  );
}
