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
  /** Featured tools appear as cards on the landing page. */
  featured?: boolean;
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
    featured: true,
  },
  {
    slug: "og-image",
    category: "create",
    name: "OG Image Generator",
    description:
      "Combine a title, subtitle, and screenshot into social and blog cards.",
    keywords: [
      "og",
      "open graph",
      "social card",
      "twitter card",
      "blog",
      "banner",
    ],
    icon: "LayoutTemplate",
    status: "soon",
  },
  {
    slug: "quote",
    category: "create",
    name: "Quote Card",
    description:
      "Turn text, a name, a handle, and an avatar into tweet-style quote graphics.",
    keywords: ["quote", "tweet", "testimonial", "avatar", "handle"],
    icon: "Quote",
    status: "soon",
  },

  // Edit
  {
    slug: "resize",
    category: "edit",
    name: "Resize & Crop",
    description:
      "Resize to preset or custom dimensions, crop freeform, and lock aspect ratios.",
    keywords: ["resize", "crop", "dimensions", "scale", "aspect ratio"],
    icon: "Crop",
    status: "soon",
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
    featured: true,
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
    status: "soon",
    featured: true,
  },
  {
    slug: "watermark",
    category: "edit",
    name: "Watermark",
    description: "Overlay text or a logo with position and opacity controls.",
    keywords: ["watermark", "logo", "overlay", "copyright", "brand"],
    icon: "Stamp",
    status: "soon",
  },

  // Optimize
  {
    slug: "compress",
    category: "optimize",
    name: "Compress",
    description:
      "Shrink image file size with a quality slider and live size preview.",
    keywords: ["compress", "shrink", "file size", "quality", "reduce", "kb"],
    icon: "Minimize2",
    status: "soon",
    featured: true,
  },
  {
    slug: "convert",
    category: "optimize",
    name: "Convert",
    description: "Convert images between PNG, JPEG, WebP, and AVIF formats.",
    keywords: [
      "convert",
      "format",
      "png",
      "jpeg",
      "jpg",
      "webp",
      "avif",
      "png to webp",
    ],
    icon: "ArrowRightLeft",
    status: "soon",
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

export function getFeaturedTools(): Tool[] {
  return tools.filter((t) => t.featured);
}
