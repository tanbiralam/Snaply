# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress — repositioning into the multi-tool suite.

## Current Goal

- Units 1–3.5 complete. Next is Unit 4 (/tools directory).

## Completed

- **Edit: Redact & Blur tool** (2026-06-21)
  - New tool at `/edit/redact` (registry flipped `soon` → `live`). Server `page.tsx` (registry-derived metadata) + client `RedactEditor.tsx`.
  - Self-contained canvas tool, zero new deps: pixelate (downscale→upscale, smoothing off), blur (`ctx.filter`), and solid black bar. Each drawn region snapshots the active mode+strength, so styles can be mixed; undo/clear/replace supported.
  - Two stacked canvases at natural resolution: a **work canvas** (baked redactions, the only thing exported) and an **overlay canvas** (region outlines + live drag rect, never exported). Pointer coords mapped display→natural via `getBoundingClientRect`. Export = `workCanvas.toBlob` → PNG download. Reuses `ImageUpload` + paste handler.
  - Deliberately did NOT extract a shared `lib/canvas/` pipeline — redact shares nothing with the screenshot pipeline; marked with a `ponytail:` comment to extract when a second consumer needs it.
  - No localStorage persistence yet (only mode+strength would persist; deferred). Verified: typecheck passes; browser verification pending.

- **Editor: reset style + editable browser URL** (2026-06-20)
  - `ScreenshotEditor` action bar (both image and code modes) gained a **Reset** button → restores `defaultSettings` and clears the active preset (image/code content preserved).
  - Browser device frame address bar is now editable. Added `browserUrl: string` to `StyleSettings` (default `"yoursite.com"`, replacing the hardcoded `snaply.app`); `drawDeviceFrame` takes an optional `browserUrl` param and renders `🔒  {url}` (lock-only when blank). Text input in `DeviceTab` shown only when the browser frame is active. Marketing rationale: hardcoding our domain into user exports hurts the user and isn't real brand exposure; attribution should be a separate optional watermark.

- **Landing visual polish** (2026-06-20)
  - `HeroVisual` rewritten to use real product imagery (`public/landing/hero-before.png` 1496×960, `hero-after.png` 3376×2304) via `next/image` (first use of next/image in the app; `priority` + `sizes` cap the 3.4MB after-PNG). Replaced the gray `MockWindow` before/after — now an overlapping editorial composition: styled "after" dominant, flat "before" tucked tilted (`-rotate-3`) into the corner. A wipe-slider was rejected because the two images aren't co-framed (the after reframes the screenshot onto a backdrop) so content would jump.
  - Visual texture: subtle CSS dot grid (`radial-gradient(hsl(var(--border)) 1px, transparent 1px)`, 22px) on the page root in `src/app/page.tsx` — theme-aware, no asset/dep. Runs uniformly across all sections; section-level `bg-secondary` bands were tried then removed because they covered the dots and read as inconsistent. Cards/panels (`bg-card`) inside sections are kept as raised surfaces over the dots.
  - `MockWindow` still used by the spotlight preset tiles (abstract style swatches — acceptable there). Typecheck passes.

- **Unit 3.5 — Landing page expansion** (2026-06-13)
  - New landing sections in `src/components/landing/` (all server components, zero image assets, DOM-composed and theme-aware): `MockWindow` (reusable mock app window), `HeroVisual` (BEFORE/AFTER illustration — flat window vs jade-gradient backdrop with padding/radius/`shadow-modal`), `HowItWorks` (3 mono-numbered steps), `StylizerSpotlight` (two alternating rows: preset tiles labeled with real preset names imported from `src/types/presets.ts` by id — Aurora, Glassmorphism, Sunset — and a non-functional token-styled mock settings panel; CTA `Open {tool.name}` → `toolPath`), `PrivacyComparison` (upload→their-server→download flow vs in-tab browser frame with accent border; the 3 value props as compact items beneath), `Faq` (6 native `<details>` items + FAQPage JSON-LD generated from the same array), `FinalCta`.
  - Final page order verified in rendered HTML: navbar → hero + visual → how it works → featured grid → pill strip → spotlight → privacy comparison → FAQ → final CTA → footer.
  - Claims kept truthful: 2x export verified against `CanvasRenderer.exportImage` (scales ×2); preset names resolve from the presets module so renames flow through; no statistics, testimonials, or badges.
  - Verified: build passes; smoke test confirms ascending section order, valid FAQPage JSON-LD (6 questions matching the rendered `<details>`), preset names in copy; greps confirm tool names only in the registry, branding only via `site.ts`, no hex/raw grays in the new components.

- **Unit 3 — Landing page rebuild** (2026-06-13)
  - Carry-over fixes: `Tool.featured?: boolean` + `getFeaturedTools()` added to the registry (featured = screenshot, redact, remove-background, compress); theme provider switched to `defaultTheme="system"`; `src/lib/site.ts` created as the single branding source (`{ name, tagline, description, url }`).
  - `/` rebuilt registry-driven in both themes: navbar (56px, "All tools" → `/#tools` until unit 4), hero (text-5xl/3xl, max 680px, "Browse tools" accent CTA → `#tools`, ghost CTA → screenshot tool), featured grid (`id="tools"`, exactly 4 cards from `getFeaturedTools()`, 260px auto-fill, card anatomy per ui-context with mono metadata + SOON badges), pill strip (the 6 non-featured tools, all currently soon/non-interactive), privacy/free-forever 3-prop section, registry-generated footer (3 category columns, soon tools unlinked).
  - New shared shell components: `Navbar`, `Footer`, `ToolCard`, `ToolPill`, `ToolIcon` (icon-name → Lucide resolver map). Card hover: border → strong, −2px lift via `motion-safe:`, 120ms ease-out.
  - Tailwind tokens added per ui-context scales: full `fontSize` remap (sizes/line-heights/tracking, plus `2xs` 11px for mono metadata), `borderColor.strong`, `transitionDuration` 120/160, `maxWidth.content` (1200px) / `maxWidth.hero` (680px), `gridTemplateColumns.tools`, `colors.primary.hover` (← `--accent-hover`).
  - Root metadata now generated from `site.ts` with a `%s — name` title template; the screenshot page title is just the registry tool name. The product name appears in code only in `site.ts` (editor header and ShareMenu share-text now read `site.name`).
  - Legacy landing deleted: `src/components/landing/*` (9 components), `NavLink.tsx`, EB Garamond import, `--font-serif`, `.font-serif-display`, and all orphaned decorative utilities/keyframes (`bg-paper-glow`, `bg-gradient-canvas*`, `shadow-soft/frame`, `reveal*`, compare/float animations). `.hairline` kept (editor uses it).
  - Verified: build passes; prod smoke test confirms exactly 4 featured cards, 9 SOON markers (3 cards + 6 pills), all 10 tool names registry-rendered, `#tools` anchor, `/create/screenshot` links, EB Garamond gone, OG site name from config.

- **Unit 2 — Jade theme implementation** (2026-06-13)
  - `src/index.css` now defines the full Jade token set from `ui-context.md` — all 16 color tokens as hex CSS custom properties plus `--shadow-card`/`--shadow-modal` — under `:root[data-theme="dark"]` (also bare `:root`, so dark is the no-JS fallback) and `:root[data-theme="light"]`.
  - shadcn's HSL variable layer (`--background`, `--card`, `--primary`, `--border`, `--ring`, etc.) is mapped from the Jade palette in HSL-triplet form under both selectors; `src/components/ui/` untouched and inherits both themes. Added a `--warning` HSL var + Tailwind `warning` color for the existing amber UI states.
  - `next-themes` reconfigured: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`; Tailwind `darkMode` switched to `["selector", '[data-theme="dark"]']`. `ThemeToggle` now toggles off `resolvedTheme` (correct when the stored theme is "system").
  - Radius remap: `--radius: 0.5rem` → `rounded-sm` 4px, `md` 6px, `lg` 8px (cards), `xl` 12px.
  - Fonts: Geist Sans/Mono via the `geist` package (next/font), exposed as `--font-sans`/`--font-mono` and wired through Tailwind's `fontFamily`. Poppins/Fira Code Google imports removed; EB Garamond kept only for the legacy landing serif (removed in Unit 3).
  - Color sweep (scoped, color-substitution only): indigo active states in `DevicePreviewSVG` → `--primary`; amber classes in `DeviceTab`/`DeviceCard` → `warning` token; `text-green-500` checks in `ShareMenu` → `text-primary` (success = jade); pure-gray rings in `StylePresets`/`CodeSettingsTab` → `ring-border`; X-share gray hover → `bg-foreground/10`; `index.css` decorative gradients (`bg-paper-glow`, `bg-gradient-canvas{,-soft}`) re-pointed at accent tokens. Light-theme shadow ramp re-tinted to jade ink (no pure black).
  - Theme switch transitions colors at 200ms ease-in-out via a zero-specificity base rule (explicit transition utilities still win); a global `prefers-reduced-motion: reduce` block kills transitions/animations.
  - Canvas/export content intentionally NOT swept: style presets, device-mockup pixel colors, code themes, traffic-light dots, and the landing's mock-screenshot depictions are exported/depicted content, not UI chrome.
  - Verified: `npm run build` passes; prod-server smoke test confirms the no-flash `data-theme` script, Geist font variables, Jade tokens + both theme selectors in compiled CSS, and the `/editor` 308 redirect.

- **Unit 1 — Route restructure + tool registry** (2026-06-13)
  - Moved the screenshot editor from `/editor` to `/create/screenshot`. The page is split into a server `page.tsx` (registry-derived metadata) and the unchanged client editor (`ScreenshotEditor.tsx`); no editor logic, state, or styling was modified.
  - Added a permanent redirect `/editor` → `/create/screenshot` via `redirects()` in `next.config.mjs`.
  - Scaffolded category folders `src/app/create/`, `src/app/edit/`, `src/app/optimize/`, each with a minimal pass-through `layout.tsx` (breadcrumb + related-tools shell deferred to a later unit; marked with TODO).
  - Created `src/lib/registry/tools.ts` — the single tool registry with the `Tool` interface (`slug, category, name, description, keywords, icon, status`), all 10 tools (`screenshot` is `live`, the other 9 are `soon`), `CATEGORY_LABELS`, and helpers (`toolPath`, `getTool`, `getToolsByCategory`, `getLiveTools`).
  - Updated the three landing links (`Hero`, `Nav`, `CTA`) from `/editor` to `/create/screenshot`.
  - `npm run build` passes with no type errors.

## In Progress

- None.

## Next Up

- Unit 4 — `/tools` searchable directory (then repoint the navbar "All tools" link from `/#tools` to `/tools`).

## Open Questions

- **Branding mismatch**: `project-overview.md` names the product **Pixltly**, but the codebase (layout metadata, landing copy, editor header) still says **Snaply**. Unit 1 kept existing branding untouched; a later unit should resolve which name ships and update metadata/copy accordingly.
- The current editor includes a built-in "Code" mode (mode toggle in its header). The registry lists Code Card as a separate `soon` tool at `/create/code`. When `/create/code` is built, decide whether the screenshot editor's code mode is removed or redirected.

## Architecture Decisions

- **Unit-2 open questions closed as decisions (unit 3)**:
  - Theme default is `system` — system preference wins on first visit; the toggle persists an explicit choice.
  - Jade hex tokens that collide with shadcn variable names stay suffixed: `--accent-foreground-token`, `--ring-token`.
  - shadcn mappings stand: `--secondary`/`--muted` ← `--bg-surface`, `--accent` ← `--bg-hover`, `--destructive-foreground` flips ink like the accent; `--chart-*` removed.
  - `ShareMenu` social hover tints remain brand colors (not tokens).
- **Branding is still TBD** (Pixltly vs Snaply) but is now fully isolated to `src/lib/site.ts` — renaming the product is a one-line change.
- `ToolIcon` resolves the registry's Lucide icon-name strings through an explicit import map (keeps the bundle tree-shaken vs importing the full lucide icon set); adding a tool with a new icon means adding one import there.

- The registry stores the Lucide **icon name as a string** (per `ui-context.md`: "Each tool's registry entry carries its own Lucide icon name") rather than importing icon components, keeping the registry dependency-free for server-side consumers (sitemap, metadata).
- Unbuilt tools have **no route segments**; their existence is carried solely by `status: "soon"` in the registry, so nav surfaces can render them without dead links.
- The `/editor` redirect lives in `next.config.mjs` (`permanent: true`) rather than as a page-level `redirect()`, matching the "permanent redirect" rule in `code-standards.md`. If the app later moves to `output: "export"`, this must be revisited (config redirects don't apply to static export).

## Session Notes

- The Unit 1 brief described the editor as living at `src/app/page.tsx` with types in `src/types/beautifier.ts`; in the actual repo, `/` is a landing page, the editor was at `src/app/editor/page.tsx`, and types live in `src/types/` (`index.ts`, `settings.ts`, `presets.ts`, `code.ts`, `devices.ts`). The move was done from the real location.
- The editor's components remain in `src/components/` unchanged; only the page moved.
