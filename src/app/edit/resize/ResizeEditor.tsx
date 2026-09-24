"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  type Box,
  type Point,
  centeredAspectRect,
  clientToImage,
  moveRect,
  parseDim,
  rectFromAnchor,
  roundBox,
  targetSize,
} from "@/lib/resize";
import { toast } from "sonner";
import { Download, ImageIcon, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

const PRESETS = [
  { label: "Open Graph", w: 1200, h: 630 },
  { label: "Instagram post", w: 1080, h: 1080 },
  { label: "Story / Reel", w: 1080, h: 1920 },
  { label: "X post", w: 1600, h: 900 },
];

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

const HANDLES = ["nw", "ne", "sw", "se"] as const;

type Drag =
  | { kind: "anchor"; anchor: Point; prev: Box }
  | { kind: "move"; start: Point; orig: Box };

const chip = (active: boolean) =>
  cn(
    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-120",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
  );

const kicker = "mb-2 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export default function ResizeEditor() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<Drag | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Box>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState<number | null>(null);
  const [outW, setOutW] = useState<number | null>(null);
  const [outH, setOutH] = useState<number | null>(null);
  const [keep, setKeep] = useState(true);

  const resetAll = useCallback((w: number, h: number) => {
    setCrop({ x: 0, y: 0, w, h });
    setAspect(null);
    setOutW(null);
    setOutH(null);
    setKeep(true);
  }, []);

  const handleImageUpload = useCallback(
    (dataUrl: string) => {
      const img = new window.Image();
      img.onload = () => {
        imgRef.current = img;
        setSize({ w: img.naturalWidth, h: img.naturalHeight });
        resetAll(img.naturalWidth, img.naturalHeight);
        setImage(dataUrl);
      };
      img.onerror = () => toast.error("Couldn't load that image");
      img.src = dataUrl;
    },
    [resetAll]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((i) => i.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") handleImageUpload(ev.target.result);
      };
      reader.readAsDataURL(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleImageUpload]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!size) return;
    const p = clientToImage(e, e.currentTarget, size.w, size.h);
    const handle = (e.target as HTMLElement).dataset.handle;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (handle === "move") {
      drag.current = { kind: "move", start: p, orig: crop };
    } else if (handle) {
      // Resize from a corner = redraw anchored at the opposite corner.
      const anchor = {
        x: handle.includes("w") ? crop.x + crop.w : crop.x,
        y: handle.includes("n") ? crop.y + crop.h : crop.y,
      };
      drag.current = { kind: "anchor", anchor, prev: crop };
    } else {
      drag.current = { kind: "anchor", anchor: p, prev: crop };
      setCrop({ ...p, w: 0, h: 0 });
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !size) return;
    const p = clientToImage(e, e.currentTarget, size.w, size.h);
    setCrop(
      d.kind === "move"
        ? moveRect(d.orig, p.x - d.start.x, p.y - d.start.y, size.w, size.h)
        : rectFromAnchor(d.anchor, p, aspect, size.w, size.h)
    );
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    // A click (or a sliver) shouldn't wipe out the previous crop.
    if (d?.kind === "anchor") setCrop((c) => (c.w < 4 || c.h < 4 ? d.prev : c));
  };

  const pickAspect = (value: number | null) => {
    if (!size) return;
    setAspect(value);
    if (value) setCrop(centeredAspectRect(size.w, size.h, value));
    if (!keep) {
      // Leaving a preset: its exact size no longer matches the crop shape.
      setOutW(null);
      setOutH(null);
      setKeep(true);
    }
  };

  const pickPreset = (p: (typeof PRESETS)[number]) => {
    if (!size) return;
    const a = p.w / p.h;
    setAspect(a);
    setCrop(centeredAspectRect(size.w, size.h, a));
    setOutW(p.w);
    setOutH(p.h);
    // Crop is locked to the preset's ratio, so exact output is distortion-free (no ±1px rounding).
    setKeep(false);
  };

  const src = size ? roundBox(crop, size.w, size.h) : null;
  const out = src ? targetSize(src.w, src.h, outW, outH, keep) : null;
  const srcMime = image?.slice(5, image.indexOf(";")) ?? "";
  const mime = srcMime in EXT ? srcMime : "image/png";

  const download = () => {
    const img = imgRef.current;
    if (!img || !src || !out) return;
    const canvas = document.createElement("canvas");
    canvas.width = out.w;
    canvas.height = out.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return toast.error("Export failed");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, out.w, out.h);
    canvas.toBlob(
      (blob) => {
        // Oversized canvases (browser limits ~16k px/side) come back null.
        if (!blob) return toast.error("Export failed — try a smaller size");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${site.name.toLowerCase()}-${out.w}x${out.h}.${EXT[mime]}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      mime,
      0.92
    );
  };

  const pct = (n: number, of: number) => `${(n / of) * 100}%`;

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
        <span className="text-sm text-muted-foreground">Resize &amp; Crop</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {image && size ? (
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="relative max-h-full max-w-full cursor-crosshair touch-none select-none overflow-hidden rounded-lg shadow-modal"
            >
              <img
                src={image}
                alt="Image being cropped"
                draggable={false}
                className="block max-h-full max-w-full"
              />
              <div
                data-handle="move"
                className="absolute cursor-move border border-primary shadow-[0_0_0_9999px_hsl(var(--background)/0.7)]"
                style={{
                  left: pct(crop.x, size.w),
                  top: pct(crop.y, size.h),
                  width: pct(crop.w, size.w),
                  height: pct(crop.h, size.h),
                }}
              >
                {HANDLES.map((h) => (
                  <span
                    key={h}
                    data-handle={h}
                    className={cn(
                      "absolute h-3 w-3 rounded-sm border border-primary bg-background",
                      h[0] === "n" ? "-top-1.5" : "-bottom-1.5",
                      h[1] === "w" ? "-left-1.5" : "-right-1.5",
                      h === "nw" || h === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload onImageUpload={handleImageUpload} hasImage={false} />
            </div>
          )}
        </main>

        {image && size && src && out && (
          <aside className="max-h-96 shrink-0 overflow-y-auto border-t hairline lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
              <div>
                <p className={kicker}>Aspect ratio</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {ASPECTS.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      aria-pressed={aspect === a.value}
                      onClick={() => pickAspect(a.value)}
                      className={chip(aspect === a.value)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className={kicker}>Presets</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((p) => {
                    const active = !keep && outW === p.w && outH === p.h;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickPreset(p)}
                        className={cn(chip(active), "flex flex-col items-start gap-0.5 text-left")}
                      >
                        {p.label}
                        <span className="font-mono text-2xs opacity-70">
                          {p.w}×{p.h}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className={kicker}>Output size</p>
                <div className="flex items-center gap-2">
                  {(
                    [
                      ["Width", outW, setOutW, src.w],
                      ["Height", outH, setOutH, src.h],
                    ] as const
                  ).map(([label, value, set, hint]) => (
                    <label key={label} className="flex-1">
                      <span className="sr-only">{label}</span>
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder={String(hint)}
                        value={value ?? ""}
                        onChange={(e) => set(parseDim(e.target.value))}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm placeholder:text-muted-foreground/60"
                      />
                    </label>
                  ))}
                </div>
                <label className="mt-3 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  Keep aspect ratio
                  <Switch checked={keep} onCheckedChange={setKeep} />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">Leave blank to keep the crop size.</p>
              </div>

              <p className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                Crop {src.w}×{src.h} → {out.w}×{out.h} · {EXT[mime]}
              </p>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Drag on the image to draw a crop, drag inside it to move, or pull a corner to resize.
              </p>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => resetAll(size.w, size.h)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      imgRef.current = null;
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
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
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
