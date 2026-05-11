"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const ZOOM_MIN  = 0.25;
export const ZOOM_MAX  = 2.0;
export const ZOOM_STEP = 0.1;

export interface ZoomBarProps {
  zoom: number | null;   // null = auto-fit
  autoFitScale: number;
  onZoomChange: (z: number | null) => void;
}

export const ZoomBar = ({ zoom, autoFitScale, onZoomChange }: ZoomBarProps) => {
  const effectiveScale = zoom ?? autoFitScale;
  const pct    = Math.round(effectiveScale * 100);
  const isAuto = zoom === null;

  const step = (delta: number) => {
    const base = zoom ?? autoFitScale;
    const next = Math.round((base + delta) * 10) / 10;
    onZoomChange(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next)));
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-border",
        "bg-card/95 backdrop-blur-sm shadow-sm px-1.5 py-1 select-none"
      )}
    >
      <button
        type="button"
        onClick={() => step(-ZOOM_STEP)}
        disabled={effectiveScale <= ZOOM_MIN}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
        title="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>

      <span className="w-10 text-center font-mono text-[11px] font-medium text-foreground">
        {pct}%
      </span>

      <button
        type="button"
        onClick={() => step(ZOOM_STEP)}
        disabled={effectiveScale >= ZOOM_MAX}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
        title="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <button
        type="button"
        onClick={() => onZoomChange(null)}
        className={cn(
          "flex h-6 items-center justify-center rounded-lg px-2 text-[10px] font-semibold transition-colors",
          isAuto
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
        title="Fit to screen"
      >
        Fit
      </button>

      <button
        type="button"
        onClick={() => onZoomChange(1)}
        className={cn(
          "flex h-6 items-center justify-center rounded-lg px-2 text-[10px] font-semibold transition-colors",
          !isAuto && Math.abs(effectiveScale - 1) < 0.01
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
        title="100% — actual pixel size"
      >
        <Maximize2 className="mr-1 h-2.5 w-2.5" />
        100%
      </button>
    </div>
  );
};
