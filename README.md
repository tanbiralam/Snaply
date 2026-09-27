# Snaply — Privacy-First Image Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

> Free forever, no limits, no ads — your images never leave your browser.

Snaply is an open-source, in-browser image toolkit. Every tool runs entirely client-side — no uploads, no accounts, no server round-trips. Create, edit, and optimize images without sacrificing privacy, and verify that claim yourself: it's all public source.

🔗 **Live:** [snaply.tanbir.in](https://snaply.tanbir.in)

---

## Tools

All 11 tools are live. Add a 12th by following the [registry pattern](#adding-a-tool) — see [CONTRIBUTING.md](CONTRIBUTING.md).

### 🎨 Create

| Tool                   | Route                 | Description                                                                                                     |
| ---------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Screenshot Stylizer** | `/create/screenshot`  | Turn flat screenshots into polished visuals with backgrounds, padding, shadows, and device frames.                |
| **OG Image Maker**      | `/create/og-image`    | Compose a title, subtitle, logo, and screenshot into polished 1200×630 social and blog cards.                     |
| **Code Snippet**        | `/create/code-snippet`| Turn a code snippet into a shareable, syntax-highlighted image with custom backgrounds and window chrome.         |
| **Favicon Generator**   | `/create/favicon`     | Turn a logo into a full favicon & app icon package — every size, a multi-res `.ico`, manifest, and embed code.    |
| **Quote Card**          | `/create/quote`       | Turn text, a name, a handle, and an avatar into social-post and quote graphics.                                   |

### ✏️ Edit

| Tool                  | Route                     | Description                                                                                        |
| --------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| **Resize & Crop**      | `/edit/resize`             | Crop to any aspect ratio and resize to exact dimensions or social-media presets.                     |
| **Metadata Viewer**    | `/edit/metadata`           | See exactly what's hidden in a photo — GPS location, camera, timestamps — then strip it losslessly.  |
| **Redact & Blur**      | `/edit/redact`             | Draw regions to permanently pixelate or blur sensitive information.                                  |
| **Remove Background**  | `/edit/remove-background`  | Remove image backgrounds with an in-browser ML model — nothing is uploaded.                          |
| **Watermark**          | `/edit/watermark`          | Stamp text or a logo onto an image — pick a corner or tile it across, with size/opacity/rotation.    |

### ⚡ Optimize

| Tool                   | Route                | Description                                                                                              |
| ---------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Compress & Convert**  | `/optimize/compress`  | Bulk-compress and convert images between PNG, JPEG, WebP, AVIF, BMP, and ICO, with batch ZIP download.     |

---

## Features

- **100% in-browser** — All processing happens client-side using the Canvas API, WebAssembly, and in-browser ML. No images are ever uploaded.
- **No account required** — Open a tool and start working immediately.
- **`/tools` directory + ⌘K command palette** — search or jump to any tool instantly.
- **Dark / light theme** — system preference detection, manual toggle, no jitter (single view-transition crossfade).
- **Responsive** — works on desktop and mobile.
- **Open source** — MIT licensed. Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
git clone https://github.com/tanbiralam/Snaply.git
cd Snaply

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command         | Description                              |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start development server with hot reload  |
| `npm run build` | Production build                          |
| `npm run start` | Start production server locally           |
| `npm run lint`  | Run ESLint                                |

There is no test suite or CI pipeline; every change is verified with `tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks in both themes — see [CONTRIBUTING.md](CONTRIBUTING.md#verifying-a-change).

---

## Tech Stack

| Category            | Technology                        |
| -------------------- | ---------------------------------- |
| Framework            | Next.js 16 (App Router)            |
| Language             | TypeScript (strict)                |
| Styling              | Tailwind CSS 3                     |
| UI components        | shadcn/ui (Radix UI primitives)    |
| Icons                | Lucide React                       |
| Fonts                | Geist Sans & Geist Mono            |
| Theme                | next-themes                        |
| Background removal   | `@imgly/background-removal` (WASM), lazy-loaded on first use |
| Syntax highlighting  | Shiki                              |
| Image encode/decode, ZIP, EXIF | Hand-rolled, zero-dependency (`src/lib/encode.ts`, `decode.ts`, `zip.ts`, `exif.ts`) |
| Analytics            | Vercel Analytics                   |

Snaply deliberately avoids heavy dependencies for anything the platform or a few hundred lines of TypeScript can already do — see [CONTRIBUTING.md](CONTRIBUTING.md#design-principles).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx, page.tsx, not-found.tsx, providers.tsx
│   ├── sitemap.ts, robots.ts       # registry-generated, no manual URL list
│   ├── tools/page.tsx              # /tools directory (search + category chips)
│   ├── create/                     # screenshot, og-image, code-snippet, favicon, quote
│   ├── edit/                       # resize, metadata, redact, remove-background, watermark
│   └── optimize/                   # compress
├── components/
│   ├── ui/                         # shadcn/ui primitives — regenerate via CLI, don't hand-edit
│   ├── landing/                    # landing page sections (HeroVisual, Faq, FinalCta, PrivacyComparison)
│   ├── device/                     # device-frame mockups used by the Screenshot tool
│   ├── Navbar.tsx, Footer.tsx, BrandMark.tsx, ThemeToggle.tsx
│   ├── CommandPalette.tsx, ToolRail.tsx, ToolDirectory.tsx
│   ├── ToolCard.tsx, FeaturedToolCard.tsx, ToolIcon.tsx
│   ├── ImageUpload.tsx, ExportButton.tsx, ShareMenu.tsx
│   └── CanvasRenderer.tsx, CodeCanvasRenderer.tsx, SettingsPanel.tsx, StylePresets.tsx, ...
├── lib/
│   ├── registry/tools.ts           # single source of truth — every tool's metadata
│   ├── site.ts                     # branding, URLs, logo/OG-image config
│   ├── canvasHelpers.ts, ogRender.ts, quoteRender.ts, deviceMockups.ts
│   ├── encode.ts, decode.ts        # zero-dep image codecs (BMP/ICO/PPM/TGA/ICNS, etc.)
│   ├── exif.ts, watermark.ts, resize.ts, zip.ts, codeHighlighter.ts
│   └── utils.ts
├── types/                          # shared TypeScript types
└── index.css                       # design tokens + global styles
```

---

## Architecture

### The tool registry is the single source of truth

Every tool is one entry in [`src/lib/registry/tools.ts`](src/lib/registry/tools.ts):

```ts
{
  slug: "my-tool",
  category: "edit",          // "create" | "edit" | "optimize"
  name: "My Tool",
  description: "What it does, in one sentence.",
  keywords: ["keyword1", "keyword2"],
  icon: "Wand2",              // any lucide-react icon name
  status: "live",             // "live" = has a route; "soon" = coming, no route yet
}
```

The footer, `/tools` directory, ⌘K command palette, homepage grid, and `sitemap.ts` are all generated from this array — add a tool here and it appears everywhere automatically. See [CONTRIBUTING.md](CONTRIBUTING.md#adding-a-tool) for the full walkthrough of adding a new one, including where the route and editor component go.

### Privacy model

Every tool follows the same constraint: **no network request ever carries user image data.** There is no backend and no API route in this app. Processing is done with:

- **Canvas API** — Screenshot Stylizer, OG Image Maker, Code Snippet, Quote Card, Redact & Blur, Resize & Crop, Watermark, Favicon Generator
- **WebAssembly** — Remove Background (`@imgly/background-removal`, ~40MB model, dynamic-imported only on first use of that one tool)
- **Byte-level parsing, no re-encode** — Metadata Viewer (hand-rolled JPEG/PNG EXIF reader + lossless stripper)
- **Browser File API + Canvas** — Compress & Convert (reads files locally, re-encodes, zips for batch download)

The only persistence is `localStorage`, and only for small per-tool settings JSON (never image bytes) — see [`architecture.md`](context/architecture.md) for the full invariant list this project is built against.

---

## Contributing

Contributions are welcome — bug fixes, new tools, or better docs. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** first: it covers local setup, the registry pattern for adding a tool, this project's coding standards, and what a PR needs before it's ready for review.

By participating, you're expected to follow the **[Code of Conduct](CODE_OF_CONDUCT.md)**.

Found a bug or have a feature idea? [Open an issue](https://github.com/tanbiralam/Snaply/issues).

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires the Canvas API, WebAssembly, and modern CSS (`@property`, container queries are not required).

---

## License

[MIT](LICENSE) — free to use for personal and commercial purposes.
