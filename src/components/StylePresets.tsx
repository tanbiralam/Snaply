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
  const bg =
    s.useGradient && s.gradientStart && s.gradientEnd
      ? `linear-gradient(135deg, ${s.gradientStart}, ${s.gradientEnd})`
      : (s.backgroundColor ?? "#1a1a2e");

  return (
    <span
      className="w-8 h-8 rounded-lg flex-shrink-0 ring-1 ring-white/10"
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
  // Open by default if one of this category's presets is active
  const defaultOpen = presets.some((p) => p.id === activePreset);
  const [open, setOpen] = useState(defaultOpen);

  const hasActive = presets.some((p) => p.id === activePreset);

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card/40">
      {/* Category header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors duration-150",
          "hover:bg-accent/20",
          open && "bg-accent/10"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {hasActive && !open && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
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
        <div className="px-2 pb-2 pt-1 space-y-1">
          {presets.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                aria-pressed={isActive}
                className={cn(
                  "relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all duration-150 text-left group",
                  isActive
                    ? "border-primary/50 bg-primary/8 shadow-sm"
                    : "border-transparent hover:border-border/50 hover:bg-accent/25"
                )}
              >
                <PresetSwatch preset={preset} />

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {preset.name}
                  </p>
                </div>

                {/* Active checkmark */}
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground scale-100 opacity-100"
                      : "scale-75 opacity-0"
                  )}
                >
                  <Check className="w-3 h-3" />
                </span>
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
    <div className="space-y-2">
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
