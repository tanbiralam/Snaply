/**
 * Procedural backgrounds. A soft scalar field (the *shape*) is drawn by a
 * *style* through one 4-stop palette, then optional *effects* are applied.
 *
 *   shapes  flow, blobs, swirl, mesh, aurora, waves, rays, marble
 *   styles  fluid, halftone, dots, glass, posterize, lines, pixel, stipple, scanlines
 *   effects bloom, aberration, vignette
 *
 * Grain is dithering in the *value* domain (noise added before the palette
 * lookup): a little reads as film grain, a lot dissolves edges into spray-paint
 * stipple. Pure functions (no DOM): the same settings give the same image at
 * any size, so the preview is just a smaller render of the export.
 */

export const GRADIENT_SHAPES = [
  { id: "flow", label: "Flow" },
  { id: "blobs", label: "Blobs" },
  { id: "swirl", label: "Swirl" },
  { id: "mesh", label: "Mesh" },
  { id: "aurora", label: "Aurora" },
  { id: "waves", label: "Waves" },
  { id: "rays", label: "Rays" },
  { id: "marble", label: "Marble" },
] as const;

export const GRADIENT_STYLES = [
  { id: "fluid", label: "Fluid" },
  { id: "halftone", label: "Halftone" },
  { id: "dots", label: "Dots" },
  { id: "glass", label: "Glass" },
  { id: "posterize", label: "Poster" },
  { id: "lines", label: "Lines" },
  { id: "pixel", label: "Pixel" },
  { id: "stipple", label: "Stipple" },
  { id: "scanlines", label: "CRT" },
] as const;

export type GradientShape = (typeof GRADIENT_SHAPES)[number]["id"];
export type GradientStyle = (typeof GRADIENT_STYLES)[number]["id"];

/** Styles that use the cell-size slider, and the subset that also uses angle. */
export const CELL_STYLES: readonly GradientStyle[] = ["halftone", "dots", "glass", "lines", "pixel", "stipple", "scanlines"];
export const ANGLE_STYLES: readonly GradientStyle[] = ["halftone", "dots", "glass"];

export interface GradientSettings {
  shape: GradientShape;
  style: GradientStyle;
  seed: number;
  width: number;
  height: number;
  /** Zoom: more/smaller features (ribbons, blobs, rings, mesh points, curtains, layers, rays, veins). */
  scale: number;
  /** Distortion of the shape by noise. */
  warp: number;
  /** -1 (mostly dark) … 1 (mostly light). */
  light: number;
  /** Value-domain dither, 0–0.6. */
  grain: number;
  /** Palette, dark → light, evenly spaced. */
  colors: string[];
  /** Cell size in px at a 1920px long side (scales with output): dots, flutes, pixels, line spacing. */
  dot: number;
  /** Screen angle in degrees (halftone, dots, glass). */
  angle: number;
  /** Effects, each 0–1. */
  bloom: number;
  aberration: number;
  vignette: number;
}

export const GRADIENT_SIZES = [
  { label: "Phone", w: 1080, h: 1920 },
  { label: "Desktop", w: 1920, h: 1080 },
  { label: "QHD", w: 2560, h: 1440 },
  { label: "4K", w: 3840, h: 2160 },
  { label: "Square", w: 1080, h: 1080 },
  { label: "OG", w: 1200, h: 630 },
] as const;

export const GRADIENT_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Dusk", colors: ["#030208", "#1b1748", "#8a4590", "#f0a6c4"] },
  { name: "Haze", colors: ["#0f1020", "#272a63", "#5d62e0", "#efc3ee"] },
  { name: "Violet", colors: ["#000000", "#2b1d8f", "#7552dc", "#e8c0f4"] },
  { name: "Steel", colors: ["#000000", "#0e1b2b", "#47698c", "#f5f2ea"] },
  { name: "Mono", colors: ["#000000", "#262626", "#8c8c8c", "#ffffff"] },
  { name: "Ember", colors: ["#0a0302", "#4a0f0a", "#c2410c", "#fcd9a8"] },
  { name: "Ocean", colors: ["#020a12", "#0b3a5c", "#1f8a9e", "#b8f0e6"] },
  { name: "Aurora", colors: ["#020611", "#0f3b3a", "#3ddc97", "#e6fff2"] },
  { name: "Sunset", colors: ["#140a26", "#6b2a8c", "#f2616d", "#ffd6a1"] },
  { name: "Sand", colors: ["#1c0f0a", "#6b3a22", "#c97b4a", "#f6d7b0"] },
  { name: "Lime", colors: ["#06110a", "#1d4d2a", "#9bd34a", "#f3ffd6"] },
  { name: "Candy", colors: ["#1b0b2b", "#3b5bdb", "#f783ac", "#fff0f6"] },
];

export const RANGES = {
  scale: [0.3, 4],
  warp: [0, 2],
  light: [-1, 1],
  grain: [0, 0.6],
  dot: [4, 80],
  angle: [0, 90],
  bloom: [0, 1],
  aberration: [0, 1],
  vignette: [0, 1],
} as const;

const palette = (name: string) => GRADIENT_PALETTES.find((p) => p.name === name)!.colors;

type Look = Omit<GradientSettings, "width" | "height">;
const base = { warp: 0.6, light: 0, grain: 0.05, dot: 12, angle: 45, bloom: 0, aberration: 0, vignette: 0 };
const look = (name: string, s: Partial<Look> & Pick<Look, "shape" | "style" | "seed" | "scale" | "colors">) => ({
  name,
  settings: { ...base, ...s } as Look,
});

/** One-click styles. The first six are modeled on reference images. Size is left alone. */
export const GRADIENT_LOOKS: { name: string; settings: Look }[] = [
  look("Silk", { shape: "flow", style: "fluid", seed: 12, scale: 0.45, warp: 0.6, light: -0.3, grain: 0.06, colors: palette("Dusk") }),
  look("Haze", { shape: "blobs", style: "fluid", seed: 5, scale: 0.6, warp: 0.5, light: 0.1, grain: 0.3, colors: palette("Haze") }),
  look("Vortex", { shape: "swirl", style: "fluid", seed: 3, scale: 1.1, warp: 0.9, grain: 0.45, colors: palette("Violet") }),
  look("Liquid", { shape: "flow", style: "fluid", seed: 4, scale: 0.8, warp: 1.1, grain: 0.04, colors: palette("Ember") }),
  look("LED", { shape: "flow", style: "dots", seed: 2, scale: 0.5, warp: 0.5, light: 0.3, grain: 0.03, colors: palette("Steel"), dot: 14, angle: 0 }),
  look("Print", { shape: "blobs", style: "halftone", seed: 8, scale: 0.7, light: -0.2, grain: 0.04, colors: palette("Mono") }),
  look("Mesh", { shape: "mesh", style: "fluid", seed: 6, scale: 1, warp: 0.4, light: 0.2, grain: 0.05, colors: palette("Sunset") }),
  look("Aurora", { shape: "aurora", style: "fluid", seed: 2, scale: 1, warp: 0.8, light: 0.1, grain: 0.08, colors: palette("Aurora"), bloom: 0.5, vignette: 0.3 }),
  look("Dunes", { shape: "waves", style: "fluid", seed: 3, scale: 1, warp: 0.5, grain: 0.15, colors: palette("Sand"), vignette: 0.3 }),
  look("Rays", { shape: "rays", style: "fluid", seed: 1, scale: 1, warp: 0.6, light: -0.1, grain: 0.1, colors: palette("Haze"), bloom: 0.6 }),
  look("Marble", { shape: "marble", style: "fluid", seed: 4, scale: 0.8, warp: 1, light: 0.2, grain: 0.03, colors: palette("Mono") }),
  look("Reeded", { shape: "flow", style: "glass", seed: 3, scale: 0.5, warp: 0.6, grain: 0.04, colors: palette("Candy"), dot: 64, angle: 0 }),
  look("Contour", { shape: "blobs", style: "lines", seed: 9, scale: 0.8, warp: 0.8, light: 0.2, grain: 0, colors: palette("Lime"), dot: 10 }),
  look("Poster", { shape: "flow", style: "posterize", seed: 5, scale: 0.6, warp: 0.9, grain: 0.08, colors: palette("Sunset") }),
  look("Mosaic", { shape: "mesh", style: "pixel", seed: 11, scale: 1.2, warp: 0.5, light: 0.1, grain: 0.04, colors: palette("Ocean"), dot: 24 }),
  look("Arcade", { shape: "swirl", style: "scanlines", seed: 5, scale: 1.2, warp: 0.8, grain: 0.05, colors: palette("Violet"), dot: 10, aberration: 0.6, vignette: 0.5 }),
];

export const defaultGradient: GradientSettings = { ...GRADIENT_LOOKS[0].settings, width: 1080, height: 1920 };

const HEX = /^#[0-9a-f]{6}$/i;

/** Validates persisted settings field by field, falling back to defaults. */
export function parseGradient(raw: unknown): GradientSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = defaultGradient;
  const num = (k: keyof typeof RANGES) => {
    const v = r[k];
    const [lo, hi] = RANGES[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d[k];
  };
  const shape = GRADIENT_SHAPES.find((o) => o.id === r.shape)?.id ?? d.shape;
  const style = GRADIENT_STYLES.find((o) => o.id === r.style)?.id ?? d.style;
  const size = GRADIENT_SIZES.find((s) => s.w === r.width && s.h === r.height);
  return {
    shape,
    style,
    seed: typeof r.seed === "number" && Number.isInteger(r.seed) ? r.seed >>> 0 : d.seed,
    width: size?.w ?? d.width,
    height: size?.h ?? d.height,
    scale: num("scale"),
    warp: num("warp"),
    light: num("light"),
    grain: num("grain"),
    colors:
      Array.isArray(r.colors) && r.colors.length === 4 && r.colors.every((c) => typeof c === "string" && HEX.test(c))
        ? (r.colors as string[])
        : d.colors,
    dot: num("dot"),
    angle: num("angle"),
    bloom: num("bloom"),
    aberration: num("aberration"),
    vignette: num("vignette"),
  };
}

// --- random generation ---------------------------------------------------

/** mulberry32 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** OKLCH → sRGB hex, reducing chroma until the color is in gamut. */
function oklch(L: number, C: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180;
  for (let c = C; ; c *= 0.9) {
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    if (c < 0.001 || lin.every((v) => v >= -0.0001 && v <= 1.0001)) {
      return (
        "#" +
        lin
          .map((v) => {
            const x = Math.min(1, Math.max(0, v));
            const e = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
            return Math.round(e * 255).toString(16).padStart(2, "0");
          })
          .join("")
      );
    }
  }
}

/**
 * A dark → light 4-stop palette from a color-harmony rule (analogous,
 * complementary, triad, split, or mono), built in OKLCH so lightness steps
 * look even across hues.
 */
export function generatePalette(seed: number): string[] {
  const r = rng(seed);
  const h = r() * 360;
  const rules = [
    [0, 20, 40, 60],
    [0, 0, 180, 200],
    [0, 120, 240, 60],
    [0, 150, 210, 30],
    [0, 0, 10, 20],
  ];
  const rule = rules[Math.floor(r() * rules.length)];
  const L = [0.1 + r() * 0.06, 0.3 + r() * 0.08, 0.6 + r() * 0.1, 0.88 + r() * 0.08];
  const C = [0.03 + r() * 0.03, 0.1 + r() * 0.06, 0.14 + r() * 0.07, 0.04 + r() * 0.06];
  return rule.map((dh, i) => oklch(L[i], C[i], h + dh));
}

/** A fully random but always-tasteful set of settings for the given seed. */
export function surpriseGradient(seed: number, width: number, height: number): GradientSettings {
  const r = rng(seed ^ 0x9e3779b9);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const range = (lo: number, hi: number) => Math.round((lo + r() * (hi - lo)) * 100) / 100;
  const shape = pick(GRADIENT_SHAPES).id;
  // Fluid is the most versatile, so it gets extra weight.
  const style = r() < 0.4 ? "fluid" : pick(GRADIENT_STYLES).id;
  const fineDetail = style === "fluid" || style === "posterize";
  return {
    shape,
    style,
    seed,
    width,
    height,
    scale: shape === "swirl" || shape === "mesh" ? range(0.8, 1.6) : range(0.4, 1.2),
    warp: range(0.2, 1.2),
    light: range(-0.4, 0.3),
    grain: fineDetail ? (r() < 0.3 ? range(0.25, 0.45) : range(0.02, 0.12)) : range(0, 0.06),
    colors: r() < 0.7 ? generatePalette(seed) : pick(GRADIENT_PALETTES).colors,
    dot: Math.round(range(8, 26)),
    angle: pick([0, 0, 45, 45, Math.round(range(0, 90))]),
    bloom: r() < 0.3 ? range(0.3, 0.7) : 0,
    aberration: r() < 0.2 ? range(0.3, 0.8) : 0,
    vignette: r() < 0.5 ? range(0.2, 0.6) : 0,
  };
}

// --- noise ---------------------------------------------------------------

function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  for (let o = 0; o < 3; o++) {
    sum += amp * valueNoise(x, y, seed + o);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 3.7;
    amp *= 0.5;
  }
  return sum / 0.875;
}

/** Field long side in samples, upscaled with a B-spline. Shapes with hard edges get more. */
const fieldSize = (shape: GradientShape) => (shape === "marble" || shape === "waves" ? 192 : 96);

type ShapeFn = (x: number, y: number) => number;

/** x, y are in long-side units (0–1 along the long edge); aspectW/H are the frame's extent in those units. */
function shapeFn(s: GradientSettings, aspectW: number, aspectH: number): ShapeFn {
  const r = (k: number) => hash(k, 7, s.seed); // per-seed constants
  const w = s.warp;
  const k = s.scale;

  switch (s.shape) {
    case "flow": {
      // Domain-warped fbm stretched 3:1 along a seeded direction: ribbons.
      const a = r(1) * Math.PI;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const ww = w * 4;
      return (x, y) => {
        const u = (x * ca + y * sa) * k * 3 * 0.35;
        const v = (y * ca - x * sa) * k * 3;
        const qx = fbm(u, v, s.seed);
        const qy = fbm(u + 5.2, v + 1.3, s.seed);
        const rx = fbm(u + ww * qx + 1.7, v + ww * qy + 9.2, s.seed);
        const ry = fbm(u + ww * qx + 8.3, v + ww * qy + 2.8, s.seed);
        return fbm(u + ww * rx, v + ww * ry, s.seed);
      };
    }

    case "blobs": {
      const n = 3 + Math.round(k * 1.5);
      const blobs = Array.from({ length: n }, (_, i) => ({
        x: -0.1 + r(10 + i) * (aspectW + 0.2),
        y: -0.1 + r(40 + i) * (aspectH + 0.2),
        r2: (0.12 + r(70 + i) * 0.3) ** 2 / k,
        w: 0.35 + r(100 + i) * 0.65,
      }));
      return (x, y) => {
        const dx = (fbm(x * 3, y * 3, s.seed) - 0.5) * w * 0.4;
        const dy = (fbm(x * 3 + 9.1, y * 3 + 4.4, s.seed) - 0.5) * w * 0.4;
        let v = 0;
        for (const b of blobs) {
          const ex = x + dx - b.x;
          const ey = y + dy - b.y;
          v += b.w * Math.exp(-(ex * ex + ey * ey) / b.r2);
        }
        return v;
      };
    }

    case "swirl": {
      // One-armed spiral, squashed into an ellipse, bent by noise; arm brightness
      // is modulated so some arms fade, and the core is dark.
      const cx = aspectW * (0.3 + r(1) * 0.4);
      const cy = aspectH * (0.3 + r(2) * 0.4);
      const rings = k * 2.5;
      const dir = r(3) < 0.5 ? 1 : -1;
      const squash = 0.75 + r(4) * 0.5;
      return (x, y) => {
        const dx = x - cx;
        const dy = (y - cy) * squash;
        const d = Math.sqrt(dx * dx + dy * dy);
        const n = fbm(x * 2.5, y * 2.5, s.seed) - 0.5;
        const m = fbm(x * 1.5 + 3.1, y * 1.5 + 7.7, s.seed + 9);
        const v = 0.5 + 0.5 * Math.sin(Math.PI * 2 * d * rings + dir * Math.atan2(dy, dx) + w * n * 8);
        return v * (0.3 + m) * Math.min(1, d / 0.12);
      };
    }

    case "mesh": {
      // Inverse-distance blend of seeded color points, each with its own value:
      // smooth regions of distinct palette colors, like a mesh gradient.
      const n = 4 + Math.round(k * 2);
      const pts = Array.from({ length: n }, (_, i) => ({
        x: r(10 + i) * aspectW,
        y: r(40 + i) * aspectH,
        v: i / (n - 1),
      }));
      return (x, y) => {
        const wx = x + (fbm(x * 2, y * 2, s.seed) - 0.5) * w * 0.3;
        const wy = y + (fbm(x * 2 + 5.5, y * 2 + 2.2, s.seed) - 0.5) * w * 0.3;
        let sum = 0;
        let wsum = 0;
        for (const p of pts) {
          const d2 = (wx - p.x) ** 2 + (wy - p.y) ** 2;
          const wt = 1 / (d2 + 0.01) ** 1.3;
          sum += wt * p.v;
          wsum += wt;
        }
        return sum / wsum;
      };
    }

    case "aurora": {
      // Thin ridges of stretched noise (curtains) inside a soft horizontal band.
      const y0 = aspectH * (0.25 + r(1) * 0.3);
      return (x, y) => {
        const n = fbm(y * 2 + 4.2, x * 0.5 + 3, s.seed);
        const c = fbm(x * k * 4 + w * 3 * n, y * k * 0.5 + 1.7, s.seed + 3);
        const ridge = (1 - Math.abs(2 * c - 1)) ** 3;
        const band = Math.exp(-(((y - y0) / 0.32) ** 2));
        return ridge * band * (0.5 + 0.5 * fbm(x * 1.5, y * 1.5 + 8, s.seed + 5));
      };
    }

    case "waves": {
      // Stacked sawtooth layers bent by two sines and noise, with uneven
      // amplitude, so terraces vary like dunes rather than repeating.
      const layers = 1.5 + k * 2.5;
      const f1 = 0.8 + r(1) * 1.5;
      const f2 = 2 + r(3) * 3;
      const p1 = r(2) * Math.PI * 2;
      return (x, y) => {
        const amp = 0.05 + 0.12 * fbm(x * 0.8, y * 0.8 + 3.3, s.seed + 4);
        const yy =
          y +
          amp * Math.sin(x * Math.PI * 2 * f1 + p1) +
          0.025 * Math.sin(x * Math.PI * 2 * f2 + y * 3) +
          w * 0.35 * (fbm(x * 2, y * 2, s.seed) - 0.5);
        const f = yy * layers;
        const t = f - Math.floor(f);
        // Smooth drop over the last 8% of each layer instead of a hard step,
        // so the edge survives sampling on the grid without stair-stepping.
        const drop = t < 0.92 ? 1 : 1 - ((t - 0.92) / 0.08) ** 2 * (3 - (2 * (t - 0.92)) / 0.08);
        return t ** 1.5 * drop;
      };
    }

    case "rays": {
      // Light from a point just outside a top corner; noise in the angle gives streaks.
      const ox = r(1) < 0.5 ? -0.05 : aspectW + 0.05;
      const oy = -0.05 - r(2) * 0.1;
      return (x, y) => {
        const dx = x - ox;
        const dy = y - oy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const th = Math.atan2(dy, dx);
        const streak = fbm(th * k * 10, d * w * 2, s.seed);
        return streak ** 2 * Math.exp(-d * 1.3);
      };
    }

    case "marble": {
      // Thin dark veins where sin(phase) crosses zero, mostly bright. Gaussian in
      // sin (not |sin|^p) so the vein has no cusp to alias on the grid.
      const a = r(1) * Math.PI;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      // Secondary veins run ~35° off the main ones and both always bend a
      // little (even at warp 0), so the layers never form a plaid grid.
      const cb = Math.cos(a + 0.6);
      const sb = Math.sin(a + 0.6);
      return (x, y) => {
        const p = (x * ca + y * sa) * k * 12 + (0.5 + w) * 6 * fbm(x * k * 2, y * k * 2, s.seed);
        const p2 = (x * cb + y * sb) * k * 20 + (0.5 + w) * 8 * fbm(x * k * 3 + 7, y * k * 3, s.seed + 2);
        const main = 1 - Math.exp(-(Math.sin(p) ** 2) / 0.02);
        const fine = 1 - 0.35 * Math.exp(-(Math.sin(p2) ** 2) / 0.01);
        return main * fine * (0.8 + 0.2 * fbm(x * 3, y * 3, s.seed + 6));
      };
    }
  }
}

/**
 * The shape sampled on a small grid, stretched to 0–1 and tone-mapped by
 * `light`. Depends only on aspect ratio, never on output size.
 */
export function noiseField(s: GradientSettings) {
  const F = fieldSize(s.shape);
  const long = Math.max(s.width, s.height);
  const fw = Math.max(2, Math.round((F * s.width) / long));
  const fh = Math.max(2, Math.round((F * s.height) / long));
  const f = shapeFn(s, (fw - 1) / (F - 1), (fh - 1) / (F - 1));
  const data = new Float32Array(fw * fh);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < fh; j++) {
    for (let i = 0; i < fw; i++) {
      // fround: min/max must match the stored Float32 values, or the stretch leaves 0..1.
      const v = Math.fround(f(i / (F - 1), j / (F - 1)));
      data[j * fw + i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const span = max - min || 1;
  const gamma = 2 ** (-s.light * 1.5) * 1.3;
  for (let n = 0; n < data.length; n++) data[n] = ((data[n] - min) / span) ** gamma;
  return { data, fw, fh };
}

/** Uniform cubic B-spline taps for each output coordinate (smooth, C2, slightly soft). */
function bsplineTaps(out: number, src: number) {
  const idx = new Int32Array(out * 4);
  const wt = new Float32Array(out * 4);
  for (let o = 0; o < out; o++) {
    const f = ((o + 0.5) * src) / out - 0.5;
    const i = Math.floor(f);
    const t = f - i;
    const t2 = t * t;
    const t3 = t2 * t;
    const w = [(1 - t) ** 3 / 6, (3 * t3 - 6 * t2 + 4) / 6, (-3 * t3 + 3 * t2 + 3 * t + 1) / 6, t3 / 6];
    for (let k = 0; k < 4; k++) {
      idx[o * 4 + k] = Math.min(src - 1, Math.max(0, i - 1 + k));
      wt[o * 4 + k] = w[k];
    }
  }
  return { idx, wt };
}

type Field = ReturnType<typeof noiseField>;

/** The field upscaled to w×h (separable: columns first, then rows). */
function upscale({ data, fw, fh }: Field, w: number, h: number): Float32Array {
  const ty = bsplineTaps(h, fh);
  const tx = bsplineTaps(w, fw);
  const mid = new Float32Array(fw * h);
  for (let y = 0; y < h; y++) {
    for (let i = 0; i < fw; i++) {
      let v = 0;
      for (let k = 0; k < 4; k++) v += ty.wt[y * 4 + k] * data[ty.idx[y * 4 + k] * fw + i];
      mid[y * fw + i] = v;
    }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * fw;
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = 0; k < 4; k++) v += tx.wt[x * 4 + k] * mid[row + tx.idx[x * 4 + k]];
      out[y * w + x] = v;
    }
  }
  return out;
}

/** Highlights of the field, box-blurred on the small grid (3 passes ≈ gaussian). */
function glowField({ data, fw, fh }: Field): Field {
  let a = Float32Array.from(data, (v) => v * v * v);
  const R = Math.max(2, Math.round(fw / 24));
  for (let pass = 0; pass < 3; pass++) {
    for (const horizontal of [true, false]) {
      const b = new Float32Array(a.length);
      for (let j = 0; j < fh; j++) {
        for (let i = 0; i < fw; i++) {
          let sum = 0;
          for (let t = -R; t <= R; t++) {
            const ii = horizontal ? Math.min(fw - 1, Math.max(0, i + t)) : i;
            const jj = horizontal ? j : Math.min(fh - 1, Math.max(0, j + t));
            sum += a[jj * fw + ii];
          }
          b[j * fw + i] = sum / (2 * R + 1);
        }
      }
      a = b;
    }
  }
  return { data: a, fw, fh };
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** 256-entry RGB lookup across evenly spaced stops. */
function paletteLut(colors: string[]): Uint8ClampedArray {
  const stops = colors.map(rgb);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let n = 0; n < 256; n++) {
    const p = (n / 255) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(p));
    const t = p - i;
    for (let c = 0; c < 3; c++) lut[n * 3 + c] = stops[i][c] + (stops[i + 1][c] - stops[i][c]) * t;
  }
  return lut;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const idx = (v: number) => Math.round(clamp01(v) * 255) * 3;

/**
 * Renders at w×h (pass a smaller size for previews; output is the same image).
 * Returns RGBA bytes for `new ImageData(px, w, h)`.
 */
export function renderGradient(s: GradientSettings, w: number, h: number): Uint8ClampedArray<ArrayBuffer> {
  const small = noiseField(s);
  const field = upscale(small, w, h);
  const px = new Uint8ClampedArray(w * h * 4);
  const lut = paletteLut(s.colors);
  const long = Math.max(w, h);
  const at = (x: number, y: number) =>
    field[Math.min(h - 1, Math.max(0, Math.round(y))) * w + Math.min(w - 1, Math.max(0, Math.round(x)))];
  // Grain cells scale with output so a 4K export has the same texture as the preview.
  const gs = long / 1000;
  const cell = (s.dot * long) / 1920;
  const a = (s.angle * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const TOP = 255 * 3;
  const nLines = Math.max(3, Math.round(160 / s.dot));
  const lineW = Math.max(1, long / 900);

  for (let y = 0; y < h; y++) {
    const gy = Math.floor(y / gs);
    for (let x = 0; x < w; x++) {
      const n = y * w + x;
      const gx = Math.floor(x / gs);
      const dither = (hash(gx, gy, s.seed) + hash(gy, gx, s.seed ^ 0x5bd1) - 1) * s.grain;
      const v = clamp01(field[n] + dither);
      let r = 0;
      let g = 0;
      let b = 0;

      switch (s.style) {
        case "fluid": {
          const l = idx(v);
          r = lut[l];
          g = lut[l + 1];
          b = lut[l + 2];
          break;
        }

        case "halftone":
        case "dots": {
          // Nearest cell centre in the rotated screen.
          const u = (x * ca + y * sa) / cell;
          const t = (y * ca - x * sa) / cell;
          const ci = Math.round(u);
          const cj = Math.round(t);
          let du = u - ci;
          let dv = t - cj;
          let radius: number;
          let ink: number;
          let bgk = 1;
          if (s.style === "halftone") {
            // Jittered centres, sqrt radius (dot *area* tracks brightness); 0.72 lets bright dots merge.
            const jx = hash(ci, cj, s.seed);
            du -= (jx - 0.5) * 0.12;
            dv -= (hash(cj, ci, s.seed + 1) - 0.5) * 0.12;
            radius = Math.sqrt(v) * cell * 0.72 * (0.85 + jx * 0.3);
            ink = TOP;
          } else {
            // LED: near-constant dots, brightness carried by color, never fully off.
            radius = cell * 0.44 * (0.7 + 0.3 * v);
            ink = idx(0.15 + 0.85 * v);
            bgk = 0.5;
          }
          const cov = clamp01(radius - Math.sqrt(du * du + dv * dv) * cell + 0.5);
          r = lut[0] * bgk + (lut[ink] - lut[0] * bgk) * cov;
          g = lut[1] * bgk + (lut[ink + 1] - lut[1] * bgk) * cov;
          b = lut[2] * bgk + (lut[ink + 2] - lut[2] * bgk) * cov;
          break;
        }

        case "glass": {
          // Reeded glass: each flute shows a mirrored, compressed slice of what's behind it.
          const u = (x * ca + y * sa) / cell;
          const f = u - Math.floor(u);
          const disp = (0.5 - f) * cell * 2.4;
          const gv = clamp01(at(x + ca * disp, y + sa * disp) + dither);
          const l = idx(gv);
          const shade = 0.82 + 0.28 * Math.sin(f * Math.PI);
          const hl = Math.exp(-(((f - 0.18) / 0.05) ** 2)) * 40;
          r = lut[l] * shade + hl;
          g = lut[l + 1] * shade + hl;
          b = lut[l + 2] * shade + hl;
          break;
        }

        case "posterize": {
          const l = idx(Math.min(4, Math.floor(v * 5)) / 4);
          r = lut[l];
          g = lut[l + 1];
          b = lut[l + 2];
          break;
        }

        case "lines": {
          // Contour lines: distance to the nearest iso-level, in px, via the field gradient.
          const fv = field[n];
          const gxd = (field[n + (x < w - 1 ? 1 : 0)] - field[n - (x > 0 ? 1 : 0)]) / 2;
          const gyd = (field[n + (y < h - 1 ? w : 0)] - field[n - (y > 0 ? w : 0)]) / 2;
          const grad = Math.sqrt(gxd * gxd + gyd * gyd) * nLines;
          const f = fv * nLines;
          const dpx = Math.abs(f - Math.round(f)) / Math.max(grad, 1e-6);
          const cov = clamp01(lineW / 2 - dpx + 0.5);
          const l = idx(0.25 + 0.75 * fv);
          r = lut[0] + (lut[l] - lut[0]) * cov;
          g = lut[1] + (lut[l + 1] - lut[1]) * cov;
          b = lut[2] + (lut[l + 2] - lut[2]) * cov;
          break;
        }

        case "pixel": {
          const ci = Math.floor(x / cell);
          const cj = Math.floor(y / cell);
          const pd = (hash(ci, cj, s.seed) + hash(cj, ci, s.seed ^ 0x5bd1) - 1) * s.grain;
          const l = idx(at((ci + 0.5) * cell, (cj + 0.5) * cell) + pd);
          r = lut[l];
          g = lut[l + 1];
          b = lut[l + 2];
          break;
        }

        case "stipple": {
          // Random 1-bit dots, density = brightness.
          const sp = Math.max(1, cell / 5);
          const on = hash(Math.floor(x / sp), Math.floor(y / sp), s.seed + 17) < v ** 1.2;
          const l = on ? TOP : 0;
          r = lut[l];
          g = lut[l + 1];
          b = lut[l + 2];
          break;
        }

        case "scanlines": {
          // CRT: horizontal scanlines plus a red/blue fringe sampled either side.
          const sp = Math.max(2, cell / 2);
          const mask = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos((Math.PI * 2 * y) / sp));
          const off = cell * 0.2;
          r = lut[idx(at(x + off, y) + dither)] * mask;
          g = lut[idx(v) + 1] * mask;
          b = lut[idx(at(x - off, y) + dither) + 2] * mask;
          break;
        }
      }
      px[n * 4] = r;
      px[n * 4 + 1] = g;
      px[n * 4 + 2] = b;
      px[n * 4 + 3] = 255;
    }
  }

  applyEffects(px, w, h, s, small, lut);
  return px;
}

function applyEffects(px: Uint8ClampedArray, w: number, h: number, s: GradientSettings, small: Field, lut: Uint8ClampedArray) {
  if (s.bloom > 0) {
    // Glow from the field's highlights, tinted by the lightest stop, added on top.
    const glow = upscale(glowField(small), w, h);
    const k = s.bloom * 1.2;
    for (let n = 0; n < glow.length; n++) {
      const gl = glow[n] * k;
      px[n * 4] += lut[765] * gl;
      px[n * 4 + 1] += lut[766] * gl;
      px[n * 4 + 2] += lut[767] * gl;
    }
  }

  if (s.aberration > 0) {
    // Radial red/blue split growing toward the edges.
    const src = px.slice();
    const S = (s.aberration * Math.max(w, h)) / 150;
    const cx = w / 2;
    const cy = h / 2;
    for (let y = 0; y < h; y++) {
      const ny = (y - cy) / cy;
      for (let x = 0; x < w; x++) {
        const nx = (x - cx) / cx;
        const dx = Math.round(nx * S);
        const dy = Math.round(ny * S);
        const rx = Math.min(w - 1, Math.max(0, x + dx));
        const ry = Math.min(h - 1, Math.max(0, y + dy));
        const bx = Math.min(w - 1, Math.max(0, x - dx));
        const by = Math.min(h - 1, Math.max(0, y - dy));
        const n = (y * w + x) * 4;
        px[n] = src[(ry * w + rx) * 4];
        px[n + 2] = src[(by * w + bx) * 4 + 2];
      }
    }
  }

  if (s.vignette > 0) {
    const cx = w / 2;
    const cy = h / 2;
    for (let y = 0; y < h; y++) {
      const ny = (y - cy) / cy;
      for (let x = 0; x < w; x++) {
        const nx = (x - cx) / cx;
        const f = 1 - s.vignette * 0.85 * Math.min(1, ((nx * nx + ny * ny) / 2) ** 1.2 * 1.6);
        const n = (y * w + x) * 4;
        px[n] *= f;
        px[n + 1] *= f;
        px[n + 2] *= f;
      }
    }
  }
}
