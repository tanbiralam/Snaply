"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import {
  QR_LOGO_SCALE,
  QR_MARGIN,
  QR_SIZES,
  defaultQr,
  drawQr,
  parseQr,
  qrColorWarning,
  qrMatrix,
  qrSvg,
  type QrEcc,
  type QrLogo,
  type QrSettings,
} from "@/lib/qr";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AlertTriangle, Copy, Download, RotateCcw, Upload, X } from "lucide-react";

const STORAGE_KEY = "qr-code";

const chip = (active: boolean) =>
  cn(
    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-120",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
  );

const kicker =
  "mb-2 block font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const field = "w-full rounded-md border border-input bg-background px-3 text-sm";
const ghostBtn =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50";

const ECC: { id: QrEcc; hint: string }[] = [
  { id: "L", hint: "7%" },
  { id: "M", hint: "15%" },
  { id: "Q", hint: "25%" },
  { id: "H", hint: "30%" },
];

const loadSettings = (): QrSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseQr(JSON.parse(raw)) : defaultQr;
  } catch {
    return defaultQr;
  }
};

export default function QrCodeEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<QrSettings>(defaultQr);
  const [loaded, setLoaded] = useState(false);
  // In memory only — the logo is never persisted (same rule as Watermark's logo).
  const [logo, setLogo] = useState<{ img: HTMLImageElement; meta: QrLogo } | null>(null);

  const set = <K extends keyof QrSettings>(k: K, v: QrSettings[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setS(loadSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* storage full or blocked — settings just won't persist */
    }
  }, [s, loaded]);

  const matrix = useMemo(() => qrMatrix(s.text, s.ecc), [s.text, s.ecc]);
  const warning =
    qrColorWarning(s.fg, s.bg) ??
    (logo && (s.ecc === "L" || s.ecc === "M")
      ? "A logo hides part of the code — use error correction Q or H so it still scans."
      : null);
  const error = !s.text
    ? "Enter some text or a URL."
    : !matrix
      ? `Too long for a QR code at level ${s.ecc} — shorten it or pick a lower error-correction level.`
      : null;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && matrix) drawQr(ctx, matrix, s, logo ?? undefined);
  }, [matrix, s, logo]);

  const onLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Logo must be an image");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result;
      if (typeof src !== "string") return;
      const img = new window.Image();
      img.onload = () => {
        // SVGs without width/height report 0 — fall back to a square.
        const w = img.naturalWidth || 1;
        const h = img.naturalHeight || 1;
        setLogo((prev) => ({ img, meta: { src, width: w, height: h, scale: prev?.meta.scale ?? 0.2 } }));
        if (s.ecc !== "H") {
          set("ecc", "H");
          toast.info("Error correction set to H so the code still scans with a logo");
        }
      };
      img.onerror = () => toast.error("Couldn't load that image");
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const toBlob = () =>
    new Promise<Blob>((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error("no canvas"));
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("export failed"))),
        "image/png"
      );
    });

  const save = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.name.toLowerCase()}-qr-${s.size}.${ext}`;
    a.click();
    // Revoking synchronously can cancel the download in Safari.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const downloadPng = async () => {
    try {
      save(await toBlob(), "png");
    } catch {
      toast.error("Export failed");
    }
  };

  const downloadSvg = () => {
    if (!matrix) return;
    save(new Blob([qrSvg(matrix, s, logo?.meta)], { type: "image/svg+xml" }), "svg");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": toBlob() }),
      ]);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked copying images — use Download instead");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <BrandMark />
        <span className="text-sm text-muted-foreground">QR Code Generator</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          {matrix ? (
            <canvas
              ref={canvasRef}
              width={s.size}
              height={s.size}
              aria-label="QR code preview"
              className="block aspect-square max-h-full w-full max-w-md rounded-lg shadow-modal [image-rendering:pixelated]"
            />
          ) : (
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              {error}
            </p>
          )}
        </main>

        <aside className="max-h-96 shrink-0 overflow-y-auto border-t hairline lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col gap-5 p-4">
            <label className="block">
              <span className={kicker}>Text or URL</span>
              <textarea
                rows={4}
                maxLength={4000}
                value={s.text}
                onChange={(e) => set("text", e.target.value)}
                placeholder="https://example.com"
                className={cn(field, "resize-y py-2 leading-relaxed")}
              />
              {error && s.text && (
                <span role="alert" className="mt-1.5 block text-xs text-destructive">
                  {error}
                </span>
              )}
            </label>

            <div>
              <span className={kicker}>Error correction</span>
              <div className="grid grid-cols-4 gap-1.5">
                {ECC.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    title={`Recovers ~${e.hint} damage`}
                    aria-pressed={s.ecc === e.id}
                    onClick={() => set("ecc", e.id)}
                    className={cn(chip(s.ecc === e.id), "flex flex-col items-center gap-0.5 px-1")}
                  >
                    {e.id}
                    <span className="font-mono text-2xs opacity-70">{e.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={kicker}>Size</span>
              <div className="grid grid-cols-4 gap-1.5">
                {QR_SIZES.map((px) => (
                  <button
                    key={px}
                    type="button"
                    aria-pressed={s.size === px}
                    onClick={() => set("size", px)}
                    className={cn(chip(s.size === px), "px-1 font-mono")}
                  >
                    {px}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className={cn(kicker, "flex justify-between")}>
                Quiet zone
                <span className="normal-case">{s.margin} modules</span>
              </span>
              <input
                type="range"
                min={QR_MARGIN[0]}
                max={QR_MARGIN[1]}
                step={1}
                value={s.margin}
                onChange={(e) => set("margin", Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>

            <div>
              <span className={kicker}>Logo</span>
              <div className="flex items-center gap-2">
                <label className="relative flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed hairline px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      onLogoFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                  {logo ? (
                    <span
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 rounded bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${logo.meta.src})` }}
                    />
                  ) : (
                    <Upload className="h-4 w-4 shrink-0" />
                  )}
                  {logo ? "Change logo" : "Add logo or image"}
                </label>
                {logo && (
                  <button
                    type="button"
                    aria-label="Remove logo"
                    onClick={() => setLogo(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border hairline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {logo && (
                <label className="mt-3 block">
                  <span className={cn(kicker, "flex justify-between")}>
                    Logo size
                    <span className="normal-case">{Math.round(logo.meta.scale * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min={QR_LOGO_SCALE[0] * 100}
                    max={QR_LOGO_SCALE[1] * 100}
                    step={1}
                    value={Math.round(logo.meta.scale * 100)}
                    onChange={(e) =>
                      setLogo({ ...logo, meta: { ...logo.meta, scale: Number(e.target.value) / 100 } })
                    }
                    className="w-full accent-primary"
                  />
                </label>
              )}
            </div>

            <div>
              <span className={kicker}>Colors</span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["fg", "Code"],
                    ["bg", "Background"],
                  ] as const
                ).map(([k, label]) => (
                  <label
                    key={k}
                    className="flex items-center justify-between gap-2 rounded-md border hairline px-2 py-1.5"
                  >
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <input
                      type="color"
                      aria-label={`${label} color`}
                      value={s[k]}
                      onChange={(e) => set(k, e.target.value)}
                      className="h-7 w-9 cursor-pointer rounded-md border border-input bg-background p-0.5"
                    />
                  </label>
                ))}
              </div>
              {warning && (
                <p className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-destructive" />
                  {warning}
                </p>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                    setS(defaultQr);
                    setLogo(null);
                  }} className={ghostBtn}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button type="button" onClick={copy} disabled={!matrix} className={ghostBtn}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={downloadSvg} disabled={!matrix} className={ghostBtn}>
                  <Download className="h-3.5 w-3.5" />
                  SVG
                </button>
                <button
                  type="button"
                  onClick={downloadPng}
                  disabled={!matrix}
                  className="inline-flex h-9 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
