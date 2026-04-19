"use client";

import { useState } from "react";
import { StyleSettings } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeviceTab } from "./DeviceTab";

interface SettingsPanelProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
}

type ActiveTab = "style" | "device";

export const SettingsPanel = ({
  settings,
  onSettingsChange,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("style");

  const updateSetting = <K extends keyof StyleSettings>(
    key: K,
    value: StyleSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

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
          <div className="space-y-5">
            {/* Layout section */}
            <div className="space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Layout
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Padding</Label>
                  <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {settings.padding}px
                  </span>
                </div>
                <Slider
                  value={[settings.padding]}
                  onValueChange={([value]) => updateSetting("padding", value)}
                  min={16}
                  max={120}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Border radius</Label>
                  <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {settings.borderRadius}px
                  </span>
                </div>
                <Slider
                  value={[settings.borderRadius]}
                  onValueChange={([value]) =>
                    updateSetting("borderRadius", value)
                  }
                  min={0}
                  max={48}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Shadow</Label>
                  <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {settings.shadowIntensity}%
                  </span>
                </div>
                <Slider
                  value={[settings.shadowIntensity]}
                  onValueChange={([value]) =>
                    updateSetting("shadowIntensity", value)
                  }
                  min={0}
                  max={80}
                  step={5}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Aspect ratio</Label>
                <Select
                  value={settings.aspectRatio}
                  onValueChange={(value) =>
                    updateSetting(
                      "aspectRatio",
                      value as StyleSettings["aspectRatio"]
                    )
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="1:1">1:1 — Square</SelectItem>
                    <SelectItem value="16:9">16:9 — Landscape</SelectItem>
                    <SelectItem value="4:5">4:5 — Portrait</SelectItem>
                    <SelectItem value="9:16">9:16 — Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Background section */}
            <div className="space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Background
              </p>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Gradient</Label>
                <Switch
                  checked={settings.useGradient}
                  onCheckedChange={(checked) =>
                    updateSetting("useGradient", checked)
                  }
                />
              </div>

              {settings.useGradient ? (
                <div className="space-y-3">
                  {/* Gradient preview bar */}
                  <div
                    className="h-7 w-full rounded-lg border border-border/40"
                    style={{
                      background: `linear-gradient(135deg, ${settings.gradientStart}, ${settings.gradientEnd})`,
                    }}
                  />
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">
                      Start
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.gradientStart}
                        onChange={(e) =>
                          updateSetting("gradientStart", e.target.value)
                        }
                        className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent appearance-none"
                      />
                      <input
                        type="text"
                        value={settings.gradientStart}
                        onChange={(e) =>
                          updateSetting("gradientStart", e.target.value)
                        }
                        className="flex-1 rounded border border-input bg-background px-2 py-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">
                      End
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.gradientEnd}
                        onChange={(e) =>
                          updateSetting("gradientEnd", e.target.value)
                        }
                        className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent appearance-none"
                      />
                      <input
                        type="text"
                        value={settings.gradientEnd}
                        onChange={(e) =>
                          updateSetting("gradientEnd", e.target.value)
                        }
                        className="flex-1 rounded border border-input bg-background px-2 py-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground">
                    Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        updateSetting("backgroundColor", e.target.value)
                      }
                      className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent appearance-none"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        updateSetting("backgroundColor", e.target.value)
                      }
                      className="flex-1 rounded border border-input bg-background px-2 py-1 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* Effects section */}
            <div className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Effects
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Blur background</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Screenshot as blurred backdrop
                  </p>
                </div>
                <Switch
                  checked={settings.blurBackground}
                  onCheckedChange={(checked) =>
                    updateSetting("blurBackground", checked)
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <DeviceTab settings={settings} onSettingsChange={onSettingsChange} />
        )}
      </div>
    </div>
  );
};
