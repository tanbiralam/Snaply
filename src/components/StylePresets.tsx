"use client";

import { useState } from "react";
import { presetCategories, Preset } from "@/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

interface StylePresetsProps {
  activePreset: string | null;
  onSelectPreset: (preset: Preset) => void;
}

// ─── Gradient swatch for a preset ────────────────────────────────────────────

const PresetSwatch = ({ preset }: { preset: Preset }) => {
  const s = preset.settings;

  // Image-based background preset — show a thumbnail
  if (s.backgroundImage) {
    return (
      <span
        className="w-7 h-7 rounded-md flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden"
        style={{
          backgroundImage: `url(${s.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  const bg =
    s.useGradient && s.gradientStart && s.gradientEnd
      ? `linear-gradient(${(s as { gradientAngle?: number }).gradientAngle ?? 135}deg, ${s.gradientStart}, ${s.gradientEnd})`
      : (s.backgroundColor ?? "#1a1a2e");

  return (
    <span
      className="w-7 h-7 rounded-md flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10"
      style={{ background: bg }}
    />
  );
};

// ─── Single category accordion panel ─────────────────────────────────────────

interface CategoryPanelProps {
  label: string;
  categoryId: string;
  presets: Preset[];
  activePreset: string | null;
  onSelectPreset: (preset: Preset) => void;
}

const CategoryPanel = ({
  label,
  categoryId,
  presets,
  activePreset,
  onSelectPreset,
}: CategoryPanelProps) => {
  const defaultOpen = presets.some((p) => p.id === activePreset);
  const [open, setOpen] = useState(defaultOpen);

  const hasActive = presets.some((p) => p.id === activePreset);

  return (
    <div className="rounded-lg border hairline overflow-hidden">
      {/* Category header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-left transition-colors duration-150",
          "hover:bg-secondary",
          open && "bg-secondary/60"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {hasActive && !open && (
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Preset list — animated open/close */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-2 pb-2 pt-1 space-y-0.5">
          {presets.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                aria-pressed={isActive}
                className={cn(
                  "relative w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150 text-left",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <PresetSwatch preset={preset} />

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-inherit">
                    {preset.name}
                  </p>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-foreground flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-background" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const StylePresets = ({
  activePreset,
  onSelectPreset,
}: StylePresetsProps) => {
  return (
    <div className="space-y-1.5">
      {presetCategories.map((category) => (
        <CategoryPanel
          key={category.id}
          categoryId={category.id}
          label={category.label}
          presets={category.presets}
          activePreset={activePreset}
          onSelectPreset={onSelectPreset}
        />
      ))}
    </div>
  );
};
