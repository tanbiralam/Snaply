"use client";

import { useState, useRef } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { StylePresets } from "@/components/StylePresets";
import { CanvasRenderer, CanvasRendererRef } from "@/components/CanvasRenderer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ExportButton } from "@/components/ExportButton";
import { StyleSettings, defaultSettings, Preset } from "@/types/beautifier";
import { Aperture, ChevronDown, Palette, Sliders } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const canvasRef = useRef<CanvasRendererRef>(null);

  const handlePresetSelect = (preset: Preset) => {
    setActivePreset(preset.id);
    setSettings({ ...settings, ...preset.settings });
  };

  const handleSettingsChange = (newSettings: StyleSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  };

  const handleExport = (format: "png" | "jpeg" | "webp") => {
    return canvasRef.current?.exportImage(format) ?? null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <img className="w-5 h-5 text-primary" src="/logo.png" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Snaply
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Transform screenshots into stunning visuals
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <ExportButton onExport={handleExport} disabled={!image} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,800px)_1fr] gap-5">
          {/* Left Panel - Style Presets */}
          <aside className="lg:block order-2 lg:order-1">
            {/* Mobile collapsible */}
            <div className="lg:hidden">
              <Collapsible open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Style Presets</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      leftPanelOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <StylePresets
                      activePreset={activePreset}
                      onSelectPreset={handlePresetSelect}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop fixed panel */}
            <div className="hidden lg:block sticky top-20">
              <div className="p-4 rounded-xl bg-card/90 border border-border/60 max-h-[calc(100vh-120px)] overflow-y-auto">
                <StylePresets
                  activePreset={activePreset}
                  onSelectPreset={handlePresetSelect}
                />
              </div>
            </div>
          </aside>
          {/* Center - Canvas */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="p-4 rounded-xl bg-card/90 border border-border/60">
              <ImageUpload onImageUpload={setImage} hasImage={!!image} />
            </div>
            <div className="rounded-xl bg-card/80 border border-border/60 overflow-hidden">
              <CanvasRenderer
                ref={canvasRef}
                image={image}
                settings={settings}
              />
            </div>
            {/* Mobile export button */}
            <div className="md:hidden flex items-center justify-between gap-3">
              <ThemeToggle />
              <ExportButton onExport={handleExport} disabled={!image} />
            </div>
          </div>
          {/* Right Panel - Settings */}
          <aside className="lg:block order-3">
            {/* Mobile collapsible */}
            <div className="lg:hidden">
              <Collapsible
                open={rightPanelOpen}
                onOpenChange={setRightPanelOpen}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Settings</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      rightPanelOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <SettingsPanel
                      settings={settings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop fixed panel */}
            <div className="hidden lg:block sticky top-20">
              <div className="p-4 rounded-xl bg-card/90 border border-border/60 max-h-[calc(100vh-120px)] overflow-hidden">
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-10 py-5">
        <p className="text-center text-xs text-muted-foreground">
          Free to use • No login required • Local processing only
        </p>
      </footer>
    </div>
  );
};

export default Index;
