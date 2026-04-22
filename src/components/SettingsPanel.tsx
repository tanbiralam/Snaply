"use client";

import { useState } from "react";
import { StyleSettings } from "@/types";
import { Palette, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleTab } from "./StyleTab";
import { DeviceTab } from "./DeviceTab";

interface SettingsPanelProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
  imageAspectRatio?: number | null;
}

type ActiveTab = "style" | "device";

export const SettingsPanel = ({
  settings,
  onSettingsChange,
  imageAspectRatio,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("style");

  const updateSetting = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) =>
    onSettingsChange({ ...settings, [key]: value });

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="mb-4 flex rounded-xl border border-border/50 bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-150",
            activeTab === "style"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Palette className="h-3.5 w-3.5" />
          Style
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("device")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-150",
            activeTab === "device"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Smartphone className="h-3.5 w-3.5" />
          Device
          {settings.deviceMockup !== "none" && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              1
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "style" ? (
          <StyleTab settings={settings} updateSetting={updateSetting} />
        ) : (
          <DeviceTab
            settings={settings}
            onSettingsChange={onSettingsChange}
            imageAspectRatio={imageAspectRatio}
          />
        )}
      </div>
    </div>
  );
};
