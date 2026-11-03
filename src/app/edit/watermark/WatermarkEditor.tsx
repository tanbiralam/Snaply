"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { FONT_CHOICES, FONT_PRELOAD } from "@/lib/ogRender";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { uniqueName, zipSync } from "@/lib/zip";
import {
  WM_LIMITS,
  defaultWm,
  drawWatermark,
  parseWm,
  type WmSettings,
} from "@/lib/watermark";
import { toast } from "sonner";
import { Download, ImageIcon, Loader2, Plus, RotateCcw, Upload, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

const STORAGE_KEY = "watermark";

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const POSITIONS = [
  "Top left",
  "Top center",
  "Top right",
  "Middle left",
  "Center",
  "Middle right",
  "Bottom left",
  "Bottom center",
  "Bottom right",
];

const chip = (active: boolean) =>
  cn(
    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-120",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
  );

const kicker =
  "mb-2 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";

function loadSettings(): WmSettings {
  if (typeof window === "undefined") return defaultWm;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseWm(JSON.parse(raw)) : defaultWm;
  } catch {
    return defaultWm; // corrupt JSON or storage blocked
  }
}

interface Item {
  id: number;
  name: string;
  /** Object URL of the original file. */
  url: string;
  img: HTMLImageElement;
  mime: string;
}

let nextId = 0;

/** Loads files as images; unreadable ones are reported and skipped, never fatal. */
async function loadItems(files: File[]): Promise<Item[]> {
  const loaded = await Promise.all(
    files.map(
      (file) =>
        new Promise<Item | null>((resolve) => {
          if (!file.type.startsWith("image/")) return resolve(null);
          const url = URL.createObjectURL(file);
          const img = new window.Image();
          img.onload = () =>
            img.naturalWidth && img.naturalHeight
              ? resolve({ id: nextId++, name: file.name || "image", url, img, mime: file.type in EXT ? file.type : "image/png" })
              : (URL.revokeObjectURL(url), resolve(null));
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.src = url;
        })
    )
  );
  const bad = files.filter((_, i) => !loaded[i]).map((f) => f.name || "image");
  if (bad.length)
    toast.error(bad.length === 1 ? `Skipped ${bad[0]}: couldn't read it` : `Skipped ${bad.length} files that couldn't be read`);
  return loaded.filter((x): x is Item => !!x);
}

/** Base image + watermark on a fresh canvas, encoded in the source format. */
function renderItem(item: Item, s: WmSettings, logo: HTMLImageElement | null): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = item.img.naturalWidth;
  c.height = item.img.naturalHeight;
  const ctx = c.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no 2d context"));
  ctx.drawImage(item.img, 0, 0);
  drawWatermark(ctx, c.width, c.height, s, logo);
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), item.mime, 0.92)
  );
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  // Revoking synchronously can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function readDataUrl(file: File, cb: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = (ev) =>
    typeof ev.target?.result === "string" && cb(ev.target.result);
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
        <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
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

  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  // Read in the initializer (not an effect) so the save effect can never write defaults over saved
  // settings first. Safe for hydration: nothing rendered depends on `s` until an image is loaded.
  const [s, setS] = useState<WmSettings>(loadSettings);
  const [fontsReady, setFontsReady] = useState(0);

  const set = <K extends keyof WmSettings>(k: K, v: WmSettings[K]) =>
    setS((p) => ({ ...p, [k]: v }));

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

  const addFiles = useCallback(async (files: File[]) => {
    const added = await loadItems(files);
    if (!added.length) return;
    setItems((prev) => [...prev, ...added]);
    setActiveId((id) => id ?? added[0].id);
  }, []);

  // Object URLs are freed when an item leaves the list, and on unmount.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  const removeItem = (id: number) => {
    const gone = items.find((i) => i.id === id);
    if (gone) URL.revokeObjectURL(gone.url);
    const rest = items.filter((i) => i.id !== id);
    setItems(rest);
    if (activeId === id) setActiveId(rest[0]?.id ?? null);
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url));
    setItems([]);
    setActiveId(null);
  };

  const active = items.find((i) => i.id === activeId) ?? null;
  const size = active ? { w: active.img.naturalWidth, h: active.img.naturalHeight } : null;

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((i) => i.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      e.preventDefault();
      addFiles([file]);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const onLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Logo must be an image");
    readDataUrl(file, (url) => {
      const img = new window.Image();
      img.onload = () => {
        // SVGs without width/height report 0×0 and can't be scaled proportionally.
        if (!img.naturalWidth || !img.naturalHeight)
          return toast.error("That logo has no size — try a PNG");
        setLogo(img);
        set("kind", "logo");
      };
      img.onerror = () => toast.error("Couldn't load that logo");
      img.src = url;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { naturalWidth: w, naturalHeight: h } = active.img;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(active.img, 0, 0, w, h);
    drawWatermark(ctx, w, h, s, logo);
  }, [s, logo, active, fontsReady]);

  const mime = active?.mime ?? "image/png";

  const download = () => {
    canvasRef.current?.toBlob(
      (blob) => {
        if (!blob) return toast.error("Export failed");
        triggerDownload(blob, `${site.name.toLowerCase()}-watermarked-${Date.now()}.${EXT[mime]}`);
      },
      mime,
      0.92
    );
  };

  // ponytail: images are rendered one at a time so only one full-size canvas is alive;
  // the zip itself is still built in memory, so very large batches are bounded by RAM.
  const downloadAll = async () => {
    setProgress(0);
    const taken = new Set<string>();
    const entries: { name: string; data: Uint8Array }[] = [];
    const failed: string[] = [];
    for (let n = 0; n < items.length; n++) {
      const item = items[n];
      try {
        const blob = await renderItem(item, s, logo);
        const base = item.name.replace(/\.[^./\\]+$/, "");
        entries.push({
          name: uniqueName(`${base}-watermarked.${EXT[item.mime]}`, taken),
          data: new Uint8Array(await blob.arrayBuffer()),
        });
      } catch {
        failed.push(item.name);
      }
      setProgress(n + 1);
    }
    setProgress(null);
    if (failed.length) toast.error(`Couldn't export ${failed.length} image${failed.length > 1 ? "s" : ""}: ${failed.join(", ")}`);
    if (!entries.length) return;
    triggerDownload(zipSync(entries), `${site.name.toLowerCase()}-watermarked.zip`);
  };

  const batch = items.length > 1;

  const needsLogo = s.kind === "logo" && !logo;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <BrandMark />
        <span className="text-sm text-muted-foreground">Watermark</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {active && size ? (
            <>
              <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={size.w}
                  height={size.h}
                  className="block max-h-full max-w-full rounded-lg shadow-modal"
                />
              </div>
              <div className="mt-3 flex max-w-full shrink-0 items-center gap-2 overflow-x-auto px-2 py-2">
                {items.map((item) => (
                  <div key={item.id} className="group relative shrink-0">
                    <button
                      type="button"
                      aria-label={`Preview ${item.name}`}
                      aria-pressed={item.id === activeId}
                      onClick={() => setActiveId(item.id)}
                      className={cn(
                        "block h-14 w-14 overflow-hidden rounded-md ring-offset-2 ring-offset-background transition-shadow duration-120",
                        item.id === activeId ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-strong"
                      )}
                    >
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    </button>
                    {batch && (
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.id)}
                        className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border hairline bg-background text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                <label
                  title="Add images"
                  className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed hairline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Add images"
                    onChange={(e) => {
                      addFiles(Array.from(e.target.files ?? []));
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                  <Plus className="h-4 w-4" />
                </label>
              </div>
            </>
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload
                onImageUpload={() => {}}
                onFiles={addFiles}
                hasImage={false}
                label="image"
              />
            </div>
          )}
        </main>

        {active && (
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
                      <span className="font-mono text-2xs uppercase text-muted-foreground">
                        {s.color}
                      </span>
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
                  {logo
                    ? "Change logo"
                    : "Upload a logo (PNG with transparency works best)"}
                </label>
              )}

              <SliderRow
                label="Size"
                unit="%"
                value={s.size}
                limits={WM_LIMITS.size}
                onChange={(v) => set("size", v)}
              />
              <SliderRow
                label="Opacity"
                unit="%"
                value={s.opacity}
                limits={WM_LIMITS.opacity}
                onChange={(v) => set("opacity", v)}
              />
              <SliderRow
                label="Rotation"
                unit="°"
                value={s.rotation}
                limits={WM_LIMITS.rotation}
                onChange={(v) => set("rotation", v)}
              />
              <SliderRow
                label={s.tile ? "Spacing" : "Margin"}
                unit="%"
                value={s.margin}
                limits={WM_LIMITS.margin}
                onChange={(v) => set("margin", v)}
              />

              <label className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                Tile across image
                <Switch
                  checked={s.tile}
                  onCheckedChange={(v) => set("tile", v)}
                />
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
                          s.position === i
                            ? "border-primary bg-primary"
                            : "hairline hover:bg-secondary"
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
                    onClick={clearAll}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    {batch ? "Clear all" : "Replace"}
                  </button>
                </div>
                {batch && (
                  <button
                    type="button"
                    onClick={download}
                    disabled={needsLogo || progress !== null}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    This image only
                  </button>
                )}
                <button
                  type="button"
                  onClick={batch ? downloadAll : download}
                  disabled={needsLogo || progress !== null}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  {progress !== null ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing {progress}/{items.length}…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {batch ? `Download all ${items.length} (.zip)` : `Download ${EXT[mime].toUpperCase()}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
