"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { FONT_CHOICES, FONT_PRELOAD } from "@/lib/ogRender";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { WM_LIMITS, defaultWm, drawWatermark, parseWm, type WmSettings } from "@/lib/watermark";
import { toast } from "sonner";
import { Download, ImageIcon, RotateCcw, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const STORAGE_KEY = "watermark";

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

const POSITIONS = [
  "Top left", "Top center", "Top right",
  "Middle left", "Center", "Middle right",
  "Bottom left", "Bottom center", "Bottom right",
];

const chip = (active: boolean) =>
  cn(
    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-120",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
  );

const kicker = "mb-2 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";

function loadSettings(): WmSettings {
  if (typeof window === "undefined") return defaultWm;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseWm(JSON.parse(raw)) : defaultWm;
  } catch {
    return defaultWm; // corrupt JSON or storage blocked
  }
}

function readDataUrl(file: File, cb: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = (ev) => typeof ev.target?.result === "string" && cb(ev.target.result);
  reader.readAsDataURL(file);
}

function SliderRow({
  label,
  unit,
  value,
  limits,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  limits: readonly [number, number];
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between">
        <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-2xs tabular-nums text-muted-foreground">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={limits[0]}
        max={limits[1]}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

export default function WatermarkEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  // Read in the initializer (not an effect) so the save effect can never write defaults over saved
  // settings first. Safe for hydration: nothing rendered depends on `s` until an image is loaded.
  const [s, setS] = useState<WmSettings>(loadSettings);
  const [fontsReady, setFontsReady] = useState(0);

  const set = <K extends keyof WmSettings>(k: K, v: WmSettings[K]) => setS((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // Storage full/blocked: settings just won't persist.
    }
  }, [s]);

  useEffect(() => {
    if (!("fonts" in document)) return;
    let alive = true;
    Promise.all(FONT_PRELOAD.map((f) => document.fonts.load(f)))
      .then(() => alive && setFontsReady((n) => n + 1))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const handleImageUpload = useCallback((dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      baseRef.current = img;
      setSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImage(dataUrl);
    };
    img.onerror = () => toast.error("Couldn't load that image");
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((i) => i.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      e.preventDefault();
      readDataUrl(file, handleImageUpload);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleImageUpload]);

  const onLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Logo must be an image");
    readDataUrl(file, (url) => {
      const img = new window.Image();
      img.onload = () => {
        // SVGs without width/height report 0×0 and can't be scaled proportionally.
        if (!img.naturalWidth || !img.naturalHeight) return toast.error("That logo has no size — try a PNG");
        setLogo(img);
        set("kind", "logo");
      };
      img.onerror = () => toast.error("Couldn't load that logo");
      img.src = url;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const base = baseRef.current;
    if (!canvas || !base || !size) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.drawImage(base, 0, 0, size.w, size.h);
    drawWatermark(ctx, size.w, size.h, s, logo);
  }, [s, logo, size, image, fontsReady]);

  const srcMime = image?.slice(5, image.indexOf(";")) ?? "";
  const mime = srcMime in EXT ? srcMime : "image/png";

  const download = () => {
    canvasRef.current?.toBlob(
      (blob) => {
        if (!blob) return toast.error("Export failed");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${site.name.toLowerCase()}-watermarked-${Date.now()}.${EXT[mime]}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      mime,
      0.92
    );
  };

  const needsLogo = s.kind === "logo" && !logo;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt={`${site.name} logo`}
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
            priority
          />
          <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
        </Link>
        <span className="text-sm text-muted-foreground">Watermark</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {image && size ? (
            <canvas
              ref={canvasRef}
              width={size.w}
              height={size.h}
              className="block max-h-full max-w-full rounded-lg shadow-modal"
            />
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload onImageUpload={handleImageUpload} hasImage={false} />
            </div>
          )}
        </main>

        {image && size && (
          <aside className="max-h-96 shrink-0 overflow-y-auto border-t hairline lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
              <div>
                <p className={kicker}>Watermark</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["text", "logo"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={s.kind === k}
                      onClick={() => set("kind", k)}
                      className={chip(s.kind === k)}
                    >
                      {k === "text" ? "Text" : "Logo"}
                    </button>
                  ))}
                </div>
              </div>

              {s.kind === "text" ? (
                <>
                  <label className="block">
                    <span className={cn(kicker, "block")}>Text</span>
                    <input
                      type="text"
                      maxLength={200}
                      value={s.text}
                      onChange={(e) => set("text", e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </label>
                  <div>
                    <p className={kicker}>Font</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FONT_CHOICES.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          aria-pressed={s.font === f.id}
                          onClick={() => set("font", f.id)}
                          className={cn(chip(s.font === f.id), "px-1")}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center justify-between gap-2">
                    <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                      Color
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-2xs uppercase text-muted-foreground">{s.color}</span>
                      <input
                        type="color"
                        value={s.color}
                        onChange={(e) => set("color", e.target.value)}
                        className="h-8 w-10 cursor-pointer rounded-md border border-input bg-background p-0.5"
                      />
                    </span>
                  </label>
                </>
              ) : (
                <label className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-dashed hairline p-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <input
                    type="file"
                    accept="image/png,image/webp,image/svg+xml,image/jpeg"
                    onChange={(e) => {
                      onLogoFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                  {logo ? (
                    <span
                      aria-hidden="true"
                      className="h-10 w-10 shrink-0 rounded-sm bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${logo.src})` }}
                    />
                  ) : (
                    <Upload className="h-4 w-4 shrink-0" />
                  )}
                  {logo ? "Change logo" : "Upload a logo (PNG with transparency works best)"}
                </label>
              )}

              <SliderRow label="Size" unit="%" value={s.size} limits={WM_LIMITS.size} onChange={(v) => set("size", v)} />
              <SliderRow label="Opacity" unit="%" value={s.opacity} limits={WM_LIMITS.opacity} onChange={(v) => set("opacity", v)} />
              <SliderRow label="Rotation" unit="°" value={s.rotation} limits={WM_LIMITS.rotation} onChange={(v) => set("rotation", v)} />
              <SliderRow
                label={s.tile ? "Spacing" : "Margin"}
                unit="%"
                value={s.margin}
                limits={WM_LIMITS.margin}
                onChange={(v) => set("margin", v)}
              />

              <label className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                Tile across image
                <Switch checked={s.tile} onCheckedChange={(v) => set("tile", v)} />
              </label>

              {!s.tile && (
                <div>
                  <p className={kicker}>Position</p>
                  <div className="grid w-24 grid-cols-3 gap-1">
                    {POSITIONS.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        aria-label={label}
                        aria-pressed={s.position === i}
                        onClick={() => set("position", i)}
                        className={cn(
                          "h-7 rounded-sm border transition-colors duration-120",
                          s.position === i ? "border-primary bg-primary" : "hairline hover:bg-secondary"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setS(defaultWm)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      baseRef.current = null;
                      setImage(null);
                      setSize(null);
                    }}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Replace
                  </button>
                </div>
                <button
                  type="button"
                  onClick={download}
                  disabled={needsLogo}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  <Download className="h-4 w-4" />
                  Download {EXT[mime].toUpperCase()}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
