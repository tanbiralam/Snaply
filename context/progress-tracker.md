# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress — repositioning into the multi-tool suite.

## Current Goal

- Unit 1 complete: route restructure + tool registry. Next is Unit 2 (theme/token system).

## Completed

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

- Unit 2 — theme/token system (Jade tokens from `ui-context.md`).

## Open Questions

- **Branding mismatch**: `project-overview.md` names the product **Pixltly**, but the codebase (layout metadata, landing copy, editor header) still says **Snaply**. Unit 1 kept existing branding untouched; a later unit should resolve which name ships and update metadata/copy accordingly.
- The current editor includes a built-in "Code" mode (mode toggle in its header). The registry lists Code Card as a separate `soon` tool at `/create/code`. When `/create/code` is built, decide whether the screenshot editor's code mode is removed or redirected.

## Architecture Decisions

- The registry stores the Lucide **icon name as a string** (per `ui-context.md`: "Each tool's registry entry carries its own Lucide icon name") rather than importing icon components, keeping the registry dependency-free for server-side consumers (sitemap, metadata).
- Unbuilt tools have **no route segments**; their existence is carried solely by `status: "soon"` in the registry, so nav surfaces can render them without dead links.
- The `/editor` redirect lives in `next.config.mjs` (`permanent: true`) rather than as a page-level `redirect()`, matching the "permanent redirect" rule in `code-standards.md`. If the app later moves to `output: "export"`, this must be revisited (config redirects don't apply to static export).

## Session Notes

- The Unit 1 brief described the editor as living at `src/app/page.tsx` with types in `src/types/beautifier.ts`; in the actual repo, `/` is a landing page, the editor was at `src/app/editor/page.tsx`, and types live in `src/types/` (`index.ts`, `settings.ts`, `presets.ts`, `code.ts`, `devices.ts`). The move was done from the real location.
- The editor's components remain in `src/components/` unchanged; only the page moved.
