"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import { BLURHASH_COMPONENTS, decodeBlurhash, encodeBlurhash } from "@/lib/blurhash";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Copy, ImageIcon } from "lucide-react";

const STORAGE_KEY = "blurhash";
/** Encode from a ≤64px copy: BlurHash only keeps ≤9 frequencies per axis, so more pixels add cost, not detail. */
const ENCODE_MAX = 64;
/** Decoded placeholder size; the browser upscales it smoothly. */
const PREVIEW_MAX = 32;

const kicker =
  "mb-2 block font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const ghostBtn =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50";

const fit = (w: number, h: number, max: number) => {
  const s = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
};

const clampComp = (v: unknown, d: number) =>
  Number.isInteger(v) && (v as number) >= BLURHASH_COMPONENTS[0] && (v as number) <= BLURHASH_COMPONENTS[1]
    ? (v as number)
    : d;

interface Source {
  pixels: Uint8ClampedArray;
  w: number;
  h: number;
  /** Original dimensions, for the aspect ratio in snippets. */
  ow: number;
  oh: number;
  url: string;
}

export default function BlurhashEditor() {
  const [src, setSrc] = useState<Source | null>(null);
  const [comp, setComp] = useState({ x: 4, y: 3 });

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      setComp({ x: clampComp(raw.x, 4), y: clampComp(raw.y, 3) });
    } catch {
      /* corrupt or blocked storage — keep defaults */
    }
  }, []);

  const changeComp = (k: "x" | "y", v: number) => {
    const next = { ...comp, [k]: v };
    setComp(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — setting just won't persist */
    }
  };

  const onImage = useCallback((dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) return toast.error("That image has no size");
      const { w, h } = fit(img.naturalWidth, img.naturalHeight, ENCODE_MAX);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return toast.error("Couldn't read that image");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      setSrc({
        pixels: ctx.getImageData(0, 0, w, h).data,
        w,
        h,
        ow: img.naturalWidth,
        oh: img.naturalHeight,
        url: dataUrl,
      });
    };
    img.onerror = () => toast.error("Couldn't load that image");
    img.src = dataUrl;
  }, []);

  // Paste-to-upload, matching the other editors.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((i) => i.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (ev) => typeof ev.target?.result === "string" && onImage(ev.target.result);
      reader.readAsDataURL(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [onImage]);

  const hash = useMemo(
    () => (src ? encodeBlurhash(src.pixels, src.w, src.h, comp.x, comp.y) : null),
    [src, comp]
  );

  // Placeholder rendered from the hash itself, so the preview is exactly what a consumer decodes.
  const placeholder = useMemo(() => {
    if (!hash || !src) return null;
    const { w, h } = fit(src.ow, src.oh, PREVIEW_MAX);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.putImageData(new ImageData(decodeBlurhash(hash, w, h), w, h), 0, 0);
    return c.toDataURL("image/png");
  }, [hash, src]);

  const css = placeholder
    ? `background-image: url("${placeholder}");\nbackground-size: cover;\naspect-ratio: ${src!.ow} / ${src!.oh};`
    : "";

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Your browser blocked clipboard access");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <BrandMark />
        <span className="text-sm text-muted-foreground">BlurHash Generator</span>
        <ThemeToggle />
      </header>

      {!src ? (
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto bg-muted/60 p-4 md:p-6">
          <div className="w-full max-w-lg">
            <ImageUpload onImageUpload={onImage} hasImage={false} label="image" />
          </div>
        </main>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <main className="grid min-w-0 flex-1 grid-cols-1 content-start gap-4 overflow-auto bg-muted/60 p-4 sm:grid-cols-2 md:p-6 lg:content-center lg:p-8">
            {(
              [
                ["Original", src.url],
                ["Placeholder", placeholder],
              ] as const
            ).map(([label, url]) => (
              <figure key={label} className="flex flex-col gap-2">
                <figcaption className="flex justify-between font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                  {label}
                  <span>{label === "Original" ? `${src.ow}×${src.oh}` : `${comp.x}×${comp.y} components`}</span>
                </figcaption>
                {url && (
                  <img
                    src={url}
                    alt={label === "Original" ? "Original image" : "BlurHash placeholder"}
                    style={{ aspectRatio: `${src.ow} / ${src.oh}` }}
                    className="block w-full rounded-lg object-cover shadow-modal"
                  />
                )}
              </figure>
            ))}
          </main>

          <aside className="max-h-96 shrink-0 overflow-y-auto border-t hairline lg:max-h-none lg:w-80 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-5 p-4">
              <div>
                <span className={cn(kicker, "flex justify-between")}>
                  BlurHash
                  <span className="normal-case">{hash?.length} chars</span>
                </span>
                <code
                  data-testid="hash"
                  className="block break-all rounded-md border hairline bg-secondary px-3 py-2 font-mono text-sm text-foreground"
                >
                  {hash}
                </code>
              </div>

              {(
                [
                  ["x", "Horizontal detail"],
                  ["y", "Vertical detail"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="block">
                  <span className={cn(kicker, "flex justify-between")}>
                    {label}
                    <span className="normal-case">{comp[k]}</span>
                  </span>
                  <input
                    type="range"
                    min={BLURHASH_COMPONENTS[0]}
                    max={BLURHASH_COMPONENTS[1]}
                    step={1}
                    value={comp[k]}
                    onChange={(e) => changeComp(k, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
              ))}
              <p className="-mt-3 text-xs text-muted-foreground">
                4×3 suits most photos. More components add detail and length.
              </p>

              <label className="block">
                <span className={kicker}>CSS (no JavaScript needed)</span>
                <textarea
                  readOnly
                  rows={4}
                  value={css}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-2xs"
                />
              </label>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSrc(null)} className={ghostBtn}>
                    <ImageIcon className="h-3.5 w-3.5" />
                    New image
                  </button>
                  <button type="button" onClick={() => copy(css, "CSS")} className={ghostBtn}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy CSS
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => hash && copy(hash, "BlurHash")}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  <Copy className="h-4 w-4" />
                  Copy BlurHash
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
