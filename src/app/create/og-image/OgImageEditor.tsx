"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  Check,
  Code2,
  Copy,
  Download,
  Image as ImageLucide,
  Linkedin,
  Loader2,
  Monitor,
  PanelRight,
  RotateCcw,
  Search,
  Slack,
  Sparkles,
  Twitter,
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
  FONT_CHOICES,
  FONT_PRELOAD,
  OG_GRADIENTS,
  OG_MESH,
  OG_W,
  OG_H,
  type OgImages,
  type OgSettings,
  type OgTemplate,
  type Rect,
} from "@/lib/ogRender";

const TEMPLATES: { id: OgTemplate; label: string; icon: typeof AlignLeft }[] = [
  { id: "spotlight", label: "Spotlight", icon: AlignLeft },
  { id: "centered", label: "Centered", icon: AlignCenter },
  { id: "showcase", label: "Showcase", icon: PanelRight },
];

// One-click looks: each sets template + font + background + colours together.
// Inspired by real-world SaaS OG images (saaspo.com).
const RECIPES: { label: string; patch: Partial<OgSettings> }[] = [
  {
    // Lemon Squeezy — purple gradient, product showcase right
    label: "SaaS purple",
    patch: { template: "showcase", font: "display", bgType: "gradient", gradientStart: "#4c1d95", gradientEnd: "#7c3aed", gradientAngle: 140, eyebrow: "", accent: "#fde68a", textColor: "#ffffff", grain: 6 },
  },
  {
    // Fin — cinematic black, warm horizon spotlight glow, editorial feel
    label: "Cinematic",
    patch: { template: "centered", font: "editorial", bgType: "mesh", meshIndex: 8, eyebrow: "", accent: "#fbbf24", textColor: "#ffffff", grain: 22 },
  },
  {
    // Novu / developer tool — pure black, tight cyan glow, monospace eyebrow
    label: "Dev dark",
    patch: { template: "spotlight", font: "grotesk", bgType: "mesh", meshIndex: 9, eyebrow: "OPEN SOURCE", accent: "#22d3ee", textColor: "#ffffff", grain: 4 },
  },
  {
    // Clarasight — soft lavender purple mesh, airy SaaS platform feel
    label: "Lavender SaaS",
    patch: { template: "centered", font: "display", bgType: "mesh", meshIndex: 10, eyebrow: "PLATFORM", accent: "#e9d5ff", textColor: "#ffffff", grain: 10 },
  },
  {
    // Runner / editorial cream — off-white, editorial serif, no screenshot
    label: "Editorial cream",
    patch: { template: "centered", font: "editorial", bgType: "gradient", gradientStart: "#fefce8", gradientEnd: "#fef3c7", gradientAngle: 160, eyebrow: "", accent: "#78350f", textColor: "#1c1917", grain: 18 },
  },
  {
    // Setary / Datum — clean white, dark text, bold sans, brand logo prominent
    label: "Clean white",
    patch: { template: "spotlight", font: "grotesk", bgType: "gradient", gradientStart: "#ffffff", gradientEnd: "#f1f5f9", gradientAngle: 160, eyebrow: "", accent: "#2563eb", textColor: "#0f172a", grain: 0 },
  },
  {
    // Blynch — dark forest green, centered, accent-colored keyword feel
    label: "Forest green",
    patch: { template: "centered", font: "display", bgType: "solid", solidColor: "#052e16", eyebrow: "", accent: "#4ade80", textColor: "#ffffff", grain: 8 },
  },
  {
    // HyperComply — dark olive, product on right, security/compliance vibe
    label: "Olive security",
    patch: { template: "showcase", font: "grotesk", bgType: "solid", solidColor: "#1a2008", eyebrow: "SECURITY", accent: "#a3e635", textColor: "#ffffff", grain: 10 },
  },
  {
    // Auth0 — very dark charcoal, spotlight, single highlighted keyword
    label: "Auth dark",
    patch: { template: "spotlight", font: "sans", bgType: "solid", solidColor: "#0b0b0f", eyebrow: "", accent: "#818cf8", textColor: "#ffffff", grain: 0 },
  },
  {
    // Optimal Workshop / Andercore — split with photo on right, corporate neutral
    label: "Corporate neutral",
    patch: { template: "showcase", font: "sans", bgType: "solid", solidColor: "#111827", eyebrow: "ENTERPRISE", accent: "#f59e0b", textColor: "#ffffff", grain: 0 },
  },
  {
    // Blog post — editorial, grainy dusk mesh, article vibe
    label: "Blog post",
    patch: { template: "centered", font: "editorial", bgType: "mesh", meshIndex: 3, eyebrow: "ARTICLE", accent: "#c4b5fd", textColor: "#ffffff", grain: 16 },
  },
  {
    // Product launch — Aurora mesh, display font, launch announcement
    label: "Product launch",
    patch: { template: "spotlight", font: "display", bgType: "mesh", meshIndex: 0, eyebrow: "NOW LIVE", accent: "#818cf8", textColor: "#ffffff", grain: 10 },
  },
  {
    // Changelog — solid near-black, green terminal accent, grotesk mono feel
    label: "Changelog",
    patch: { template: "spotlight", font: "grotesk", bgType: "solid", solidColor: "#0b0f19", eyebrow: "CHANGELOG", accent: "#34d399", textColor: "#ffffff", grain: 6 },
  },
  {
    // Minimal — pure slate, clean, no eyebrow, sky accent
    label: "Minimal",
    patch: { template: "spotlight", font: "sans", bgType: "solid", solidColor: "#0f172a", eyebrow: "", accent: "#38bdf8", textColor: "#ffffff", grain: 0 },
  },
];

type Platform = "none" | "x" | "linkedin" | "slack" | "google";
const PLATFORMS: { id: Platform; label: string; icon: typeof Twitter }[] = [
  { id: "none", label: "Card", icon: Monitor },
  { id: "x", label: "X", icon: Twitter },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "slack", label: "Slack", icon: Slack },
  { id: "google", label: "Google", icon: Search },
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
  const [metaCopied, setMetaCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fontsReady, setFontsReady] = useState(0);
  const [platform, setPlatform] = useState<Platform>("none");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shotRectRef = useRef<Rect | null>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const bg = useLoadedImage(bgSrc);
  const logo = useLoadedImage(logoSrc);
  const shot = useLoadedImage(shotSrc);

  const set = useCallback(<K extends keyof OgSettings>(key: K, val: OgSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Preload the self-hosted fonts, then bump a counter to redraw with them.
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

  // Redraw whenever anything changes (incl. once fonts finish loading, and the
  // platform frame so the canvas stays drawn if it remounts inside the mock).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgs: OgImages = { bg, logo, shot };
    shotRectRef.current = drawOg(ctx, s, imgs).shotRect;
  }, [s, bg, logo, shot, fontsReady, platform]);

  // ── Drag the screenshot in the preview ──────────────────────────────────────
  const toOg = useCallback((clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const ratio = OG_W / r.width;
    return { x: (clientX - r.left) * ratio, y: (clientY - r.top) * ratio };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = shotRectRef.current;
      if (!rect) return;
      const p = toOg(e.clientX, e.clientY);
      if (p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h) {
        dragRef.current = { px: p.x, py: p.y, ox: s.shotX, oy: s.shotY };
        setDragging(true);
        canvasRef.current?.setPointerCapture(e.pointerId);
      }
    },
    [toOg, s.shotX, s.shotY]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const d = dragRef.current;
      if (!d) return;
      const p = toOg(e.clientX, e.clientY);
      setS((prev) => ({ ...prev, shotX: d.ox + (p.x - d.px), shotY: d.oy + (p.y - d.py) }));
    },
    [toOg]
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }, []);

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

  const copyMeta = useCallback(async () => {
    const url = "https://your-site.com/og.png";
    const esc = (t: string) => t.replace(/"/g, "&quot;").replace(/\s+/g, " ").trim();
    const snippet = [
      `<meta property="og:title" content="${esc(s.title)}" />`,
      `<meta property="og:description" content="${esc(s.subtitle)}" />`,
      `<meta property="og:image" content="${url}" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:image" content="${url}" />`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(snippet);
      setMetaCopied(true);
      setTimeout(() => setMetaCopied(false), 2000);
      toast.success("Meta tags copied", { description: "Swap in your hosted image URL" });
    } catch {
      toast.error("Copy failed");
    }
  }, [s.title, s.subtitle]);

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

  const canvasEl = (
    <canvas
      ref={canvasRef}
      width={OG_W}
      height={OG_H}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "block h-auto w-full",
        shot && "touch-none",
        shot && (dragging ? "cursor-grabbing" : "cursor-grab")
      )}
    />
  );

  const meta = {
    title: s.title || "Untitled",
    description: s.subtitle,
    domain: (s.handle || s.brand || "yoursite.com").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    brand: s.brand || site.name,
    accent: s.accent,
  };

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
          {/* Platform preview switcher */}
          <div className="flex items-center gap-1 rounded-lg border hairline bg-background/60 p-0.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                title={p.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  platform === p.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <p.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>

          {platform === "none" ? (
            <div className="w-full max-w-3xl overflow-hidden rounded-xl shadow-modal ring-1 ring-border/60">
              {canvasEl}
            </div>
          ) : (
            <PreviewMock platform={platform} meta={meta}>
              {canvasEl}
            </PreviewMock>
          )}

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
            {/* Recipes — one-click starting points */}
            <Section title="Recipes">
              <div className="flex flex-wrap gap-1.5">
                {RECIPES.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setS((prev) => ({ ...prev, ...r.patch }))}
                    className="inline-flex items-center gap-1 rounded-full border hairline bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-strong hover:text-foreground"
                  >
                    <Sparkles className="h-3 w-3" />
                    {r.label}
                  </button>
                ))}
              </div>
            </Section>

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

            {/* Typeface */}
            <Section title="Typeface">
              <div className="grid grid-cols-4 gap-2">
                {FONT_CHOICES.map((f) => {
                  const active = s.font === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => set("font", f.id)}
                      className={cn(
                        "rounded-lg border py-2 text-xs font-semibold transition-all",
                        active
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                          : "hairline text-muted-foreground hover:border-strong hover:text-foreground"
                      )}
                    >
                      {f.label}
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

              {shotSrc && s.template !== "centered" && (
                <div className="flex flex-col gap-3 rounded-lg border hairline bg-secondary/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Adjust screenshot</span>
                    <button
                      type="button"
                      onClick={() => setS((p) => ({ ...p, shotX: 0, shotY: 0, shotScale: 1 }))}
                      className="text-2xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Reset position
                    </button>
                  </div>
                  <div className="flex gap-1 rounded-lg border hairline p-0.5">
                    {(["contain", "cover"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => set("shotFit", f)}
                        className={cn(
                          "flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors",
                          s.shotFit === f
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <Field label={`Size · ${Math.round(s.shotScale * 100)}%`}>
                    <Slider
                      value={[Math.round(s.shotScale * 100)]}
                      min={50}
                      max={160}
                      step={5}
                      onValueChange={([v]) => set("shotScale", v / 100)}
                    />
                  </Field>
                  <p className="text-2xs text-muted-foreground">
                    Drag the screenshot in the preview to reposition it.
                  </p>
                </div>
              )}
            </Section>

            {/* Background */}
            <Section title="Background">
              <div className="flex gap-1 rounded-lg border hairline p-0.5">
                {(["gradient", "mesh", "solid", "image"] as const).map((t) => (
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

              {s.bgType === "mesh" && (
                <div className="grid grid-cols-4 gap-2">
                  {OG_MESH.map((m, i) => {
                    const active = s.meshIndex === i;
                    return (
                      <button
                        key={m.name}
                        type="button"
                        title={m.name}
                        onClick={() => set("meshIndex", i)}
                        className={cn(
                          "h-10 rounded-lg ring-offset-2 ring-offset-background transition-all",
                          active ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-strong"
                        )}
                        style={{
                          background: `radial-gradient(circle at 20% 25%, ${m.blobs[0].color}, transparent 60%), radial-gradient(circle at 85% 20%, ${m.blobs[1].color}, transparent 55%), radial-gradient(circle at 60% 90%, ${m.blobs[2].color}, transparent 60%), ${m.base}`,
                        }}
                      />
                    );
                  })}
                </div>
              )}

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

              <Field label={`Grain · ${s.grain}%`}>
                <Slider
                  value={[s.grain]}
                  min={0}
                  max={60}
                  step={2}
                  onValueChange={([v]) => set("grain", v)}
                />
              </Field>
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

            {/* Embed */}
            <Section title="Embed">
              <p className="text-2xs leading-relaxed text-muted-foreground">
                Download the PNG, host it, then paste these tags in your page&apos;s{" "}
                <code className="rounded bg-secondary px-1 font-mono">&lt;head&gt;</code>.
              </p>
              <button
                type="button"
                onClick={copyMeta}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {metaCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Code2 className="h-3.5 w-3.5" />
                )}
                Copy meta tags
              </button>
            </Section>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Social platform preview ────────────────────────────────────────────────

interface PreviewMeta {
  title: string;
  description: string;
  domain: string;
  brand: string;
  accent: string;
}

function PreviewMock({
  platform,
  meta,
  children,
}: {
  platform: Exclude<Platform, "none">;
  meta: PreviewMeta;
  children: React.ReactNode;
}) {
  const avatar = (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ background: meta.accent }}
    >
      {meta.brand.charAt(0).toUpperCase()}
    </div>
  );

  if (platform === "x") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-[#2f3336] bg-black p-4 text-white shadow-modal">
        <div className="flex gap-3">
          {avatar}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-bold">{meta.brand}</span>
              <span className="text-[#71767b]">@{meta.domain.split(".")[0]} · 1h</span>
            </div>
            <p className="mt-0.5 text-sm">Check this out 👇</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-[#2f3336]">
              {children}
              <div className="bg-black px-3 py-2">
                <p className="text-xs text-[#71767b]">{meta.domain}</p>
                <p className="truncate text-sm text-white">{meta.title}</p>
                {meta.description && (
                  <p className="line-clamp-1 text-xs text-[#71767b]">{meta.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "linkedin") {
    return (
      <div className="w-full max-w-md rounded-lg border border-black/10 bg-white text-[#000000e6] shadow-modal">
        <div className="flex items-center gap-2 p-3">
          {avatar}
          <div>
            <p className="text-sm font-semibold leading-tight">{meta.brand}</p>
            <p className="text-xs text-[#00000099]">Promoted</p>
          </div>
        </div>
        {children}
        <div className="bg-[#f3f2ef] px-3 py-2.5">
          <p className="truncate text-sm font-semibold">{meta.title}</p>
          <p className="text-xs text-[#00000099]">{meta.domain}</p>
        </div>
      </div>
    );
  }

  if (platform === "slack") {
    return (
      <div className="w-full max-w-md bg-white p-4 text-[#1d1c1d] shadow-modal">
        <div className="flex gap-2">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {meta.brand} <span className="ml-1 align-middle text-xs font-normal text-[#616061]">1:00 PM</span>
            </p>
            <div className="mt-1 border-l-4 pl-3" style={{ borderColor: meta.accent }}>
              <p className="text-sm font-bold text-[#1264a3]">{meta.title}</p>
              {meta.description && <p className="text-sm text-[#1d1c1d]">{meta.description}</p>}
              <div className="mt-2 max-w-xs overflow-hidden rounded-md border border-black/10">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // google
  return (
    <div className="w-full max-w-xl rounded-lg border border-black/10 bg-white p-4 text-left shadow-modal">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {avatar}
            <div>
              <p className="text-sm text-[#202124]">{meta.brand}</p>
              <p className="text-xs text-[#5f6368]">{meta.domain}</p>
            </div>
          </div>
          <p className="mt-1 text-xl leading-snug text-[#1a0dab]">{meta.title}</p>
          {meta.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">{meta.description}</p>
          )}
        </div>
        <div className="w-32 shrink-0 overflow-hidden rounded-lg border border-black/10">
          {children}
        </div>
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
