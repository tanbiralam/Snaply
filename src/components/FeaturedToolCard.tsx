import Link from "next/link";
import { toolPath, type Tool } from "@/lib/registry/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolPreview } from "@/components/ToolPreview";

export function FeaturedToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={toolPath(tool)}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-[border-color,transform,box-shadow] duration-120 ease-out hover:border-strong hover:shadow-card motion-safe:hover:-translate-y-0.5"
    >
      <ToolPreview slug={tool.slug} />
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
