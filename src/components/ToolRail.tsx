"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Search } from "lucide-react";
import { CATEGORY_LABELS, getLiveTools, toolPath, type ToolCategory } from "@/lib/registry/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { openCommandPalette } from "@/components/CommandPalette";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const item = (active = false) =>
  cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-120 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  );

function Tip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function ToolRail() {
  const pathname = usePathname();
  const live = getLiveTools();
  const groups = (Object.keys(CATEGORY_LABELS) as ToolCategory[])
    .map((category) => ({ category, tools: live.filter((t) => t.category === category) }))
    .filter((g) => g.tools.length);

  return (
    <nav aria-label="Tools" className="hidden w-14 shrink-0 flex-col border-r bg-secondary md:flex">
      <div className="flex h-14 shrink-0 items-center justify-center border-b">
        <Tip label="Search tools (Ctrl/⌘ K)">
          <button type="button" aria-label="Search tools" onClick={openCommandPalette} className={item()}>
            <Search className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </Tip>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto py-2">
        {groups.map((g, i) => (
          <Fragment key={g.category}>
            {i > 0 && <hr aria-hidden="true" className="my-2 w-6 border-border" />}
            <ul aria-label={CATEGORY_LABELS[g.category]} className="flex flex-col gap-1">
              {g.tools.map((tool) => {
                const href = toolPath(tool);
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Tip label={tool.name}>
                      {/* No viewport prefetch: 11 tool bundles (shiki, etc.) on every tool page is wasted bandwidth. */}
                      <Link
                        href={href}
                        prefetch={false}
                        aria-label={tool.name}
                        aria-current={active ? "page" : undefined}
                        className={item(active)}
                      >
                        <ToolIcon name={tool.icon} className="h-5 w-5" />
                      </Link>
                    </Tip>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ))}
      </div>

      <div className="flex shrink-0 justify-center border-t py-2">
        <Tip label="All tools">
          <Link href="/tools" aria-label="All tools" className={item()}>
            <LayoutGrid className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </Tip>
      </div>
    </nav>
  );
}

/** Category-layout shell: the tool rail beside the tool's own full-height page. */
export function ToolShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ToolRail />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
