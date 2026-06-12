# UI Context

## Theme

The product ships with **both light and dark themes**, exact mirrors of each other — same layout, same spacing, same sizing, same radii. Only the color tokens swap.

The design direction is **Jade**: green-tinted graphite neutrals with a jade accent. The concept — every neutral in the system carries a subtle green undertone (never pure gray), which is what makes the UI read as designed rather than generated. The accent is a single jade green used sparingly: CTAs, active states, and icons — never large fills. The image being worked on is always the brightest, most prominent thing on screen; chrome stays quiet and tinted so the user's content is the focus.

Anti-vibe-coded signatures (non-negotiable):

- **Tinted neutrals only** — no pure grays (`#888`-style values) anywhere; every neutral comes from the green-tinted ramp below.
- **Sharper cards** — cards use 8px radius, not the soft-default 12px.
- **Mono metadata** — structural details (file sizes, dimensions, formats, counts, kicker labels, "soon" badges) render in the mono font at 11–12px. UI prose stays in sans.
- **Accent discipline** — jade appears only on interactive/active elements; success states share the jade family, so the accent never fights a second green.

### Theme switching

- Dark is the default. The theme is controlled by a `data-theme` attribute on `<html>` (`data-theme="dark"` or `data-theme="light"`).
- The engine is `next-themes` (already in the codebase), configured with `attribute="data-theme"`, `defaultTheme="dark"`, and system-preference detection on first visit. It persists the choice to localStorage and prevents the flash-of-wrong-theme on load — do not replace it with a hand-rolled provider.
- Every color is a CSS custom property defined twice — once under `:root[data-theme="dark"]` and once under `:root[data-theme="light"]`. Components reference only the variable name, never a raw hex value, so a theme switch never requires touching a component.

## Colors

All components must reference these tokens — no hardcoded hex values anywhere. Token names are identical across themes; only the values differ.

| Role                    | CSS Variable          | Dark      | Light     |
| ----------------------- | --------------------- | --------- | --------- |
| Page background         | `--bg-base`           | `#0E1311` | `#FAFDFB` |
| Surface                 | `--bg-surface`        | `#151C19` | `#EFF4F0` |
| Surface (raised)        | `--bg-elevated`       | `#1B2420` | `#FFFFFF` |
| Hover surface           | `--bg-hover`          | `#1F2A25` | `#E6EDE8` |
| Primary text            | `--text-primary`      | `#EDF4F0` | `#15201A` |
| Secondary text          | `--text-secondary`    | `#BFCBC4` | `#3E4A43` |
| Muted text              | `--text-muted`        | `#7E8E85` | `#6B7A70` |
| Primary accent          | `--accent-primary`    | `#3DDC97` | `#0B8A5C` |
| Accent hover            | `--accent-hover`      | `#5BE7AA` | `#09744D` |
| Accent text (on accent) | `--accent-foreground` | `#05291A` | `#FFFFFF` |
| Border (default)        | `--border-default`    | `#25312B` | `#DEE7E0` |
| Border (strong)         | `--border-strong`     | `#36473E` | `#C6D4C9` |
| Error                   | `--state-error`       | `#FF6B6B` | `#C92A2A` |
| Success                 | `--state-success`     | `#3DDC97` | `#0B8A5C` |
| Warning                 | `--state-warning`     | `#FFB224` | `#B45309` |
| Focus ring              | `--ring`              | `#3DDC97` | `#0B8A5C` |

Notes on the palette:

- Success intentionally shares the accent value — in this system, jade _is_ the positive color. Don't introduce a second green.
- `--accent-foreground` flips between themes: near-black ink on the bright dark-mode jade, white on the deep light-mode jade. Always pair accent fills with this token, never with `--text-primary`.
- Dark mode separates layers with borders and the elevation steps (`base → surface → elevated → hover`); shadows are a light-mode-only device.

Shadows (light theme only; dark relies on borders + elevation tokens):

| Role         | CSS Variable     | Value                                                           |
| ------------ | ---------------- | --------------------------------------------------------------- |
| Card shadow  | `--shadow-card`  | `0 1px 2px rgba(21,32,26,0.06), 0 1px 3px rgba(21,32,26,0.10)`  |
| Modal shadow | `--shadow-modal` | `0 8px 24px rgba(21,32,26,0.12), 0 2px 6px rgba(21,32,26,0.08)` |

## Typography

Fonts:

| Role      | Font       | Variable      | Fallback                  |
| --------- | ---------- | ------------- | ------------------------- |
| UI text   | Geist Sans | `--font-sans` | `system-ui, sans-serif`   |
| Code/mono | Geist Mono | `--font-mono` | `ui-monospace, monospace` |

Mono usage (part of the design identity, not just code display): file sizes, image dimensions, format labels (`PNG · JPG · WEBP`), counts, kicker/eyebrow labels, "SOON" badges, and code-card previews. Mono metadata renders at 11–12px, medium weight, often letter-spaced (`0.05–0.1em`) and uppercase for kickers.

Type scale — every text element uses one of these exact steps. Sizes in px, line-height unitless (px in parens), weight numeric.

| Token       | Size | Line height | Weight | Tracking | Usage                        |
| ----------- | ---- | ----------- | ------ | -------- | ---------------------------- |
| `text-xs`   | 12px | 1.33 (16px) | 500    | 0        | Pills, badges, captions      |
| `text-sm`   | 14px | 1.43 (20px) | 400    | 0        | Body small, secondary labels |
| `text-base` | 16px | 1.5 (24px)  | 400    | 0        | Body, form inputs            |
| `text-lg`   | 18px | 1.44 (26px) | 500    | -0.005em | Card titles, section labels  |
| `text-xl`   | 20px | 1.4 (28px)  | 600    | -0.01em  | Tool page headings           |
| `text-2xl`  | 24px | 1.33 (32px) | 600    | -0.01em  | Sub-hero headings            |
| `text-3xl`  | 30px | 1.27 (38px) | 700    | -0.02em  | Section headings             |
| `text-5xl`  | 48px | 1.1 (53px)  | 700    | -0.02em  | Landing hero (desktop)       |

- Hero scales down to `text-3xl` (30px) on mobile (`< 640px`).
- Mono kicker/metadata sits at 11–12px regardless of context; it never scales with headings.

## Spacing scale

A single 4px-based scale. Every margin, gap, and padding value comes from here — no arbitrary pixel values.

| Token | Value |
| ----- | ----- |
| `0.5` | 2px   |
| `1`   | 4px   |
| `2`   | 8px   |
| `3`   | 12px  |
| `4`   | 16px  |
| `5`   | 20px  |
| `6`   | 24px  |
| `8`   | 32px  |
| `10`  | 40px  |
| `12`  | 48px  |
| `16`  | 64px  |
| `20`  | 80px  |
| `24`  | 96px  |

## Padding conventions

Fixed per component type so spacing is identical everywhere a type recurs.

| Element                 | Padding                                    |
| ----------------------- | ------------------------------------------ |
| Button (md, default)    | `8px` vertical, `16px` horizontal          |
| Button (sm)             | `6px` vertical, `12px` horizontal          |
| Button (lg / CTA)       | `12px` vertical, `24px` horizontal         |
| Input / select          | `8px` vertical, `12px` horizontal          |
| Tool card               | `20px` all sides                           |
| Panel / sidebar inner   | `16px` all sides                           |
| Modal body              | `24px` all sides                           |
| Pill / badge            | `2px` vertical, `10px` horizontal          |
| Page gutter (mobile)    | `16px` left/right                          |
| Page gutter (desktop)   | `24px` left/right                          |
| Section vertical rhythm | `80px` top/bottom between landing sections |

## Sizing

| Element                  | Size                                 |
| ------------------------ | ------------------------------------ |
| Navbar height            | `56px`                               |
| Button height (sm/md/lg) | `32px` / `40px` / `48px`             |
| Input height             | `40px`                               |
| Sidebar width            | `300px` (fixed)                      |
| Tool card min width      | `260px` (grid auto-fills above this) |
| Tool grid gap            | `16px`                               |
| Command palette width    | `560px` max, `90vw` on mobile        |
| Modal width              | `480px` max, `90vw` on mobile        |
| Content max width        | `1200px` centered                    |
| Hero copy max width      | `680px`                              |
| Icon (inline / button)   | `16px` / `20px`                      |
| Avatar (quote card)      | `40px`                               |
| Focus ring               | `2px` solid `--ring`, `2px` offset   |

## Border radius

Sharper than soft defaults — part of the tool-like identity.

| Context           | Class          | Value  |
| ----------------- | -------------- | ------ |
| Inline / small UI | `rounded-sm`   | 4px    |
| Buttons / inputs  | `rounded-md`   | 6px    |
| Cards / panels    | `rounded-lg`   | 8px    |
| Modals / overlays | `rounded-xl`   | 12px   |
| Pills / avatars   | `rounded-full` | 9999px |

(Tailwind's radius scale is remapped to these values in the config; never use Tailwind's default 12px+ radii on cards.)

## Component Library

shadcn/ui on top of Tailwind. Components live in `components/ui/`. Add new components via the shadcn CLI rather than writing from scratch. shadcn's HSL variables are mapped to the token table above in the Tailwind config, so generated components inherit both themes with zero per-component overrides.

## Layout Patterns

- **Landing (`/`)**: single-column scroll, `1200px` max content width, `80px` vertical rhythm between sections — hero, featured tool grid, pill strip, privacy/free-forever section.
- **Directory (`/tools`)**: sticky search input + category chips (top, `56px` below navbar) above a responsive card grid (`260px` min cards, `16px` gap) that live-filters as the user types.
- **Tool page**: full-viewport working area — fixed `300px` control sidebar, fluid center canvas preview, with a breadcrumb at top and a related-tools footer at bottom.
- **Sidebars**: fixed `300px` width with a `1px --border-default` separator and `16px` inner padding.
- **Command palette**: centered overlay, `560px` max width, backdrop blur, opened via Cmd+K.
- **Navbar**: `56px` tall, top bar with a `1px` bottom border, theme toggle on the right; "All tools" links to `/tools`.
- **Tool cards**: icon (jade) → title (sans, text-lg) → description (sans, text-sm, muted) → mono metadata line (11px). Coming-soon tools show a mono `SOON` badge, top-right.

## Icons

Lucide React. Stroke-based icons only, `1.5px` stroke width. Sizes: `16px` inline, `20px` in buttons. Tool-card icons render in `--accent-primary`. Each tool's registry entry carries its own Lucide icon name so the grid, palette, and nav stay consistent.

## Motion

| Interaction        | Duration | Easing                       |
| ------------------ | -------- | ---------------------------- |
| Hover / color      | 120ms    | `ease-out`                   |
| Theme switch       | 200ms    | `ease-in-out` (colors only)  |
| Modal / palette in | 160ms    | `cubic-bezier(0.16,1,0.3,1)` |
| Card lift on hover | 120ms    | `ease-out` (translateY -2px) |

Card hover also steps the border from `--border-default` to `--border-strong`. Respect `prefers-reduced-motion`: disable transforms and shorten transitions to color-only.
