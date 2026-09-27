"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORY_LABELS, searchTools, tools, type ToolCategory } from "@/lib/registry/tools";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";

const CATEGORIES: (ToolCategory | "all")[] = ["all", ...(Object.keys(CATEGORY_LABELS) as ToolCategory[])];

export function ToolDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");

  const matches = searchTools(query);
  const shown = category === "all" ? matches : matches.filter((t) => t.category === category);
  const count = (c: ToolCategory | "all") => (c === "all" ? matches.length : matches.filter((t) => t.category === c).length);

  return (
    <>
      <div className="sticky top-14 z-30 -mx-4 border-b bg-background/90 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — try “shrink” or “png to webp”"
            aria-label="Search tools"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-120 hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors duration-120 ease-out",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:border-strong hover:bg-accent"
              )}
            >
              {c === "all" ? "All" : CATEGORY_LABELS[c]}
              <span className="font-mono text-2xs opacity-70">{count(c)}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-2xs uppercase tracking-wider text-muted-foreground" aria-live="polite">
        {shown.length} {shown.length === 1 ? "tool" : "tools"}
      </p>

      {shown.length ? (
        <div className="mt-4 grid grid-cols-tools gap-4">
          {shown.map((tool) => (
            <ToolCard key={`${tool.category}/${tool.slug}`} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-foreground">No tools match “{query.trim()}”{category !== "all" && ` in ${CATEGORY_LABELS[category]}`}.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="mt-3 text-sm text-primary transition-colors duration-120 hover:text-primary-hover"
          >
            Show all {tools.length} tools
          </button>
        </div>
      )}
    </>
  );
}
