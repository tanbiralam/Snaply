# Snaply — Privacy-First Image Toolkit

> Free forever, no limits, no ads — your images never leave your browser.

Snaply is an open-source, in-browser image toolkit. Every tool runs entirely client-side — no uploads, no accounts, no server round-trips. Create polished visuals, edit images, and compress files without sacrificing privacy.

🔗 **Live:** [snaply.tanbir.in](https://snaply.tanbir.in)

---

## Tools

### 🎨 Create

| Tool                    | Description                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Screenshot Stylizer** | Turn flat screenshots into polished visuals with gradient backgrounds, padding, shadows, border radius, device frames, and multiple aspect ratios. Export as PNG, JPEG, or WebP. |
| **OG Image Maker**      | Compose a title, subtitle, logo, and screenshot into a polished 1200×630 Open Graph / social card. Supports gradient backgrounds, custom fonts, and direct image export.         |

### ✏️ Edit

| Tool                  | Description                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Redact & Blur**     | Draw regions over an image to permanently pixelate or blur sensitive information. Fully client-side — nothing leaves the browser. |
| **Remove Background** | Remove image backgrounds using an in-browser ML model (`@imgly/background-removal`). No uploads, no API keys.                     |

### ⚡ Optimize

| Tool                   | Description                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compress & Convert** | Bulk-compress and convert images between PNG, JPEG, WebP, and AVIF formats. Includes a quality slider and live size-savings preview. Supports batch processing and ZIP download. |

---

## Features

- **100% in-browser** — All processing happens client-side using the Canvas API, WebAssembly, and in-browser ML. No images are ever uploaded.
- **No account required** — Open the site and start working immediately.
- **Dark / Light theme** — System preference detection with manual toggle.
- **Responsive** — Works on desktop and mobile.
- **Open Source** — MIT licensed. Contributions welcome.

---

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/tanbiralam/Snaply
cd Snaply-Screenshot-Stylizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Production build                         |
| `npm run start` | Start production server locally          |
| `npm run lint`  | Run ESLint                               |

---

## Tech Stack

| Category            | Technology                       |
| ------------------- | -------------------------------- |
| Framework           | Next.js 16 (App Router)          |
| Language            | TypeScript                       |
| Styling             | Tailwind CSS 3                   |
| UI Components       | shadcn/ui (Radix UI primitives)  |
| Icons               | Lucide React                     |
| Fonts               | Geist Sans & Geist Mono          |
| Theme               | next-themes                      |
| Notifications       | Sonner                           |
| Background Removal  | @imgly/background-removal (WASM) |
| Syntax Highlighting | Shiki                            |
| Analytics           | Vercel Analytics                 |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout, metadata & OG tags
│   ├── page.tsx                    # Landing page
│   ├── not-found.tsx               # 404 page
│   ├── providers.tsx               # React context providers
│   ├── create/
│   │   ├── screenshot/             # Screenshot Stylizer tool
│   │   └── og-image/               # OG Image Maker tool
│   ├── edit/
│   │   ├── redact/                 # Redact & Blur tool
│   │   └── remove-background/      # Background Removal tool
│   └── optimize/
│       └── compress/               # Compress & Convert tool
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── landing/                    # Landing page sections
│   │   ├── HeroVisual.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── StylizerSpotlight.tsx
│   │   ├── PrivacyComparison.tsx
│   │   ├── Faq.tsx
│   │   └── FinalCta.tsx
│   ├── CanvasRenderer.tsx          # Core canvas rendering (screenshot tool)
│   ├── CodeCanvasRenderer.tsx      # Canvas renderer for code screenshots
│   ├── ExportButton.tsx            # Format selection & download
│   ├── Footer.tsx                  # Site footer
│   ├── ImageUpload.tsx             # Drag & drop image upload
│   ├── Navbar.tsx                  # Site navigation
│   ├── SettingsPanel.tsx           # Shared customization controls
│   ├── ShareMenu.tsx               # Share / copy-link menu
│   ├── StylePresets.tsx            # Style preset cards
│   ├── StyleTab.tsx                # Style configuration tab
│   ├── ThemeToggle.tsx             # Dark/light mode switch
│   ├── ToolCard.tsx                # Tool card for landing page grid
│   ├── ToolPill.tsx                # Compact tool pill (non-featured tools)
│   └── ZoomBar.tsx                 # Canvas zoom controls
├── lib/
│   ├── registry/
│   │   └── tools.ts                # Central tool registry (source of truth)
│   ├── site.ts                     # Site branding & URL config
│   ├── canvasHelpers.ts            # Canvas drawing utilities
│   ├── ogRender.ts                 # OG image canvas rendering engine
│   ├── decode.ts                   # Image decode utilities
│   ├── encode.ts                   # Image encode & export utilities
│   ├── deviceMockups.ts            # Device frame definitions
│   ├── codeHighlighter.ts          # Shiki-based syntax highlighting
│   ├── zip.ts                      # ZIP archive generation (bulk export)
│   └── utils.ts                    # Shared utilities (cn helper)
├── hooks/
│   └── use-mobile.tsx              # Mobile breakpoint detection hook
├── types/                          # Shared TypeScript types
└── index.css                       # Global styles & CSS variables
```

---

## Architecture

### Tool Registry

All tools are registered in [`src/lib/registry/tools.ts`](src/lib/registry/tools.ts). This is the single source of truth for tool metadata — adding a tool here surfaces it in the footer, landing page tool grid, and any future navigation automatically.

```ts
// Example: adding a new tool to the registry
{
  slug: "my-tool",
  category: "edit",          // "create" | "edit" | "optimize"
  name: "My Tool",
  description: "What it does.",
  keywords: ["keyword1", "keyword2"],
  icon: "Wand2",             // Any lucide-react icon name
  status: "live",            // "live" = has a route; "soon" = coming soon
  featured: true,            // Show as a card on the landing page
}
```

Then create its route at `src/app/{category}/{slug}/page.tsx`.

### Privacy Model

Every tool follows the same constraint: **no network requests for user data**. Processing is done with:

- **Canvas API** — Screenshot Stylizer, OG Image Maker, Redact & Blur
- **WebAssembly** — Background Removal (`@imgly/background-removal`), image encode/decode
- **Browser File API** — Compress & Convert (reads files locally, generates download)

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create your branch from `main`.
2. **Install** dependencies with `npm install`.
3. **Run** the dev server with `npm run dev`.
4. **Add your tool** to the registry in `src/lib/registry/tools.ts` and create its route.
5. **Open a Pull Request** with a clear description of your changes.

Please keep tools privacy-first — no user data should leave the browser.

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Canvas API, WebAssembly, and modern CSS features.

---

## License

[MIT](LICENSE) — free to use for personal and commercial purposes.
