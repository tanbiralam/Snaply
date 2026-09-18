"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { StyleSettings, defaultSettings, Preset } from "@/types";
import { CanvasRenderer, CanvasRendererRef } from "@/components/CanvasRenderer";
import { ExportButton } from "@/components/ExportButton";
import { ShareMenu } from "@/components/ShareMenu";
import { ImageUpload } from "@/components/ImageUpload";
import { SettingsPanel } from "@/components/SettingsPanel";
import { StylePresets } from "@/components/StylePresets";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { ImageIcon, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { site } from "@/lib/site";
import Link from "next/link";
import Image from "next/image";


export default function ScreenshotEditor() {
  const imageCanvasRef = useRef<CanvasRendererRef>(null);

  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);


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

  const handleImageUpload = useCallback((dataUrl: string) => {
    setImage(dataUrl);
    setImageAspectRatio(null);
    const img = new window.Image();
    img.onload = () => setImageAspectRatio(img.width / img.height);
    img.src = dataUrl;
  }, []);

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
      return imageCanvasRef.current?.exportImage(format) ?? null;
    },
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

        <span className="text-sm text-muted-foreground">Screenshot Stylizer</span>

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
          {image ? (
            <div className="flex h-full w-full flex-col items-center gap-4">
              <div className="relative flex min-h-0 flex-1 w-full">
                <CanvasRenderer
                  ref={imageCanvasRef}
                  image={image}
                  settings={settings}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImageAspectRatio(null);
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleResetStyle}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <ExportButton onExport={handleExport} disabled={!image} />
                <ShareMenu onExport={handleExport} disabled={!image} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload onImageUpload={handleImageUpload} hasImage={!!image} />
            </div>
          )}
        </main>

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
              <SettingsPanel
                settings={settings}
                onSettingsChange={handleSettingsChange}
                imageAspectRatio={imageAspectRatio}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
