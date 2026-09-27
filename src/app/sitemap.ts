import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getLiveTools, toolPath } from "@/lib/registry/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/tools`, changeFrequency: "weekly", priority: 0.8 },
    ...getLiveTools().map((tool) => ({
      url: `${site.url}${toolPath(tool)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
