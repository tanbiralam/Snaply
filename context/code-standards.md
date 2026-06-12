# Code Standards

## General

- Keep modules small and single-purpose — one tool, one concern per file.
- Fix root causes, not symptoms; do not layer workarounds over a broken pipeline function.
- Do not mix unrelated concerns in one component or route — a tool page composes shared libs, it does not reimplement them.
- Reuse the shared canvas pipeline for all pixel work; never duplicate export, aspect math, or frame drawing inside a tool.
- The tool registry is the single source of truth — never hardcode a tool's name, slug, icon, or category anywhere a registry lookup would do.

## TypeScript

- Strict mode is required throughout the project (`strict: true`); no implicit `any`.
- Avoid `any` — use explicit interfaces or narrowly scoped types. Prefer `unknown` + narrowing over `any` when a type is genuinely open.
- Validate unknown external input at boundaries before trusting it: uploaded files (type, size, dimensions) and any value read from localStorage must be checked before use.
- Type the tool registry entry once (`Tool` interface) and derive everything — grid, palette, sitemap, metadata — from that type.
- Prefer discriminated unions for tool/category state over loose string comparisons.

## Next.js (App Router)

- Default to server components; add `"use client"` only when browser interactivity requires it (canvas, file input, drag, localStorage, theme toggle).
- Keep the heavy, interactive work in client component leaves; let layouts and static page shells stay on the server where possible.
- One route segment = one tool. Each `page.tsx` imports only its own pipeline so it stays in that route's bundle.
- Lazy-load heavy assets (`@imgly/background-removal`, ~40MB model) with dynamic import on first use within `/edit/remove-background` — never at module top level, never globally.
- Use the category `layout.tsx` for shared shell (breadcrumb, related-tools footer), not for per-tool logic.
- Keep `/editor` as a permanent redirect to `/create/screenshot`.

## Styling

- Use CSS custom property tokens defined in `ui-context.md` — no hardcoded hex values in any component.
- Follow the spacing, sizing, type, and border-radius scales in `ui-context.md`; no arbitrary pixel values.
- Both light and dark themes must work from tokens alone — never branch on theme inside a component with conditional colors.
- Use Tailwind utilities mapped to the token scale; reach for arbitrary values (`[12px]`) only when a token genuinely does not exist, and prefer adding a token instead.
- Respect `prefers-reduced-motion` wherever transforms or transitions are used.

## Client-Side Processing (replaces API Routes)

- There are no API routes and no server. All processing runs in the browser; never add a `fetch` to a backend for image work.
- Validate and parse any file input (MIME type, size, decoded dimensions) before passing it into the canvas pipeline.
- Keep pipeline functions pure where possible: take input + settings, return a canvas/blob, no hidden global state.
- Return predictable shapes from pipeline helpers (always a `Blob`/`HTMLCanvasElement`, never sometimes-null without a typed result).
- Never send image data off the device. Any feature requiring an upload is out of scope by invariant.

## Data and Storage

- The only persistence layer is `localStorage`, holding per-tool settings keyed by tool slug — small JSON only.
- Never store image data or large blobs in localStorage; working images and outputs live in memory (canvas/Blob) and leave only via explicit user download.
- Read localStorage defensively: wrap in try/catch, validate the parsed shape, fall back to defaults on miss or corruption.
- Treat the in-memory working image as the source of truth during a session; settings persist, pixels do not.

## File Organization

- `src/app/` — Route segments only: `create/`, `edit/`, `optimize/`, each with a category `layout.tsx` and per-tool `page.tsx`.
- `src/lib/canvas/` — Shared rendering pipeline: canvas helpers, aspect/letterboxing math, device mockups, export system.
- `src/lib/registry/` — The single tool registry and its `Tool` type; all nav/grid/metadata generation reads from here.
- `src/components/` — Shared shell UI: navbar, theme toggle, command palette, tool card, pill strip, category chips, search input.
- `src/components/ui/` — shadcn/ui generated components (see Protected Files in ai-workflow-rules.md).
