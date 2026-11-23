import Link from "next/link";
import { ChevronDown, Github } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPaletteButton } from "@/components/CommandPalette";
import { BrandMark } from "@/components/BrandMark";
import { ToolIcon } from "@/components/ToolIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CATEGORY_LABELS,
  getLiveTools,
  toolPath,
  type ToolCategory,
} from "@/lib/registry/tools";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ToolCategory[];

function CategoryMenu({ category }: { category: ToolCategory }) {
  const items = getLiveTools().filter((t) => t.category === category);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[15px] font-medium text-foreground/80 outline-none transition-colors duration-120 hover:bg-foreground/5 hover:text-foreground data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground">
        {CATEGORY_LABELS[category]}
        <ChevronDown className="h-4 w-4 opacity-60" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-72 rounded-2xl p-2">
        {items.map((tool) => (
          <DropdownMenuItem key={tool.slug} asChild className="cursor-pointer rounded-xl p-2">
            <Link href={toolPath(tool)} className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                <ToolIcon name={tool.icon} className="h-4 w-4 text-primary" />
              </span>
              <span className="text-sm font-medium">{tool.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** `overlay`: transparent and unbordered, for sitting on the landing sky. */
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={cn(
        "z-40",
        overlay ? "absolute inset-x-0 top-0" : "sticky top-0 border-b bg-background"
      )}
    >
      <div className={cn("mx-auto flex max-w-content items-center gap-6 px-4 md:px-6", overlay ? "h-20" : "h-14")}>
        {/* Source is 600×200, so it scales up cleanly. */}
        <div className="[&_img]:h-10 [&_img]:w-auto">
          <BrandMark />
        </div>

        <nav aria-label="Tool categories" className="hidden items-center gap-1 md:flex">
          {CATEGORIES.map((c) => (
            <CategoryMenu key={c} category={c} />
          ))}
          <Link
            href="/tools"
            className="inline-flex h-9 items-center rounded-full px-3 text-[15px] font-medium text-foreground/80 transition-colors duration-120 hover:bg-foreground/5 hover:text-foreground"
          >
            All tools
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CommandPaletteButton />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full border hairline bg-card/80 hover:bg-secondary transition-colors"
          >
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
