"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { drawImageCover, roundRect } from "@/lib/canvasHelpers";
import { encodeIco } from "@/lib/encode";
import { zipSync, type ZipEntry } from "@/lib/zip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, Copy, Download, ImageIcon, RotateCcw, Type } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// 48 only ever ships embedded in favicon.ico; everything else also gets a
// standalone named PNG, matching the file names browsers/OSes look for.
const SIZES = [16, 32, 48, 180, 192, 512] as const;
const ICO_SIZES: readonly number[] = [16, 32, 48];
const PNG_EXPORTS: Record<number, string> = {
  16: "favicon-16x16.png",
  32: "favicon-32x32.png",
  180: "apple-touch-icon.png",
  192: "android-chrome-192x192.png",
  512: "android-chrome-512x512.png",
};

const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
  backgroundSize: "10px 10px",
  backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
  backgroundColor: "#fff",
};

const SHAPES = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
] as const;
type Shape = (typeof SHAPES)[number]["id"];

const TEXT_FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const DEFAULT_BG = "#4f46e5";
const DEFAULT_FG = "#ffffff";

/** Renders a letter/word/emoji onto a square backdrop — the "text mode" source image. */
function drawTextIcon(size: number, text: string, bg: string, fg: string, shape: Shape): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.save();
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (shape === "rounded") {
    ctx.beginPath();
    roundRect(ctx, 0, 0, size, size, size * 0.22);
    ctx.clip();
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  const label = text.trim() || "A";
  const maxWidth = size * 0.7;
  let fontSize = Math.floor(size * 0.6);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  while (fontSize > 8) {
    ctx.font = `700 ${fontSize}px ${TEXT_FONT_STACK}`;
    if (ctx.measureText(label).width <= maxWidth) break;
    fontSize -= 2;
  }
  ctx.fillStyle = fg;
  ctx.fillText(label, size / 2, size / 2 + fontSize * 0.04);
  return canvas;
}

function useLoadedImage(src: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImg(null); return; }
    const im = new window.Image();
    im.onload = () => setImg(im);
    im.onerror = () => setImg(null);
    im.src = src;
    return () => { im.onload = null; };
  }, [src]);
  return img;
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring";

function SectionLabel({ children }: { children: string }) {
  return <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded bg-transparent"
        />
        <span className="font-mono text-xs uppercase text-muted-foreground">{value}</span>
      </div>
    </Field>
  );
}

export default function FaviconEditor() {
  const [mode, setMode] = useState<"image" | "text">("image");
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [text, setText] = useState("A");
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [fgColor, setFgColor] = useState(DEFAULT_FG);
  const [shape, setShape] = useState<Shape>("rounded");
  const [textSrcUrl, setTextSrcUrl] = useState<string | null>(null);
  const [name, setName] = useState("My App");
  const [themeColor, setThemeColor] = useState("#0f172a");
  const [copied, setCopied] = useState(false);

  // Text/emoji mode renders to an offscreen square canvas and feeds the result
  // through the exact same dataURL → <img> → drawImageCover pipeline an
  // uploaded file uses, so nothing downstream needs to know which mode it came from.
  useEffect(() => {
    if (mode !== "text") return;
    setTextSrcUrl(drawTextIcon(512, text, bgColor, fgColor, shape).toDataURL("image/png"));
  }, [mode, text, bgColor, fgColor, shape]);

  const effectiveSrc = mode === "text" ? textSrcUrl : srcUrl;
  const img = useLoadedImage(effectiveSrc);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const isSquare = !img || img.naturalWidth === img.naturalHeight;

  useEffect(() => {
    if (!img) return;
    for (const size of SIZES) {
      const canvas = canvasRefs.current.get(size);
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) continue;
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingQuality = "high";
      drawImageCover(ctx, img, size, size);
    }
  }, [img]);

  const reset = useCallback(() => {
    if (mode === "image") {
      setSrcUrl(null);
    } else {
      setText("A");
      setBgColor(DEFAULT_BG);
      setFgColor(DEFAULT_FG);
      setShape("rounded");
    }
  }, [mode]);

  const embedSnippet = `<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="${themeColor}" />`;

  const copyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Embed code copied");
    } catch {
      toast.error("Copy failed");
    }
  }, [embedSnippet]);

  const download = useCallback(async () => {
    if (!img) return;
    const toBlob = (canvas: HTMLCanvasElement) =>
      new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));

    const entries: ZipEntry[] = [];
    for (const [sizeStr, fileName] of Object.entries(PNG_EXPORTS)) {
      const canvas = canvasRefs.current.get(Number(sizeStr));
      const blob = canvas && (await toBlob(canvas));
      if (blob) entries.push({ name: fileName, data: new Uint8Array(await blob.arrayBuffer()) });
    }

    const icoCanvases = ICO_SIZES.map((s) => canvasRefs.current.get(s)).filter((c): c is HTMLCanvasElement => !!c);
    const icoBlob = await encodeIco(icoCanvases);
    entries.push({ name: "favicon.ico", data: new Uint8Array(await icoBlob.arrayBuffer()) });

    const manifest = {
      name,
      short_name: name.slice(0, 12),
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: themeColor,
      background_color: themeColor,
      display: "standalone",
    };
    entries.push({ name: "site.webmanifest", data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });

    const zipBlob = zipSync(entries);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.name.toLowerCase()}-favicon-package.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Favicon package downloaded", { description: `${entries.length} files` });
  }, [img, name, themeColor]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt={`${site.name} logo`} width={28} height={28} className="h-7 w-7 rounded-lg" priority />
          <span className="font-semibold tracking-tight text-[15px]">{site.name}</span>
        </Link>
        <span className="text-sm text-muted-foreground">Favicon Generator</span>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/60 p-4 md:p-6 lg:p-8">
        <div className="mx-auto mb-6 flex items-center gap-1 rounded-lg border hairline bg-card p-0.5">
          <button
            type="button"
            onClick={() => setMode("image")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150",
              mode === "image" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Upload image
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150",
              mode === "text" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Type className="h-3.5 w-3.5" />
            Letters &amp; emoji
          </button>
        </div>

        {mode === "image" && !srcUrl ? (
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4">
            <ImageUpload onImageUpload={setSrcUrl} hasImage={false} />
            <p className="text-center text-xs text-muted-foreground">
              A square logo or app icon works best — non-square images are center-cropped. Processed entirely in your browser.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 md:flex-row md:items-start">
            <div className="flex flex-col items-center gap-4 md:w-1/2">
              {mode === "image" && !isSquare && (
                <p className="rounded-lg border hairline bg-card px-3 py-2 text-center text-xs text-muted-foreground">
                  Your image isn&apos;t square — it&apos;s center-cropped to fit each icon.
                </p>
              )}

              <div className="flex flex-wrap items-end justify-center gap-5 rounded-xl border hairline bg-card p-6">
                {SIZES.map((size) => {
                  const display = Math.min(size, 96);
                  return (
                    <div key={size} className="flex flex-col items-center gap-1.5">
                      <div
                        className="overflow-hidden rounded-md ring-1 ring-border"
                        style={{ width: display, height: display, ...CHECKER }}
                      >
                        <canvas
                          ref={(el) => {
                            if (el) canvasRefs.current.set(size, el);
                            else canvasRefs.current.delete(size);
                          }}
                          width={size}
                          height={size}
                          style={{ width: display, height: display }}
                        />
                      </div>
                      <span className="text-2xs font-mono text-muted-foreground">{size}px</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {mode === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  {mode === "image" ? "Replace" : "Reset"}
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={!img}
                  className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download package
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 md:w-1/2">
              {mode === "text" && (
                <div className="space-y-3 rounded-xl border hairline bg-card p-4">
                  <SectionLabel>Design</SectionLabel>
                  <Field label="Text or emoji">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="A"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField label="Background" value={bgColor} onChange={setBgColor} />
                    <ColorField label="Text color" value={fgColor} onChange={setFgColor} />
                  </div>
                  <Field label="Shape">
                    <div className="flex gap-1 rounded-lg border hairline p-0.5">
                      {SHAPES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setShape(s.id)}
                          className={cn(
                            "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                            shape === s.id
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              <div className="space-y-3 rounded-xl border hairline bg-card p-4">
                <SectionLabel>App details</SectionLabel>
                <Field label="Name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My App"
                    className={inputCls}
                  />
                </Field>
                <ColorField label="Theme color" value={themeColor} onChange={setThemeColor} />
                <p className="text-2xs text-muted-foreground">
                  Used in <code className="rounded bg-secondary px-1 font-mono">site.webmanifest</code> and the <code className="rounded bg-secondary px-1 font-mono">theme-color</code> meta tag.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border hairline bg-card p-4">
                <SectionLabel>Embed in &lt;head&gt;</SectionLabel>
                <pre className="overflow-x-auto rounded-lg bg-secondary/60 p-3 font-mono text-2xs leading-relaxed text-foreground">
                  {embedSnippet}
                </pre>
                <button
                  type="button"
                  onClick={copyEmbed}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy embed code
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
