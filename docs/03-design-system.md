# Design system

The rules SubTrack's interface follows, so every screen looks like it belongs
to the same app.

**The visual document is a PDF:** [assets/design-system.pdf](assets/design-system.pdf),
with swatches, type samples, components and their states. It was made before
building, when the app was still called SubAlert. This page records the same
rules and what changed since.

**In code,** every value lives once in
[`client/src/styles/tokens.css`](../client/src/styles/tokens.css) as a CSS
custom property (`--color-*`, `--font-size-*`, `--space-*`). Each component has
its own CSS Module (for example `Button.module.css`) that reads only those
variables, never a raw hex or pixel value. Changing one line in `tokens.css`
restyles the whole app. Dark mode is one more block in the same file.

## Colour

Five colours, plus three neutral greys. **Teal** means "you're in control"
(buttons, links, selected states). **Orange-red** has one job: something is
about to charge you, or something went wrong.

| Name in code | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--color-primary` | `#0E6E5C` | `#4FB79C` | buttons, links, selected states, focus |
| `--color-accent` | `#C2410C` | `#FF8F63` | "Urgent" and "Soon", errors |
| `--color-bg` | `#F5F7F8` | `#12161B` | page background |
| `--color-surface` | `#FFFFFF` | `#1A1F26` | cards, header, inputs |
| `--color-text` | `#1A1D21` | `#E8EDF2` | body text and headings |
| `--color-text-muted` | `#5A6470` | `#A7B2BE` | labels, captions, footer |
| `--color-border` | `#8A949E` | `#6C7986` | input and button outlines |
| `--color-divider` | `#E3E7EA` | `#2A323B` | card edges, row lines |
| `--chart-1` | `#00876a` | `#22a882` | the 12-month chart (a more vivid step of the teal, checked for colour blindness) |

Service icons use a soft tint with a dark icon of the same hue (blue, green,
orange, red, purple, grey), defined as `--icon-*-bg` and `--icon-*-fg`.

### Contrast (WCAG AA: 4.5 : 1 for text, 3 : 1 for UI parts)

| Pair (light theme) | Contrast | |
| --- | --- | --- |
| Text on page background | 15.7 : 1 | pass |
| Muted text on a card | 6.0 : 1 | pass |
| White on teal (buttons) | 6.2 : 1 | pass |
| Teal on page background (links) | 5.7 : 1 | pass |
| Orange-red on a card (urgent dates, errors) | 5.2 : 1 | pass |
| White on orange-red (Urgent badge) | 5.2 : 1 | pass |
| Input outline on a card (not text) | 3.1 : 1 | pass (3 : 1) |

**Dark theme:** every text pair is at least **6.8 : 1**, and input outlines are
**3.7 : 1**.

## Type

One font, **Inter** (Google Fonts), falling back to the system sans-serif.

| Name in code | Size | Weight | Used for |
| --- | --- | --- | --- |
| `--font-size-lg` | 24px | 700 | page titles, card numbers |
| `--font-size-md` | 16px | 400 (600 for service names) | body text, inputs, service names, prices |
| `--font-size-button` | 14px | 600 | button labels (to fit phone headers) |
| `--font-size-sm` | 13px | 400–500 | form labels, badges, pills, errors, footer |

## Spacing and sizes

Everything is a multiple of **8px**.

| Name in code | Value | Used for |
| --- | --- | --- |
| `--space-1` | 8px | label to input, icon to text, between pills |
| `--space-2` | 16px | inside cards and rows, between fields, phone screen edge |
| `--space-3` | 24px | between cards, auth card padding |
| `--space-4` | 32px | between sections, desktop screen edge |
| `--radius` | 8px | corners (pills are fully round) |
| `--control-height` | 40px | every button and input: easy to tap |
| `--content-max` | 1120px | widest the content gets on desktop |
| `--bottom-nav-height` | 60px | the phone's bottom bar |

**Breakpoints:** phone styles are the default; **640px** and up is the
desktop layout (with a tablet tab row below **1024px**). Tested down to 375px
wide, with no sideways scrolling.

## Components and their states

| Component | Normal | Hover | Focused | Disabled | Loading |
| --- | --- | --- | --- | --- | --- |
| **Button** (primary, secondary, danger) | teal fill, or outlined | slightly darker | 3px teal ring | faded, "progress" cursor | spinner before the label, disabled so it can't be sent twice |
| **FormField** (input + label + error) | grey outline | — | 2px teal edge with a soft glow; orange-red when there's an error | — | — |
| **Password field** | dots, with a Show button | — | same glow | — | — |
| **DecisionToggle** (Keep / Cancel / Undecided) | outlined | light background | 3px teal ring | — | — |
| **Pill** (filters) | outlined, with a count | light background | 3px teal ring | — | — |
| **SubscriptionRow** | a row on desktop, a card on phones; a stripe for Urgent/Soon | light background, clickable | ring on its buttons | "Ended" rows are faded | — |

**Focus is never removed without a replacement:** every button, link, pill and
toggle shows a 3px teal ring when reached with the keyboard (`:focus-visible`),
and inputs show the teal glow instead.

**Motion** is short and always eases out (`--duration-fast` 120ms, `--duration`
200ms, `--duration-slow` 320ms). All of it switches off for people who ask
their device for reduced motion.

## States: loading, empty, error, data

| State | What it looks like |
| --- | --- |
| **Loading** | grey placeholder shapes in the page's own layout, gently shimmering, so nothing jumps when data arrives. Screen readers hear "Loading your subscriptions…" |
| **Empty** | a dashed card with one sentence and a "+ Add subscription" button (see [02-mockup.md](02-mockup.md)) |
| **Error** | the message in orange-red with a "Try again" button; form errors sit under their field, and the cursor moves to the first problem |
| **Data** | the normal screen |

## What changed since the PDF

- **Name and logo:** SubAlert became **SubTrack**, and the plain teal square
  became the logo drawn by my girlfriend.
- **Dark mode** was added: one block in `tokens.css` that changes only the
  colours.
- **Charts** got their own colour (`--chart-1`), because the brand teal was too
  muted for a chart.
- **Focus on inputs** changed from an outline to a teal edge with a soft glow,
  still clearly visible.
- **Phone navigation** moved to a bottom bar (`--bottom-nav-height`).
- **Buttons** got a loading spinner.
