"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FONT_CHOICES, FONT_PRELOAD, OG_GRADIENTS, OG_MESH } from "@/lib/ogRender";
import { QUOTE_SIZES, defaultQuote, drawQuote, type QuoteSettings, type QuoteSize } from "@/lib/quoteRender";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Copy, Download, RotateCcw, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const chip = (active: boolean) =>
  cn(
    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-120",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
  );

const swatch = (active: boolean) =>
  cn(
    "h-9 rounded-md ring-offset-2 ring-offset-background transition-shadow duration-120",
    active ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-strong"
  );

const kicker = "mb-2 block font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const field = "w-full rounded-md border border-input bg-background px-3 text-sm";

export default function QuoteEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<QuoteSettings>(defaultQuote);
  const [avatar, setAvatar] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(0);

  const set = <K extends keyof QuoteSettings>(k: K, v: QuoteSettings[K]) => setS((p) => ({ ...p, [k]: v }));
  const { w: W, h: H } = QUOTE_SIZES[s.size];

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

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawQuote(ctx, s, avatar);
  }, [s, avatar, fontsReady, W, H]);

  const onAvatarFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Avatar must be an image");
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result !== "string") return;
      const img = new window.Image();
      img.onload = () =>
        img.naturalWidth && img.naturalHeight ? setAvatar(img) : toast.error("That image has no size — try a PNG or JPG");
      img.onerror = () => toast.error("Couldn't load that image");
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const toBlob = () =>
    new Promise<Blob>((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error("no canvas"));
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("export failed"))), "image/png");
    });

  const download = async () => {
    try {
      const url = URL.createObjectURL(await toBlob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.name.toLowerCase()}-quote-${W}x${H}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": toBlob() })]);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked copying images — use Download instead");
    }
  };

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
        <span className="text-sm text-muted-foreground">Quote Card</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            aria-label="Quote card preview"
            className="block max-h-full max-w-full rounded-lg shadow-modal"
          />
        </main>

        <aside className="max-h-96 shrink-0 overflow-y-auto border-t hairline lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col gap-5 p-4">
            <div>
              <span className={kicker}>Template</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["post", "quote"] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={s.template === t} onClick={() => set("template", t)} className={chip(s.template === t)}>
                    {t === "post" ? "Social post" : "Big quote"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={kicker}>Size</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(QUOTE_SIZES) as QuoteSize[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={s.size === k}
                    onClick={() => set("size", k)}
                    className={cn(chip(s.size === k), "flex flex-col items-center gap-0.5 px-1")}
                  >
                    {QUOTE_SIZES[k].label}
                    <span className="font-mono text-2xs opacity-70">
                      {QUOTE_SIZES[k].w}×{QUOTE_SIZES[k].h}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className={kicker}>Quote</span>
              <textarea
                rows={4}
                maxLength={600}
                value={s.quote}
                onChange={(e) => set("quote", e.target.value)}
                className={cn(field, "resize-y py-2 leading-relaxed")}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className={kicker}>Name</span>
                <input type="text" maxLength={60} value={s.name} onChange={(e) => set("name", e.target.value)} className={cn(field, "h-10")} />
              </label>
              <label className="block">
                <span className={kicker}>Handle</span>
                <input type="text" maxLength={40} value={s.handle} onChange={(e) => set("handle", e.target.value)} className={cn(field, "h-10")} />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed hairline px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    onAvatarFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
                {avatar ? (
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${avatar.src})` }}
                  />
                ) : (
                  <Upload className="h-4 w-4 shrink-0" />
                )}
                {avatar ? "Change avatar" : "Add avatar"}
              </label>
              {avatar && (
                <button
                  type="button"
                  aria-label="Remove avatar"
                  onClick={() => setAvatar(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border hairline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {s.template === "quote" && (
              <div>
                <span className={kicker}>Font</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {FONT_CHOICES.map((f) => (
                    <button key={f.id} type="button" aria-pressed={s.font === f.id} onClick={() => set("font", f.id)} className={cn(chip(s.font === f.id), "px-1")}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className={kicker}>{s.template === "post" ? "Card" : "Text"}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["light", "dark"] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={s.tone === t} onClick={() => set("tone", t)} className={chip(s.tone === t)}>
                    {t === "light" ? "Light" : "Dark"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={kicker}>Background</span>
              <div className="mb-2 grid grid-cols-3 gap-1.5">
                {(["gradient", "mesh", "solid"] as const).map((b) => (
                  <button key={b} type="button" aria-pressed={s.bgType === b} onClick={() => set("bgType", b)} className={chip(s.bgType === b)}>
                    {b[0].toUpperCase() + b.slice(1)}
                  </button>
                ))}
              </div>
              {s.bgType === "gradient" && (
                <div className="grid grid-cols-7 gap-1.5">
                  {OG_GRADIENTS.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      title={g.name}
                      aria-label={`${g.name} gradient`}
                      aria-pressed={s.gradientStart === g.start && s.gradientEnd === g.end}
                      onClick={() => setS((p) => ({ ...p, gradientStart: g.start, gradientEnd: g.end, gradientAngle: g.angle }))}
                      className={swatch(s.gradientStart === g.start && s.gradientEnd === g.end)}
                      style={{ background: `linear-gradient(135deg, ${g.start}, ${g.end})` }}
                    />
                  ))}
                </div>
              )}
              {s.bgType === "mesh" && (
                <div className="grid grid-cols-6 gap-1.5">
                  {OG_MESH.map((m, i) => (
                    <button
                      key={m.name}
                      type="button"
                      title={m.name}
                      aria-label={`${m.name} mesh`}
                      aria-pressed={s.meshIndex === i}
                      onClick={() => set("meshIndex", i)}
                      className={swatch(s.meshIndex === i)}
                      style={{
                        background: `radial-gradient(circle at 20% 25%, ${m.blobs[0].color}, transparent 60%), radial-gradient(circle at 85% 20%, ${m.blobs[1].color}, transparent 55%), radial-gradient(circle at 60% 90%, ${m.blobs[2].color}, transparent 60%), ${m.base}`,
                      }}
                    />
                  ))}
                </div>
              )}
              {s.bgType === "solid" && (
                <label className="flex items-center justify-between gap-2">
                  <span className="font-mono text-2xs uppercase text-muted-foreground">{s.solidColor}</span>
                  <input
                    type="color"
                    aria-label="Background color"
                    value={s.solidColor}
                    onChange={(e) => set("solidColor", e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded-md border border-input bg-background p-0.5"
                  />
                </label>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setS(defaultQuote);
                    setAvatar(null);
                  }}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <button
                type="button"
                onClick={download}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
