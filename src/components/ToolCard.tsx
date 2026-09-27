import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, toolPath, type Tool } from "@/lib/registry/tools";
import { ToolIcon } from "@/components/ToolIcon";

const cardBase =
  "relative flex flex-col overflow-hidden rounded-lg border bg-card transition-[border-color,transform,box-shadow] duration-120 ease-out";

function CardBody({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <ToolIcon name={tool.icon} className="h-5 w-5 text-primary" />
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-card-foreground">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </div>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  if (tool.status === "live") {
    return (
      <Link
        href={toolPath(tool)}
        className={`${cardBase} hover:border-strong hover:shadow-card motion-safe:hover:-translate-y-0.5`}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={`/landing/thumbs/${tool.slug}.webp`}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 260px"
            className="object-cover"
          />
        </div>
        <CardBody tool={tool} />
      </Link>
    );
  }

  return (
    <div className={`${cardBase} opacity-60`} aria-disabled="true">
      <div className="relative aspect-video w-full bg-muted">
        <span className="absolute right-3 top-3 rounded-full border px-2.5 py-0.5 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      </div>
      <CardBody tool={tool} />
    </div>
  );
}
