import Link from "next/link";
import { toolPath, type Tool } from "@/lib/registry/tools";
import { ToolPreview } from "@/components/ToolPreview";

export function FeaturedToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={toolPath(tool)}
      className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-elev-1 transition-[transform,box-shadow] duration-160 ease-out hover:shadow-elev-2 motion-safe:hover:-translate-y-1 motion-safe:active:scale-[0.98] active:duration-75"
    >
      {/* The preview already shows what the tool does, so no icon above the title. */}
      <div className="overflow-hidden">
        <div className="transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]">
          <ToolPreview slug={tool.slug} />
        </div>
      </div>
      <div className="flex flex-col gap-1 p-5">
        <h3 className="text-lg font-medium text-card-foreground">{tool.name}</h3>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
