# Pixltly

## Overview

Pixltly is a free, privacy-first image toolkit that runs entirely in the browser. Every tool — for creating, editing, and optimizing images — processes files locally on the user's device; no image is ever uploaded to a server. It is built for developers, indie hackers, and marketers who need to make product visuals look good and prepare images for the web without signing up, hitting usage limits, or worrying about where their files go. It began as a screenshot stylizer and is repositioning into a multi-tool suite where each tool is a thin mode over one shared canvas pipeline.

## Goals

1. Ship a single launchable version containing 12 tools across three categories (Create / Edit / Optimize), each on its own route. **Shipped** (as 11 routes — Convert lives inside Compress & Convert).
2. Keep 100% of image processing client-side so the "no uploads, no limits, no ads" promise is structurally true, not just marketing.
3. Make the app read as one polished product — via categorized routing, a shared tool registry, and a searchable directory — rather than a pile of disconnected utilities.
4. **Post-launch expansion (planned, not yet built)**: add QR Code Generator (shipped 2026-11-03), SVG Optimizer (shipped 2026-11-03), and BlurHash Generator (shipped 2026-11-03) (3 new routes, bringing the total to 14), plus batch support for Watermark (all shipped 2026-11-03) — see Features and `progress-tracker.md`'s Next Up.

## Core User Flow

1. A first-time user lands on the homepage (`/`) and sees the hero, the privacy/free-forever pitch, 3–4 featured tool cards, and a compact pill strip listing the remaining tools.
2. They click a featured card (or a pill, or "View all tools") and go straight to a tool page or the directory.
3. A returning user goes directly to `/tools` (the searchable directory) or to a bookmarked tool page.
4. On `/tools`, they filter the grid by typing (live filter-as-you-type) or tap a category chip (All / Create / Edit / Optimize) to narrow it down.
5. They open a tool, do their task entirely in-browser, and export/download the result.
6. From any tool page, a left tool rail (every tool, grouped by category, current one highlighted) lets them move laterally to another tool in one click; Cmd+K opens a command palette to jump anywhere.

## Features

### Create

- **Screenshot Stylizer** — backgrounds, padding, shadows, device frames (`/create/screenshot`)
- **Code Snippet** — render code snippets as styled, syntax-highlighted images (`/create/code-snippet`)
- **OG Image Generator** — title/subtitle/screenshot to social & blog cards (`/create/og-image`)
- **Favicon Generator** — logo, letter, or emoji to a full favicon/app-icon package (multi-res .ico, PNGs, manifest, embed code) (`/create/favicon`)
- **Quote Card** — text + name + handle + avatar to tweet/quote graphics (`/create/quote`)
- **QR Code Generator** — text/URL to a downloadable QR code (PNG or SVG), with error-correction level, size, quiet zone, foreground/background colors, and an optional center logo/image (10–25% of the code width; adding one switches error correction to H) (`/create/qr-code`)
- **Gradient Generator** — artistic procedural backgrounds from code, no upload. **Surprise me** randomizes everything (shape, style, palette, sliders, effects) within tuned ranges, and **Generate** makes a new color-harmony palette in OKLCH. You can also pick one of 16 **Looks** or mix any of 8 **shapes** (Flow, Blobs, Swirl, Mesh, Aurora, Waves, Rays, Marble) with any of 9 **styles** (Fluid, Halftone, Dots, Glass, Poster, Lines, Pixel, Stipple, CRT). There are 12 palettes plus 4 editable stops; sliders for scale, warp, light and grain (fine grain up to spray stipple), plus cell size and angle where the style uses them; and effects (bloom, aberration, vignette). Shuffle picks a new seed for the same settings. Size presets: Phone 1080×1920, Desktop, QHD, 4K, Square, OG. The same settings give the same image at any size. Exports PNG or JPG, or copies PNG (`/create/gradient`)

### Edit

- **Resize & Crop** — preset + custom dimensions, freeform crop, aspect locks (`/edit/resize`)
- **Metadata Viewer** — view embedded EXIF/GPS/device metadata and strip it losslessly (`/edit/metadata`)
- **Redact & Blur** — draw regions to permanently pixelate/blur sensitive info (`/edit/redact`)
- **Remove Background** — in-browser ML background removal, lazy-loaded (`/edit/remove-background`)
- **Watermark** — text or logo overlay with position/opacity controls (`/edit/watermark`). **Batch mode**: drop or pick several images (or add more from the thumbnail strip); the same settings apply to all; "Download all (.zip)" renders them one at a time in their original formats and sizes. Unreadable files are skipped with a toast. A single image keeps the original one-file download.

### Optimize

- **Compress** — quality slider with live file-size preview (`/optimize/compress`)
- **Convert** — PNG / JPEG / WebP / AVIF format conversion (`/optimize/convert`)
- **SVG Optimizer** — upload or paste an SVG; SVGO `preset-default` + multipass strips editor metadata, rounds numbers (adjustable decimal precision 0–6), and simplifies paths, keeping `viewBox` and `<title>`; before/after previews and size comparison, copy markup, download `.min.svg` (`/optimize/svg-optimizer`)
- **BlurHash Generator** — upload or paste an image, get its BlurHash string (1–9 components per axis, default 4×3) with a side-by-side decoded preview, copy-to-clipboard, and a copyable CSS fallback (a tiny decoded PNG as `background-image`, with the source aspect ratio) for no-JS blur-up (`/optimize/blurhash`)

### Shell & Navigation

- Tool registry as a single source of truth (slug, category, name, description, keywords, icon)
- Searchable, filterable `/tools` directory with category chips
- Cmd+K command palette available on every page
- A tool rail on each tool page for one-click switching between tools

## Scope

### In Scope

- The 15 tools listed above (all shipped; Gradient Generator added 2026-11-06), each on its own categorized route
- The marketing landing page, the `/tools` directory, and the command palette
- A shared canvas rendering pipeline, presets, and export system reused by all raster tools (SVG Optimizer works on markup, not pixels, and is exempt — see `architecture.md`)
- Batch processing for Watermark specifically (multiple images, one settings pass, zip download)
- localStorage persistence for settings across sessions
- Redirect from legacy `/editor` to `/create/screenshot`

### Out of Scope

- Any backend, server, login, or user accounts
- Shareable/hosted links and cloud storage (breaks the no-server promise)
- Batch processing for any tool other than Watermark (deferred to a later v1.x)
- Animated GIF / MP4 exports (deferred — large standalone feature)
- App Store screenshot templates and README header templates
- Ads, paywalls, or usage limits of any kind

## Success Criteria

1. A user can open any of the 15 tools from a categorized route and complete its task fully in-browser with no network image upload.
2. Typing in the `/tools` search box live-filters cards by name and keyword (e.g. "shrink" surfaces Compress, "png to webp" surfaces Convert).
3. The homepage shows exactly the featured tools plus a pill strip, and every nav surface (homepage grid, directory, sitemap, metadata) is generated from the single tool registry with no drift.
4. Cmd+K opens a working command palette on every page that navigates to any tool.
5. Visiting `/editor` redirects to `/create/screenshot`.
