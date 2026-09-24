export type ToolCategory = "create" | "edit" | "optimize";

export type ToolStatus = "live" | "soon";

export interface Tool {
  /** Route segment under the category, kebab-case (e.g. "remove-background"). */
  slug: string;
  category: ToolCategory;
  name: string;
  description: string;
  /** Search terms for the /tools directory and command palette. */
  keywords: string[];
  /** Lucide icon name (lucide-react export). */
  icon: string;
  /** "live" tools have a route; "soon" tools exist only in the registry. */
  status: ToolStatus;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  create: "Create",
  edit: "Edit",
  optimize: "Optimize",
};

export const tools: readonly Tool[] = [
  // Create
  {
    slug: "screenshot",
    category: "create",
    name: "Screenshot Stylizer",
    description:
      "Turn flat screenshots into polished visuals with backgrounds, padding, shadows, and device frames.",
    keywords: [
      "screenshot",
      "beautify",
      "background",
      "gradient",
      "device frame",
      "mockup",
      "shadow",
      "padding",
    ],
    icon: "Image",
    status: "live",
  },
  {
    slug: "og-image",
    category: "create",
    name: "OG Image Maker",
    description:
      "Compose a title, subtitle, logo, and screenshot into polished 1200×630 social and blog cards.",
    keywords: [
      "og",
      "open graph",
      "social card",
      "twitter card",
      "blog",
      "banner",
      "1200x630",
      "meta image",
      "share image",
    ],
    icon: "LayoutTemplate",
    status: "live",
  },
  {
    slug: "code-snippet",
    category: "create",
    name: "Code Snippet",
    description:
      "Turn a code snippet into a shareable, syntax-highlighted image with custom backgrounds and window chrome.",
    keywords: [
      "code",
      "snippet",
      "syntax highlighting",
      "code screenshot",
      "code card",
      "dev",
      "programming",
    ],
    icon: "Code",
    status: "live",
  },
  {
    slug: "favicon",
    category: "create",
    name: "Favicon Generator",
    description:
      "Turn a logo into a full favicon & app icon package — every size, a multi-res .ico, manifest, and embed code.",
    keywords: [
      "favicon",
      "app icon",
      "apple touch icon",
      "manifest",
      "ico",
      "site icon",
      "android chrome icon",
    ],
    icon: "Squircle",
    status: "live",
  },
  {
    slug: "quote",
    category: "create",
    name: "Quote Card",
    description:
      "Turn text, a name, a handle, and an avatar into social-post and quote graphics.",
    keywords: [
      "quote",
      "tweet",
      "post",
      "testimonial",
      "avatar",
      "handle",
      "instagram",
      "social",
    ],
    icon: "Quote",
    status: "live",
  },

  {
    slug: "resize",
    category: "edit",
    name: "Resize & Crop",
    description:
      "Crop to any aspect ratio and resize to exact dimensions or social-media presets.",
    keywords: [
      "resize",
      "crop",
      "dimensions",
      "aspect ratio",
      "scale",
      "trim",
      "instagram",
      "thumbnail",
      "1080x1080",
      "1200x630",
    ],
    icon: "Crop",
    status: "live",
  },
  {
    slug: "metadata",
    category: "edit",
    name: "Metadata Viewer",
    description:
      "See exactly what's hidden in a photo — GPS location, camera, timestamps — then strip it losslessly.",
    keywords: [
      "exif",
      "metadata",
      "gps",
      "location",
      "privacy",
      "strip metadata",
      "remove exif",
      "geotag",
    ],
    icon: "ScanSearch",
    status: "live",
  },
  {
    slug: "redact",
    category: "edit",
    name: "Redact & Blur",
    description:
      "Draw regions to permanently pixelate or blur sensitive information.",
    keywords: ["redact", "blur", "pixelate", "censor", "hide", "privacy"],
    icon: "EyeOff",
    status: "live",
  },
  {
    slug: "remove-background",
    category: "edit",
    name: "Remove Background",
    description:
      "Remove image backgrounds with an in-browser ML model — nothing is uploaded.",
    keywords: [
      "remove background",
      "background removal",
      "transparent",
      "cutout",
    ],
    icon: "Eraser",
    status: "live",
  },
  {
    slug: "watermark",
    category: "edit",
    name: "Watermark",
    description:
      "Stamp text or a logo onto an image — pick a corner or tile it across, with size, opacity, and rotation controls.",
    keywords: [
      "watermark",
      "logo",
      "copyright",
      "stamp",
      "overlay",
      "brand",
      "protect",
      "signature",
    ],
    icon: "Stamp",
    status: "live",
  },


  // Optimize
  {
    slug: "compress",
    category: "optimize",
    name: "Compress & Convert",
    description:
      "Bulk-compress and convert images between PNG, JPEG, WebP, and AVIF with a quality slider and live size savings.",
    keywords: [
      "compress",
      "shrink",
      "file size",
      "quality",
      "reduce",
      "kb",
      "convert",
      "format",
      "png",
      "jpeg",
      "jpg",
      "webp",
      "avif",
      "bulk",
      "batch",
    ],
    icon: "Minimize2",
    status: "live",
  },
];

/** Canonical route for a tool: /category/slug. */
export function toolPath(tool: Pick<Tool, "category" | "slug">): string {
  return `/${tool.category}/${tool.slug}`;
}

export function getTool(
  category: ToolCategory,
  slug: string
): Tool | undefined {
  return tools.find((t) => t.category === category && t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getLiveTools(): Tool[] {
  return tools.filter((t) => t.status === "live");
}

// Filler words dropped from queries so "png to webp" matches on png + webp.
const STOPWORDS = new Set(["a", "an", "and", "the", "to", "into", "of", "for", "from", "in", "my", "or", "with"]);

/**
 * Live filter for the directory and command palette. Every query word must appear in
 * the tool's name, keywords, category, or description; results are ranked by where
 * the words hit (name > keyword > category/description), registry order breaking ties.
 */
export function searchTools(query: string, pool: readonly Tool[] = tools): Tool[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((w) => w && !STOPWORDS.has(w));
  if (!words.length) return [...pool];

  const scored: { tool: Tool; score: number; i: number }[] = [];
  pool.forEach((tool, i) => {
    const name = tool.name.toLowerCase();
    const keywords = tool.keywords.join(" ").toLowerCase();
    const rest = `${CATEGORY_LABELS[tool.category]} ${tool.description}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (name.includes(w)) score += 3;
      else if (keywords.includes(w)) score += 2;
      else if (rest.includes(w)) score += 1;
      else return;
    }
    scored.push({ tool, score, i });
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((s) => s.tool);
}
