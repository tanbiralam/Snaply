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
import { ImageIcon } from "lucide-react";
import Link from "next/link";

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const canvasRef = useRef<CanvasRendererRef>(null);
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  // Receives full Preset object, sets activePreset id and merges settings
  const handlePresetSelect = useCallback((preset: Preset) => {
    setActivePreset(preset.id);
    setSettings((prev) => ({
      ...prev,
      // Always reset backgroundImage so switching from image preset to gradient clears it
      backgroundImage: null,
      ...preset.settings,
    }));
  }, []);

  // Clears activePreset when user manually changes any setting
  const handleSettingsChange = useCallback((newSettings: StyleSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  }, []);

  // When image changes, measure its dimensions to derive the aspect ratio
  // for the device recommendation system.
  const handleImageUpload = useCallback((dataUrl: string) => {
    setImage(dataUrl);
    setImageAspectRatio(null);
    const img = new Image();
    img.onload = () => setImageAspectRatio(img.width / img.height);
    img.src = dataUrl;
  }, []);

  // ── Global paste handler (Ctrl+V / Cmd+V) ────────────────────────────────
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (dataUrl) {
              handleImageUpload(dataUrl);
              toast.success("Screenshot pasted!");
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleImageUpload]);

  const handleExport = useCallback(
    (format: "png" | "jpeg" | "webp"): string | null => {
      return canvasRef.current?.exportImage(format) ?? null;
    },
    []
  );



  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        {/* Logo — clicking returns to landing page */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-foreground text-background font-semibold text-sm">
            S
          </span>
          <span className="font-semibold tracking-tight text-[15px]">Snaply</span>
        </Link>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main layout: three columns ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left panel — style presets */}
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

        {/* Center — canvas / upload area */}
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {image ? (
            <div className="flex h-full w-full flex-col items-center gap-4">
              {/* Canvas preview — fills available height */}
              <div className="relative flex min-h-0 flex-1 w-full">
                <CanvasRenderer
                  ref={canvasRef}
                  image={image}
                  settings={settings}
                />
              </div>

              {/* Bottom action bar */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setImage(null); setImageAspectRatio(null); }}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Replace
                </button>

                <ExportButton onExport={handleExport} disabled={!image} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload onImageUpload={handleImageUpload} hasImage={!!image} />
            </div>
          )}
        </main>

        {/* Right panel — settings (Style + Device tabs) */}
        <aside className="hidden w-72 shrink-0 flex-col border-l hairline xl:flex">
          <div className="flex h-full flex-col overflow-y-auto">
            <SettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              imageAspectRatio={imageAspectRatio}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
