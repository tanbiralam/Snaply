# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress — repositioning into the multi-tool suite.

## Current Goal

- Units 1–3.5 complete. Next is Unit 4 (/tools directory).

## Completed

- **OG Image Maker — quality upgrade** (2026-06-22)
  - Product decision (user): free-form drag isn't the differentiator for OG cards; *opinionated quality* is. Built three upgrades; deliberately skipped device/browser frames (user said not needed).
  - **Typography**: self-hosted display fonts as static woff2 in `public/fonts/` (Inter 400/600, Sora 800, Fraunces 600, Space Grotesk 700 — latin subset, ~110KB total). `@font-face` in `index.css` (lazy — only fetched when rendered, so other pages pay nothing). Editor preloads via `document.fonts.load(FONT_PRELOAD)` then bumps a counter to redraw. 4 heading choices (Sora/Grotesk/Fraunces/Inter) via `HEADINGS` map threaded through `fitTitle`; body text = Inter; weights restricted to shipped faces (no faux-bold). Graceful fallback to system stack if a face fails to load.
  - **Backgrounds**: added `mesh` bg type (`OG_MESH` presets = base + 3 radial colour blobs, drawn as layered radial gradients) and a **grain** slider that reuses the screenshot tool's `drawGrain` over the whole background (content rect collapsed). Gradient/solid/image still there.
  - **Recipes**: one-click `RECIPES` (Blog post, Product launch, Changelog, Quote, Minimal) that patch template + font + background + colours together.
  - **Social previews**: a platform switcher (Card / X / LinkedIn / Slack / Google) wraps the live canvas in `PreviewMock` chrome so users see the real unfurl. Canvas stays drawn across remounts (`platform` added to the redraw effect deps).
  - **Embed**: "Copy meta tags" builds the `og:*` + `twitter:card` snippet (1200×630, escaped) to clipboard with hosting guidance.
  - Verified: `tsc`, lint, full `next build` pass. Pixel/visual + font-rendering check still pending (browser only).

- **Create: OG Image Maker** (2026-06-21)
  - New tool at `/create/og-image` (registry flipped `soon` → `live`, renamed "OG Image Generator" → "OG Image Maker", description/keywords expanded; **left unfeatured** so the landing's 4-card featured grid is untouched). Server `page.tsx` + client `OgImageEditor.tsx`. Zero new deps.
  - Renderer `src/lib/ogRender.ts`: pure `drawOg(ctx, settings, images)` onto a fixed **1200×630** canvas (Open Graph spec). **Reuses the shared canvas helpers** (`angleToGradientPoints`, `drawImageCover`, `roundRect`) per invariant 5 — no pixel math reinvented. Three templates: **Spotlight** (brand row + accent bar + eyebrow + auto-fit title + subtitle, optional right-side screenshot panel w/ shadow), **Centered** (logo + eyebrow pill + centered stack), **Showcase** (left text column + dominant screenshot panel). Title auto-fits font size to line budget; text wraps with explicit `\n` support; canvas `letterSpacing` used where supported (graceful no-op fallback).
  - Editor: live canvas preview + right controls panel (template cards, content fields, logo/screenshot uploaders, background tabs gradient/solid/image with 8 gradient presets + custom colours + angle, image overlay slider, accent + light/dark/custom text colour). Export = **Download PNG** (1200×630) + **Copy to clipboard** (`ClipboardItem`) + Reset. Self-contained like the other editors; responsive (controls stack below preview under `lg`).
  - Verified: `tsc`, lint, full `next build` all pass; `/create/og-image` prerenders. Pixel-level visual check pending (browser only — renderer can't run under Node without node-canvas, deliberately not added).

- **Optimize: Compress & Convert tool** (2026-06-21)
  - New tool at `/optimize/compress` (registry flipped `soon` → `live`, renamed "Compress" → "Compress & Convert", keywords merged with the planned `convert` tool's). Server `page.tsx` + client `CompressEditor.tsx`. Zero new deps.
  - **Bulk**: multi-file drop / browse / paste; per-image grid with thumbnail (over a checkerboard so transparency shows), original→new size, % saved/gained, per-item download, and remove. "Add" appends more; "Clear" wipes.
  - **Convert + compress**: output format = Same-as-original / WebP / JPEG / PNG / AVIF; quality slider (10–100%, hidden for PNG since it's lossless). AVIF option only appears if `canvas.toBlob` actually *encodes* AVIF (feature-detected once on mount — decode is widespread, encode isn't). JPEG output flattens transparency onto white.
  - **Pipeline**: one reused offscreen canvas; `createImageBitmap` decode (fast, off-main-thread) → draw → `toBlob`. Items carry a `processedKey` (`format|quality`) so only stale items re-encode; processing is **sequential** (bounds memory on big batches — `ponytail:` comment marks the concurrency-pool upgrade path). Quality changes debounced 250ms; a run counter cancels stale passes. All object URLs revoked on re-encode / remove / unmount.
  - **Download all** → a single `.zip` via a new dependency-free STORE-method zip writer (`src/lib/zip.ts`); images are already compressed so DEFLATE would be wasted CPU. Duplicate output names get `-n` suffixes. Validated the zip byte layout with system `unzip` (lists + extracts + CRC-checks).
  - No localStorage persistence (consistent with the other new editors). Reuses shadcn `Slider` + `site.ts` + `ThemeToggle`; self-contained like redact/remove-background (shares nothing with the screenshot canvas pipeline).
  - **Output encoders BMP + ICO** (`src/lib/encode.ts`, 2026-06-21): canvas `toBlob` only writes PNG/JPEG/WebP/AVIF, so added zero-dep encoders — `encodeBmp` (24-bit BGR, bottom-up, row-padded, alpha flattened to white; pure + Node-tested, validated with `file`) and `encodeIco` (single-PNG ICO container, downscales to ≤256px). Both added as always-on format cards (`mime: null`, so shown without toBlob feature-detection); the processor branches to them instead of `toBlob`; quality slider hidden for the lossless set (PNG/BMP/ICO). Output targets are now PNG/JPEG/WebP/AVIF/BMP/ICO — the full set encodable client-side without a server (GIF would need `gif.js`; deferred).
  - **Input decoder registry** (`src/lib/decode.ts`, 2026-06-21): `decodeImage(file)` returns a drawable `ImageBitmap | HTMLCanvasElement` the encode pipeline draws as before. Native formats (PNG/JPG/JPEG/JFIF/WebP/GIF/BMP/ICO/AVIF) go through `createImageBitmap`; **zero-dep hand-written decoders** added for **PPM/PGM/PBM** (P2/P3/P5/P6, 8- & 16-bit), **TGA** (24/32-bit + 8-bit gray, uncompressed & RLE, origin-aware), and **ICNS** (extracts the largest embedded PNG). Pure `pnmToRGBA`/`tgaToRGBA`/`icnsExtractPng` are DOM-free and unit-tested in Node (6 synthetic-file asserts pass). Editor now filters dropped files via `canDecode`, sets `<input accept>` from `SUPPORTED_INPUT`, shows a file-icon placeholder for not-yet-encoded non-native inputs (`isPreviewable`), and lists accepted formats in the empty state. **Decision (user, "client-side max"):** HEIC/TIFF/PSD are *not* browser-native and need libraries — install was declined, so they're left as documented lazy-import seams in `decode.ts` (npm i + add a `case`); RAW/EPS/PS/PUB/XPS/ODD/ODG/XCF are server-only (Ghostscript/LibreOffice/LibRaw) and out of scope since the no-backend/privacy invariant stands.
  - **Per-image options** (grid kept): each card has an **Options** panel (toggle) with a **format override** (native `<select>`, "Default (…)" follows the global format), **resize** W×H inputs + a **keep-aspect** Switch (contain-fit when both set; single axis scales the other), and a **metadata note** — re-encoding through canvas inherently drops EXIF/GPS, so this is stated (`ShieldCheck`), not a fake toggle (preserving metadata would need an EXIF parse/reinject lib). Output dims shown on done cards. `processedKey` now encodes the *effective* per-item settings (`override-or-global fmt | quality | W | H | keepAspect`), so editing one card re-encodes only that card; a global format change re-encodes only cards without an override. Resize/quality edits go through a 300ms debounced bump. High-quality `imageSmoothingQuality` for downscales. Format cards themselves were reshaped from `w-24` squares to horizontal icon-left rectangles (the squares read as AI-template).
  - **Visual pass**: the plain `Select` was replaced with a row of icon-bearing **format cards** (Original/WebP/JPEG/PNG/AVIF) that show only browser-encodable formats (now feature-detects all four at mount, not just AVIF) — active card gets an accent ring + animated check. Empty state is a layered drop zone (gradient + dot-grid backdrop, `bounce-subtle` upload icon on drag, supported-format chips). Encoding feedback uses existing tailwind keyframes: an indeterminate `shimmer` top bar while any item is in flight, a per-thumbnail blur + `shimmer` scan-sweep + spinner during encode, and a `scale-in` done badge. Cards enter with `scale-in`. No new keyframes/deps — all from the existing `tailwind.config.ts` set. **Encode scope is intentionally PNG/JPEG/WebP/AVIF only** (what `canvas.toBlob` supports natively); GIF/BMP/HEIC/TIFF/ICO would each need a WASM encoder, which would violate the heavy-dep invariant — deferred unless specifically requested.
  - Drive-by: removed a dead `eslint-disable @next/next/no-img-element` directive in `RemoveBackgroundEditor` (the flat config never registers that plugin, so the directive errored) — repo `npm run lint` is now green. Verified: typecheck + lint pass; browser verification (encode quality across formats, large batches) pending.

- **Edit: Remove Background tool** (2026-06-21)
  - New tool at `/edit/remove-background` (registry flipped `soon` → `live`). Server `page.tsx` + client `RemoveBackgroundEditor.tsx`. Added dependency `@imgly/background-removal` (^1.7.0) — the one sanctioned heavy dep.
  - Model is **dynamic-imported on first run only** (`await import("@imgly/background-removal")` inside the run handler), never at module top level — satisfies architecture invariant 4. Only model weights are fetched from a CDN; the user's image never leaves the browser (privacy invariant intact).
  - Flow: upload/paste → auto-runs `removeBackground(dataUrl, {progress})` → transparent PNG Blob → object URL shown over a CSS checkerboard → Download PNG. Progress callback drives a % overlay ("first run downloads ~40MB"). Error path shows Retry. Object URLs revoked on replace/unmount.
  - Verified: typecheck passes; browser verification pending (model download + cutout quality).

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
