"use client";

import { StyleSettings, DeviceMockup, deviceMockupOptions } from "@/types";
import { cn } from "@/lib/utils";
import {
  classifyImageRatio,
  isDeviceIncompatible,
  type DeviceCompatibility,
} from "@/lib/deviceRecommendation";
import { AlertTriangle, Sparkles } from "lucide-react";
import { DeviceCard } from "./device/DeviceCard";

interface DeviceTabProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
  imageAspectRatio?: number | null;
}

// Device groupings
const WIDE_DEVICES: DeviceMockup[]      = ["none", "browser", "macos", "ipad"];
const PORTRAIT_PHONES: DeviceMockup[]   = ["iphone", "android"];

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
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
    <div className="space-y-5">
      {/* Recommendation banner */}
      {compatibility && (
        <div className="flex items-start gap-2 rounded-lg border hairline bg-secondary/50 px-3 py-2.5">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/70" />
          <p className="text-[11px] leading-relaxed text-foreground/80">
            {compatibility.recommendation}
          </p>
        </div>
      )}

      <DeviceGrid devices={WIDE_DEVICES}      title="Wide frames" />
      <DeviceGrid devices={PORTRAIT_PHONES}   title="Phone · Portrait" />

      {/* Incompatibility warning for the currently selected device */}
      {selectedIsIncompat && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
            This frame works best with a different image ratio. You may see letterboxing or stretching.
          </p>
        </div>
      )}

      {settings.deviceMockup !== "none" && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Frame chrome adapts to your current theme automatically.
        </p>
      )}
    </div>
  );
};
