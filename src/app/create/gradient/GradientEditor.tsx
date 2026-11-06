"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import {
  ANGLE_STYLES,
  CELL_STYLES,
  GRADIENT_LOOKS,
  GRADIENT_PALETTES,
  GRADIENT_SHAPES,
  GRADIENT_SIZES,
  GRADIENT_STYLES,
  RANGES,
  defaultGradient,
  generatePalette,
  parseGradient,
  renderGradient,
  surpriseGradient,
  type GradientSettings,
} from "@/lib/gradient";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Copy, Dices, Download, RefreshCw, RotateCcw, Sparkles } from "lucide-react";

const STORAGE_KEY = "gradient";
/** Preview long side; the export renders the same image at full size. */
const PREVIEW = 1080;

const chip = (active: boolean) =>
  cn(
    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-120",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "hairline text-muted-foreground hover:bg-secondary hover:text-foreground"
  );

const kicker =
  "mb-2 block font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const ghostBtn =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50";
const swatch = "h-7 w-full cursor-pointer rounded-md border border-input bg-background p-0.5";

const randomSeed = () => Math.floor(Math.random() * 1_000_000);

/** Small square previews of each look, rendered once on the client. */
const lookThumbs = () =>
  GRADIENT_LOOKS.map(({ settings }) => {
    const c = document.createElement("canvas");
    c.width = c.height = 96;
    // Render as if 960px wide so dot cells stay visible at thumbnail size.
    const px = renderGradient({ ...settings, width: 1080, height: 1080, dot: settings.dot * 6 }, 96, 96);
    c.getContext("2d")?.putImageData(new ImageData(px, 96, 96), 0, 0);
    return c.toDataURL();
  });

const loadSettings = (): GradientSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseGradient(JSON.parse(raw)) : defaultGradient;
  } catch {
    return defaultGradient;
  }
};

function Slider({
  label,
  value,
  display,
  range,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  range: readonly [number, number];
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className={cn(kicker, "flex justify-between")}>
        {label}
        <span className="normal-case">{display}</span>
      </span>
      <input
        type="range"
        min={range[0]}
        max={range[1]}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

export default function GradientEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<GradientSettings>(defaultGradient);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  const set = <K extends keyof GradientSettings>(k: K, v: GradientSettings[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setS(loadSettings());
    setLoaded(true);
    setThumbs(lookThumbs());
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* storage full or blocked — settings just won't persist */
    }
  }, [s, loaded]);

  const k = PREVIEW / Math.max(s.width, s.height);
  const pw = Math.round(s.width * k);
  const ph = Math.round(s.height * k);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.putImageData(new ImageData(renderGradient(s, pw, ph), pw, ph), 0, 0);
  }, [s, pw, ph]);

  const toBlob = async (type: "image/png" | "image/jpeg") => {
    // Yield a frame so the "Rendering…" state paints before the blocking render.
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r)));
    const canvas = document.createElement("canvas");
    canvas.width = s.width;
    canvas.height = s.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    // ponytail: renders on the main thread (~0.3s at 4K); move to a worker if it ever janks.
    ctx.putImageData(new ImageData(renderGradient(s, s.width, s.height), s.width, s.height), 0, 0);
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("export failed"))), type, 0.92)
    );
  };

  const download = async (type: "image/png" | "image/jpeg") => {
    setBusy(true);
    try {
      const url = URL.createObjectURL(await toBlob(type));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.name.toLowerCase()}-${s.style}-${s.seed}-${s.width}x${s.height}.${type === "image/png" ? "png" : "jpg"}`;
      a.click();
      // Revoking synchronously can cancel the download in Safari.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      toast.error("Export failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": toBlob("image/png") })]);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked copying images — use Download instead");
    }
  };

  const shuffle = () => set("seed", randomSeed());

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <BrandMark />
        <span className="text-sm text-muted-foreground">Gradient Generator</span>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden bg-muted/60 p-4 md:p-6 lg:p-8">
          <canvas
            ref={canvasRef}
            width={pw}
            height={ph}
            aria-label="Generated background preview"
            style={{ aspectRatio: `${s.width} / ${s.height}` }}
            className="block max-h-full min-h-0 max-w-full rounded-lg shadow-modal"
          />
          <span className="font-mono text-2xs text-muted-foreground">
            {s.width} × {s.height} · SEED {s.seed}
          </span>
        </main>

        <aside className="max-h-96 shrink-0 overflow-y-auto border-t hairline lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col gap-5 p-4">
            <div>
              <span className={kicker}>Looks</span>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_LOOKS.map((look, i) => (
                  <button
                    key={look.name}
                    type="button"
                    aria-label={`${look.name} look`}
                    onClick={() => setS((p) => ({ ...p, ...look.settings }))}
                    className="group relative overflow-hidden rounded-md border hairline transition-colors duration-120 hover:border-primary"
                  >
                    <span
                      aria-hidden="true"
                      className="block aspect-square w-full bg-muted bg-cover"
                      style={thumbs[i] ? { backgroundImage: `url(${thumbs[i]})` } : undefined}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center font-mono text-2xs text-foreground">
                      {look.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={kicker}>Shape</span>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_SHAPES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={s.shape === o.id}
                    onClick={() => set("shape", o.id)}
                    className={chip(s.shape === o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={kicker}>Style</span>
              <div className="grid grid-cols-3 gap-1.5">
                {GRADIENT_STYLES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={s.style === o.id}
                    onClick={() => set("style", o.id)}
                    className={chip(s.style === o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setS((p) => surpriseGradient(randomSeed(), p.width, p.height))}
                title="Randomize everything: shape, style, colors, and effects"
                className={cn(ghostBtn, "border-primary text-primary hover:text-primary")}
              >
                <Sparkles className="h-4 w-4" />
                Surprise me
              </button>
              <button
                type="button"
                onClick={shuffle}
                title="New random pattern, same settings"
                className={ghostBtn}
              >
                <Dices className="h-4 w-4" />
                Shuffle
              </button>
            </div>

            <div>
              <span className={kicker}>Size</span>
              <div className="grid grid-cols-3 gap-1.5">
                {GRADIENT_SIZES.map((sz) => {
                  const active = s.width === sz.w && s.height === sz.h;
                  return (
                    <button
                      key={sz.label}
                      type="button"
                      aria-pressed={active}
                      title={`${sz.w} × ${sz.h}`}
                      onClick={() => setS((p) => ({ ...p, width: sz.w, height: sz.h }))}
                      className={cn(chip(active), "flex flex-col items-center gap-0.5 px-1")}
                    >
                      {sz.label}
                      <span className="font-mono text-2xs opacity-70">
                        {sz.w}×{sz.h}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={cn(kicker, "flex items-center justify-between")}>
                Palette
                <button
                  type="button"
                  onClick={() => set("colors", generatePalette(randomSeed()))}
                  className="inline-flex items-center gap-1 normal-case tracking-normal transition-colors hover:text-foreground"
                >
                  <RefreshCw className="h-3 w-3" />
                  Generate
                </button>
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PALETTES.map((p) => {
                  const active = p.colors.join() === s.colors.join();
                  return (
                    <button
                      key={p.name}
                      type="button"
                      title={p.name}
                      aria-label={`${p.name} palette`}
                      aria-pressed={active}
                      onClick={() => set("colors", p.colors)}
                      className={cn(
                        "h-8 rounded-md border transition-colors duration-120",
                        active ? "border-primary ring-1 ring-primary" : "hairline"
                      )}
                      style={{ background: `linear-gradient(135deg, ${p.colors.join(", ")})` }}
                    />
                  );
                })}
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {s.colors.map((c, i) => (
                  <input
                    key={i}
                    type="color"
                    aria-label={`Color stop ${i + 1}`}
                    value={c}
                    onChange={(e) => set("colors", s.colors.map((x, j) => (j === i ? e.target.value : x)))}
                    className={swatch}
                  />
                ))}
              </div>
            </div>

            {CELL_STYLES.includes(s.style) && (
              <Slider
                label="Cell size"
                value={s.dot}
                display={`${s.dot}px`}
                range={RANGES.dot}
                step={1}
                onChange={(v) => set("dot", v)}
              />
            )}
            {ANGLE_STYLES.includes(s.style) && (
              <Slider
                label="Angle"
                value={s.angle}
                display={`${s.angle}°`}
                range={RANGES.angle}
                step={1}
                onChange={(v) => set("angle", v)}
              />
            )}

            <Slider
              label="Scale"
              value={s.scale}
              display={s.scale.toFixed(1)}
              range={RANGES.scale}
              step={0.1}
              onChange={(v) => set("scale", v)}
            />
            <Slider
              label="Warp"
              value={s.warp}
              display={s.warp.toFixed(2)}
              range={RANGES.warp}
              step={0.05}
              onChange={(v) => set("warp", v)}
            />
            <Slider
              label="Light"
              value={s.light}
              display={`${s.light > 0 ? "+" : ""}${Math.round(s.light * 100)}`}
              range={RANGES.light}
              step={0.05}
              onChange={(v) => set("light", v)}
            />
            <Slider
              label="Grain"
              value={s.grain}
              display={`${Math.round(s.grain * 100)}%`}
              range={RANGES.grain}
              step={0.01}
              onChange={(v) => set("grain", v)}
            />

            <span className={cn(kicker, "-mb-3")}>Effects</span>
            {(
              [
                ["bloom", "Bloom"],
                ["aberration", "Aberration"],
                ["vignette", "Vignette"],
              ] as const
            ).map(([key, label]) => (
              <Slider
                key={key}
                label={label}
                value={s[key]}
                display={`${Math.round(s[key] * 100)}%`}
                range={RANGES[key]}
                step={0.05}
                onChange={(v) => set(key, v)}
              />
            ))}

            <div className="mt-auto flex flex-col gap-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setS(defaultGradient)} className={ghostBtn}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button type="button" onClick={copy} disabled={busy} className={ghostBtn}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => download("image/png")} disabled={busy} className={ghostBtn}>
                  <Download className="h-3.5 w-3.5" />
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => download("image/jpeg")}
                  disabled={busy}
                  className="inline-flex h-9 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {busy ? "Rendering…" : "Download JPG"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
