"use client";

import { StyleSettings, DeviceMockup, deviceMockupOptions } from "@/types";
import { cn } from "@/lib/utils";
import {
  classifyImageRatio,
  isDeviceIncompatible,
  type DeviceCompatibility,
} from "@/lib/deviceRecommendation";
import { AlertTriangle, Sparkles } from "lucide-react";
import { DeviceCard, DeviceContextOptions } from "./device/DeviceCard";

interface DeviceTabProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
  imageAspectRatio?: number | null;
}

// Device groupings
const WIDE_DEVICES: DeviceMockup[]      = ["none", "browser", "macos", "ipad"];
const PORTRAIT_PHONES: DeviceMockup[]   = ["iphone", "android"];
const LANDSCAPE_PHONES: DeviceMockup[]  = ["iphone-landscape", "android-landscape"];

export const DeviceTab = ({ settings, onSettingsChange, imageAspectRatio }: DeviceTabProps) => {
  const updateDevice = (value: DeviceMockup) =>
    onSettingsChange({ ...settings, deviceMockup: value });

  const compatibility: DeviceCompatibility | null =
    imageAspectRatio != null ? classifyImageRatio(imageAspectRatio) : null;

  const isIncompat = (d: DeviceMockup) => isDeviceIncompatible(d, compatibility);
  const labelFor   = (d: DeviceMockup) =>
    deviceMockupOptions.find((o) => o.value === d)?.label ?? d;

  const selectedIsIncompat =
    settings.deviceMockup !== "none" && isIncompat(settings.deviceMockup);

  const DeviceGrid = ({ devices, title }: { devices: DeviceMockup[]; title: string }) => (
    <div>
      <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {devices.map((device) => (
          <DeviceCard
            key={device}
            device={device}
            active={settings.deviceMockup === device}
            label={labelFor(device)}
            onClick={() => updateDevice(device)}
            incompatible={isIncompat(device)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Recommendation banner */}
      {compatibility && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            {compatibility.recommendation}
          </p>
        </div>
      )}

      <DeviceGrid devices={WIDE_DEVICES}      title="Wide frames" />
      <DeviceGrid devices={PORTRAIT_PHONES}   title="Phone frames · Portrait" />
      <DeviceGrid devices={LANDSCAPE_PHONES}  title="Phone frames · Landscape" />

      {/* Incompatibility warning for the currently selected device */}
      {selectedIsIncompat && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
            This frame works best with a different image ratio. You may see letterboxing or stretching.
          </p>
        </div>
      )}

      <DeviceContextOptions
        device={settings.deviceMockup}
        settings={settings}
        onChange={onSettingsChange}
      />

      {settings.deviceMockup !== "none" && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Frame chrome adapts to your current theme automatically.
        </p>
      )}
    </div>
  );
};
