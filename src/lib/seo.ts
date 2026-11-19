import type { Metadata } from "next";
import { site } from "@/lib/site";
import { CATEGORY_LABELS, getTool, toolPath, type ToolCategory } from "@/lib/registry/tools";

/** Per-tool metadata: title, description, keywords, canonical, and OG/Twitter that match the tool (not the homepage). */
export function toolMetadata(category: ToolCategory, slug: string): Metadata {
  const tool = getTool(category, slug);
  if (!tool) return {};
  const path = toolPath(tool);
  const title = `${tool.name} — free, in-browser`;
  const image = `${site.url}${site.ogImage.path}`;
  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: tool.description,
      type: "website",
      url: `${site.url}${path}`,
      siteName: site.name,
      images: [{ url: image, width: site.ogImage.width, height: site.ogImage.height, alt: tool.name }],
    },
    twitter: { card: "summary_large_image", title, description: tool.description, images: [image] },
  };
}

/** schema.org SoftwareApplication JSON-LD for a tool page. */
export function toolJsonLd(category: ToolCategory, slug: string) {
  const tool = getTool(category, slug);
  if (!tool) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${site.url}${toolPath(tool)}`,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: CATEGORY_LABELS[category],
    operatingSystem: "Any (web browser)",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
  };
}
