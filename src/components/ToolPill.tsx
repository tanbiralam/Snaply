import Link from "next/link";
import { toolPath, type Tool } from "@/lib/registry/tools";

const pillBase =
  "inline-flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-0.5 text-xs";

export function ToolPill({ tool }: { tool: Tool }) {
  if (tool.status === "live") {
    return (
      <Link
        href={toolPath(tool)}
        className={`${pillBase} text-foreground transition-colors duration-120 ease-out hover:border-strong hover:bg-accent`}
      >
        {tool.name}
      </Link>
    );
  }

  return (
    <span className={`${pillBase} text-muted-foreground`} aria-disabled="true">
      {tool.name}
      <span className="font-mono text-2xs font-medium uppercase tracking-wider">
        Soon
      </span>
    </span>
  );
}
