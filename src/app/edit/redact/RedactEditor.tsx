"use client";

// ponytail: self-contained canvas tool. No shared lib/canvas/ pipeline yet —
// redact shares nothing with the screenshot pipeline (no frames/gradients/padding).
// Extract a shared module when a second consumer needs the same drawing.

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Download, Eraser, ImageIcon, Undo2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RedactMode = "pixelate" | "blur" | "solid";

/** Region in natural image-pixel coordinates, with the effect captured at draw time. */
interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  mode: RedactMode;
  strength: number;
}

const MODES: { id: RedactMode; label: string }[] = [
  { id: "pixelate", label: "Pixelate" },
  { id: "blur", label: "Blur" },
  { id: "solid", label: "Black bar" },
];

function applyEffect(
  ctx: CanvasRenderingContext2D,
  base: CanvasImageSource,
  r: Region
) {
  const { x, y, w, h } = r;
  if (w < 1 || h < 1) return;

  if (r.mode === "solid") {
    ctx.fillStyle = "#000"; // exported content (censor bar), not UI chrome
    ctx.fillRect(x, y, w, h);
    return;
  }

  if (r.mode === "blur") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = `blur(${r.strength}px)`;
    ctx.drawImage(base, 0, 0);
    ctx.restore(); // also resets ctx.filter
    return;
  }

  // pixelate: downscale the region into a tiny buffer, draw it back up with smoothing off
  const block = Math.max(2, r.strength);
  const tw = Math.max(1, Math.round(w / block));
  const th = Math.max(1, Math.round(h / block));
  const off = document.createElement("canvas");
  off.width = tw;
  off.height = th;
  const octx = off.getContext("2d");
  if (!octx) return;
  octx.drawImage(base, x, y, w, h, 0, 0, tw, th);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, tw, th, x, y, w, h);
  ctx.imageSmoothingEnabled = true;
}

function normalizeRect(a: { x: number; y: number }, b: { x: number; y: number }) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export default function RedactEditor() {
  const workRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [mode, setMode] = useState<RedactMode>("pixelate");
  const [strength, setStrength] = useState(14);

  const handleImageUpload = useCallback((dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      baseImgRef.current = img;
      setSize({ w: img.naturalWidth, h: img.naturalHeight });
      setRegions([]);
      setImage(dataUrl);
    };
    img.onerror = () => toast.error("Couldn't load that image");
    img.src = dataUrl;
  }, []);

  // Paste-to-upload, matching the screenshot editor.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
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
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleImageUpload]);

  // Bake the image + committed regions into the work canvas.
  useEffect(() => {
    const canvas = workRef.current;
    const base = baseImgRef.current;
    if (!canvas || !base || !size) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.drawImage(base, 0, 0, size.w, size.h);
    for (const r of regions) applyEffect(ctx, base, r);
  }, [regions, size, image]);

  // Draw region outlines + the in-progress drag rect (display only, never exported).
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !size) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const stroke = Math.max(1, size.w / 600);
    ctx.lineWidth = stroke;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    for (const r of regions) ctx.strokeRect(r.x, r.y, r.w, r.h);
    if (draft) {
      ctx.setLineDash([stroke * 4, stroke * 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.strokeRect(draft.x, draft.y, draft.w, draft.h);
      ctx.setLineDash([]);
    }
  }, [draft, regions, size]);

  // Map a pointer event to natural image coordinates.
  const toImageCoords = useCallback((e: React.PointerEvent) => {
    const canvas = overlayRef.current;
    if (!canvas || !size) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * size.w;
    const y = ((e.clientY - rect.top) / rect.height) * size.h;
    return {
      x: Math.max(0, Math.min(size.w, x)),
      y: Math.max(0, Math.min(size.h, y)),
    };
  }, [size]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const p = toImageCoords(e);
    if (!p) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = p;
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
  }, [toImageCoords]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const p = toImageCoords(e);
    if (!p) return;
    setDraft(normalizeRect(dragStart.current, p));
  }, [toImageCoords]);

  const onPointerUp = useCallback(() => {
    const d = draft;
    dragStart.current = null;
    setDraft(null);
    if (d && d.w > 3 && d.h > 3) {
      setRegions((prev) => [...prev, { ...d, mode, strength }]);
    }
  }, [draft, mode, strength]);

  const undo = useCallback(() => setRegions((prev) => prev.slice(0, -1)), []);
  const clear = useCallback(() => setRegions([]), []);

  const download = useCallback(() => {
    const canvas = workRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return toast.error("Export failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.name.toLowerCase()}-redacted-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

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
        <span className="text-sm text-muted-foreground">Redact &amp; Blur</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {image && size ? (
            <div className="relative max-h-full max-w-full">
              <canvas
                ref={workRef}
                width={size.w}
                height={size.h}
                className="block max-h-full max-w-full rounded-lg shadow-modal"
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              />
              <canvas
                ref={overlayRef}
                width={size.w}
                height={size.h}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <ImageUpload onImageUpload={handleImageUpload} hasImage={false} />
            </div>
          )}
        </main>

        {image && (
          <aside className="shrink-0 border-t hairline lg:w-72 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Redaction style
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "rounded-md border hairline px-2 py-1.5 text-xs font-medium transition-colors",
                        mode === m.id
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode !== "solid" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {mode === "blur" ? "Blur radius" : "Pixel size"}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">{strength}px</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={48}
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                    className="w-full accent-foreground"
                  />
                </div>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                Drag on the image to cover sensitive areas. New regions use the style above.
              </p>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={undo}
                    disabled={regions.length === 0}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 h-9 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={clear}
                    disabled={regions.length === 0}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 h-9 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    baseImgRef.current = null;
                    setImage(null);
                    setSize(null);
                    setRegions([]);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Replace image
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
