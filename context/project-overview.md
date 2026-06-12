# Pixltly

## Overview

Pixltly is a free, privacy-first image toolkit that runs entirely in the browser. Every tool — for creating, editing, and optimizing images — processes files locally on the user's device; no image is ever uploaded to a server. It is built for developers, indie hackers, and marketers who need to make product visuals look good and prepare images for the web without signing up, hitting usage limits, or worrying about where their files go. It began as a screenshot stylizer and is repositioning into a multi-tool suite where each tool is a thin mode over one shared canvas pipeline.

## Goals

1. Ship a single launchable version containing 10 tools across three categories (Create / Edit / Optimize), each on its own route.
2. Keep 100% of image processing client-side so the "no uploads, no limits, no ads" promise is structurally true, not just marketing.
3. Make the app read as one polished product — via categorized routing, a shared tool registry, and a searchable directory — rather than a pile of disconnected utilities.

## Core User Flow

1. A first-time user lands on the homepage (`/`) and sees the hero, the privacy/free-forever pitch, 3–4 featured tool cards, and a compact pill strip listing the remaining tools.
2. They click a featured card (or a pill, or "View all tools") and go straight to a tool page or the directory.
3. A returning user goes directly to `/tools` (the searchable directory) or to a bookmarked tool page.
4. On `/tools`, they filter the grid by typing (live filter-as-you-type) or tap a category chip (All / Create / Edit / Optimize) to narrow it down.
5. They open a tool, do their task entirely in-browser, and export/download the result.
6. From any tool page, breadcrumbs and a "related tools" footer let them move laterally to adjacent tools; Cmd+K opens a command palette to jump anywhere.

## Features

### Create

- **Screenshot Stylizer** — backgrounds, padding, shadows, device frames (`/create/screenshot`)
- **Code Card** — render code snippets as styled images (`/create/code`)
- **OG Image Generator** — title/subtitle/screenshot to social & blog cards (`/create/og-image`)
- **Quote Card** — text + name + handle + avatar to tweet/quote graphics (`/create/quote`)

### Edit

- **Resize & Crop** — preset + custom dimensions, freeform crop, aspect locks (`/edit/resize`)
- **Redact & Blur** — draw regions to permanently pixelate/blur sensitive info (`/edit/redact`)
- **Remove Background** — in-browser ML background removal, lazy-loaded (`/edit/remove-background`)
- **Watermark** — text or logo overlay with position/opacity controls (`/edit/watermark`)

### Optimize

- **Compress** — quality slider with live file-size preview (`/optimize/compress`)
- **Convert** — PNG / JPEG / WebP / AVIF format conversion (`/optimize/convert`)

### Shell & Navigation

- Tool registry as a single source of truth (slug, category, name, description, keywords, icon)
- Searchable, filterable `/tools` directory with category chips
- Cmd+K command palette available on every page
- Breadcrumbs and related-tools cross-linking on each tool page

## Scope

### In Scope

- The 10 tools listed above, each on its own categorized route
- The marketing landing page, the `/tools` directory, and the command palette
- A shared canvas rendering pipeline, presets, and export system reused by all tools
- localStorage persistence for settings across sessions
- Redirect from legacy `/editor` to `/create/screenshot`

### Out of Scope

- Any backend, server, login, or user accounts
- Shareable/hosted links and cloud storage (breaks the no-server promise)
- Batch processing (deferred to v1.1)
- Animated GIF / MP4 exports (deferred — large standalone feature)
- App Store screenshot templates and README header templates
- Ads, paywalls, or usage limits of any kind

## Success Criteria

1. A user can open any of the 10 tools from a categorized route and complete its task fully in-browser with no network image upload.
2. Typing in the `/tools` search box live-filters cards by name and keyword (e.g. "shrink" surfaces Compress, "png to webp" surfaces Convert).
3. The homepage shows exactly the featured tools plus a pill strip, and every nav surface (homepage grid, directory, sitemap, metadata) is generated from the single tool registry with no drift.
4. Cmd+K opens a working command palette on every page that navigates to any tool.
5. Visiting `/editor` redirects to `/create/screenshot`.
