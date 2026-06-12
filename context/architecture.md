# Architecture Context

> This app has **no backend**. There is no server runtime, no database, no auth, and no user accounts. Everything runs in the browser and ships as static assets.

## Stack

| Layer       | Technology                        | Role                                                      |
| ----------- | --------------------------------- | --------------------------------------------------------- |
| Framework   | Next.js (App Router) + TypeScript | Routing, page shells, static export                       |
| UI          | Tailwind + shadcn/ui              | Styling and component primitives                          |
| Rendering   | HTML Canvas 2D API                | Shared image pipeline (draw, frame, export) for all tools |
| ML          | @imgly/background-removal         | In-browser background removal model (lazy-loaded)         |
| Persistence | Browser localStorage              | Per-tool settings persisted across sessions               |
| Hosting     | Static hosting / CDN              | App ships as static assets (no server runtime required)   |

## System Boundaries

- `src/app/` — Route segments. Three category folders (`create/`, `edit/`, `optimize/`), each with a `layout.tsx` (breadcrumb + related-tools shell) and per-tool `page.tsx`. Owns routing and per-tool page composition only.
- `src/lib/canvas/` — The shared rendering pipeline: canvas helpers, letterboxing/aspect math, device mockups, and the export system. Owns all pixel-level image work; tools call into it, never reimplement it.
- `src/lib/registry/` — The single tool registry (`{ slug, category, name, description, keywords, icon }`). Owns the source of truth that the homepage grid, directory, command palette, sitemap, and metadata all read from.
- `src/components/` — Shared shell UI: navbar, command palette (Cmd+K), tool cards, pill strip, category chips, search input. Owns cross-tool UI; tool-specific controls live within their own tool page.

## Storage Model

- **localStorage**: Per-tool settings and preferences (last-used presets, quality values, dimensions). Keyed by tool slug. This is the only persistence layer — it is per-device and per-browser.
- **In-memory (Canvas / Blob)**: The working image and all generated output. Images exist only as in-memory canvas data and download Blobs; they are never serialized to a server, and only leave the browser via an explicit user-initiated download.

## Privacy Model

- There is no authentication, ownership, or access control because there is no shared or server-side state. Each user operates only on their own local browser session.
- Privacy is enforced by architecture, not policy: image data never leaves the device, so there is nothing to upload, store, or authorize access to.

## Invariants

1. No image data is ever sent to a server. All processing happens client-side; any feature that would require an upload is out of scope.
2. The tool registry is the single source of truth. The homepage, directory, command palette, sitemap, and metadata are all generated from it — tools are never hardcoded in more than one place.
3. Routes are always two-level and categorized (`/category/tool-name`) in kebab-case, noun-first, no abbreviations; the UI heading matches the slug.
4. Heavy assets (e.g. the ~40MB background-removal model) are lazy-loaded only on first use within their own route, never bundled globally.
5. Every tool reuses the shared canvas pipeline; no tool reimplements export, aspect math, or frame drawing.
