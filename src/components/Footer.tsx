import Link from "next/link";
import { site } from "@/lib/site";
import {
  CATEGORY_LABELS,
  getToolsByCategory,
  toolPath,
  type ToolCategory,
} from "@/lib/registry/tools";

// Columns pair categories together rather than one-per-category, so a
// light category (Optimize: one tool) never strands its own near-empty
// column next to Create/Edit's five.
const columns: ToolCategory[][] = [["create"], ["edit", "optimize"]];

function CategoryList({ category }: { category: ToolCategory }) {
  return (
    <nav aria-label={`${CATEGORY_LABELS[category]} tools`} className="flex flex-col gap-2">
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
              <span className="text-sm text-muted-foreground/60">{tool.name}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold tracking-tight">
            {site.name}
          </span>
          <p className="text-sm text-muted-foreground">{site.tagline}</p>
        </div>

        {columns.map((group) => (
          <div key={group.join("-")} className="flex flex-col gap-6">
            {group.map((category) => (
              <CategoryList key={category} category={category} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-content items-center justify-center gap-1.5 px-4 py-4 md:px-6">
          <span className="text-sm text-muted-foreground">
            Got feedback? Reach out on{" "}
            <a
              href="https://x.com/iamtanbirr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors duration-120 ease-out hover:decoration-foreground"
            >
              𝕏
            </a>{" "}
            · Open source on{" "}
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors duration-120 ease-out hover:decoration-foreground"
            >
              GitHub
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
