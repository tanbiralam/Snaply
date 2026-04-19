"use client";

import { StyleSettings, DeviceMockup } from "@/types";
import { deviceMockupOptions } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DeviceTabProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
}

// ─── Mini SVG previews ────────────────────────────────────────────────────────

const DevicePreviewSVG = ({
  device,
  active,
}: {
  device: DeviceMockup;
  active: boolean;
}) => {
  const stroke = active ? "#6c5ce7" : "currentColor";
  const fill = active ? "rgba(108,92,231,0.08)" : "transparent";
  const barFill = active ? "rgba(108,92,231,0.12)" : "rgba(0,0,0,0.04)";

  switch (device) {
    // ── Wide / landscape ──────────────────────────────────────────────────
    case "browser":
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect
            x="1"
            y="1"
            width="50"
            height="36"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          <rect
            x="1"
            y="1"
            width="50"
            height="10"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={barFill}
          />
          <rect x="1" y="7" width="50" height="4" fill={barFill} />
          <circle cx="8" cy="6" r="1.5" fill="#ff5f57" />
          <circle cx="13" cy="6" r="1.5" fill="#febc2e" />
          <circle cx="18" cy="6" r="1.5" fill="#28c840" />
          <rect
            x="22"
            y="3.5"
            width="22"
            height="5"
            rx="2.5"
            stroke={stroke}
            strokeWidth="0.8"
            fill="white"
            fillOpacity="0.5"
          />
          <rect
            x="5"
            y="16"
            width="42"
            height="3"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="5"
            y="22"
            width="34"
            height="3"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
          <rect
            x="5"
            y="28"
            width="38"
            height="3"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
        </svg>
      );

    case "macos":
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect
            x="1"
            y="1"
            width="50"
            height="36"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          <rect
            x="1"
            y="1"
            width="50"
            height="9"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={barFill}
          />
          <rect x="1" y="6" width="50" height="4" fill={barFill} />
          <circle cx="8" cy="5.5" r="1.5" fill="#ff5f57" />
          <circle cx="13" cy="5.5" r="1.5" fill="#febc2e" />
          <circle cx="18" cy="5.5" r="1.5" fill="#28c840" />
          <rect
            x="5"
            y="15"
            width="42"
            height="3"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="5"
            y="21"
            width="34"
            height="3"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
          <rect
            x="5"
            y="27"
            width="38"
            height="3"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
        </svg>
      );

    case "ipad":
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect
            x="1"
            y="1"
            width="46"
            height="36"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          <rect
            x="4"
            y="4"
            width="40"
            height="30"
            rx="2"
            fill={stroke}
            fillOpacity="0.06"
          />
          <circle cx="49.5" cy="19" r="2.5" stroke={stroke} strokeWidth="0.8" />
          <rect
            x="6"
            y="8"
            width="36"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="6"
            y="13"
            width="28"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
          <rect
            x="6"
            y="18"
            width="32"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
          <rect
            x="6"
            y="23"
            width="24"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.10"
          />
        </svg>
      );

    // ── iPhone portrait ───────────────────────────────────────────────────
    case "iphone":
      return (
        <svg width="30" height="52" viewBox="0 0 30 52" fill="none">
          <rect
            x="1"
            y="1"
            width="28"
            height="50"
            rx="6"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          <rect
            x="10"
            y="2.5"
            width="10"
            height="4"
            rx="2"
            fill={stroke}
            fillOpacity="0.4"
          />
          <rect
            x="3"
            y="10"
            width="24"
            height="30"
            rx="1"
            fill={stroke}
            fillOpacity="0.08"
          />
          <rect
            x="5"
            y="13"
            width="18"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <rect
            x="5"
            y="17"
            width="14"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="5"
            y="21"
            width="16"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="11"
            y="46"
            width="8"
            height="3"
            rx="1.5"
            fill={stroke}
            fillOpacity="0.30"
          />
        </svg>
      );

    // ── iPhone landscape ──────────────────────────────────────────────────
    case "iphone-landscape":
      return (
        <svg width="52" height="30" viewBox="0 0 52 30" fill="none">
          <rect
            x="1"
            y="1"
            width="50"
            height="28"
            rx="6"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          {/* notch on left side */}
          <rect
            x="2.5"
            y="10"
            width="4"
            height="10"
            rx="2"
            fill={stroke}
            fillOpacity="0.4"
          />
          {/* screen area */}
          <rect
            x="10"
            y="3"
            width="30"
            height="24"
            rx="1"
            fill={stroke}
            fillOpacity="0.08"
          />
          <rect
            x="12"
            y="7"
            width="18"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <rect
            x="12"
            y="11"
            width="14"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="12"
            y="15"
            width="16"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          {/* home indicator on right */}
          <rect
            x="46"
            y="12"
            width="3"
            height="6"
            rx="1.5"
            fill={stroke}
            fillOpacity="0.30"
          />
        </svg>
      );

    // ── Android portrait ──────────────────────────────────────────────────
    case "android":
      return (
        <svg width="30" height="52" viewBox="0 0 30 52" fill="none">
          <rect
            x="1"
            y="1"
            width="28"
            height="50"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          <circle cx="15" cy="5" r="1.5" fill={stroke} fillOpacity="0.5" />
          <rect
            x="3"
            y="10"
            width="24"
            height="30"
            rx="1"
            fill={stroke}
            fillOpacity="0.08"
          />
          <rect
            x="5"
            y="13"
            width="18"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <rect
            x="5"
            y="17"
            width="14"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="5"
            y="21"
            width="16"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="9"
            y="44"
            width="4"
            height="4"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <circle cx="15" cy="46" r="2" stroke={stroke} strokeWidth="0.8" />
          <rect
            x="17"
            y="44"
            width="4"
            height="4"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
        </svg>
      );

    // ── Android landscape ─────────────────────────────────────────────────
    case "android-landscape":
      return (
        <svg width="52" height="30" viewBox="0 0 52 30" fill="none">
          <rect
            x="1"
            y="1"
            width="50"
            height="28"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            fill={fill}
          />
          {/* camera dot top-center */}
          <circle cx="26" cy="4" r="1.5" fill={stroke} fillOpacity="0.5" />
          {/* screen area */}
          <rect
            x="10"
            y="3"
            width="32"
            height="24"
            rx="1"
            fill={stroke}
            fillOpacity="0.08"
          />
          <rect
            x="12"
            y="7"
            width="18"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <rect
            x="12"
            y="11"
            width="14"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          <rect
            x="12"
            y="15"
            width="16"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.15"
          />
          {/* nav dots on right */}
          <rect
            x="44"
            y="11"
            width="4"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <circle cx="46" cy="16" r="1.5" stroke={stroke} strokeWidth="0.8" />
          <rect
            x="44"
            y="19"
            width="4"
            height="2"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
        </svg>
      );

    // ── None ──────────────────────────────────────────────────────────────
    case "none":
    default:
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect
            x="1"
            y="1"
            width="50"
            height="36"
            rx="4"
            stroke={stroke}
            strokeWidth="1.2"
            strokeDasharray="4 3"
            fill={fill}
          />
          <rect
            x="5"
            y="8"
            width="42"
            height="22"
            rx="2"
            fill={stroke}
            fillOpacity="0.06"
          />
          <rect
            x="8"
            y="12"
            width="36"
            height="2.5"
            rx="1"
            fill={stroke}
            fillOpacity="0.20"
          />
          <rect
            x="8"
            y="17"
            width="28"
            height="2.5"
            rx="1"
            fill={stroke}
            fillOpacity="0.12"
          />
          <rect
            x="8"
            y="22"
            width="32"
            height="2.5"
            rx="1"
            fill={stroke}
            fillOpacity="0.12"
          />
        </svg>
      );
  }
};

// ─── Device card ──────────────────────────────────────────────────────────────

const DeviceCard = ({
  device,
  active,
  label,
  onClick,
}: {
  device: DeviceMockup;
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-150",
      active
        ? "border-primary/50 bg-primary/5 shadow-sm"
        : "border-border/40 bg-card/50 hover:border-border hover:bg-accent/20"
    )}
  >
    {active && (
      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <polyline
            points="1.5,4 3,5.5 6.5,2"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )}
    <DevicePreviewSVG device={device} active={active} />
    <span
      className={cn(
        "text-[11px] font-medium transition-colors text-center leading-tight",
        active
          ? "text-primary"
          : "text-muted-foreground group-hover:text-foreground"
      )}
    >
      {label}
    </span>
  </button>
);

// ─── Contextual options per device ────────────────────────────────────────────

const BrowserOptions = () => (
  <div className="space-y-3 pt-1">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      Browser options
    </p>
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
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      macOS options
    </p>
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
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {label} options
    </p>
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
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      iPad options
    </p>
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

const DeviceContextOptions = ({
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
      {device === "browser" && <BrowserOptions />}
      {device === "macos" && <MacOSOptions />}
      {device === "iphone" && <PhoneOptions label="iPhone" />}
      {device === "iphone-landscape" && (
        <PhoneOptions label="iPhone landscape" />
      )}
      {device === "android" && <PhoneOptions label="Android" />}
      {device === "android-landscape" && (
        <PhoneOptions label="Android landscape" />
      )}
      {device === "ipad" && <IPadOptions />}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const DeviceTab = ({ settings, onSettingsChange }: DeviceTabProps) => {
  const updateDevice = (value: DeviceMockup) => {
    onSettingsChange({ ...settings, deviceMockup: value });
  };

  const wideDevices: DeviceMockup[] = ["none", "browser", "macos", "ipad"];

  const portraitPhones: DeviceMockup[] = ["iphone", "android"];
  const landscapePhones: DeviceMockup[] = [
    "iphone-landscape",
    "android-landscape",
  ];

  const labelFor = (d: DeviceMockup) =>
    deviceMockupOptions.find((o) => o.value === d)?.label ?? d;

  return (
    <div className="space-y-5">
      {/* Wide / desktop frames */}
      <div>
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Wide frames
        </p>
        <div className="grid grid-cols-2 gap-2">
          {wideDevices.map((device) => (
            <DeviceCard
              key={device}
              device={device}
              active={settings.deviceMockup === device}
              label={labelFor(device)}
              onClick={() => updateDevice(device)}
            />
          ))}
        </div>
      </div>

      {/* Phone frames — portrait */}
      <div>
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Phone frames · Portrait
        </p>
        <div className="grid grid-cols-2 gap-2">
          {portraitPhones.map((device) => (
            <DeviceCard
              key={device}
              device={device}
              active={settings.deviceMockup === device}
              label={labelFor(device)}
              onClick={() => updateDevice(device)}
            />
          ))}
        </div>
      </div>

      {/* Phone frames — landscape */}
      <div>
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Phone frames · Landscape
        </p>
        <div className="grid grid-cols-2 gap-2">
          {landscapePhones.map((device) => (
            <DeviceCard
              key={device}
              device={device}
              active={settings.deviceMockup === device}
              label={labelFor(device)}
              onClick={() => updateDevice(device)}
            />
          ))}
        </div>
      </div>

      {/* Contextual options */}
      <DeviceContextOptions
        device={settings.deviceMockup}
        settings={settings}
        onChange={onSettingsChange}
      />

      {/* Theme hint */}
      {settings.deviceMockup !== "none" && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Frame chrome adapts to your current theme automatically.
        </p>
      )}
    </div>
  );
};
