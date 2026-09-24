import Image from "next/image";
import Link from "next/link";
import { toolPath, type Tool } from "@/lib/registry/tools";
import { ToolIcon } from "@/components/ToolIcon";

/**
 * Most thumbnails crop fine from the center. OG Image Maker and Quote Card both
 * left-align their text near the card's edge, so a centered crop clips words —
 * these keep the left side instead.
 */
const OBJECT_POSITION: Partial<Record<string, string>> = {
  "og-image": "left center",
  quote: "left center",
};

export function FeaturedToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={toolPath(tool)}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-[border-color,transform,box-shadow] duration-120 ease-out hover:border-strong hover:shadow-card motion-safe:hover:-translate-y-0.5"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
        <Image
          src={`/landing/thumbs/${tool.slug}.webp`}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          className="object-cover"
          style={{ objectPosition: OBJECT_POSITION[tool.slug] ?? "center" }}
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <ToolIcon name={tool.icon} className="h-5 w-5 text-primary" />
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium text-card-foreground">{tool.name}</h3>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}
