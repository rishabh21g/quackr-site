# UI libraries: references, not dependencies

We build Quackr's UI (landing page now, dashboard later) by **borrowing from two copy-paste libraries
and re-skinning what we borrow in the Quackr flavor**. Nothing from either library is installed or
pre-copied. When a section needs a component:

1. **Look it up in both libraries** (links below). Fetch the live page or source at that moment; the
   catalogs change, so don't trust this file's lists over the site.
2. **Pick the better one**, or combine: e.g. Arc's behavior with Opensource UI's look.
3. **Adapt it to the flavor** using the checklist below, then put it where it's used.
4. **Log it** in [Adopted](#adopted) so the next person reuses it instead of re-porting.

Once a piece is used in two places, promote it to `src/components/ui/` as a shared primitive.

---

## The two libraries

### Opensource UI: opensourceui.in

|                     |                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Site / catalog      | https://opensourceui.in/components (≈207 components, 30 categories)                                       |
| Source              | https://github.com/bidyut10/opensourceui → `components/<category>/<name>.tsx`                             |
| Agent notes         | repo `skills/opensource-ui/` (`references/catalog.md` lists every slug)                                   |
| How it ships        | Copy-paste `.tsx`. No npm package, no CLI, no registry                                                     |
| Styling             | Tailwind v4 utilities, hard-coded `neutral-*` palette, `cn()` = `clsx` + `tailwind-merge`                  |
| Icons               | `lucide-react` + hand-written SVGs in repo `icons/`                                                       |
| Conventions         | `forwardRef`, props extend native HTML props, `data-slot` attrs, `"use client"` where needed               |
| License             | MIT, `Copyright (c) 2026 Bidyut Kundu`. Keep the notice in copied files                                  |

**Good for:** visual, self-contained pieces with a lot of polish. Device **mockups** (phone, browser),
**notification banners** (Apple-style, toast, system alert), **OTP inputs**, `phone-field-input`,
`copy-button`, button micro-interactions, **widgets**, social cards, background patterns.

### Arc UI: uiarc.dev

|                     |                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Site / catalog      | https://uiarc.dev (components under `/components/<name>`, blocks under `/components/blocks/<name>`)        |
| Machine-readable    | https://uiarc.dev/llms.txt, `/llms-full.txt`, `/r/catalog.json`, `/r/registry.json`, MCP `/api/mcp`        |
| Read source         | `https://uiarc.dev/r/<name>.json` (shadcn registry item; file contents inside, no install needed)        |
| Source repo         | https://github.com/kuratlielia/arc-library                                                                |
| How it ships        | shadcn-compatible registry: `npx shadcn@latest add https://uiarc.dev/r/<name>.json`                       |
| Styling             | **CSS modules + CSS variables**, not Tailwind. Needs `arc-foundation.css` for its tokens                  |
| Deps                | Most items use `motion` and `lucide-react`                                                                 |
| License             | Free items: MIT, `Copyright (c) 2026 Elia Kuratli`. **Pro items are paid & proprietary. Don't use them** unless we buy a licence |

**Good for:** app-grade behavior and **landing blocks**. Hero, site header and footer, FAQ, CTA, logo marquee,
stats band, feature bento, testimonials, pricing calculator and plan comparison, newsletter. Primitives with real
interaction: combobox, select, dialog, drawer, popover, tooltip, toast, tabs, accordion,
`phone-input`, `billing-toggle`, `segmented-control`, `copy-button`. Dashboard pieces: metric card,
usage meter, charts, sortable table, filter toolbar, empty state.

> Block paths above come from Arc's `llms.txt` summary and were not opened one by one. Check the page exists before linking it.

### Which to reach for

| Need                                           | Start with             | Why                                                        |
| ---------------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| A whole landing section (FAQ, pricing, footer) | Arc blocks             | Opensource UI has no section-level blocks                  |
| Overlay, select, combobox, anything stateful    | Arc                    | Better keyboard/ARIA coverage, real interaction models      |
| A showpiece visual (phone, SMS banner, OTP)    | Opensource UI          | Tailwind already, closest to our hand-built hero            |
| Dashboard charts / tables                      | Arc                    | Opensource UI's tables are static display cards             |
| Small button micro-interaction                 | Either, compare both   | Opensource UI ports faster, since it's already Tailwind              |

---

## The Quackr flavor: adaptation checklist

Every borrowed component must pass this before it ships. Our tokens live in `src/app/globals.css`.

**Colour: every colour has one job**

| Library role                                                   | Quackr token                          |
| -------------------------------------------------------------- | ------------------------------------- |
| page bg · OSUI `neutral-50`/white page · Arc `--background`    | `paper`                               |
| card/field bg · OSUI `white` · Arc `--surface`, `--surface-raised` | `surface`                         |
| muted fill/hover · OSUI `neutral-50/100` · Arc `--surface-muted` | `paper` or `ink/[0.04]`             |
| primary text · OSUI `neutral-900` · Arc `--foreground`         | `ink`                                 |
| secondary text · OSUI `neutral-600/700` · Arc `--text-secondary` | `ink-2`                             |
| muted/meta text · OSUI `neutral-400/500` · Arc `--text-muted`  | `ink-3`                               |
| borders · OSUI `neutral-100/200` · Arc `--border`, `--border-subtle` | `line`                          |
| strong/hover border · OSUI `neutral-300` · Arc `--border-strong` | `line-strong`                       |
| primary button · OSUI `neutral-800/900` · Arc `--accent` button | `ink` → hover `ink-hover`            |
| accent (cyan, amber, violet, Arc `--accent`)                   | `duck` family, **only** for "Quackr / your decoy" (decoy number, highlighted codes, mascot, copied state). Never text, never a button fill |
| success / live (emerald, Arc `--success`)                      | `live` family, **only** for "code received / live" |
| error (rose, Arc `--danger`)                                   | keep rose for now; add a `danger` token when the first form lands |

- Third-party brand marks stay monochrome (`ink-2` on `paper`) so they never outshout ours.
- No gradients, glass, or coloured glows, except `<Atmosphere/>` and `<CloudBank/>` (src/components/art/atmosphere.tsx), used behind the hero phones, the final CTA and the auth brand panel.

**Type**: `font-display` (Fraunces serif with SOFT 100 / WONK 0, weight 400–500, tight tracking) for headlines only, `font-sans` (Inter) for UI, `font-mono`
(JetBrains Mono, `tabular-nums`) for numbers and codes, because they're the product. Drop the libraries' Geist,
Instrument Serif or Inter-in-a-variable setup.

**Icons**: Phosphor only (`@phosphor-icons/react`, use `/dist/ssr` in server components). Swap every
Lucide icon. Default `size={14–18}`, `weight="bold"` for small UI glyphs, `"duotone"` for feature
icons, `"fill"` for brand logos.

**Shape**: four radii plus pills. Don't use library defaults (Arc ships 18/26/34px).

| Use                         | Radius        |
| --------------------------- | ------------- |
| list rows, menu items       | `10px`        |
| buttons, fields, CTA        | `14px`        |
| dropdowns, popovers         | `18px`        |
| shells that wrap controls   | `20px`        |
| nav links, small CTAs, tags | `rounded-full`|

**Depth**: flat by default with a `line` border. Shadows only from our set: hairline
`0 1px 2px rgba(22,23,28,.04)`, `--shadow-card`, popover
`0 1px 2px rgba(22,23,28,.06), 0 24px 48px -16px rgba(22,23,28,.25)`, and `--shadow-phone`. All are tinted with ink
`rgb(22 23 28)`, never black.

**Motion**: hover arrives faster than it leaves, and press is instant.
`duration-[var(--hover-out)] hover:duration-[var(--hover-in)]`, press `translate-y-px` at
`--dur-instant`, easing `var(--ease-standard)` (enter: `var(--ease-enter)`). Replace library easings and
durations (OSUI's 200ms `cubic-bezier(.32,.72,0,1)`, Arc's Motion springs) with ours. Every animation
gets a `prefers-reduced-motion` fallback.

**Focus**: the global `:focus-visible` 2px `ink` outline. Remove library focus rings.

**Code**:
- Tailwind utilities with our tokens. **Arc's CSS modules get rewritten to Tailwind.** Don't import
  `arc-foundation.css` or add its `--background`/`--accent` variable system alongside ours.
- **New dependencies need a yes first.** `motion`, `clsx` and `tailwind-merge` are approved and installed
  (`cn()` lives in `src/lib/cn.ts`, motion presets in `src/lib/motion.ts`). Anything else still needs a yes. Drop
  `lucide-react` entirely. Arc items that depend on Radix get their keyboard/ARIA re-implemented by hand.
- Keep the library's state logic, keyboard handling and ARIA. Restyle, but don't rewrite behavior.
- Keep our `sm:`/`lg:` breakpoints. OSUI's "md: only" rule doesn't apply here.
- Licence header at the top of every ported file:
  `// Adapted from <Opensource UI|Arc UI> <ComponentName> (MIT, © 2026 <Bidyut Kundu|Elia Kuratli>).`

---

## Shortlist for planned Quackr sections

Candidates to compare when we get there. Not yet evaluated.

| Section                          | Opensource UI                                   | Arc UI                                                     |
| -------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Nav dropdowns (Numbers, Developers) | `dropdowns/*`                                | `mega-menu-morph` (Pro ✗), `dropdown-menu`, `popover`      |
| Country picker upgrade           | `combobox-field-input`, `phone-field-input`     | `combobox`, `phone-input`, `select`                        |
| SMS / code visuals               | `notifications/*`, `otp-boxed-input`, `mockups/phone` | `toast-stack`, `slot-text`, `text-morph`             |
| Pricing                          | `toggle-pricing-cards`                          | `billing-toggle`, `plan-comparison`, `usage-pricing` blocks |
| Social proof / logos             | `socials/*` testimonial cards                   | `logo-marquee`, `testimonial-stage`, `stats-band` blocks   |
| FAQ                              | none                                             | `faq-section` block, `accordion`                           |
| Footer / final CTA               | `newsletter-form`                               | `site-footer`, `cta-section`, `newsletter-signup` blocks   |
| Dashboard                        | `table/*`                                       | `metric-card`, `usage-meter`, `sortable-data-table`, `filter-toolbar`, `empty-state`, charts |

---

## Adopted

| Component | Source (library → item) | Lives at | Notes |
| --------- | ----------------------- | -------- | ----- |
| SlotText | Arc → `slot-text` | `src/components/ui/slot-text.tsx` | Number, code and price rolls. Shared primitive |
| Logo marquee | Arc → `logo-marquee` | `src/components/sections/works-with.tsx` | Pause button, hidden duplicate list, reduced-motion wrap |
| Stepper marker | Arc → `stepper` (idea only) | `src/components/sections/how-it-works.tsx` | Track per step; the fill follows scroll progress (desktop) or scene playback (smaller screens) |
| Stats band | Arc → `stats-band` | `src/components/sections/stats-band.tsx` | Divided grid; SlotText instead of its counter |
| Tabs | Arc → `tabs` | `src/components/sections/developers.tsx` | Radix removed, keyboard model kept |
| Copy button | Arc + Opensource UI → `copy-button` | `src/components/sections/developers.tsx` | Arc states + live region, OSUI stacked label |
| Code block tokenizer | Arc → `code-block` | `src/components/sections/developers.tsx` | Restrained colours, duck for strings |
| Ink spotlight band | Opensource UI → `background-gradient/dark-carbon-spotlight-background` | `src/components/art/ink-spotlight.tsx` (used by `sections/developers.tsx`) | Static layer stack kept (base radial, top spotlight, vignette, 4px dots), re-coloured to ink with a paper-warm spotlight; added 5% feTurbulence grain, optional faint duck tint, inner hairline. Chosen over `dark-ink-field` (grey blobs) and `dark-midnight-mesh` (grid + teal glows) as the calmest |
| Billing toggle | Arc → `billing-toggle` | `src/components/sections/pricing.tsx` | Radiogroup, sliding pill |
| Pricing cards | Opensource UI → `toggle-pricing-cards` (layout) | `src/components/sections/pricing.tsx` | |
| Chat card | Opensource UI → `socials/discord-chat-card` | `src/components/sections/testimonials.tsx` | Message layout only |
| FAQ + accordion | Arc → `faq-section` + `accordion` | `src/components/sections/faq.tsx` | Radix removed |
| Site footer | Arc → `site-footer` (columns variant) | `src/components/site/footer.tsx` | No newsletter |
| OTP input | Opensource UI → `otp/otp-boxed-input` | `src/components/auth/otp-input.tsx` | Paste fills from box 1 |
| Password strength | Arc → `password-strength` | `src/components/auth/password-meter.tsx`, `validate.ts` | Phosphor eye toggle |
| World coverage map | Arc → `stats-band` (world land mask/map) | `src/components/sections/bento/world-land.ts`, `world-coverage.tsx` | Land mask reused for the coverage tile |
| Identity stack | Opensource UI → `others/stacked-cards-effect` + `users/credit-card-glass` | `src/components/sections/bento/identity-stack.tsx` | Stacked cards, glass card layout |
| Password reveal | Arc → `password-field` (reveal) | `src/components/sections/bento/identity-stack.tsx` | Reveal toggle on the vault row |
| Private SIM tile | Opensource UI → `others/progress-ring-card` + Arc → `switch`, `countdown` | `src/components/sections/bento/private-sim.tsx` | Ring, auto-renew switch, rental countdown |
| Phone field (display) | Arc → `phone-input` (closed field) | `src/components/art/phone-field.tsx` | Display-only, prop-driven: one shell, country trigger behind a hairline divider, flag layer that rolls in list direction, faint guide in the country's shape. Fixed trigger width (no spring). Beat OSUI `inputs/phone-field-input` (static dial prefix, no country) and `inputs/select-field-input` |
| OTP field (display) | Arc → `otp-input` block + Opensource UI → `otp/otp-boxed-input` (filled look) | `src/components/art/otp-field.tsx` | Display-only, no inputs (nothing in the art can take focus). Arc's single ring that glides slot to slot, digits rise and unblur; OSUI's duck-soft filled slots. `auth/otp-input.tsx` not reused because it renders real inputs |
| Form button (display) | Arc → `button` | `src/components/art/form-button.tsx` | Display-only `<span>`. Disabled keeps its outline and fades only the label (no grey slab); label crossfade. OSUI `buttons/*` are decorative (3D, neumorphic, latch), not a quiet form submit |
