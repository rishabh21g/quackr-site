// Adapted from Opensource UI DarkCarbonSpotlightBackground (MIT, © 2026 Bidyut Kundu).
// Kept its layer stack (base radial, top spotlight, vignette, 4px carbon dots). Re-coloured from neutral #0C0C0C to our
// ink, spotlight warmed toward paper, added a film-grain layer, an optional faint duck tint and an inner hairline edge.
// Static: nothing here moves, so reduced motion needs no separate path. Picked over DarkInkField (drifting grey blobs)
// and DarkMidnightMesh (grid lines + teal/sky glows) as the calmest of the three.

import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

/** Ink, nudged lighter near the spotlight and darker at the far edges. */
const BASE =
  "radial-gradient(circle at 50% 12%, color-mix(in srgb, var(--ink), white 6%) 0%, color-mix(in srgb, var(--ink), white 2.5%) 36%, var(--ink) 68%, color-mix(in srgb, var(--ink), black 28%) 100%)";

/** Soft warm-white wash from the top centre: paper, warmed with a touch of duck. */
const SPOTLIGHT =
  "radial-gradient(ellipse 62% 58% at 50% 0%, color-mix(in srgb, color-mix(in srgb, var(--paper) 88%, var(--duck)) 11%, transparent) 0%, transparent 100%)";

const VIGNETTE =
  "radial-gradient(ellipse at center, transparent 46%, color-mix(in srgb, black 38%, transparent) 100%)";

const DOTS = "radial-gradient(circle at center, rgba(255, 255, 255, 0.7) 1px, transparent 1px)";

/** Grayscale fractal noise, tiled. The layer sits at 5% so it reads as paper-like grain, not texture. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

/** Faint duck warmth, for whatever sits on the band that matters most (the code panel). */
const TINT = "radial-gradient(closest-side, color-mix(in srgb, var(--duck) 7%, transparent), transparent)";

type InkSpotlightProps = ComponentPropsWithRef<"div"> & {
  /** Position/size classes for the faint duck tint layer. Omit for no tint. */
  tintClassName?: string;
};

/**
 * Dark ink band: a static, layered background that children sit on.
 * Give it the radius via `className` (the inner hairline follows with `rounded-[inherit]`).
 */
export function InkSpotlight({ children, className, tintClassName, ...props }: InkSpotlightProps) {
  return (
    <div
      data-slot="ink-spotlight"
      className={cn("relative isolate overflow-hidden bg-ink [color-scheme:dark]", className)}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: BASE }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: SPOTLIGHT }} />
      {tintClassName && (
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute -z-10", tintClassName)}
          style={{ backgroundImage: TINT }}
        />
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: VIGNETTE }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[length:4px_4px] opacity-[0.03]"
        style={{ backgroundImage: DOTS }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[length:180px_180px] opacity-[0.05]"
        style={{ backgroundImage: GRAIN }}
      />
      {/* Inner hairline + top highlight so the rounded edge reads as a crafted surface, not a cut-out. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]"
      />
      {children}
    </div>
  );
}
