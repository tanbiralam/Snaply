import Link from "next/link";
import { CATEGORY_LABELS, toolPath, type Tool } from "@/lib/registry/tools";
import { ToolIcon } from "@/components/ToolIcon";

const cardBase =
  "relative flex flex-col gap-3 rounded-lg border bg-card p-5 transition-[border-color,transform,box-shadow] duration-120 ease-out";

function CardBody({ tool }: { tool: Tool }) {
  return (
    <>
      <ToolIcon name={tool.icon} className="h-5 w-5 text-primary" />
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-card-foreground">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  if (tool.status === "live") {
    return (
      <Link
        href={toolPath(tool)}
        className={`${cardBase} hover:border-strong hover:shadow-card motion-safe:hover:-translate-y-0.5`}
      >
        <CardBody tool={tool} />
      </Link>
    );
  }

  return (
    <div className={`${cardBase} opacity-60`} aria-disabled="true">
      <span className="absolute right-3 top-3 rounded-full border px-2.5 py-0.5 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        Soon
      </span>
      <CardBody tool={tool} />
    </div>
  );
}
