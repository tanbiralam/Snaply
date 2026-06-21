"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  Check,
  Copy,
  Download,
  Image as ImageLucide,
  Loader2,
  PanelRight,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  drawOg,
  defaultOg,
  OG_GRADIENTS,
  OG_W,
  OG_H,
  type OgImages,
  type OgSettings,
  type OgTemplate,
} from "@/lib/ogRender";

const TEMPLATES: { id: OgTemplate; label: string; icon: typeof AlignLeft }[] = [
  { id: "spotlight", label: "Spotlight", icon: AlignLeft },
  { id: "centered", label: "Centered", icon: AlignCenter },
  { id: "showcase", label: "Showcase", icon: PanelRight },
];

function useLoadedImage(src: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const im = new window.Image();
    im.onload = () => setImg(im);
    im.onerror = () => setImg(null);
    im.src = src;
    return () => {
      im.onload = null;
    };
  }, [src]);
  return img;
}

function readFile(file: File, cb: (dataUrl: string) => void) {
  const r = new FileReader();
  r.onload = (e) => {
    const d = e.target?.result;
    if (typeof d === "string") cb(d);
  };
  r.readAsDataURL(file);
}

export default function OgImageEditor() {
  const [s, setS] = useState<OgSettings>(defaultOg);
  const [bgSrc, setBgSrc] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [shotSrc, setShotSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bg = useLoadedImage(bgSrc);
  const logo = useLoadedImage(logoSrc);
  const shot = useLoadedImage(shotSrc);

  const set = useCallback(<K extends keyof OgSettings>(key: K, val: OgSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Redraw whenever anything changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgs: OgImages = { bg, logo, shot };
    drawOg(ctx, s, imgs);
  }, [s, bg, logo, shot]);

  const exportBlob = useCallback(
    (): Promise<Blob | null> =>
      new Promise((res) => {
        const canvas = canvasRef.current;
        if (!canvas) return res(null);
        canvas.toBlob((b) => res(b), "image/png");
      }),
    []
  );

  const download = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await exportBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.name.toLowerCase()}-og-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("OG image downloaded", { description: "1200 × 630 PNG" });
    } finally {
      setExporting(false);
    }
  }, [exportBlob]);

  const copy = useCallback(async () => {
    try {
      const blob = await exportBlob();
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy not supported", { description: "Use Download instead" });
    }
  }, [exportBlob]);

  const reset = useCallback(() => {
    setS(defaultOg);
    setBgSrc(null);
    setLogoSrc(null);
    setShotSrc(null);
    toast.success("Reset to defaults");
  }, []);

  const pickGradient = useCallback((g: (typeof OG_GRADIENTS)[number]) => {
    setS((prev) => ({
      ...prev,
      bgType: "gradient",
      gradientStart: g.start,
      gradientEnd: g.end,
      gradientAngle: g.angle,
    }));
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt={`${site.name} logo`} width={28} height={28} className="h-7 w-7 rounded-lg" priority />
          <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
        </Link>
        <span className="text-sm text-muted-foreground">OG Image Maker</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* Preview — sticky on mobile so it stays visible while scrolling controls */}
        <main className="sticky top-0 z-10 flex shrink-0 flex-col items-center justify-center gap-4 border-b bg-muted p-4 hairline md:p-8 lg:static lg:z-auto lg:min-h-0 lg:flex-1 lg:overflow-auto lg:border-b-0 lg:bg-muted/60">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl shadow-modal ring-1 ring-border/60">
            <canvas
              ref={canvasRef}
              width={OG_W}
              height={OG_H}
              className="block h-auto w-full"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 hidden text-xs text-muted-foreground sm:inline">
              1200 × 630 · Open Graph
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </button>
            <button
              type="button"
              onClick={download}
              disabled={exporting}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PNG
            </button>
          </div>
        </main>

        {/* Controls */}
        <aside className="w-full shrink-0 border-t hairline lg:w-96 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="flex flex-col gap-6 p-5">
            {/* Template */}
            <Section title="Template">
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => {
                  const active = s.template === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set("template", t.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium transition-all",
                        active
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                          : "hairline text-muted-foreground hover:border-strong hover:text-foreground"
                      )}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Content */}
            <Section title="Content">
              <Field label="Eyebrow">
                <input
                  type="text"
                  value={s.eyebrow}
                  onChange={(e) => set("eyebrow", e.target.value)}
                  placeholder="Small label above the title"
                  className={inputCls}
                />
              </Field>
              <Field label="Title">
                <textarea
                  value={s.title}
                  onChange={(e) => set("title", e.target.value)}
                  rows={2}
                  className={cn(inputCls, "resize-none")}
                />
              </Field>
              <Field label="Subtitle">
                <textarea
                  value={s.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  rows={3}
                  className={cn(inputCls, "resize-none")}
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Brand">
                  <input
                    type="text"
                    value={s.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Handle / URL">
                  <input
                    type="text"
                    value={s.handle}
                    onChange={(e) => set("handle", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            {/* Images */}
            <Section title="Images">
              <div className="grid grid-cols-2 gap-2">
                <ImageSlot
                  label="Logo"
                  has={!!logoSrc}
                  onPick={(f) => readFile(f, setLogoSrc)}
                  onClear={() => setLogoSrc(null)}
                />
                <ImageSlot
                  label="Screenshot"
                  has={!!shotSrc}
                  onPick={(f) => readFile(f, setShotSrc)}
                  onClear={() => setShotSrc(null)}
                />
              </div>
              <p className="text-2xs text-muted-foreground">
                Screenshot shows in the Spotlight &amp; Showcase templates.
              </p>
            </Section>

            {/* Background */}
            <Section title="Background">
              <div className="flex gap-1 rounded-lg border hairline p-0.5">
                {(["gradient", "solid", "image"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("bgType", t)}
                    className={cn(
                      "flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors",
                      s.bgType === t
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {s.bgType === "gradient" && (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {OG_GRADIENTS.map((g) => {
                      const active = s.gradientStart === g.start && s.gradientEnd === g.end;
                      return (
                        <button
                          key={g.name}
                          type="button"
                          title={g.name}
                          onClick={() => pickGradient(g)}
                          className={cn(
                            "h-10 rounded-lg ring-offset-2 ring-offset-background transition-all",
                            active ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-strong"
                          )}
                          style={{ background: `linear-gradient(135deg, ${g.start}, ${g.end})` }}
                        />
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ColorField label="From" value={s.gradientStart} onChange={(v) => set("gradientStart", v)} />
                    <ColorField label="To" value={s.gradientEnd} onChange={(v) => set("gradientEnd", v)} />
                  </div>
                  <Field label={`Angle · ${s.gradientAngle}°`}>
                    <Slider
                      value={[s.gradientAngle]}
                      min={0}
                      max={360}
                      step={5}
                      onValueChange={([v]) => set("gradientAngle", v)}
                    />
                  </Field>
                </>
              )}

              {s.bgType === "solid" && (
                <ColorField label="Colour" value={s.solidColor} onChange={(v) => set("solidColor", v)} />
              )}

              {s.bgType === "image" && (
                <>
                  <ImageSlot
                    label="Background image"
                    has={!!bgSrc}
                    full
                    onPick={(f) => readFile(f, setBgSrc)}
                    onClear={() => setBgSrc(null)}
                  />
                  <Field label={`Dark overlay · ${Math.round(s.overlay * 100)}%`}>
                    <Slider
                      value={[Math.round(s.overlay * 100)]}
                      min={0}
                      max={80}
                      step={5}
                      onValueChange={([v]) => set("overlay", v / 100)}
                    />
                  </Field>
                </>
              )}
            </Section>

            {/* Colours */}
            <Section title="Colours">
              <ColorField label="Accent" value={s.accent} onChange={(v) => set("accent", v)} />
              <Field label="Text">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => set("textColor", "#ffffff")}
                    className={cn(
                      "flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors",
                      s.textColor.toLowerCase() === "#ffffff"
                        ? "border-primary text-primary"
                        : "hairline text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => set("textColor", "#0f172a")}
                    className={cn(
                      "flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors",
                      s.textColor.toLowerCase() === "#0f172a"
                        ? "border-primary text-primary"
                        : "hairline text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Dark
                  </button>
                  <input
                    type="color"
                    value={s.textColor}
                    onChange={(e) => set("textColor", e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded-md border hairline bg-transparent"
                  />
                </div>
              </Field>
            </Section>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── small UI helpers ──────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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

function ImageSlot({
  label,
  has,
  full,
  onPick,
  onClear,
}: {
  label: string;
  has: boolean;
  full?: boolean;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div className={cn("relative", full && "col-span-2")}>
      <label
        className={cn(
          "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed py-3 text-xs transition-colors",
          has ? "border-primary/40 bg-primary/5 text-primary" : "hairline text-muted-foreground hover:border-strong hover:text-foreground"
        )}
      >
        {has ? <ImageLucide className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
        {has ? `${label} ✓` : label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            e.target.value = "";
          }}
        />
      </label>
      {has && (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Remove ${label}`}
          className="absolute -right-1.5 -top-1.5 rounded-full bg-background p-0.5 text-muted-foreground shadow ring-1 ring-border hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
