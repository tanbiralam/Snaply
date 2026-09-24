"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { zipSync } from "@/lib/zip";
import { canDecode, decodeImage, isPreviewable, SUPPORTED_INPUT } from "@/lib/decode";
import { encodeBmp, encodeIco, icoSize } from "@/lib/encode";
import { parseDim, targetSize } from "@/lib/resize";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AppWindow,
  Check,
  Download,
  FileIcon,
  Files,
  ImageIcon,
  Layers,
  Loader2,
  Plus,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ─── Formats ────────────────────────────────────────────────────────────────

type TargetFormat =
  | "original"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "image/bmp"
  | "image/x-icon";

const ENCODABLE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/bmp",
  "image/x-icon",
]);
const LOSSY = new Set(["image/jpeg", "image/webp", "image/avif"]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/x-icon": "ico",
};

interface FormatCard {
  fmt: TargetFormat;
  /** mime to feature-detect; null = always available (passthrough). */
  mime: string | null;
  label: string;
  ext: string;
  tag: string;
  icon: LucideIcon;
}

// Order = how they read left→right. AVIF last (it's the optional one).
const FORMAT_CARDS: FormatCard[] = [
  { fmt: "original", mime: null, label: "Original", ext: "keep", tag: "Same format", icon: Files },
  { fmt: "image/webp", mime: "image/webp", label: "WebP", ext: ".webp", tag: "Best balance", icon: Sparkles },
  { fmt: "image/jpeg", mime: "image/jpeg", label: "JPEG", ext: ".jpg", tag: "For photos", icon: ImageIcon },
  { fmt: "image/png", mime: "image/png", label: "PNG", ext: ".png", tag: "Lossless · alpha", icon: Layers },
  { fmt: "image/avif", mime: "image/avif", label: "AVIF", ext: ".avif", tag: "Smallest size", icon: Zap },
  // BMP/ICO use our own encoders (mime: null = always available, not toBlob-detected).
  { fmt: "image/bmp", mime: null, label: "BMP", ext: ".bmp", tag: "Uncompressed", icon: Square },
  { fmt: "image/x-icon", mime: null, label: "ICO", ext: ".ico", tag: "Favicon · ≤256px", icon: AppWindow },
];

function resolveMime(format: TargetFormat, inType: string): string {
  if (format !== "original") return format;
  return ENCODABLE.has(inType) ? inType : "image/png";
}

function renameExt(name: string, mime: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base}.${EXT[mime] ?? "png"}`;
}

/** Short uppercase badge label for a mime, e.g. "image/jpeg" → "JPG". */
function shortLabel(mime: string): string {
  if (mime === "image/jpeg") return "JPG";
  return (EXT[mime] ?? mime.split("/")[1] ?? "IMG").toUpperCase();
}

/** The little PNG → WEBP file glyph shown on a card while it encodes. */
function ConvertGlyph({ from, to }: { from: string; to: string }) {
  const File = ({ label, active }: { label: string; active?: boolean }) => (
    <div className="flex flex-col items-center gap-1">
      <FileIcon
        className={cn("h-6 w-6", active ? "text-primary" : "text-muted-foreground")}
        strokeWidth={1.5}
      />
      <span
        className={cn(
          "text-[8px] font-bold leading-none tracking-wide",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-background/85 px-3 py-2 shadow-modal backdrop-blur-sm">
      <div className="animate-pulse-soft">
        <File label={from} />
      </div>
      {/* Track with a packet travelling source → target. */}
      <div className="relative h-6 w-8">
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-muted-foreground/30 via-primary/40 to-primary/60" />
        <span className="absolute top-1/2 h-1.5 w-1.5 animate-travel rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
      </div>
      <div className="animate-pulse-soft [animation-delay:0.7s]">
        <File label={to} active />
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Item model ───────────────────────────────────────────────────────────────

type ItemStatus = "pending" | "processing" | "done" | "error";

interface Item {
  id: string;
  file: File;
  name: string;
  srcUrl: string;
  inType: string;
  inSize: number;
  width: number;
  height: number;
  outBlob: Blob | null;
  outUrl: string | null;
  outSize: number | null;
  outName: string | null;
  status: ItemStatus;
  /** Whether the original can be shown in an <img> before it's encoded. */
  previewable: boolean;
  /** Per-image overrides. undefined format = follow the global format. */
  fmtOverride?: TargetFormat;
  resizeW: number | null;
  resizeH: number | null;
  keepAspect: boolean;
  /** Effective-settings snapshot this item's output was produced for. */
  processedKey: string;
}

// File-picker filter: image/* plus the extensions browsers don't tag as images.
const ACCEPT = ["image/*", ...SUPPORTED_INPUT.map((e) => `.${e}`)].join(",");

let idSeq = 0;
const nextId = () => `img-${++idSeq}`;

function triggerDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompressEditor() {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<TargetFormat>("image/webp");
  const [quality, setQuality] = useState(80);
  const [supported, setSupported] = useState<Set<string>>(
    new Set(["image/webp", "image/jpeg", "image/png"])
  );
  const [zipping, setZipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [openOpts, setOpenOpts] = useState<Set<string>>(new Set());

  // Refs the async processor reads so it never runs against stale settings
  // without re-subscribing the effect to every keystroke.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const formatRef = useRef(format);
  formatRef.current = format;
  const qualityRef = useRef(quality);
  qualityRef.current = quality;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runRef = useRef(0);
  const [processToken, setProcessToken] = useState(0);
  const bump = useCallback(() => setProcessToken((t) => t + 1), []);

  // Debounced bump for typing into resize fields / dragging quality.
  const bumpTimer = useRef<ReturnType<typeof setTimeout>>();
  const bumpDebounced = useCallback(() => {
    if (bumpTimer.current) clearTimeout(bumpTimer.current);
    bumpTimer.current = setTimeout(() => setProcessToken((t) => t + 1), 300);
  }, []);

  const updateOpts = useCallback(
    (id: string, patch: Partial<Item>) => {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      bumpDebounced();
    },
    [bumpDebounced]
  );

  const toggleOpts = useCallback((id: string) => {
    setOpenOpts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Feature-detect which formats this browser can actually *encode* ─────────
  // (decode is widespread; encode — AVIF especially — is not.)
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 2;
    const mimes = ["image/webp", "image/jpeg", "image/png", "image/avif"];
    Promise.all(
      mimes.map(
        (m) =>
          new Promise<[string, boolean]>((res) =>
            c.toBlob((b) => res([m, !!b && b.type === m]), m)
          )
      )
    ).then((rs) => setSupported(new Set(rs.filter(([, ok]) => ok).map(([m]) => m))));
  }, []);

  // ── Reprocess when format / quality change (quality debounced) ─────────────
  useEffect(() => {
    const t = setTimeout(bump, 250);
    return () => clearTimeout(t);
  }, [format, quality, bump]);

  // ── The processor: encodes every item whose key is stale ───────────────────
  useEffect(() => {
    const myRun = ++runRef.current;
    let cancelled = false;
    const canvas =
      canvasRef.current ?? (canvasRef.current = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const keyOf = (it: Item) =>
      `${it.fmtOverride ?? formatRef.current}|${quality}|${it.resizeW ?? ""}|${it.resizeH ?? ""}|${it.keepAspect}`;

    (async () => {
      const q = qualityRef.current / 100;
      // ponytail: sequential — bounds memory on big batches (one decoded bitmap
      // live at a time). Add a small concurrency pool if throughput ever matters.
      const todo = itemsRef.current.filter((it) => it.processedKey !== keyOf(it));
      for (const it of todo) {
        if (cancelled || myRun !== runRef.current) return;
        const key = keyOf(it);
        setItems((prev) =>
          prev.map((p) => (p.id === it.id ? { ...p, status: "processing" } : p))
        );
        try {
          const mime = resolveMime(it.fmtOverride ?? formatRef.current, it.inType);
          const src = await decodeImage(it.file);
          const { w: tw, h: th } = targetSize(
            src.width, src.height, it.resizeW, it.resizeH, it.keepAspect
          );
          canvas.width = tw;
          canvas.height = th;
          ctx.clearRect(0, 0, tw, th);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          // JPEG has no alpha — flatten transparency onto white, not black.
          if (mime === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, tw, th);
          }
          ctx.drawImage(src, 0, 0, tw, th);
          if (src instanceof ImageBitmap) src.close();
          let blob: Blob | null;
          if (mime === "image/bmp") {
            blob = new Blob([encodeBmp(tw, th, ctx.getImageData(0, 0, tw, th).data)], {
              type: "image/bmp",
            });
          } else if (mime === "image/x-icon") {
            blob = await encodeIco([canvas]);
          } else {
            blob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, mime, LOSSY.has(mime) ? q : undefined)
            );
          }
          if (!blob) throw new Error("encode failed");
          if (cancelled || myRun !== runRef.current) return;
          const out = mime === "image/x-icon" ? icoSize(tw, th) : { w: tw, h: th };
          setItems((prev) =>
            prev.map((p) => {
              if (p.id !== it.id) return p;
              if (p.outUrl) URL.revokeObjectURL(p.outUrl);
              return {
                ...p,
                status: "done",
                outBlob: blob,
                outSize: blob.size,
                outUrl: URL.createObjectURL(blob),
                outName: renameExt(p.name, mime),
                width: out.w,
                height: out.h,
                processedKey: key,
              };
            })
          );
        } catch {
          setItems((prev) =>
            prev.map((p) =>
              p.id === it.id ? { ...p, status: "error", processedKey: key } : p
            )
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [processToken, quality]);

  // ── Cleanup every object URL on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      for (const it of itemsRef.current) {
        URL.revokeObjectURL(it.srcUrl);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      }
    };
  }, []);

  // ── Add / remove ───────────────────────────────────────────────────────────
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const imgs = Array.from(files).filter(canDecode);
      if (!imgs.length) {
        toast.error("No supported images found", {
          description: "Drop PNG, JPG, WebP, AVIF, GIF, BMP, ICO, PPM, TGA or ICNS",
        });
        return;
      }
      const created = imgs.map<Item>((file) => ({
        id: nextId(),
        file,
        name: file.name || "image",
        srcUrl: URL.createObjectURL(file),
        inType: file.type,
        inSize: file.size,
        previewable: isPreviewable(file),
        width: 0,
        height: 0,
        outBlob: null,
        outUrl: null,
        outSize: null,
        outName: null,
        status: "pending",
        resizeW: null,
        resizeH: null,
        keepAspect: true,
        processedKey: "",
      }));
      setItems((prev) => [...prev, ...created]);
      bump();
    },
    [bump]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const it = prev.find((p) => p.id === id);
      if (it) {
        URL.revokeObjectURL(it.srcUrl);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      for (const it of prev) {
        URL.revokeObjectURL(it.srcUrl);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      }
      return [];
    });
  }, []);

  // ── Paste-to-add, matching the other editors ───────────────────────────────
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.items ?? [])
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter((f): f is File => !!f);
      if (files.length) {
        addFiles(files);
        toast.success(`Added ${files.length} image${files.length > 1 ? "s" : ""}`);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [addFiles]);

  // ── Downloads ──────────────────────────────────────────────────────────────
  const downloadAll = useCallback(async () => {
    const done = items.filter((i) => i.status === "done" && i.outBlob && i.outName);
    if (!done.length) return;
    setZipping(true);
    try {
      // Track every name actually emitted (not just originals), so a generated "a-1.png"
      // can't collide with a real input that was already called "a-1.png".
      const taken = new Set<string>();
      const entries = await Promise.all(
        done.map(async (i) => {
          let name = i.outName!;
          for (let n = 1; taken.has(name); n++) name = i.outName!.replace(/(\.[^.]+)$/, `-${n}$1`);
          taken.add(name);
          return { name, data: new Uint8Array(await i.outBlob!.arrayBuffer()) };
        })
      );
      const url = URL.createObjectURL(zipSync(entries));
      triggerDownload(url, `${site.name.toLowerCase()}-images.zip`);
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  }, [items]);

  // ── Derived summary ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const done = items.filter((i) => i.status === "done" && i.outSize != null);
    const totalIn = done.reduce((n, i) => n + i.inSize, 0);
    const totalOut = done.reduce((n, i) => n + (i.outSize ?? 0), 0);
    const savedPct = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
    return { count: done.length, totalIn, totalOut, savedPct };
  }, [items]);

  const cards = FORMAT_CARDS.filter((c) => c.mime === null || supported.has(c.mime));
  const globalLabel = FORMAT_CARDS.find((c) => c.fmt === format)?.label ?? "WebP";
  // Quality only applies to lossy encoders; "original" is a mix, so keep it shown.
  const showQuality = !["image/png", "image/bmp", "image/x-icon"].includes(format);
  const doneCount = items.filter((i) => i.status === "done").length;
  const busyCount = items.filter((i) => i.status === "processing" || i.status === "pending").length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Indeterminate top bar — visible only while work is in flight. */}
      <div className="relative h-0.5 w-full overflow-hidden">
        {busyCount > 0 && (
          <div className="absolute inset-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}
      </div>

      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt={`${site.name} logo`} width={28} height={28} className="h-7 w-7 rounded-lg" priority />
          <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
        </Link>
        <span className="text-sm text-muted-foreground">Compress &amp; Convert</span>
        <ThemeToggle />
      </header>

      {items.length === 0 ? (
        <main className="relative flex flex-1 items-center justify-center overflow-auto p-6">
          {/* Soft decorative backdrop so the empty state isn't flat. */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-muted/50"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden
          />
          <label
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              "group relative z-10 flex w-full max-w-xl animate-scale-in cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border border-dashed bg-card/70 p-12 text-center shadow-card backdrop-blur-sm transition-all duration-160",
              isDragging
                ? "scale-[1.01] border-primary bg-primary/5 shadow-modal"
                : "hairline hover:border-strong hover:bg-card"
            )}
          >
            <input
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <div
              className={cn(
                "rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-5 ring-1 ring-primary/20 transition-transform",
                isDragging ? "animate-bounce-subtle" : "group-hover:scale-105"
              )}
            >
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                {isDragging ? "Drop to add them" : "Drop images here — as many as you like"}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or click to browse · or press <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-2xs">Ctrl+V</kbd> to paste
              </p>
            </div>
            {/* Supported conversions, shown as quiet chips. */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {cards
                .filter((c) => c.fmt !== "original")
                .map((c) => (
                  <span
                    key={c.fmt}
                    className="inline-flex items-center gap-1 rounded-full border hairline bg-background/60 px-2.5 py-1 text-2xs font-medium text-muted-foreground"
                  >
                    <c.icon className="h-3 w-3" />
                    {c.label}
                  </span>
                ))}
            </div>
            <p className="max-w-sm text-center text-2xs leading-relaxed text-muted-foreground/70">
              Accepts {SUPPORTED_INPUT.map((e) => e.toUpperCase()).join(", ")}. Everything runs in
              your browser — nothing is uploaded.
            </p>
          </label>
        </main>
      ) : (
        <>
          {/* ── Studio controls ───────────────────────────────────────────── */}
          <div className="shrink-0 border-b hairline bg-card/40 px-5 py-4">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              {/* Format cards */}
              <div className="flex flex-col gap-2">
                <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                  Convert to
                </span>
                <div className="flex flex-wrap gap-2">
                  {cards.map((c) => {
                    const active = format === c.fmt;
                    return (
                      <button
                        key={c.fmt}
                        type="button"
                        onClick={() => setFormat(c.fmt)}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-xl border py-2 pl-2 pr-4 text-left transition-all duration-120",
                          active
                            ? "border-primary bg-primary/5 shadow-card ring-1 ring-primary/30"
                            : "hairline bg-card hover:border-strong hover:bg-secondary/40"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-primary/15 text-primary"
                              : "bg-secondary text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <c.icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-sm font-semibold leading-none">
                            {c.label}
                            {active && (
                              <Check className="h-3 w-3 animate-scale-in text-primary" strokeWidth={3} />
                            )}
                          </span>
                          <span className="text-2xs leading-none text-muted-foreground">{c.tag}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality */}
              {showQuality && (
                <div className="flex flex-col gap-2">
                  <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                    Quality
                  </span>
                  <div className="flex h-[68px] items-center gap-3">
                    <Slider
                      value={[quality]}
                      min={10}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setQuality(v)}
                      className="w-40"
                    />
                    <span className="w-10 text-sm font-semibold tabular-nums">{quality}%</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="ml-auto flex items-center gap-2 self-center">
                {stats.count > 0 && (
                  <div className="mr-2 hidden text-right sm:block">
                    <div className="text-sm font-medium">
                      {formatBytes(stats.totalIn)} → {formatBytes(stats.totalOut)}
                    </div>
                    <div
                      className={cn(
                        "text-2xs font-medium",
                        stats.savedPct >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {stats.savedPct >= 0 ? "saved" : "grew"} {Math.abs(stats.savedPct)}% across {stats.count}
                    </div>
                  </div>
                )}
                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border hairline px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                  <input type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
                </label>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={doneCount === 0 || zipping}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {zipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download all{doneCount > 0 ? ` (${doneCount})` : ""}
                </button>
              </div>
            </div>
          </div>

          {/* ── Grid ──────────────────────────────────────────────────────── */}
          <main className="relative flex-1 overflow-auto bg-gradient-to-b from-muted/40 to-muted/60 p-4 md:p-6">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {items.map((it) => {
                const delta =
                  it.outSize != null && it.inSize > 0
                    ? Math.round((1 - it.outSize / it.inSize) * 100)
                    : null;
                const busy = it.status === "processing" || it.status === "pending";
                const open = openOpts.has(it.id);
                const overridden = it.fmtOverride != null || it.resizeW != null || it.resizeH != null;
                const destMime = resolveMime(it.fmtOverride ?? format, it.inType);
                return (
                  <div
                    key={it.id}
                    className="group relative flex animate-scale-in flex-col overflow-hidden rounded-xl border hairline bg-card shadow-card transition-shadow hover:shadow-modal"
                  >
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      aria-label="Remove"
                      className="absolute right-2 top-2 z-20 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[linear-gradient(45deg,#eee_25%,transparent_25%),linear-gradient(-45deg,#eee_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[length:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] dark:opacity-90">
                      {it.outUrl || it.previewable ? (
                        <img
                          src={it.outUrl ?? it.srcUrl}
                          alt={it.name}
                          className={cn(
                            "max-h-full max-w-full object-contain transition-all duration-300",
                            busy ? "scale-[0.97] blur-[1px]" : "scale-100 blur-0"
                          )}
                        />
                      ) : (
                        // Non-native format with no encoded preview yet.
                        <FileIcon className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.25} />
                      )}
                      {/* "File converting to another file" while encoding. */}
                      {busy && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/45 backdrop-blur-[2px]">
                          <ConvertGlyph from={shortLabel(it.inType)} to={shortLabel(destMime)} />
                        </div>
                      )}
                      {/* Done badge pops in. */}
                      {it.status === "done" && (
                        <span className="absolute left-2 top-2 flex h-5 w-5 animate-scale-in items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <p className="truncate text-sm font-medium" title={it.outName ?? it.name}>
                        {it.outName ?? it.name}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                        <span>
                          {formatBytes(it.inSize)}
                          {it.outSize != null && <> → <span className="text-foreground">{formatBytes(it.outSize)}</span></>}
                        </span>
                        {delta != null && (
                          <span
                            className={cn(
                              "font-medium",
                              delta >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {delta >= 0 ? "−" : "+"}
                            {Math.abs(delta)}%
                          </span>
                        )}
                        {it.status === "error" && <span className="font-medium text-destructive">failed</span>}
                      </div>
                      {it.status === "done" && it.width > 0 && (
                        <span className="text-2xs tabular-nums text-muted-foreground/70">
                          {it.width} × {it.height} px
                        </span>
                      )}

                      {/* ── Per-image options ──────────────────────────────── */}
                      {open && (
                        <div className="mt-2 flex animate-scale-in flex-col gap-2.5 rounded-lg border hairline bg-secondary/30 p-2.5 text-xs">
                          <label className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Format</span>
                            <select
                              value={it.fmtOverride ?? "default"}
                              onChange={(e) =>
                                updateOpts(it.id, {
                                  fmtOverride:
                                    e.target.value === "default"
                                      ? undefined
                                      : (e.target.value as TargetFormat),
                                })
                              }
                              className="h-7 rounded-md border border-input bg-background px-1.5 text-xs"
                            >
                              <option value="default">Default ({globalLabel})</option>
                              {cards.map((c) => (
                                <option key={c.fmt} value={c.fmt}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Resize</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                placeholder="W"
                                value={it.resizeW ?? ""}
                                onChange={(e) => updateOpts(it.id, { resizeW: parseDim(e.target.value) })}
                                className="h-7 w-12 rounded-md border border-input bg-background px-1 text-center text-xs"
                              />
                              <span className="text-muted-foreground">×</span>
                              <input
                                type="number"
                                min={1}
                                placeholder="H"
                                value={it.resizeH ?? ""}
                                onChange={(e) => updateOpts(it.id, { resizeH: parseDim(e.target.value) })}
                                className="h-7 w-12 rounded-md border border-input bg-background px-1 text-center text-xs"
                              />
                              <span className="text-muted-foreground">px</span>
                            </div>
                          </div>

                          <label className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Keep aspect ratio</span>
                            <Switch
                              checked={it.keepAspect}
                              onCheckedChange={(v) => updateOpts(it.id, { keepAspect: v })}
                              className="scale-90"
                            />
                          </label>

                          <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                            Metadata (EXIF, GPS) removed on export
                          </div>
                        </div>
                      )}

                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleOpts(it.id)}
                          className={cn(
                            "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs transition-colors",
                            open || overridden
                              ? "border-primary/40 bg-primary/5 text-primary"
                              : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
                        >
                          <Sliders className="h-3 w-3" />
                          Options
                        </button>
                        {it.status === "done" && it.outUrl && it.outName && (
                          <button
                            type="button"
                            onClick={() => triggerDownload(it.outUrl!, it.outName!)}
                            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
