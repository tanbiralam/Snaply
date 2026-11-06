/**
 * Procedural backgrounds. A soft scalar field (the *shape*) is drawn by one of
 * three *styles*, all through one 4-stop palette:
 *
 *   shape  flow   — domain-warped noise stretched along a seeded direction (silk ribbons)
 *          blobs  — a few large soft gaussians, lightly warped (haze)
 *          swirl  — twisted rings around a seeded center (vortex)
 *   style  fluid    — palette gradient
 *          halftone — rotated print screen, dot size follows brightness
 *          dots     — LED grid, dot color follows brightness
 *
 * Grain is dithering in the *value* domain (noise added before the palette
 * lookup): a little reads as film grain, a lot dissolves edges into spray-paint
 * stipple. Pure functions (no DOM): the same settings give the same image at
 * any size, so the preview is just a smaller render of the export.
 */

export type GradientShape = "flow" | "blobs" | "swirl";
export type GradientStyle = "fluid" | "halftone" | "dots";

export interface GradientSettings {
  shape: GradientShape;
  style: GradientStyle;
  seed: number;
  width: number;
  height: number;
  /** Zoom: more/smaller ribbons, more/smaller blobs, more rings. */
  scale: number;
  /** Distortion of the shape by noise. */
  warp: number;
  /** -1 (mostly dark) … 1 (mostly light). */
  light: number;
  /** Value-domain dither, 0–0.6. */
  grain: number;
  /** Palette, dark → light, evenly spaced. */
  colors: string[];
  /** Halftone/dots cell size in px at a 1920px long side (scales with output). */
  dot: number;
  /** Halftone/dots screen angle in degrees. */
  angle: number;
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
];

export const RANGES = {
  scale: [0.3, 4],
  warp: [0, 2],
  light: [-1, 1],
  grain: [0, 0.6],
  dot: [4, 40],
  angle: [0, 90],
} as const;

const palette = (name: string) => GRADIENT_PALETTES.find((p) => p.name === name)!.colors;

/** One-click styles, each modeled on a reference look. Size is left alone. */
export const GRADIENT_LOOKS: { name: string; settings: Omit<GradientSettings, "width" | "height"> }[] = [
  {
    name: "Silk",
    settings: { shape: "flow", style: "fluid", seed: 12, scale: 0.45, warp: 0.6, light: -0.3, grain: 0.06, colors: palette("Dusk"), dot: 12, angle: 45 },
  },
  {
    name: "Haze",
    settings: { shape: "blobs", style: "fluid", seed: 5, scale: 0.6, warp: 0.5, light: 0.1, grain: 0.3, colors: palette("Haze"), dot: 12, angle: 45 },
  },
  {
    name: "Vortex",
    settings: { shape: "swirl", style: "fluid", seed: 3, scale: 1.1, warp: 0.9, light: 0, grain: 0.45, colors: palette("Violet"), dot: 12, angle: 45 },
  },
  {
    name: "Liquid",
    settings: { shape: "flow", style: "fluid", seed: 4, scale: 0.8, warp: 1.1, light: 0, grain: 0.04, colors: palette("Ember"), dot: 12, angle: 45 },
  },
  {
    name: "LED",
    settings: { shape: "flow", style: "dots", seed: 2, scale: 0.5, warp: 0.5, light: 0.3, grain: 0.03, colors: palette("Steel"), dot: 14, angle: 0 },
  },
  {
    name: "Print",
    settings: { shape: "blobs", style: "halftone", seed: 8, scale: 0.7, warp: 0.6, light: -0.2, grain: 0.04, colors: palette("Mono"), dot: 12, angle: 45 },
  },
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
  const oneOf = <T extends string>(v: unknown, opts: readonly T[], fb: T) =>
    opts.includes(v as T) ? (v as T) : fb;
  const size = GRADIENT_SIZES.find((s) => s.w === r.width && s.h === r.height);
  return {
    shape: oneOf(r.shape, ["flow", "blobs", "swirl"], d.shape),
    style: oneOf(r.style, ["fluid", "halftone", "dots"], d.style),
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

/** Field long side in samples. Shapes are soft, so this is upscaled with a B-spline. */
const FIELD = 96;

type ShapeFn = (x: number, y: number) => number;

/** x, y are in long-side units (0–1 along the long edge). */
function shapeFn(s: GradientSettings, aspectW: number, aspectH: number): ShapeFn {
  const r = (k: number) => hash(k, 7, s.seed); // per-seed constants
  const w = s.warp;

  if (s.shape === "flow") {
    // Stretch noise 3:1 along a seeded direction so shapes become ribbons.
    const a = r(1) * Math.PI;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const k = s.scale * 3;
    const ww = w * 4;
    return (x, y) => {
      const u = (x * ca + y * sa) * k * 0.35;
      const v = (y * ca - x * sa) * k;
      const qx = fbm(u, v, s.seed);
      const qy = fbm(u + 5.2, v + 1.3, s.seed);
      const rx = fbm(u + ww * qx + 1.7, v + ww * qy + 9.2, s.seed);
      const ry = fbm(u + ww * qx + 8.3, v + ww * qy + 2.8, s.seed);
      return fbm(u + ww * rx, v + ww * ry, s.seed);
    };
  }

  if (s.shape === "blobs") {
    const n = 3 + Math.round(s.scale * 1.5);
    const blobs = Array.from({ length: n }, (_, i) => ({
      x: -0.1 + r(10 + i) * (aspectW + 0.2),
      y: -0.1 + r(40 + i) * (aspectH + 0.2),
      r2: (0.12 + r(70 + i) * 0.3) ** 2 / s.scale,
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

  // swirl: a one-armed spiral (radius + angle in the phase), squashed into an
  // ellipse, bent by noise, and with arm brightness modulated so some arms fade.
  const cx = aspectW * (0.3 + r(1) * 0.4);
  const cy = aspectH * (0.3 + r(2) * 0.4);
  const rings = s.scale * 2.5;
  const dir = r(3) < 0.5 ? 1 : -1;
  const squash = 0.75 + r(4) * 0.5;
  return (x, y) => {
    const dx = x - cx;
    const dy = (y - cy) * squash;
    const d = Math.sqrt(dx * dx + dy * dy);
    const n = fbm(x * 2.5, y * 2.5, s.seed) - 0.5;
    const m = fbm(x * 1.5 + 3.1, y * 1.5 + 7.7, s.seed + 9);
    const v = 0.5 + 0.5 * Math.sin(Math.PI * 2 * d * rings + dir * Math.atan2(dy, dx) + w * n * 8);
    return v * (0.3 + m) * Math.min(1, d / 0.12); // faded arms, dark core
  };
}

/**
 * The shape sampled on a small grid, stretched to 0–1 and tone-mapped by
 * `light`. Depends only on aspect ratio, never on output size.
 */
export function noiseField(s: GradientSettings) {
  const long = Math.max(s.width, s.height);
  const fw = Math.max(2, Math.round((FIELD * s.width) / long));
  const fh = Math.max(2, Math.round((FIELD * s.height) / long));
  const f = shapeFn(s, (fw - 1) / (FIELD - 1), (fh - 1) / (FIELD - 1));
  const data = new Float32Array(fw * fh);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < fh; j++) {
    for (let i = 0; i < fw; i++) {
      // fround: min/max must match the stored Float32 values, or the stretch leaves 0..1.
      const v = Math.fround(f(i / (FIELD - 1), j / (FIELD - 1)));
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

/** The field upscaled to w×h (separable: columns first, then rows). */
function upscale(field: ReturnType<typeof noiseField>, w: number, h: number): Float32Array {
  const { data, fw, fh } = field;
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

/**
 * Renders at w×h (pass a smaller size for previews; output is the same image).
 * Returns RGBA bytes for `new ImageData(px, w, h)`.
 */
export function renderGradient(s: GradientSettings, w: number, h: number): Uint8ClampedArray<ArrayBuffer> {
  const field = upscale(noiseField(s), w, h);
  const px = new Uint8ClampedArray(w * h * 4);
  const lut = paletteLut(s.colors);
  const long = Math.max(w, h);
  // Grain cells scale with output so a 4K export has the same texture as the preview.
  const gs = long / 1000;
  const cell = (s.dot * long) / 1920;
  const a = (s.angle * Math.PI) / 180;
  const cos = Math.cos(a) / cell;
  const sin = Math.sin(a) / cell;
  const L = 255 * 3;

  for (let y = 0; y < h; y++) {
    const gy = Math.floor(y / gs);
    for (let x = 0; x < w; x++) {
      const n = y * w + x;
      const gx = Math.floor(x / gs);
      const dither = (hash(gx, gy, s.seed) + hash(gy, gx, s.seed ^ 0x5bd1) - 1) * s.grain;
      const v = clamp01(field[n] + dither);
      let r: number;
      let g: number;
      let b: number;

      if (s.style === "fluid") {
        const l = Math.round(v * 255) * 3;
        r = lut[l];
        g = lut[l + 1];
        b = lut[l + 2];
      } else {
        // Nearest cell centre in the rotated screen.
        const u = x * cos + y * sin;
        const t = y * cos - x * sin;
        const ci = Math.round(u);
        const cj = Math.round(t);
        let du = u - ci;
        let dv = t - cj;
        let radius: number;
        if (s.style === "halftone") {
          // Jittered centres and sqrt radius: dot *area* tracks brightness; 0.72 lets bright dots merge.
          const jx = hash(ci, cj, s.seed);
          du -= (jx - 0.5) * 0.12;
          dv -= (hash(cj, ci, s.seed + 1) - 0.5) * 0.12;
          radius = Math.sqrt(v) * cell * 0.72 * (0.85 + jx * 0.3);
        } else {
          // LED: near-constant dots, brightness carried by color.
          radius = cell * 0.44 * (0.7 + 0.3 * v);
        }
        const cov = clamp01(radius - Math.sqrt(du * du + dv * dv) * cell + 0.5);
        // LEDs never fully switch off, so dark regions still show a faint grid.
        const ink = s.style === "halftone" ? L : Math.round((0.15 + 0.85 * v) * 255) * 3;
        // Background: darkest stop (halved for LEDs so unlit dots still read).
        const bgk = s.style === "dots" ? 0.5 : 1;
        r = lut[0] * bgk + (lut[ink] - lut[0] * bgk) * cov;
        g = lut[1] * bgk + (lut[ink + 1] - lut[1] * bgk) * cov;
        b = lut[2] * bgk + (lut[ink + 2] - lut[2] * bgk) * cov;
      }
      px[n * 4] = r;
      px[n * 4 + 1] = g;
      px[n * 4 + 2] = b;
      px[n * 4 + 3] = 255;
    }
  }
  return px;
}
