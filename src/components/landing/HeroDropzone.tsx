"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Lock, X } from "lucide-react";
import photo from "../../../public/landing/hero.jpg";
import { getToolsForFile, toolPath, type Tool } from "@/lib/registry/tools";
import { setPendingFile } from "@/lib/pending-file";
import { ToolIcon } from "@/components/ToolIcon";
import { cn, formatBytes } from "@/lib/utils";

// Three crops of the hero photo fanned like prints on a desk. They open up on
// hover and spread further while a file is dragged over.
const PRINTS = [
  { pos: "20% 60%", rest: "-rotate-[9deg] -translate-x-7", open: "-rotate-[14deg] -translate-x-12", hover: "group-hover:-rotate-[12deg] group-hover:-translate-x-9" },
  { pos: "85% 40%", rest: "rotate-[8deg] translate-x-7", open: "rotate-[14deg] translate-x-12", hover: "group-hover:rotate-[11deg] group-hover:translate-x-9" },
  { pos: "50% 45%", rest: "-translate-y-1", open: "-translate-y-3", hover: "group-hover:-translate-y-2" },
];

function PhotoStack({ spread }: { spread: boolean }) {
  return (
    <span aria-hidden="true" className="relative mb-6 grid h-[72px] w-[96px] place-items-center">
      {PRINTS.map((p) => (
        <span
          key={p.pos}
          className={cn(
            "absolute inset-0 overflow-hidden rounded-md bg-card p-1 shadow-elev-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            spread ? p.open : cn(p.rest, p.hover)
          )}
        >
          <span className="relative block h-full w-full overflow-hidden rounded-[3px]">
            <Image
              src={photo}
              alt=""
              fill
              sizes="96px"
              className="object-cover dark:brightness-[0.8] dark:saturate-[0.7]"
              style={{ objectPosition: p.pos }}
            />
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Drop (or pick) a file → the tools that can open it. Picking one hands the
 * file to that tool's page in memory (pending-file.ts); nothing is uploaded.
 */
export function HeroDropzone() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [picked, setPicked] = useState<{ file: File; tools: Tool[] } | null>(null);

  const pick = (file: File | undefined) => {
    if (file) setPicked({ file, tools: getToolsForFile(file) });
  };

  const open = (tool: Tool) => {
    if (!picked) return;
    setPendingFile(picked.file);
    router.push(toolPath(tool));
  };

  return (
    <div className="w-full">
      {/* Frosted panel floating over the photo; the inner well is recessed. */}
      <div className="rounded-[20px] bg-card/70 p-2 shadow-elev-3 backdrop-blur-2xl backdrop-saturate-150">
        {picked ? (
          <div className="rounded-[14px] bg-card p-4 shadow-elev-inset sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{picked.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(picked.file.size)} ·{" "}
                  {picked.tools.length
                    ? `${picked.tools.length} tools can open this`
                    : "no tool opens this file yet"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPicked(null)}
                aria-label="Choose a different file"
                className="rounded-full p-2 text-muted-foreground transition-colors duration-120 hover:bg-background hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {picked.tools.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {picked.tools.map((tool) => (
                  <li key={tool.slug}>
                    <button
                      type="button"
                      onClick={() => open(tool)}
                      className="group flex w-full items-center gap-3 rounded-lg bg-background px-3 py-3 text-left shadow-elev-1 transition-[box-shadow,transform] duration-160 ease-out hover:shadow-elev-2 motion-safe:hover:-translate-y-0.5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                        <ToolIcon name={tool.icon} className="h-[18px] w-[18px] text-primary" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {tool.name}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-120 group-hover:translate-x-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Try a PNG, JPG, WebP or SVG.
              </p>
            )}
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files[0]);
            }}
            className={cn(
              "group flex cursor-pointer flex-col items-center rounded-[14px] px-6 py-12 text-center shadow-elev-inset transition-[background-color,box-shadow] duration-160 ease-out sm:py-14",
              dragging ? "bg-primary/10 ring-2 ring-inset ring-primary" : "bg-card"
            )}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
              className="sr-only"
            />
            <PhotoStack spread={dragging} />
            <span className="text-xl font-semibold text-foreground">
              {dragging ? "Let go to find a tool" : "Drop an image to find a tool"}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">We'll show you what you can do with it.</span>
            <span className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),0_1px_2px_hsl(var(--primary)/0.4),0_6px_16px_-6px_hsl(var(--primary)/0.6)] transition-[background-color,transform] duration-160 ease-out group-hover:bg-primary-hover motion-safe:group-hover:-translate-y-px">
              Choose an image
            </span>
          </label>
        )}
        <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Never leaves your device
          </span>
          <span>PNG, JPG, WebP, SVG</span>
        </div>
      </div>

    </div>
  );
}
