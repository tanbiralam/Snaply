"use client";

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
import { cn } from "@/lib/utils";

interface StyleTabProps {
  settings: StyleSettings;
  updateSetting: <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => void;
}

// ─── Reusable row primitives ──────────────────────────────────────────────────

/** Thin, non-intrusive section label — matches landing page sidebar labels */
const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

const SliderRow = ({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">{label}</Label>
      <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {value}{unit}
      </span>
    </div>
    <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
  </div>
);

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer appearance-none rounded-lg border hairline bg-transparent"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg border hairline bg-background px-2 py-1 font-mono text-xs"
      />
    </div>
  </div>
);

// ─── Section: Layout ──────────────────────────────────────────────────────────

const LayoutSection = ({ settings, updateSetting }: StyleTabProps) => (
  <div className="space-y-3">
    <SectionLabel>Layout</SectionLabel>
    <SliderRow
      label="Padding" value={settings.padding} unit="px"
      min={16} max={120} step={4}
      onChange={(v) => updateSetting("padding", v)}
    />
    <SliderRow
      label="Border radius" value={settings.borderRadius} unit="px"
      min={0} max={48} step={2}
      onChange={(v) => updateSetting("borderRadius", v)}
    />
    <SliderRow
      label="Shadow" value={settings.shadowIntensity} unit="%"
      min={0} max={80} step={5}
      onChange={(v) => updateSetting("shadowIntensity", v)}
    />
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">Aspect ratio</Label>
      <Select
        value={settings.aspectRatio}
        onValueChange={(v) => updateSetting("aspectRatio", v as StyleSettings["aspectRatio"])}
      >
        <SelectTrigger className="h-8 text-xs rounded-lg border hairline">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Auto</SelectItem>
          <SelectItem value="1:1">1:1 — Square</SelectItem>
          <SelectItem value="16:9">16:9 — Landscape</SelectItem>
          <SelectItem value="4:3">4:3 — Classic</SelectItem>
          <SelectItem value="4:5">4:5 — Portrait</SelectItem>
          <SelectItem value="9:16">9:16 — Story</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

// ─── Section: Background ──────────────────────────────────────────────────────

/** 8 compass directions mapped to their CSS gradient angles. */
const DIRECTIONS: { angle: number; label: string; arrow: string }[] = [
  { angle: 315, label: "Top-left",   arrow: "↖" },
  { angle: 0,   label: "Up",         arrow: "↑" },
  { angle: 45,  label: "Top-right",  arrow: "↗" },
  { angle: 270, label: "Left",       arrow: "←" },
  { angle: -1,  label: "",           arrow: ""  }, // centre blank
  { angle: 90,  label: "Right",      arrow: "→" },
  { angle: 225, label: "Bot-left",   arrow: "↙" },
  { angle: 180, label: "Down",       arrow: "↓" },
  { angle: 135, label: "Bot-right",  arrow: "↘" },
];

const GradientDirectionPicker = ({
  angle,
  onChange,
}: {
  angle: number;
  onChange: (a: number) => void;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label className="text-[10px] text-muted-foreground">Direction</Label>
      <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {angle}°
      </span>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {DIRECTIONS.map((dir, i) => {
        if (dir.angle === -1) {
          return (
            <div key={i} className="flex h-7 w-full items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            </div>
          );
        }
        const isActive = angle === dir.angle;
        return (
          <button
            key={i}
            type="button"
            title={dir.label}
            onClick={() => onChange(dir.angle)}
            className={cn(
              "flex h-7 w-full items-center justify-center rounded-lg text-sm transition-colors duration-100",
              isActive
                ? "bg-foreground text-background"
                : "border hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {dir.arrow}
          </button>
        );
      })}
    </div>
  </div>
);

const BackgroundSection = ({ settings, updateSetting }: StyleTabProps) => (
  <div className="space-y-3">
    <SectionLabel>Background</SectionLabel>
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">Gradient</Label>
      <Switch
        checked={settings.useGradient}
        onCheckedChange={(v) => updateSetting("useGradient", v)}
      />
    </div>
    {settings.useGradient ? (
      <div className="space-y-3">
        <div
          className="h-7 w-full rounded-lg border hairline"
          style={{ background: `linear-gradient(${settings.gradientAngle ?? 135}deg, ${settings.gradientStart}, ${settings.gradientEnd})` }}
        />
        <GradientDirectionPicker
          angle={settings.gradientAngle ?? 135}
          onChange={(v) => updateSetting("gradientAngle", v)}
        />
        <ColorRow label="Start" value={settings.gradientStart} onChange={(v) => updateSetting("gradientStart", v)} />
        <ColorRow label="End"   value={settings.gradientEnd}   onChange={(v) => updateSetting("gradientEnd", v)} />
      </div>
    ) : (
      <ColorRow label="Color" value={settings.backgroundColor} onChange={(v) => updateSetting("backgroundColor", v)} />
    )}
  </div>
);


// ─── Section: Effects ─────────────────────────────────────────────────────────

const EffectsSection = ({ settings, updateSetting }: StyleTabProps) => (
  <div className="space-y-3">
    <SectionLabel>Effects</SectionLabel>
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-xs font-medium">Blur background</Label>
        <p className="text-[10px] text-muted-foreground">Screenshot as blurred backdrop</p>
      </div>
      <Switch
        checked={settings.blurBackground}
        onCheckedChange={(v) => updateSetting("blurBackground", v)}
      />
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-medium">Grain</Label>
          <p className="text-[10px] text-muted-foreground">Film texture on background only</p>
        </div>
        <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {settings.grainIntensity}%
        </span>
      </div>
      <Slider
        value={[settings.grainIntensity]}
        onValueChange={([v]) => updateSetting("grainIntensity", v)}
        min={0} max={100} step={5}
      />
    </div>
  </div>
);

// ─── Composed style tab ───────────────────────────────────────────────────────

export const StyleTab = ({ settings, updateSetting }: StyleTabProps) => (
  <div className="space-y-6">
    <LayoutSection    settings={settings} updateSetting={updateSetting} />
    <BackgroundSection settings={settings} updateSetting={updateSetting} />
    <EffectsSection   settings={settings} updateSetting={updateSetting} />
  </div>
);
