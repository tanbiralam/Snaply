"use client";

import { DeviceMockup } from "@/types";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { DevicePreviewSVG } from "./DevicePreviewSVG";

// ─── Device card ──────────────────────────────────────────────────────────────

export const DeviceCard = ({
  device,
  active,
  label,
  onClick,
  incompatible,
}: {
  device: DeviceMockup;
  active: boolean;
  label: string;
  onClick: () => void;
  incompatible?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    title={incompatible ? "May not look great with this image aspect ratio" : undefined}
    className={cn(
      "group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all duration-150",
      active
        ? "border-foreground bg-secondary text-foreground shadow-sm"
        : "border hairline bg-background hover:border-foreground/30 hover:bg-secondary",
      incompatible && !active && "opacity-40"
    )}
  >
    {active && (
      <span className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-foreground">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <polyline points="1.5,4 3,5.5 6.5,2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )}
    {incompatible && !active && (
      <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/90">
        <AlertTriangle className="h-2.5 w-2.5 text-white" />
      </span>
    )}
    <DevicePreviewSVG device={device} active={active} />
    <span
      className={cn(
        "text-center text-[11px] font-medium leading-tight transition-colors",
        active
          ? "text-foreground"
          : incompatible
            ? "text-muted-foreground/50"
            : "text-muted-foreground group-hover:text-foreground"
      )}
    >
      {label}
    </span>
  </button>
);

