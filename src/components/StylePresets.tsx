import { presets, Preset } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StylePresetsProps {
  activePreset: string | null;
  onSelectPreset: (preset: Preset) => void;
}

export const StylePresets = ({
  activePreset,
  onSelectPreset,
}: StylePresetsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Style Presets
        </h3>
      </div>
      <div className="space-y-2">
        {presets.map((preset) => {
          const isActive = activePreset === preset.id;
          const gradientStyle = preset.settings.useGradient
            ? `linear-gradient(135deg, ${preset.settings.gradientStart}, ${preset.settings.gradientEnd})`
            : preset.settings.backgroundColor;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors duration-150 text-left group",
                isActive
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/40 bg-card/60 hover:bg-accent/30"
              )}
            >
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-border/60"
                style={{ background: gradientStyle }}
              />
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-sm text-foreground">
                  {preset.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {preset.description}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full transition-opacity",
                  isActive
                    ? "bg-primary text-primary-foreground opacity-100"
                    : "opacity-0"
                )}
              >
                <Check className="w-3 h-3" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
