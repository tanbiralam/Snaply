"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORY_LABELS, getLiveTools, searchTools, toolPath, type Tool } from "@/lib/registry/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "palette:open";
const optionId = (t: Tool) => `palette-${t.category}-${t.slug}`;

/** Opens the palette from anywhere (e.g. the navbar button) without shared state. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = searchTools(query, getLiveTools());
  const current = results[Math.min(active, results.length - 1)];

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      if (dialogRef.current?.open) dialogRef.current.close();
      else open();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, [open]);

  useEffect(() => {
    if (current) document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const go = (tool: Tool | undefined) => {
    if (!tool) return;
    dialogRef.current?.close();
    router.push(toolPath(tool));
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (Math.min(i, results.length - 1) + step + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(current);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search tools"
      // Clicks on the ::backdrop land on the dialog element itself.
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      className="mx-auto mt-[12vh] w-[90vw] max-w-[560px] overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-modal backdrop:bg-background/60 backdrop:backdrop-blur-sm motion-safe:open:animate-palette-in"
    >
      <div className="flex items-center gap-2 border-b px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={current ? optionId(current) : undefined}
          aria-autocomplete="list"
          aria-label="Search tools"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          placeholder="Jump to a tool…"
          className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </div>

      <ul id="palette-results" role="listbox" aria-label="Tools" className="max-h-80 overflow-y-auto p-2">
        {results.map((tool) => (
          <li
            key={optionId(tool)}
            id={optionId(tool)}
            role="option"
            aria-selected={tool === current}
            onMouseMove={() => setActive(results.indexOf(tool))}
            onClick={() => go(tool)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm",
              tool === current ? "bg-primary/15 text-foreground" : "text-foreground"
            )}
          >
            <ToolIcon name={tool.icon} className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate">{tool.name}</span>
            <span className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[tool.category]}
            </span>
          </li>
        ))}
        {!results.length && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground" role="presentation">
            No tools match “{query.trim()}”
          </li>
        )}
      </ul>

      <div className="flex gap-4 border-t px-4 py-2 font-mono text-2xs uppercase tracking-wider text-muted-foreground">
        <span>↑↓ navigate</span>
        <span>↵ open</span>
        <span>esc close</span>
      </div>
    </dialog>
  );
}

export function CommandPaletteButton() {
  const [mod, setMod] = useState("⌘");
  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setMod("Ctrl ");
  }, []);
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Search tools"
      aria-keyshortcuts="Meta+K Control+K"
      className="inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground transition-colors duration-120 ease-out hover:border-strong hover:text-foreground"
    >
      <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden font-mono text-2xs sm:inline">{mod}K</kbd>
    </button>
  );
}
