import { cn } from "@/lib/cn";

/**
 * The page's only soft effect: a warm glow with a cool wash beside it, like light
 * through a window. Sits behind hero visuals and the final CTA. No images, no JS.
 */
export function Atmosphere({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)} style={{ opacity: intensity }}>
      <div className="atmo-cool absolute left-[8%] top-[18%] h-[70%] w-[46%]" />
      <div className="atmo-warm absolute left-1/2 top-[6%] h-[88%] w-[64%] -translate-x-1/2" />
      <div className="atmo-cool absolute right-[6%] top-[30%] h-[60%] w-[40%]" />
    </div>
  );
}

/**
 * A soft bank of cloud-like blobs for the bottom of a scene. Overlapping soft
 * circles in paper white read as clouds without drawing one.
 *
 * Perf: each puff is a pre-softened radial gradient, not a `blur()` filter. Eleven blurred layers under a mask were
 * re-filtered whenever the scene repainted (the phone above rises on scroll). The gradient box is grown by 36px a side
 * (2σ of the old 18px blur) and its stops follow a blurred disc's falloff, so the silhouette matches.
 */
const PUFF =
  "radial-gradient(closest-side, #fff 50%, rgba(255,255,255,0.5) 76%, rgba(255,255,255,0.08) 92%, rgba(255,255,255,0))";
export function CloudBank({ className }: { className?: string }) {
  const puffs = [
    [4, 62, 34], [18, 48, 30], [32, 58, 36], [48, 44, 40], [64, 56, 34], [80, 46, 32], [94, 60, 30],
    [12, 78, 40], [40, 76, 44], [70, 78, 42], [96, 82, 36],
  ];
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-[260px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_45%)]",
        className,
      )}
    >
      {puffs.map(([x, y, s], i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${s * 8 + 72}px`,
            height: `${s * 6 + 72}px`,
            transform: "translate(-50%,-50%)",
            backgroundImage: PUFF,
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-paper" />
    </div>
  );
}

// HorizonGlow and EmberGlow are adapted from Opensource UI ArcBandsBackground and HoneyEmberBackground
// (MIT, © Bidyut Kundu). Kept: stacked radial ellipses rising from the bottom edge, soft layers and a
// faint 4px dot texture. Changed: re-coloured from rainbow and orange to duck-honey with a cool sky edge,
// a hairline highlight on the horizon's rim, and no wrapper (they drop in behind an existing scene).
// Perf: no CSS blur() on any layer. The originals blurred huge (up to 150%-wide) layers; on phones that filter is
// re-run as the page scrolls. The radial gradients already fade to transparent well inside their boxes, so the
// blur was only softening a soft edge; EmberGlow's solid blobs became gradient blobs with the same falloff.

/** A soft dawn rising behind a scene: duck-honey at the centre, cooling to sky at the edges. */
export function HorizonGlow({ className }: { className?: string }) {
  return (
    // Fades out at the bottom too, so the dawn dissolves into the next section rather than ending on a line.
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_74%,transparent)]",
        className,
      )}
    >
      {/* the bands */}
      <div className="absolute -bottom-[30%] left-1/2 h-[100%] w-[150%] -translate-x-1/2 rounded-[100%] [background:radial-gradient(ellipse_120%_88%_at_50%_100%,rgba(255,212,59,0.42)_0%,rgba(251,191,36,0.30)_20%,rgba(253,186,116,0.20)_40%,rgba(186,230,253,0.22)_62%,rgba(251,250,247,0)_82%)]" />
      <div className="absolute -bottom-[24%] left-1/2 h-[84%] w-[128%] -translate-x-1/2 rounded-[100%] [background:radial-gradient(ellipse_110%_80%_at_50%_100%,rgba(255,212,59,0.26)_0%,rgba(253,186,116,0.16)_40%,rgba(186,230,253,0.14)_66%,transparent_86%)]" />
      {/* bright core where the phones stand */}
      <div className="absolute -bottom-[18%] left-1/2 h-[66%] w-[108%] -translate-x-1/2 rounded-[100%] [background:radial-gradient(ellipse_100%_72%_at_50%_100%,rgba(255,255,255,0.6)_0%,rgba(255,252,247,0.2)_38%,transparent_72%)]" />
      {/* hairline rim of the horizon */}
      <div className="absolute -bottom-[30%] left-1/2 h-[100%] w-[150%] -translate-x-1/2 rounded-[100%] border-t border-white/70 [mask-image:linear-gradient(to_right,transparent_15%,#000_40%,#000_60%,transparent_85%)]" />
      {/* dot texture, so the glow reads as printed rather than digital */}
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,#16171c_1px,transparent_1px)] [background-size:4px_4px] opacity-[0.035] [mask-image:linear-gradient(to_top,#000_30%,transparent)]" />
    </div>
  );
}

/*
  EmberGlow's blobs, formerly solid ellipses under one blur(64px). Each box grows by 2σ (128px) a side and its gradient
  follows a blurred ellipse's falloff (≈50% at the old edge, gone at 2σ past it).
*/
const SPREAD = 128;
type EmberBoxSpec = { left?: string; right?: string; top?: string; bottom?: string; w: string; h: string };
const EMBERS: (EmberBoxSpec & { rgb: string; opacity: number })[] = [
  { left: "-6%", top: "4%", h: "60%", w: "46%", rgb: "255,212,59", opacity: 0.17 },
  { right: "-8%", top: "18%", h: "56%", w: "44%", rgb: "251,191,36", opacity: 0.13 },
  { left: "22%", bottom: "-10%", h: "60%", w: "56%", rgb: "253,186,116", opacity: 0.14 },
  { right: "14%", bottom: "0%", h: "44%", w: "36%", rgb: "186,230,253", opacity: 0.18 },
];
const grow = (v: string | undefined) => (v === undefined ? undefined : `calc(${v} - ${SPREAD}px)`);
function emberBox({ left, right, top, bottom, w, h }: EmberBoxSpec) {
  return {
    left: grow(left),
    right: grow(right),
    top: grow(top),
    bottom: grow(bottom),
    width: `calc(${w} + ${SPREAD * 2}px)`,
    height: `calc(${h} + ${SPREAD * 2}px)`,
  };
}
const emberFill = (rgb: string) =>
  `radial-gradient(closest-side, rgb(${rgb}) 0%, rgba(${rgb},0.85) 35%, rgba(${rgb},0.5) 60%, rgba(${rgb},0.15) 82%, rgba(${rgb},0) 100%)`;

/** Warm honey light for a closing scene, softer than the hero horizon. */
export function EmberGlow({ className }: { className?: string }) {
  return (
    // The top fade lets the light rise out of the section above instead of starting on a hard line.
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,rgba(0,0,0,0.35)_14%,#000_34%)]",
        className,
      )}
    >
      {EMBERS.map(({ rgb, opacity, ...box }) => (
        <div key={rgb} className="absolute" style={{ ...emberBox(box), opacity, backgroundImage: emberFill(rgb) }} />
      ))}
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,#78350f_1px,transparent_1px)] [background-size:4px_4px] opacity-[0.03]" />
    </div>
  );
}
