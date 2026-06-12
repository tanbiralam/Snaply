import Link from "next/link";
import { site } from "@/lib/site";
import {
  CATEGORY_LABELS,
  getToolsByCategory,
  toolPath,
  type ToolCategory,
} from "@/lib/registry/tools";

const categories: ToolCategory[] = ["create", "edit", "optimize"];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold tracking-tight">
            {site.name}
          </span>
          <p className="text-sm text-muted-foreground">{site.tagline}</p>
        </div>

        {categories.map((category) => (
          <nav
            key={category}
            aria-label={`${CATEGORY_LABELS[category]} tools`}
            className="flex flex-col gap-2"
          >
            <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[category]}
            </span>
            <ul className="flex flex-col gap-1.5">
              {getToolsByCategory(category).map((tool) => (
                <li key={tool.slug}>
                  {tool.status === "live" ? (
                    <Link
                      href={toolPath(tool)}
                      className="text-sm text-muted-foreground transition-colors duration-120 ease-out hover:text-foreground"
                    >
                      {tool.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground/60">
                      {tool.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
