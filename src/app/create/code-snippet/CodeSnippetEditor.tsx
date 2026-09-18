"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  StyleSettings,
  defaultSettings,
  CodeSettings,
  defaultCodeSettings,
  Preset,
} from "@/types";
import {
  CodeCanvasRenderer,
  CodeCanvasRendererRef,
} from "@/components/CodeCanvasRenderer";
import { CodeSettingsTab } from "@/components/CodeSettingsTab";
import { ExportButton } from "@/components/ExportButton";
import { ShareMenu } from "@/components/ShareMenu";
import { CodeInput } from "@/components/CodeInput";
import { StylePresets } from "@/components/StylePresets";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Code, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import Link from "next/link";
import Image from "next/image";

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

/** Trimmed card-frame controls: padding/radius/shadow/background/grain —
 * the subset of StyleSettings CodeCanvasRenderer actually reads. No aspect
 * ratio or device/blur controls; those don't apply to a code card. */
function CardSettingsTab({
  settings,
  onSettingsChange,
}: {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
}) {
  const update = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    const next = { ...settings, [key]: value };
    const bgControls: Array<keyof StyleSettings> = [
      "useGradient",
      "gradientStart",
      "gradientEnd",
      "gradientAngle",
      "backgroundColor",
    ];
    if (bgControls.includes(key as keyof StyleSettings)) next.backgroundImage = null;
    onSettingsChange(next);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Layout</SectionLabel>
        <SliderRow label="Padding" value={settings.padding} unit="px" min={16} max={120} step={4} onChange={(v) => update("padding", v)} />
        <SliderRow label="Border radius" value={settings.borderRadius} unit="px" min={0} max={48} step={2} onChange={(v) => update("borderRadius", v)} />
        <SliderRow label="Shadow" value={settings.shadowIntensity} unit="%" min={0} max={80} step={5} onChange={(v) => update("shadowIntensity", v)} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Background</SectionLabel>
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Gradient</Label>
          <Switch checked={settings.useGradient} onCheckedChange={(v) => update("useGradient", v)} />
        </div>
        {settings.useGradient ? (
          <div className="space-y-3">
            <div
              className="h-7 w-full rounded-lg border hairline"
              style={{ background: `linear-gradient(${settings.gradientAngle ?? 135}deg, ${settings.gradientStart}, ${settings.gradientEnd})` }}
            />
            <ColorRow label="Start" value={settings.gradientStart} onChange={(v) => update("gradientStart", v)} />
            <ColorRow label="End" value={settings.gradientEnd} onChange={(v) => update("gradientEnd", v)} />
          </div>
        ) : (
          <ColorRow label="Color" value={settings.backgroundColor} onChange={(v) => update("backgroundColor", v)} />
        )}
        <SliderRow label="Grain" value={settings.grainIntensity} unit="%" min={0} max={100} step={5} onChange={(v) => update("grainIntensity", v)} />
      </div>
    </div>
  );
}

function Controls({
  settings,
  onSettingsChange,
  codeSettings,
  onCodeSettingsChange,
}: {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
  codeSettings: CodeSettings;
  onCodeSettingsChange: (settings: CodeSettings) => void;
}) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <CodeSettingsTab codeSettings={codeSettings} onCodeSettingsChange={onCodeSettingsChange} />
      <div className="border-t hairline pt-6">
        <CardSettingsTab settings={settings} onSettingsChange={onSettingsChange} />
      </div>
    </div>
  );
}

export default function CodeSnippetEditor() {
  const codeCanvasRef = useRef<CodeCanvasRendererRef>(null);

  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [codeSettings, setCodeSettings] = useState<CodeSettings>(defaultCodeSettings);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasCode = codeSettings.codeContent.trim().length > 0;

  const handlePresetSelect = useCallback((preset: Preset) => {
    setActivePreset(preset.id);
    setSettings((prev) => ({
      ...prev,
      backgroundImage: null,
      ...preset.settings,
    }));
  }, []);

  const handleSettingsChange = useCallback((newSettings: StyleSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  }, []);

  const handleResetStyle = useCallback(() => {
    setSettings(defaultSettings);
    setActivePreset(null);
    toast.success("Style reset");
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type === "text/plain") {
          const active = document.activeElement;
          if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
            return;
          }
          item.getAsString((text) => {
            if (text) {
              setCodeSettings((prev) => ({ ...prev, codeContent: text }));
              toast.success("Code pasted!");
            }
          });
          e.preventDefault();
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleExport = useCallback(
    (format: "png" | "jpeg" | "webp"): string | null =>
      codeCanvasRef.current?.exportImage(format) ?? null,
    []
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt={`${site.name} logo`}
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
            priority
          />
          <span className="font-semibold tracking-tight text-[15px]">{site.name}</span>
        </Link>

        <span className="text-sm text-muted-foreground">Code Snippet</span>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-56 shrink-0 flex-col border-r hairline lg:flex">
          <div className="flex h-full flex-col overflow-y-auto p-3">
            <p className="mb-3 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Presets
            </p>
            <StylePresets
              activePreset={activePreset}
              onSelectPreset={handlePresetSelect}
            />
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {hasCode ? (
            <div className="flex h-full w-full flex-col items-center gap-4">
              <div className="relative flex min-h-0 flex-1 w-full">
                <CodeCanvasRenderer
                  ref={codeCanvasRef}
                  settings={settings}
                  codeSettings={codeSettings}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCodeSettings((prev) => ({ ...prev, codeContent: "" }))}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Code className="h-3.5 w-3.5" />
                  Edit Code
                </button>
                <button
                  type="button"
                  onClick={handleResetStyle}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <ExportButton onExport={handleExport} disabled={!hasCode} />
                <ShareMenu onExport={handleExport} disabled={!hasCode} />
              </div>
            </div>
          ) : (
            <CodeInput
              code={codeSettings.codeContent}
              onChange={(code) => setCodeSettings((prev) => ({ ...prev, codeContent: code }))}
            />
          )}
        </main>

        <aside className="hidden w-72 shrink-0 flex-col border-l hairline xl:flex">
          <div className="flex h-full flex-col overflow-y-auto">
            <Controls
              settings={settings}
              onSettingsChange={handleSettingsChange}
              codeSettings={codeSettings}
              onCodeSettingsChange={setCodeSettings}
            />
          </div>
        </aside>
      </div>

      {/* Mobile editing controls — desktop uses the fixed asides above */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background text-sm font-medium shadow-lg"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Edit
      </button>

      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t hairline bg-background">
            <div className="flex shrink-0 items-center justify-between border-b hairline px-4 py-3">
              <span className="text-sm font-semibold">Edit</span>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="border-b hairline p-3">
                <p className="mb-3 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Presets
                </p>
                <StylePresets
                  activePreset={activePreset}
                  onSelectPreset={handlePresetSelect}
                />
              </div>
              <Controls
                settings={settings}
                onSettingsChange={handleSettingsChange}
                codeSettings={codeSettings}
                onCodeSettingsChange={setCodeSettings}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
