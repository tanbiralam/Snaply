"use client";

import { StyleSettings, DeviceMockup } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
      "group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-150",
      active
        ? "border-primary/50 bg-primary/5 shadow-sm"
        : "border-border/40 bg-card/50 hover:border-border hover:bg-accent/20",
      incompatible && !active && "opacity-45"
    )}
  >
    {active && (
      <span className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
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
          ? "text-primary"
          : incompatible
            ? "text-muted-foreground/60"
            : "text-muted-foreground group-hover:text-foreground"
      )}
    >
      {label}
    </span>
  </button>
);

// ─── Contextual option panels ─────────────────────────────────────────────────

const BrowserOptions = () => (
  <div className="space-y-3 pt-1">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Browser options</p>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Show URL bar</Label>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Traffic lights</Label>
      <Switch defaultChecked />
    </div>
  </div>
);

const MacOSOptions = () => (
  <div className="space-y-3 pt-1">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">macOS options</p>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Traffic lights</Label>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Window title</Label>
      <Switch />
    </div>
  </div>
);

const PhoneOptions = ({ label }: { label: string }) => (
  <div className="space-y-3 pt-1">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label} options</p>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Show notch</Label>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Home indicator</Label>
      <Switch defaultChecked />
    </div>
  </div>
);

const IPadOptions = () => (
  <div className="space-y-3 pt-1">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">iPad options</p>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Home button</Label>
      <Switch defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Camera dot</Label>
      <Switch defaultChecked />
    </div>
  </div>
);

// ─── Contextual options dispatcher ────────────────────────────────────────────

export const DeviceContextOptions = ({
  device,
  settings,
  onChange,
}: {
  device: DeviceMockup;
  settings: StyleSettings;
  onChange: (s: StyleSettings) => void;
}) => {
  if (device === "none") return null;
  return (
    <div className="mt-4 rounded-xl border border-border/50 bg-card/60 p-3">
      {device === "browser"           && <BrowserOptions />}
      {device === "macos"             && <MacOSOptions />}
      {device === "iphone"            && <PhoneOptions label="iPhone" />}
      {device === "iphone-landscape"  && <PhoneOptions label="iPhone landscape" />}
      {device === "android"           && <PhoneOptions label="Android" />}
      {device === "android-landscape" && <PhoneOptions label="Android landscape" />}
      {device === "ipad"              && <IPadOptions />}
    </div>
  );
};
