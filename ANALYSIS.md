# Snaply — Screenshot Stylizer: End-to-End Codebase Analysis

> Generated 2026-06-11. Covers architecture, rendering pipeline, data model, landing page, configuration, git state, and a full list of bugs / code smells / recommendations.

---

## 1. Project Overview

**Snaply** is a client-side screenshot beautifier: paste or upload a screenshot (or paste code), style it with backgrounds, gradients, device frames, shadows and effects, then export or share it. All processing happens in the browser via the Canvas API — no backend, no login.

It has two faces

1. **Landing page** (`/`) — marketing site with hero, features, before/after demo, testimonials, CTA.
2. **Editor** (`/editor`) — the actual tool, with two modes:
   - **Image mode** — stylize an uploaded/pasted screenshot.
   - **Code mode** — render syntax-highlighted code as a shareable image (Shiki-powered).

---

## 2. Tech Stack

| Layer               | Choice                                                        | Notes                                                 |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| Framework           | Next.js 16.2.4 (App Router)                                   | Migrated from Vite (commit `b3e47e5`)                 |
| UI library          | React 19.2.5                                                  |                                                       |
| Language            | TypeScript 5.8                                                | **`strict: false`** in [tsconfig.json](tsconfig.json) |
| Styling             | Tailwind CSS 3.4 + CSS variables                              | shadcn/ui-style tokens, class-based dark mode         |
| Components          | Radix UI primitives + shadcn/ui                               | button, select, slider, switch, tooltip, toast, etc.  |
| Syntax highlighting | Shiki 4                                                       | Lazy singleton highlighter                            |
| Theming             | next-themes                                                   | Default dark, system-aware                            |
| Toasts              | sonner + Radix toast                                          | Both present (duplication)                            |
| Icons               | lucide-react                                                  |                                                       |
| Fonts               | Poppins (sans), EB Garamond (display serif), Fira Code (mono) | Google Fonts via [src/index.css](src/index.css#L1-L3) |

Rendering is **pure Canvas 2D** — no html2canvas/dom-to-image dependency, which keeps exports deterministic and fast.

---

## 3. Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, full OG/Twitter metadata, theme provider
│   ├── page.tsx            # Landing page (composes landing/*)
│   ├── editor/page.tsx     # Editor orchestrator — owns ALL editor state
│   ├── providers.tsx       # Theme + tooltip + toaster providers
│   └── not-found.tsx
├── components/
│   ├── CanvasRenderer.tsx      # Screenshot-mode canvas pipeline (357 lines)
│   ├── CodeCanvasRenderer.tsx  # Code-mode canvas pipeline (348 lines)
│   ├── SettingsPanel.tsx       # Tabbed settings (Code / Style / Device)
│   ├── StyleTab / DeviceTab / CodeSettingsTab / StylePresets
│   ├── ImageUpload / CodeInput / ExportButton / ShareMenu / ZoomBar
│   ├── device/                 # DeviceCard, DevicePreviewSVG
│   ├── landing/                # Nav, Hero, Features, BeforeAfter, UseCases, CTA, Footer, MockScreenshot
│   └── ui/                     # shadcn/ui primitives
├── lib/
│   ├── canvasHelpers.ts    # roundRect, letterboxing, grain, aspect-ratio math
│   ├── deviceMockups.ts    # Device frame geometry + chrome drawing (396 lines)
│   ├── codeHighlighter.ts  # Shiki singleton + tokenizer
│   ├── deviceRecommendation.ts
│   └── utils.ts            # cn(), blob/clipboard helpers
└── types/                  # settings, presets, devices, code (+ dead beautifier.ts)
```

### State management

All editor state lives in [src/app/editor/page.tsx](src/app/editor/page.tsx) via plain `useState` — no context, no store, no persistence:

- `editorMode`: `"image" | "code"`
- `image`: base64 data URL of the screenshot
- `settings`: `StyleSettings` (shared by both modes)
- `codeSettings`: `CodeSettings`
- `activePreset`: highlight-only marker
- `imageAspectRatio`: detected ratio of the uploaded image

Settings flow **down** as props into `CanvasRenderer` / `CodeCanvasRenderer` / `SettingsPanel`; changes flow **up** via callbacks. Both renderers expose `exportImage(format, quality)` through `useImperativeHandle` refs, which the page delegates to based on the active mode.

---

## 4. Canvas Rendering Pipeline

### Image mode ([CanvasRenderer.tsx](src/components/CanvasRenderer.tsx))

Draw order in `drawToContext` (lines ~167–260):

1. **Background** — background image (cover-scaled) → gradient (`gradientStart`→`gradientEnd` at `gradientAngle`) → solid color.
2. **Blurred backdrop** — optional: the screenshot itself redrawn with `blur(40px) saturate(1.2)` at 70% alpha behind the frame, with a translucent gradient veil on top.
3. **Film grain** — `drawGrain()` noise overlay, clipped (even-odd) so it only hits the background, never the screenshot.
4. **Drop shadow** — `shadowBlur`/`shadowOffsetY` derived from `shadowIntensity`, drawn on the frame's rounded rect.
5. **Device frame chrome** — `drawDeviceFrame()` paints browser bars, macOS traffic lights, iPhone notch, etc., theme-aware via `getDeviceColors(isDark)`.
6. **Screenshot** — letterboxed (`object-fit: contain` semantics) inside the content rect, clipped to the content radius.

Canvas size derives from device layout + aspect ratio + padding (`getAspectRatioDimensions`). Zoom supports Ctrl/Cmd+wheel plus an auto-fit scale against the container (via ResizeObserver). **Export renders fresh at 2× resolution** to a temporary canvas, then `toDataURL` as PNG / JPEG / WebP (quality 0.95).

### Code mode ([CodeCanvasRenderer.tsx](src/components/CodeCanvasRenderer.tsx))

1. Tokenizes code asynchronously via Shiki (`tokenizeCode`) with cancellation guard.
2. Measures every line with `measureText()` to size the code block (min 400px wide).
3. Draws background (solid/gradient), shadow, rounded block filled with the theme's background, a darkened title bar with **three traffic-light dots** and optional window title, then per-token colored text with optional 50%-opacity line numbers.
4. Font stack hardcoded: JetBrains Mono → Fira Code → SF Mono → Cascadia Code → Consolas; line height = `fontSize × 1.7`.

### Export & Share

- **ExportButton** — dropdown of PNG/JPEG/WebP, downloads as `snaply-<timestamp>.<ext>`, with loading/“Downloaded!” states.
- **ShareMenu** — X / LinkedIn / Instagram shortcuts: exports PNG → converts data URL → Blob → **copies image to clipboard** (`copyImageToClipboard`, converting to PNG if needed) → opens the platform in a new tab (X gets pre-filled text). Toast tells the user to paste.

---

## 5. Data Model

### `StyleSettings` ([src/types/settings.ts](src/types/settings.ts)) — 13 fields

| Setting                         | Range / Type                                            | Default               |
| ------------------------------- | ------------------------------------------------------- | --------------------- |
| `padding`                       | 16–120 px                                               | 40                    |
| `borderRadius`                  | 0–48 px                                                 | 12                    |
| `shadowIntensity`               | 0–80                                                    | 40                    |
| `backgroundColor`               | hex                                                     | `#1a1a2e`             |
| `gradientStart` / `gradientEnd` | hex                                                     | `#667eea` / `#764ba2` |
| `gradientAngle`                 | degrees                                                 | 135                   |
| `useGradient`                   | boolean                                                 | true                  |
| `blurBackground`                | boolean                                                 | false                 |
| `aspectRatio`                   | `"free" \| "16:9" \| "4:3" \| "1:1" \| "9:16" \| "4:5"` | `"free"`              |
| `deviceMockup`                  | see below                                               | `"none"`              |
| `grainIntensity`                | 0–100                                                   | 0                     |
| `backgroundImage`               | string \| null                                          | null                  |

### Presets ([src/types/presets.ts](src/types/presets.ts)) — 29 presets, 5 categories

| Category          | Count | Examples                                        |
| ----------------- | ----- | ----------------------------------------------- |
| Image backgrounds | 6     | Pastel Dream, Aurora, Neon Grid, Windows Ghibli |
| Gradients         | 8     | Purple Dream, Sunset, Ocean, Neon Cyber         |
| Minimal           | 6     | White, Pearl, Graphite, Heavy Shadow            |
| Glass & Blur      | 3     | Glassmorphism, Glass Indigo, Glass Midnight     |
| Grainy & Textured | 6     | Warm Film, Charcoal, Noir                       |

Each preset is a partial `StyleSettings` override. Selecting one clears any custom background image.

### Device mockups ([src/types/devices.ts](src/types/devices.ts), [src/lib/deviceMockups.ts](src/lib/deviceMockups.ts)) — 8 options

`none`, `browser` (44px chrome bar + URL field), `macos` (32px title bar), `iphone` (notch + home indicator), `iphone-landscape`, `android` (punch-hole), `android-landscape`, `ipad`. Each defines a `DeviceFrameLayout` (frame size, content offset/size, corner radius) with dark/light chrome palettes. `deviceRecommendation.ts` suggests a frame from the uploaded image's aspect ratio.

### Code mode ([src/types/code.ts](src/types/code.ts))

- **12 languages**: TypeScript, JavaScript, Python, JSON, HTML, CSS, Bash, Go, Rust, Java, C++, SQL.
- **9 themes**: github-dark/light, dracula, nord, vitesse-dark, one-dark-pro, catppuccin-mocha, min-dark, slack-dark (each with a swatch preview).
- Settings: font size 10–24px, line numbers toggle, window title.

---

## 6. Landing Page & Styling System

**Sections** ([src/app/page.tsx](src/app/page.tsx)): Nav → Hero (with a CSS-built `AppPreview` mirroring the editor's 3-panel layout) → Features (6 cards) → BeforeAfter (animated clip-path comparison slider, 4.5s loop) → UseCases (3 persona quotes + 4 community testimonials, "2,400+ developers" social proof) → CTA → Footer. Copy themes: speed ("No login. No setup. Just ⌘V"), privacy ("all processing happens client-side"), craft ("A real editor. Not a template.").

**Styling**: shadcn-style HSL CSS variables for both themes (light gray / very dark, purple-blue primary), 7-level shadow token scale, custom utilities (`.bg-paper-glow`, `.bg-gradient-canvas`, `.hairline`, `.font-serif-display`) and a set of entrance/loop animations (`reveal-*`, `float-slow`, `slide-compare`, `clip-compare`). Dark mode is class-based and defaults to dark with system detection.

**SEO**: [layout.tsx](src/app/layout.tsx) has complete Open Graph + Twitter card metadata against the hardcoded `https://snaply.app`. `robots.txt` exists; no sitemap or PWA manifest.

---

## 7. Git State

Recent history shows a clear build-up: Vite→Next.js migration → device frames → grain/zoom/clipboard paste → landing page → image-background presets → ShareMenu → **code editor mode** → 4:5 aspect ratio (latest commit `f100bc7`).

**Uncommitted (7 files, unstaged)**: landing polish — layout.tsx metadata changes, small edits to BeforeAfter/Features/Footer/Nav/UseCases, and new `clip-compare` keyframes in [src/index.css](src/index.css). The untracked `screenshots/` folder holds local captures.

---

## 8. Issues Found

### Bugs

| #   | Issue                                                                                                                                                                                                                                  | Location                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | **Code mode ignores `backgroundImage`** — fills hardcoded `#1a1a2e` instead of drawing the selected image, so image-background presets silently break in code mode                                                                     | [CodeCanvasRenderer.tsx:153-155](src/components/CodeCanvasRenderer.tsx#L153-L155)                        |
| 2   | **Landscape device frames unimplemented** — `iphone-landscape` / `android-landscape` exist in the type and have SVG previews, but `getDeviceLayout()` has no case for them, so they fall through to default geometry (no bezels/notch) | [deviceMockups.ts:70-154](src/lib/deviceMockups.ts#L70-L154)                                             |
| 3   | **DeviceCard option toggles do nothing** — switches use `defaultChecked` with no `onCheckedChange`/state, so visible controls don't affect rendering                                                                                   | [DeviceCard.tsx:68-105](src/components/device/DeviceCard.tsx#L68-L105)                                   |
| 4   | **Aspect-ratio type/UI mismatch** — type says `"free"` + includes `"4:3"`; the UI renders `"auto"` and omits 4:3                                                                                                                       | [settings.ts:3](src/types/settings.ts#L3), [StyleTab.tsx:116-120](src/components/StyleTab.tsx#L116-L120) |
| 5   | Image load failures are silent (`onerror` just clears state, no toast)                                                                                                                                                                 | [CanvasRenderer.tsx:100](src/components/CanvasRenderer.tsx#L100)                                         |

### Code smells / dead code

- **`src/types/beautifier.ts` (290 lines) is entirely unused** and contains duplicate, conflicting `StyleSettings`/`Preset`/`DeviceMockup` definitions plus stale preset data — delete it.
- `angleToGradientPoints()` is duplicated verbatim in both canvas renderers; `roundRect` exists as a polyfill in `canvasHelpers.ts` and again as `roundRectPath` in `deviceMockups.ts`, while `CodeCanvasRenderer` already uses native `ctx.roundRect()` — consolidate.
- Both renderers are ~350-line monoliths mixing image loading, sizing, zoom, and drawing; extracting hooks (`useCanvasZoom`, `useLoadedImage`) would help testability.
- Artificial delays: 400 ms in [ExportButton.tsx:72](src/components/ExportButton.tsx#L72), 150 ms in [ShareMenu.tsx:71](src/components/ShareMenu.tsx#L71) — exports are synchronous; these just make the UI feel slower.
- Defensive `gradientAngle ?? 135` fallbacks (with a type cast in StylePresets) even though the field is non-optional.
- `package.json` name is still **`vite_react_shadcn_ts`** at version `0.0.0`; the TODO about the production domain in layout.tsx is already resolved.
- SettingsPanel clears `backgroundImage` when gradient controls change, but not the reverse — asymmetric reset logic.

### Performance

- `drawGrain()` regenerates random noise pixel-by-pixel on every redraw — pre-generating a noise tile would cut redraw cost dramatically at high grain intensities.
- Code mode re-measures every token with `measureText()` on each settings change; no caching.
- `autoFitScale`/`effectiveScale` recomputed each render without `useMemo` (minor).
- Export always renders at fixed 2×; no user-facing resolution choice, so large screenshots can produce very large files.

### Accessibility / UX

- Footer links (Privacy, Changelog, GitHub, Twitter) and the Nav GitHub icon are non-functional `<span>` placeholders.
- BeforeAfter slider is animation-only — not keyboard-operable, no reduced-motion handling.
- No tokenization loading indicator in code mode (silent delay on first paste).
- No undo/redo and no settings persistence — a refresh loses everything.

---

## 9. Recommendations (Prioritized)

1. **Fix code-mode background image** (bug #1) — the most user-visible defect; presets advertise backgrounds that don't apply.
2. **Implement or remove landscape device frames** (bug #2) and **wire up or remove DeviceCard toggles** (bug #3) — dead UI erodes trust.
3. **Reconcile the AspectRatio type with the UI** (bug #4).
4. **Delete `src/types/beautifier.ts`** and deduplicate `angleToGradientPoints`/`roundRect` into `canvasHelpers.ts`.
5. Rename `package.json` to `snaply-screenshot-stylizer`, set a real version, remove the stale TODO.
6. Persist `settings`/`codeSettings` to `localStorage` — cheap, big UX win.
7. Cache the grain noise tile and memoize code-block measurements.
8. Make footer/nav links real (or remove them), add `prefers-reduced-motion` support, surface image-load errors via toast.
9. Consider enabling TypeScript `strict` mode incrementally — the codebase is small enough that it's still tractable.

---

## 10. Verdict

A well-scoped, cleanly structured client-side tool with a genuinely good rendering pipeline (proper draw ordering, theme-aware device chrome, 2× exports, even-odd grain clipping shows care). The main debt is **feature stubs that look finished but aren't** (code-mode backgrounds, landscape frames, device toggles, footer links) and **leftover migration artifacts** (package name, dead beautifier.ts). Nothing structural needs rework — a focused cleanup pass on Section 8 would bring the codebase fully in line with its polish-focused branding.
