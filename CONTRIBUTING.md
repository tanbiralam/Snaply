# Contributing to Snaply

Thanks for wanting to contribute. This doc covers local setup, how to add a new tool, the standards a PR is expected to follow, and how to verify a change before opening one.

## Getting set up

```bash
git clone https://github.com/tanbiralam/Snaply.git
cd Snaply
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). There's no backend to configure and no environment variables required — everything runs client-side.

## Design principles

These aren't style preferences, they're the constraints the whole app is built around. A PR that breaks one of these will be asked to change, regardless of how well it's implemented otherwise:

1. **No image data ever leaves the browser.** No tool may `fetch`/upload the user's image, or any part of it, to any server — this project's entire pitch is that it doesn't need to. Fonts, model weights (e.g. the background-removal WASM model), and static assets are fine to fetch; user content is not.
2. **The tool registry is the single source of truth.** Never hardcode a tool's name, slug, icon, or category anywhere a lookup against `src/lib/registry/tools.ts` would do instead. The footer, `/tools` directory, command palette, homepage grid, and sitemap are all *generated* from that array.
3. **Reuse the shared pipeline, don't reinvent it.** Canvas drawing helpers live in `src/lib/canvasHelpers.ts`, `ogRender.ts`, etc. If you need to draw a gradient, crop-to-fill, or round a rect, check there first. New pixel math belongs in a shared lib only if a second tool will actually use it — don't extract speculatively.
4. **Zero new dependencies for anything a few hundred lines can do.** This repo hand-rolls its own BMP/ICO/PPM/TGA/ICNS codecs, ZIP writer, and EXIF parser (`src/lib/encode.ts`, `decode.ts`, `zip.ts`, `exif.ts`) rather than pulling in libraries for them. The one exception is `@imgly/background-removal`, because ML background removal genuinely isn't a few-hundred-line problem — and even that is dynamic-imported on first use, never loaded up front. If you think your tool needs a new dependency, open an issue to discuss it before writing code around it.
5. **Design tokens only, no hardcoded hex.** Colors, spacing, radii, and type scale come from the CSS custom properties in `src/index.css` (documented in `context/ui-context.md`). Both light and dark themes must work from those tokens alone — don't branch on theme inside a component.

## Adding a tool

Every tool is the same shape: one registry entry, one route folder, one client editor component. Here's the walkthrough:

1. **Add the registry entry** in [`src/lib/registry/tools.ts`](src/lib/registry/tools.ts):

   ```ts
   {
     slug: "my-tool",
     category: "edit",          // "create" | "edit" | "optimize"
     name: "My Tool",
     description: "One sentence describing what it does.",
     keywords: ["keyword1", "keyword2"],  // matched by /tools search + ⌘K
     icon: "Wand2",              // any lucide-react export name
     status: "live",             // "soon" if you're landing the route in a later PR
   }
   ```

2. **Create the route** at `src/app/{category}/{slug}/page.tsx` — a server component that derives its metadata from the registry entry (copy the pattern from an existing tool's `page.tsx`, e.g. `src/app/edit/resize/page.tsx`).

3. **Build the editor** as a client component (`"use client"`) alongside it, e.g. `MyToolEditor.tsx`. Reuse `ImageUpload`, `ExportButton`, and the canvas helpers rather than rebuilding upload/export/drawing plumbing per tool.

4. **If the tool needs persisted settings**, use `localStorage` keyed by the tool's slug, small JSON only (never image bytes), read defensively (`try/catch`, validate the parsed shape, fall back to defaults).

5. **Update `context/project-overview.md`** with the new tool under the right category — this repo keeps its scope doc in sync with what's actually shipped.

That's it — no other file needs to know about the new tool. If you find yourself editing the navbar, footer, or command palette to "add" your tool, something's wrong; those all read from the registry already.

## Coding standards

- TypeScript strict mode; no `any` — use `unknown` + narrowing when a type is genuinely open.
- Validate unknown input at the boundary: uploaded files (type/size/dimensions) and anything read from `localStorage` must be checked before use.
- Default to server components; add `"use client"` only where browser interactivity (canvas, file input, drag, localStorage, theme) requires it.
- One route segment = one tool; a `page.tsx` imports only its own pipeline so it stays in that route's JS bundle.
- Respect `prefers-reduced-motion` for anything that transitions or transforms.

**Protected — don't hand-edit unless explicitly discussed first:**

- `src/components/ui/*` — shadcn/ui generated primitives. Extend via composition or regenerate via the shadcn CLI.
- Any third-party library internals.
- Lockfiles and generated build output.

## Verifying a change

There's no automated test suite or CI in this repo yet, so a PR is expected to include the manual verification a test suite would otherwise give you:

1. `npx tsc --noEmit` — no type errors.
2. `npm run lint` — no lint errors.
3. `npm run build` — production build succeeds.
4. Exercise the actual feature in a browser (`npm run dev` or `npm run start`), in **both light and dark theme**, and check the console for errors/warnings.
5. If you touched a shared pipeline (canvas helpers, encode/decode, the registry), spot-check at least one other tool that depends on it for regressions.

Describe what you tested in the PR description — "verified: X, Y, Z" is enough, it doesn't need to be a novel.

## Commit / PR conventions

- Keep PRs scoped to one tool or one piece of shared infrastructure — not both in the same PR (a new tool *and* a canvas-helper refactor is two PRs).
- Write commit messages and PR titles that describe the change's intent, not just its mechanics (`fix: strip GPS but keep orientation on EXIF removal`, not `update exif.ts`).
- Link the issue you're addressing, if there is one.

## Questions

Open a [GitHub issue](https://github.com/tanbiralam/Snaply/issues) — for a quick question, tag it `question`, no need to wait for a full bug report.
