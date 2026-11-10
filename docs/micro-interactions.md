# Micro-interactions map

Every small response the landing page and auth pages give to a pointer, a key, a scroll or a swipe, section by
section. Use it to keep new work consistent and to find what's still missing. Tokens live in
`src/app/globals.css` (Motion block, plus the "Micro-interactions (pass 1)" block at the end), and the motion
presets live in `src/lib/motion.ts`.

Status: **exists** (was already there), **added** (pass 1), **gap** (not done yet). Where a gap sits in a file
someone else owns, it says **owner: other** and gives a concrete fix.

## House rules

1. **Hover arrives fast and leaves slow.** It comes in over `--hover-in` (120ms) and goes out over `--hover-out`
   (180ms), on `--ease-standard`. Write it as `duration-[var(--hover-out)] hover:duration-[var(--hover-in)]`. Hover
   changes colour, border or shadow. The only movement allowed is a lift of 2px or less on cards and a 2px nudge on arrows.
2. **Press is 1px down and instant.** Every button, and anything that acts like one, gets `active:translate-y-px`.
   On touch screens a hover-only effect is never the only feedback. Give it an `active:` twin, or show the
   information without hover (`pointer-coarse:`).
3. **Arrows mean "onward".** A trailing arrow nudges 2px toward where it goes: `.link-arrow` moves it right,
   `.link-arrow-back` moves it left. Leading icons and brand marks stay still (`data-no-nudge`). Ink CTAs that
   navigate carry the arrow (`<ButtonLink arrow>`). Outline and ghost CTAs don't.
4. **One accent flash per event.** Duck flashes only for a code or the decoy, when a code arrives or is copied
   (`.mi-code-flash`, 900ms). Green is only for success or live. Never use both on one event, and never flash on a loop.
5. **Nothing loops off screen.** JS loops are gated by `useInView`, and the marquee pauses when out of view.
   Indicators the user isn't waiting on run once (the typing dots, for example).
6. **A success state says what happened, in words.** Use "Copied", "Signed in (demo)" or "Sent again". It resets
   after about 2s or when the context changes (switching tabs resets "Copied"). A demo control that does nothing
   says so instead of staying silent.
7. **Reveal once and settle once.** Scroll-ins rise 12px over 0.5s on `--ease-enter`, staggered 0.08 to 0.1s:
   heading first, then content. Nothing re-animates when you scroll back. Springs overshoot at most once
   (damping ratio of 0.5 or more), and toggles glide with `bounce: 0`.
8. **Focus is always visible.** Use the global 2px ink ring at a 2px offset. On dark surfaces use
   `focus-visible:outline-white/70`. Fields let the ring settle in, from transparent at a 4px offset to ink at
   2px over 120ms. Never remove the ring.
9. **Reduced motion keeps the same end state with no movement.** Transitions go to none, loops stop, reveals
   render static and springs become `duration: 0`. A colour change may stay.
10. **Optical centring.** Any centred text with tracking of 0.06em or more cancels its trailing tracking with an
    inner span carrying `mr-[-<tracking>]`, e.g. `<span className="mr-[-0.12em]">`. Pills count as centred.
    `<Eyebrow>` already does this. Icon and text pairs use `items-center`, and the icon sits on the text's
    x-height, with no extra gap on one side of a pill.

## Shared pieces

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| `ButtonLink` / `buttonClass` | hover / press / focus | bg or border shift; 1px press; trailing svg nudges 2px | 120 in / 180 out, press instant | press stays (no motion) | exists |
| `ButtonLink arrow` prop | n/a | appends the standard 16px bold `ArrowRight` | as above | n/a | added |
| `.link-arrow [data-no-nudge]` | hover | leading icon stays put | n/a | n/a | added |
| `.link-arrow-back` | hover | back arrow nudges 2px left | 120 / 180 | static | added |
| `.mi-underline` (label span inside `<a>`) | hover, focus-visible, press | 1px underline grows from left | 120 / 180, ease-standard | instant | added |
| `.mi-code-flash`, `.mi-code-panel:has([data-state=copied]) .mi-code-chip` | code arrives / code copied | duck + 3px duck ring settling to the chip's fill | 900ms ease-enter | none | added |
| `<Reveal>` / `<RevealItem>` | scroll into view | 12px rise + fade, once | 0.5s ease-enter, -12% margin | static | exists |
| `<SlotText>` | value change | digit reels roll | 0.7–1.3s, no overshoot | static swap | exists |
| `<SnapRail>` (ui, owner: other) | swipe / dot tap | snap-x, next card peeks, dots track active | dot width 260ms | `scrollTo` auto | exists. Dot buttons are `h-11` (44px) with `-my-2.5`, so the row keeps its 24px visual height: added. |

## Nav (`site/nav.tsx`, owner: other)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Header bar | scroll > 8px | paper backdrop, hairline, height 64→56 | 260ms | colour change only | exists |
| Active section pill | scroll | shared-layout pill glides between links | `smooth` spring | instant | exists |
| Links | hover | ink-2 → ink | 120 / 180 | n/a | exists |
| "Get a number" | hover / press | bg darkens; trailing 14px `ArrowRight` nudges 2px (`buttonClass`) | 120 / 180 | static | added (arrow) |
| Menu toggle | hover / press | ink/4% bg, 1px press + ink/6%; List and X cross-fade with a 90° rotate | 120 / 180, press instant; swap 160ms | fade, `duration: 0` | added |
| Mobile menu links | tap / open / close | rows press to `bg-ink/[0.04]`; focus moves to the first link on open and back to the toggle on close; body scroll locked while open (released if the viewport grows to lg) | press instant | n/a | added |

## Hero (`hero/*`, owner: other)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Copy rise-in | first paint | CSS `hero-in`, staggered 80ms | 0.6s ease-enter | none | exists |
| Live chip link | hover | border + text darken, arrow 2px right | 120 / 180 | static | exists |
| CountryPicker trigger | hover / open | paper bg; caret rotates 180° | 120 / 180; caret 260ms | n/a | exists. **Gap, owner: other:** no press state. Add `active:translate-y-px`. |
| CountryPicker list | open / pointer / keys | `panel-in` 120ms; active row paper bg | 120ms ease-enter | n/a | exists. **Gap, owner: other:** it closes without an exit animation. Add a 100ms fade on close, or accept the asymmetry. |
| Picker CTA | hover / press | `btn-ink` + `link-arrow` | as button | n/a | exists |
| Popular country pills | hover / press | border darken, 1px press | 120 / 180 | n/a | exists. Hit area is 44px tall via an invisible `after:-inset-y-1.5`; visual stays 32px: added. |
| "Or try a free number" | hover / focus / press | ink-2 → ink; `.mi-underline` grows from left; arrow nudges | 120 / 180 | instant underline | added |
| `CopyNumber` | click | success: duck-soft fill, check + "Copied"; failure: danger edge, warning icon + "Press ⌘C" (SR: "Could not copy … Press Command C"); 1px press | 1.6s reset (2.2s on error); timer cleared on re-click and unmount | n/a | added (honest error, `writeClipboard` fallback, timer cleanup) |
| Phone demo refresh | press | icon rotates 180° | 260ms | n/a | exists. Hit area is 44px via an invisible `after:-inset-1.5`; visual stays 32px: added. |
| Duck "quack" bubble | hover | speech bubble | n/a | n/a | **gap, owner: other.** Hover only. Trigger it on tap too (`onPointerDown`), or once in view. |

## Works with (`sections/works-with.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Marquee | always | 40s linear loop; hover pauses | linear | wraps static, centred | exists |
| Marquee off screen | leaves viewport | loop pauses (`useInView`) | n/a | n/a | added |
| App chips | hover / press | border darkens, glyph and name go ink | 120 / 180 | n/a | exists (hover), added (`active:` twin) |
| Pause / Play pill | press | 1px press, icon swaps, polite "Motion paused" | instant | hidden (no motion to pause) | exists |
| Centred eyebrow and pill label | n/a | trailing tracking cancelled | n/a | n/a | added (rule 10) |

## Problem (`sections/problem.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Heading, columns, closer | in view | reveal; columns stagger 0.1 | 0.5s | static | exists |
| Icon circle | hover / tap | 2px lift, border-strong | 120 / 180 | no lift | exists (hover), added (`group-active:` twin) |
| Glyph wiggle | pointerenter (fires on tap too) | one small wiggle | 0.5s ease-standard | none | exists |
| Mobile rail | swipe | `SnapRail`; columns become cards below md | snap | auto scroll | added |

## How it works (`sections/how-it-works.tsx`, owner: other)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Active step | scroll-linked | duck-deep rule fills; number and title go ink | `smooth`; colours 260ms | instant | exists |
| Steps | in view | stagger reveal | 0.08 | static | exists |
| DecoyFlow travellers | n/a | n/a | n/a | n/a | removed: the section now uses `SignupSwap`; `art/decoy-flow.tsx` and the `.flow-*` CSS are deleted. |
| "~5s" stat | in view | `SlotText` rolls `~0s` → `~5s` once (SSR renders `~0s`, deterministic) | 0.9s | static `~5s` | added |
| CTAs | hover / press | button + arrow | as button | n/a | exists |

## Product bento (`sections/product-bento.tsx`, `bento/*`, `art/*`, owner: other)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Tiles | hover | 2px lift + card shadow | 120 / 180 | no lift | exists. **Gap:** no touch twin. Add `active:-translate-y-0.5 active:shadow-[var(--shadow-card)]`. |
| "Learn more" | hover / focus / press | `.mi-underline` grows from left, arrow nudges | 120 / 180 | instant underline | added |
| Flag stack spread, renew icon spin, vault row lift | tile hover | spread / -180° / lift | 120–260ms | static | exists. **Gap:** hover only. On `pointer-coarse`, trigger once in view (`useInView` → `data-on`), or on `group-active`. |
| Public inbox, Terminal, OtpChip | in view | live loops | gated by `useInView` | static | exists |

## Stats band (`sections/stats-band.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Numbers | in view | SlotText roll from zeros, staggered 0.12s | 0.9s+ | static values | exists |
| Cells | in view | stagger reveal | 0.09 | static | exists |
| Cell hover | hover | ink/2% tint; delivery cell duck-soft deepens | 120 / 180 | colour only | added |
| Detail line | hover (fine pointer); always shown (coarse) | mono detail rises 4px and fades in: "Rated 4.8 out of 5", "Refunded if no code arrives", "US, UK, DE, SE and more", green dot + "Live now" | 120 / 180 | fade only | added |

## Developers (`sections/developers.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Tabs | click / arrows / Home / End | shared pill glides; panel slides in the travel direction | `snappy`; panel `smooth` | fade 80ms | exists |
| Tabs focus | keyboard | white/70 ring (the ink ring was invisible on ink) | instant | n/a | added |
| Tabs touch | press | white/80 text; height 40 → 44px | instant | n/a | added |
| Copy button | click | icon morphs, label stack swaps, polite status, 1.8s reset | 160ms | instant | exists |
| Copy button focus / press | keyboard / touch | white/70 ring; white/8% bg on press | instant | n/a | added |
| Copied → code chip | copy succeeds | `482917` chip flashes duck once (`:has()`) | 900ms ease-enter | none | added |
| Copy reset on tab switch | tab change | CopyButton keyed by snippet, so "Copied" never labels the wrong code | n/a | n/a | added |
| Error state | clipboard refused | danger icon, "Failed", polite "Could not copy the code" | 1.8s | instant | exists |
| "Get an API key" | hover | arrow nudge | 120 / 180 | n/a | added (`arrow`) |

## Pricing (`sections/pricing.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Heading, toggle | in view | reveal | 0.5s, toggle +0.06s | static | added |
| Billing toggle | click / arrows | thumb glides; "Save 20%" rewrites to "You save $24" | spring 0.34s, bounce 0 | instant | exists |
| Prices | billing change | SlotText reels | 0.7s, stagger 0.06 | static | exists |
| Note line | billing change | blur-swap "Billed monthly" ↔ "Billed $95.88 yearly" | 0.22 / 0.14s | instant | exists |
| Struck monthly price | switch to yearly | `$9.99` struck through fades in beside "/mo" (only on plans whose price drops); SR reads "was" | 0.22s after 0.2s | fade only | added |
| Plan cards | hover | 2px lift; non-popular get border-strong + card shadow | 120 / 180 | no lift | added |
| Layout | n/a | Free, then Private number (popular, centre, raised 8px on md+), then Single use | n/a | n/a | added |
| Plan CTAs | hover / press | button states; the ink CTA gets the arrow | as button | n/a | exists, arrow added |
| Mobile rail | swipe | `SnapRail initial={1}`: opens on the popular plan with Free peeking | snap | auto | added |
| "Most popular" pill | n/a | trailing tracking cancelled | n/a | n/a | added (rule 10) |

## Testimonials (`sections/testimonials.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Heading + rating | in view | reveal | 0.5s | static | added |
| Typing dots | list in view | per message: avatar + "typing…" bubble, three dots brighten in turn once, then hand over to the message | 0.45s window, 0.62s between messages | none (static list) | added |
| Bubble arrival | after its dots | rise from its own side, small scale | spring 380/30 | static list | exists (retimed) |
| Code chip (Tomás) | its bubble arrives | one duck flash | 900ms after arrival +0.15s | none | added |
| Bubble tilt | hover / press | tilt straightens to 0° | 120 / 180 | instant | added |
| Mobile | n/a | tilt is 60% below sm; figure `min-w-0`; chip wraps | n/a | n/a | added |

## FAQ (`sections/faq.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Heading column, list | in view | reveal (inside the sticky column, so it still sticks) | 0.5s, list +0.08s | static | added |
| Question row | hover | text dims to ink-2 | 120 / 180 | n/a | exists |
| Plus circle | hover / press | edge goes ink/30, glyph goes ink; 1px press | 120 / 180, press instant | n/a | added |
| Plus → × | open | rotates 45°, fills ink | `snappy` | instant | exists |
| Panel | open / close | height spring + fade, answer settles 6px | `smooth` | instant | exists |
| Keyboard | arrows / Home / End | moves between questions | n/a | n/a | exists |
| "Read the API docs" inline link | hover | decoration-colour transition | 120 / 180 | n/a | added (was a snap) |
| "Still stuck? Talk to us" | hover | underline + arrow nudge | 120 / 180 | n/a | exists |

## Final CTA (`sections/final-cta.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Headline | in view | reveal | 0.5s | static | exists |
| CountryPicker | in view | reveal, 0.1s after the headline | 0.5s | static | added |
| Phone | scroll-linked | rises 40px → 0 out of the clouds | scroll | static | exists |
| OtpChip | in view | code rolls | 2.6s | static | exists |
| Mobile CTA hand-off | section on screen | `data-mobile-cta-hide`: the sticky bar steps aside | 0.2s | instant | added |

## Footer (`site/footer.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Column links | hover / focus / press | ink-2 → ink + underline grows from left | 120 / 180 | colour only | added (underline) |
| Status link | hover | ink + underline grow; live dot pings | 120 / 180 | no ping | exists, underline added |
| Live dot | always | CSS ping loop | 1.8s | none | exists. **Gap, owner: other (globals):** the loop also runs off screen. It's compositor-only and cheap, so accepted for now. |

## Mobile CTA (`site/mobile-cta.tsx`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Bar | scroll > 600px | slides up; slides away over pricing, the final CTA and the footer | 0.32s in / 0.2s out | instant | exists, final CTA added |
| Button | press | ink-hover fill + 1px down; arrow via `arrow` | instant | n/a | added (fill) |

## Auth (`/login`, `/signup`, `components/auth/*`)

| Element | Trigger | Feedback | Timing/easing | Reduced-motion | Status |
| --- | --- | --- | --- | --- | --- |
| Text fields | hover / focus | border-strong; focus ring settles (transparent at 4px → ink at 2px), border ink/40; invalid ring goes danger | 120 / 180 | instant ring | added (focus) |
| Field error | invalid on blur / submit | row opens with icon, `aria-describedby` | 0.2s ease-enter | fade | exists |
| Password eye | press | 1px press, ink | instant | n/a | added |
| Password meter | typing | segments fill as a wave; label swaps | `smooth` | instant | exists |
| Terms checkbox | check | check scales 75% → 100% + fades; edge darkens on press | 120ms ease-enter | instant | added |
| Google button | click | polite note: "Google sign-in isn't connected in this demo. Use email below." | `panel-in` 180ms | none | added (it used to do nothing) |
| Google G | hover | stays put (no nudge) | n/a | n/a | added |
| Submit (MorphSubmit) | submit | label → spinner → check, all in words | 0.22s | fade | exists |
| "Forgot password?" | click | demo note fades in | `panel-in` 180ms | none | added (it used to snap) |
| OTP boxes | focus / type / paste / wrong code | focused box scales 1.04 + ink border; filled boxes duck-soft; wrong code shakes once + danger | 120 / 180; shake 0.45s | no scale, no shake | exists |
| "Use a different email" | hover / press | back arrow nudges left; 1px press | 120 / 180 | static | added |
| Resend | countdown → click | "Sent again. Resend in 0:30" | 1s ticks | n/a | exists |
| Step indicator | step change | current segment stretches (layout) | `snappy` | colour only | exists |
| "You're in" duck | step 3 | spring pop, retuned to one overshoot (damping 14 → 20) | spring | static | added (retune) |
| Brand panel inbox | in view | new SMS every 3s, latest code duck then soft | 3s; 0.45s rows | static list | exists |
| Uppercase pills (Free plan, Decoy number ×2, "or") | n/a | trailing tracking cancelled | n/a | n/a | added (rule 10) |

## Mobile (375px)

Rails are for rows of big, equal things you compare side by side (plans, problem cards, bento tiles). Short,
scannable content stays stacked or wrapped. Thumb reach means a primary CTA sits in the lower half of the screen
or on the sticky bar.

| Section | Layout at 375 | Touch targets | CTA thumb reach | Hover-only → touch equivalent | Rail? | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Nav (other) | logo + "Get a number" + menu | toggle 44px; CTA `sm` is 36px tall | top bar, out of easy reach; the sticky mobile CTA covers it | n/a | no | **gap, owner: other.** "Get a number" `sm` is 36px. Make it `h-11` below sm, or rely on the mobile CTA. |
| Hero (other) | stack: chip, headline, picker (stacked), pills, phones | pills and refresh 32px visual, 44px hit area | picker CTA is above the fold, mid-screen: OK | duck quack is hover only | no | pills and refresh: added. **Gap, owner: other:** quack on tap. |
| Works with | marquee, 44px chips | pause 44px | n/a | chip hover → `active:` | already a horizontal loop | done |
| Problem | `SnapRail`, 84% cards, dots | n/a | n/a | lift → `group-active:` | **rail** | added |
| How it works (other) | stack: art, then 3 steps, then CTAs | CTAs `lg` 48px | CTAs after the steps: OK | none | no, steps read vertically | **owner: other.** Fine as is. Consider stacking CTAs full-width below sm. |
| Product bento (other) | 1-column stack of 5 tall tiles | "Learn more" 44px | n/a | tile lift, flag spread, renew spin are hover only | **should be a rail** | **gap, owner: other.** Wrap the tiles in `<SnapRail label="Products" className="md:grid ...">` below md, and trigger the tile hover effects on in-view under `pointer-coarse`. |
| Stats band | 2x2 grid | n/a | n/a | detail line always shown on coarse pointers | no: four short cells scan better as 2x2 than as a swipe | added |
| Developers | stack: copy, then code panel; `pre` scrolls sideways inside the panel | tabs 44px, copy 44px | CTAs above the panel: OK | none | no | added (tabs to 44px) |
| Pricing | `SnapRail initial={1}`: opens on Private number, Free peeks on the left | toggle 44px, CTAs 48px | CTA sits at the bottom of each card: OK | card lift is desktop only (the CTA carries the press) | **rail** | added |
| Testimonials | vertical conversation, bubbles up to 287px, tilt 60% | n/a | n/a | tilt straightens on press | no, a conversation reads down | added |
| FAQ | stack; heading not sticky | rows 68px+ | contact link 44px | circle press | no | done |
| Final CTA | stack: headline, picker, phone in clouds | picker 48px | picker mid-screen; the sticky bar steps aside here | n/a | no | added |
| Footer | brand, then a 2-column link grid (`grid-cols-2 sm:grid-cols-4`) | links 44px below sm | n/a | underline grows on press | no | exists |
| Mobile CTA | fixed bottom bar, safe-area padding | 48px | best thumb reach on the page | press fill | n/a | added |
| Auth | single column; the brand panel is hidden below lg (layout) | fields 48px, eye 44px, checkbox row 44px | submit full width, low on screen | n/a | no | done |

## Top gaps left (owner: other)

1. **Product bento on mobile:** move the 5-tile stack into a `SnapRail`, and give the hover-only tile effects an in-view or press twin on touch.
2. ~~**Nav "Get a number":** trailing arrow, menu toggle press + tokens + List→X crossfade, row press, focus management, scroll lock.~~ added
3. ~~**`CopyNumber`:** honest error state and timer cleanup.~~ added
4. **Touch targets under 44px:** hero country pills, the phone-demo refresh and the `SnapRail` dots: added. Still a gap: the nav `sm` CTA (36px).
5. **Loops off screen:** DecoyFlow is removed, so its travellers are gone (added). The live dot is still accepted for now.
6. ~~**Underline consistency:** "Or try a free number" (hero) and bento "Learn more" on `.mi-underline`.~~ added
7. ~~**How-it-works "~5s":** rolls in with `SlotText`, like the stats band.~~ added
