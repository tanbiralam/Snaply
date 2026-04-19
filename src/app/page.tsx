"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { StyleSettings, defaultSettings, Preset } from "@/types";
import { CanvasRenderer, CanvasRendererRef } from "@/components/CanvasRenderer";
import { ExportButton } from "@/components/ExportButton";
import { ImageUpload } from "@/components/ImageUpload";
import { SettingsPanel } from "@/components/SettingsPanel";
import { StylePresets } from "@/components/StylePresets";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { Link, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── URL state encoding helpers ──────────────────────────────────────────────

function encodeSettings(settings: StyleSettings): string {
  try {
    return btoa(JSON.stringify(settings));
  } catch {
    return "";
  }
}

function decodeSettings(encoded: string): Partial<StyleSettings> | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    if (typeof decoded === "object" && decoded !== null) {
      return decoded as Partial<StyleSettings>;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const canvasRef = useRef<CanvasRendererRef>(null);
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Restore settings from URL hash on mount ──────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#state=")) {
      const encoded = hash.slice("#state=".length);
      const decoded = decodeSettings(encoded);
      if (decoded) {
        setSettings({ ...defaultSettings, ...decoded });
      }
    }
    setIsInitialized(true);
  }, []);

  // ── Sync settings to URL hash whenever they change ───────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    const encoded = encodeSettings(settings);
    if (encoded) {
      const newUrl =
        window.location.pathname + window.location.search + "#state=" + encoded;
      window.history.replaceState(null, "", newUrl);
    }
  }, [settings, isInitialized]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  // Receives full Preset object, sets activePreset id and merges settings
  const handlePresetSelect = useCallback((preset: Preset) => {
    setActivePreset(preset.id);
    setSettings((prev) => ({ ...prev, ...preset.settings }));
  }, []);

  // Clears activePreset when user manually changes any setting
  const handleSettingsChange = useCallback((newSettings: StyleSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  }, []);

  const handleExport = useCallback(
    (format: "png" | "jpeg" | "webp"): string | null => {
      return canvasRef.current?.exportImage(format) ?? null;
    },
    []
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! Share it to apply these settings.");
    } catch {
      toast.error("Could not copy link — please copy the URL manually.");
    }
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <img className="w-5 h-5" src="/logo.png" alt="Snaply logo" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">
              Snaply
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block leading-none">
              Transform screenshots into stunning visuals
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5",
              "text-xs font-medium text-muted-foreground transition-all duration-150",
              "hover:border-border hover:bg-accent/30 hover:text-foreground"
            )}
            title="Copy shareable link with current settings"
          >
            <Link className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy link</span>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* ── Main layout: three columns ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left panel — style presets */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border/50 lg:flex">
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

        {/* Center — canvas / upload area */}
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden p-4 md:p-6 lg:p-8">
          {image ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              {/* Canvas preview */}
              <div className="relative flex min-h-0 flex-1 w-full items-center justify-center">
                <CanvasRenderer
                  ref={canvasRef}
                  image={image}
                  settings={settings}
                />
              </div>

              {/* Bottom action bar */}
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-2",
                    "text-xs font-medium text-muted-foreground transition-all duration-150",
                    "hover:border-border hover:bg-accent/30 hover:text-foreground"
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Replace
                </button>

                <ExportButton onExport={handleExport} disabled={!image} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload onImageUpload={setImage} hasImage={!!image} />
            </div>
          )}
        </main>

        {/* Right panel — settings (Style + Device tabs) */}
        <aside className="hidden w-72 shrink-0 flex-col border-l border-border/50 xl:flex">
          <div className="flex h-full flex-col overflow-y-auto">
            <SettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
