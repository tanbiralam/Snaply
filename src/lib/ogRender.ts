// Open Graph card renderer. Draws a 1200×630 social card onto a 2D context.
// Reuses the shared canvas helpers (gradient math, rounded rects) per the
// architecture invariant — no pixel math is reinvented here.

import { angleToGradientPoints, drawGrain, drawImageCover, roundRect } from "@/lib/canvasHelpers";
import { presetCategories } from "@/types/presets";

export const OG_W = 1200;
export const OG_H = 630;

// Self-hosted fonts (declared in index.css, preloaded by the editor before draw).
// Falls back to the system stack if a face hasn't loaded yet.
const SYSTEM = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const BODY = `"Inter OG", ${SYSTEM}`;
const FONT = BODY; // body text (subtitle, brand, eyebrow, handle)

export type FontChoice = "display" | "grotesk" | "editorial" | "sans";

export const HEADINGS: Record<FontChoice, { family: string; weight: number }> = {
  display: { family: `"Sora OG", ${BODY}`, weight: 800 },
  grotesk: { family: `"Space Grotesk OG", ${BODY}`, weight: 700 },
  editorial: { family: `"Fraunces OG", Georgia, "Times New Roman", serif`, weight: 600 },
  sans: { family: BODY, weight: 600 },
};

export const FONT_CHOICES: { id: FontChoice; label: string }[] = [
  { id: "display", label: "Sora" },
  { id: "grotesk", label: "Grotesk" },
  { id: "editorial", label: "Fraunces" },
  { id: "sans", label: "Inter" },
];

// document.fonts.load() specifiers — the editor preloads these so switching is instant.
export const FONT_PRELOAD = [
  '400 16px "Inter OG"',
  '600 16px "Inter OG"',
  '800 16px "Sora OG"',
  '700 16px "Space Grotesk OG"',
  '600 16px "Fraunces OG"',
];

export type OgTemplate = "spotlight" | "centered" | "showcase" | "split";
export type OgBg = "gradient" | "mesh" | "solid" | "image" | "generated";

/** Gradient Generator renders, shared with the Screenshot Stylizer's Gradients presets. */
export const OG_GENERATED: { name: string; src: string; thumb: string }[] =
  (presetCategories.find((c) => c.id === "gradients")?.presets ?? [])
    .filter((p) => p.settings.backgroundImage)
    .map((p) => ({ name: p.name, src: p.settings.backgroundImage!, thumb: p.thumb ?? p.settings.backgroundImage! }));

export const OG_MESH: {
  name: string;
  base: string;
  blobs: { x: number; y: number; r: number; color: string }[];
}[] = [
  {
    name: "Aurora",
    base: "#0b1020",
    blobs: [
      { x: 0.15, y: 0.2, r: 0.6, color: "#4f46e5" },
      { x: 0.82, y: 0.12, r: 0.5, color: "#9333ea" },
      { x: 0.7, y: 0.9, r: 0.6, color: "#06b6d4" },
    ],
  },
  {
    name: "Ember",
    base: "#190b12",
    blobs: [
      { x: 0.12, y: 0.85, r: 0.6, color: "#f97316" },
      { x: 0.85, y: 0.18, r: 0.55, color: "#db2777" },
      { x: 0.5, y: 0.5, r: 0.45, color: "#7c3aed" },
    ],
  },
  {
    name: "Mint",
    base: "#04140f",
    blobs: [
      { x: 0.2, y: 0.3, r: 0.6, color: "#10b981" },
      { x: 0.85, y: 0.78, r: 0.55, color: "#22d3ee" },
      { x: 0.62, y: 0.1, r: 0.4, color: "#84cc16" },
    ],
  },
  {
    name: "Dusk",
    base: "#0e0f1a",
    blobs: [
      { x: 0.8, y: 0.25, r: 0.6, color: "#6366f1" },
      { x: 0.18, y: 0.82, r: 0.6, color: "#ec4899" },
      { x: 0.5, y: 0.5, r: 0.4, color: "#3b82f6" },
    ],
  },
  {
    name: "Copper",
    base: "#110a00",
    blobs: [
      { x: 0.1, y: 0.1, r: 0.55, color: "#d97706" },
      { x: 0.9, y: 0.85, r: 0.6, color: "#b45309" },
      { x: 0.55, y: 0.45, r: 0.4, color: "#ef4444" },
    ],
  },
  {
    name: "Arctic",
    base: "#060d14",
    blobs: [
      { x: 0.25, y: 0.75, r: 0.65, color: "#0ea5e9" },
      { x: 0.78, y: 0.15, r: 0.5, color: "#38bdf8" },
      { x: 0.5, y: 0.5, r: 0.35, color: "#a78bfa" },
    ],
  },
  {
    name: "Jungle",
    base: "#020d08",
    blobs: [
      { x: 0.2, y: 0.6, r: 0.65, color: "#16a34a" },
      { x: 0.8, y: 0.3, r: 0.55, color: "#15803d" },
      { x: 0.5, y: 0.9, r: 0.4, color: "#facc15" },
    ],
  },
  {
    name: "Rose",
    base: "#120009",
    blobs: [
      { x: 0.15, y: 0.3, r: 0.6, color: "#f43f5e" },
      { x: 0.82, y: 0.7, r: 0.55, color: "#e11d48" },
      { x: 0.5, y: 0.1, r: 0.4, color: "#fb923c" },
    ],
  },
  {
    name: "Cinematic",
    base: "#000000",
    blobs: [
      { x: 0.5, y: 1.1, r: 0.7, color: "#f59e0b" },
      { x: 0.3, y: 0.9, r: 0.45, color: "#ef4444" },
      { x: 0.72, y: 0.95, r: 0.4, color: "#f97316" },
    ],
  },
  {
    name: "Developer",
    base: "#000000",
    blobs: [
      { x: 0.5, y: 0.4, r: 0.45, color: "#06b6d4" },
      { x: 0.18, y: 0.6, r: 0.3, color: "#8b5cf6" },
      { x: 0.82, y: 0.3, r: 0.28, color: "#3b82f6" },
    ],
  },
  {
    name: "Lavender",
    base: "#1e1040",
    blobs: [
      { x: 0.5, y: 0.35, r: 0.65, color: "#a78bfa" },
      { x: 0.15, y: 0.75, r: 0.5, color: "#7c3aed" },
      { x: 0.85, y: 0.65, r: 0.45, color: "#c4b5fd" },
    ],
  },
];

export interface OgSettings {
  template: OgTemplate;
  font: FontChoice;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Button label under the text; empty hides it. */
  cta: string;
  brand: string;
  handle: string;
  bgType: OgBg;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  solidColor: string;
  meshIndex: number;
  genIndex: number; // OG_GENERATED entry for the "generated" background
  /** Split template: the solid text panel on the left. Text colour is picked for contrast. */
  panelColor: string;
  grain: number; // film-grain overlay over the background, 0–100
  overlay: number; // dark overlay over a background image, 0–1
  accent: string;
  textColor: string;
  // Screenshot placement (spotlight & showcase templates).
  shotFit: "contain" | "cover";
  shotScale: number; // multiplier on the template's base panel size
  shotX: number; // drag offset in OG (1200×630) units
  shotY: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OgImages {
  bg: HTMLImageElement | null;
  /** The loaded OG_GENERATED image, when bgType is "generated". */
  gen?: HTMLImageElement | null;
  logo: HTMLImageElement | null;
  shot: HTMLImageElement | null;
}

export const OG_GRADIENTS: { name: string; start: string; end: string; angle: number }[] = [
  { name: "Midnight", start: "#0f2027", end: "#2c5364", angle: 150 },
  { name: "Indigo", start: "#4f46e5", end: "#a855f7", angle: 135 },
  { name: "Sunset", start: "#ff6a5f", end: "#ffb347", angle: 120 },
  { name: "Ocean", start: "#2193b0", end: "#6dd5ed", angle: 135 },
  { name: "Forest", start: "#0f766e", end: "#34d399", angle: 135 },
  { name: "Berry", start: "#8e2de2", end: "#4a00e0", angle: 135 },
  { name: "Slate", start: "#1e293b", end: "#0f172a", angle: 160 },
  { name: "Dawn", start: "#ffecd2", end: "#fcb69f", angle: 120 },
  { name: "Obsidian", start: "#000000", end: "#1a1a2e", angle: 145 },
  { name: "Crimson", start: "#450a0a", end: "#dc2626", angle: 135 },
  { name: "Sage", start: "#f0fdf4", end: "#bbf7d0", angle: 150 },
  { name: "Paper", start: "#fafaf9", end: "#e7e5e4", angle: 160 },
  { name: "Plum", start: "#2e1065", end: "#7e22ce", angle: 145 },
  { name: "Coral", start: "#fff1f2", end: "#fda4af", angle: 135 },
];

export const defaultOg: OgSettings = {
  template: "spotlight",
  font: "display",
  eyebrow: "OPEN GRAPH",
  title: "Build something people love",
  subtitle:
    "A privacy-first toolkit for crafting beautiful share images — right in your browser.",
  cta: "",
  brand: "Snaply",
  handle: "snaply.live",
  bgType: "gradient",
  gradientStart: OG_GRADIENTS[0].start,
  gradientEnd: OG_GRADIENTS[0].end,
  gradientAngle: OG_GRADIENTS[0].angle,
  solidColor: "#0f172a",
  meshIndex: 0,
  genIndex: 0,
  panelColor: "#f1efea",
  grain: 0,
  overlay: 0.35,
  accent: "#818cf8",
  textColor: "#ffffff",
  shotFit: "contain",
  shotScale: 1,
  shotX: 0,
  shotY: 0,
};

// ─── small helpers ──────────────────────────────────────────────────────────

export function withAlpha(hex: string, a: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Near-black or white, whichever reads better on `hex`. */
export function inkOn(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  // Contrast vs white = 1.05/(L+.05); vs ink(#111, L≈.0056) = (L+.05)/.0556. Pick the larger.
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.0556 ? "#ffffff" : "#111111";
}

export function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const t = `${cur} ${words[i]}`;
      if (ctx.measureText(t).width > maxW) {
        out.push(cur);
        cur = words[i];
      } else cur = t;
    }
    out.push(cur);
  }
  return out;
}

interface Fitted {
  size: number;
  lines: string[];
  lineHeight: number;
}

function fitTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines: number,
  max: number,
  min: number,
  family: string,
  weight: number
): Fitted {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines) return { size, lines, lineHeight: Math.round(size * 1.12) };
  }
  ctx.font = `${weight} ${min}px ${family}`;
  const all = wrap(ctx, text, maxW);
  const lines = all.slice(0, maxLines);
  if (all.length > maxLines) lines[maxLines - 1] = ellipsize(ctx, lines[maxLines - 1], maxW);
  return { size: min, lines, lineHeight: Math.round(min * 1.12) };
}

/** Largest title (≤ maxLines) whose block fits `maxH`; ellipsized at `min` if nothing fits. */
function fitTitleIn(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  maxLines: number,
  max: number,
  min: number,
  family: string,
  weight: number
): Fitted {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrap(ctx, text, maxW);
    const lineHeight = Math.round(size * 1.12);
    if (lines.length <= maxLines && lines.length * lineHeight <= maxH) {
      return { size, lines: balance(ctx, text, maxW, lines), lineHeight };
    }
  }
  const lineHeight = Math.round(min * 1.12);
  return fitTitle(ctx, text, maxW, Math.max(1, Math.min(maxLines, Math.floor(maxH / lineHeight))), min, min, family, weight);
}

/** Narrowest wrap with the same line count, so the last line isn't a lone word (text-wrap: balance). */
function balance(ctx: CanvasRenderingContext2D, text: string, maxW: number, lines: string[]): string[] {
  if (lines.length < 2 || text.includes("\n")) return lines;
  let lo = maxW * 0.5;
  let hi = maxW;
  let best = lines;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const l = wrap(ctx, text, mid);
    if (l.length === lines.length) {
      best = l;
      hi = mid;
    } else lo = mid;
  }
  return best;
}

/** Subtitle lines, capped (last one ellipsized). Sets ctx.font. */
function subtitleLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, px: number, cap = 3): string[] {
  if (!text) return [];
  ctx.font = `400 ${px}px ${FONT}`;
  const all = wrap(ctx, text, maxW);
  const lines = all.slice(0, cap);
  if (all.length > cap) lines[cap - 1] = ellipsize(ctx, lines[cap - 1], maxW);
  return lines;
}

/**
 * Title + subtitle sharing `availH` with `otherH` of fixed parts (eyebrow,
 * button…). The subtitle gives up lines (cap → 1) before the title is
 * ellipsized, since the title carries the card.
 */
function fitCopy(
  ctx: CanvasRenderingContext2D,
  s: Pick<OgSettings, "title" | "subtitle">,
  colW: number,
  availH: number,
  otherH: number,
  t: { maxLines: number; max: number; min: number; family: string; weight: number },
  sub: { px: number; lh: number; gap: number; cap: number; maxW?: number }
): { title: Fitted; subLines: string[]; subH: number } {
  let last: { title: Fitted; subLines: string[]; subH: number } | null = null;
  for (let cap = sub.cap; cap >= 1; cap--) {
    const subLines = subtitleLines(ctx, s.subtitle, sub.maxW ?? colW, sub.px, cap);
    const subH = subLines.length ? sub.gap + subLines.length * sub.lh : 0;
    const title = fitTitleIn(ctx, s.title, colW, availH - otherH - subH, t.maxLines, t.max, t.min, t.family, t.weight);
    last = { title, subLines, subH };
    if (!title.lines[title.lines.length - 1]?.endsWith("…")) break;
  }
  return last!;
}

/** Mark a line as truncated: drop whole words (then characters, for one long word) until "…" fits. */
export function ellipsize(ctx: CanvasRenderingContext2D, line: string, maxW: number): string {
  let t = line.trimEnd();
  while (t.includes(" ") && ctx.measureText(`${t}…`).width > maxW) t = t.replace(/\s*\S+$/, "");
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

/** object-fit: cover inside an arbitrary rect. */
function coverRect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  const sw = iw * scale;
  const sh = ih * scale;
  ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
}

export function circleImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  coverRect(ctx, img, x, y, size, size);
  ctx.restore();
}

/**
 * Draws the screenshot as a framed card inside a base panel, applying the
 * user's scale + drag offset. Returns the on-screen rect (OG coords) so the
 * editor can hit-test it for dragging. `contain` shows the whole shot on a
 * white card; `cover` fills the card (cropping).
 */
function drawShot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  base: Rect,
  s: OgSettings,
  /** White mat around the image, like a printed photo (Split template). */
  frame = 0
): Rect {
  let w = base.w * s.shotScale;
  let h = base.h * s.shotScale;
  if (frame && s.shotFit === "contain") {
    // A matted print takes the photo's shape instead of letterboxing it.
    const k = Math.min((w - 2 * frame) / img.naturalWidth, (h - 2 * frame) / img.naturalHeight);
    w = img.naturalWidth * k + 2 * frame;
    h = img.naturalHeight * k + 2 * frame;
  }
  const x = base.x + (base.w - w) / 2 + s.shotX;
  const y = base.y + (base.h - h) / 2 + s.shotY;
  const r = 18 + frame;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 22;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // Image area, inset by the frame.
  const ix = x + frame;
  const iy = y + frame;
  const iw2 = w - 2 * frame;
  const ih2 = h - 2 * frame;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, ix, iy, iw2, ih2, r - frame);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(ix, iy, iw2, ih2);
  if (s.shotFit === "cover") {
    coverRect(ctx, img, ix, iy, iw2, ih2);
  } else {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(iw2 / iw, ih2 / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, ix + (iw2 - dw) / 2, iy + (ih2 - dh) / 2, dw, dh);
  }
  ctx.restore();
  return { x, y, w, h };
}

// ─── background ───────────────────────────────────────────────────────────────

function drawMesh(ctx: CanvasRenderingContext2D, index: number, W: number, H: number) {
  const mesh = OG_MESH[index] ?? OG_MESH[0];
  ctx.fillStyle = mesh.base;
  ctx.fillRect(0, 0, W, H);
  const maxR = Math.max(W, H);
  for (const b of mesh.blobs) {
    const cx = b.x * W;
    const cy = b.y * H;
    const r = b.r * maxR;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, withAlpha(b.color, 0.85));
    g.addColorStop(1, withAlpha(b.color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

export type BgSettings = Pick<
  OgSettings,
  "bgType" | "gradientStart" | "gradientEnd" | "gradientAngle" | "solidColor" | "meshIndex" | "grain" | "overlay"
>;

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  s: BgSettings,
  imgs: Pick<OgImages, "bg" | "gen">,
  W: number = OG_W,
  H: number = OG_H
) {
  ctx.clearRect(0, 0, W, H);
  const photo = s.bgType === "image" ? imgs.bg : s.bgType === "generated" ? imgs.gen : null;
  if (photo) {
    drawImageCover(ctx, photo, W, H);
    if (s.overlay > 0) {
      ctx.fillStyle = `rgba(0,0,0,${s.overlay})`;
      ctx.fillRect(0, 0, W, H);
    }
  } else if (s.bgType === "mesh") {
    drawMesh(ctx, s.meshIndex, W, H);
  } else if (s.bgType === "solid") {
    ctx.fillStyle = s.solidColor;
    ctx.fillRect(0, 0, W, H);
  } else {
    const [x0, y0, x1, y1] = angleToGradientPoints(s.gradientAngle, W, H);
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, s.gradientStart);
    g.addColorStop(1, s.gradientEnd);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  // Film grain over the whole background (content rect collapsed to nothing).
  if (s.grain > 0) drawGrain(ctx, W, H, s.grain, -10, -10, 0, 0, 0);
}

// ─── shared pieces ──────────────────────────────────────────────────────────

const PILL_H = 44;
const CTA_H = 60;

/** Tinted pill label. `x` is the left edge, or the center when ctx.textAlign is "center". Returns its height. */
function drawEyebrowPill(ctx: CanvasRenderingContext2D, label: string, color: string, x: number, y: number): number {
  const centered = ctx.textAlign === "center";
  ctx.font = `600 20px ${FONT}`;
  setSpacing(ctx, 2);
  const t = label.toUpperCase();
  const pw = ctx.measureText(t).width + 40;
  const left = centered ? x - pw / 2 : x;
  ctx.beginPath();
  roundRect(ctx, left, y, pw, PILL_H, PILL_H / 2);
  ctx.fillStyle = withAlpha(color, 0.16);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(t, centered ? x : left + 20, y + PILL_H / 2 + 1);
  setSpacing(ctx, 0);
  return PILL_H;
}

/** Accent button with an arrow. Same alignment rule as drawEyebrowPill. Returns its height. */
function drawCta(ctx: CanvasRenderingContext2D, label: string, accent: string, x: number, y: number): number {
  const centered = ctx.textAlign === "center";
  ctx.font = `600 26px ${FONT}`;
  const t = `${label}  →`;
  const bw = ctx.measureText(t).width + 60;
  const left = centered ? x - bw / 2 : x;
  ctx.save();
  ctx.shadowColor = withAlpha(accent, 0.45);
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  roundRect(ctx, left, y, bw, CTA_H, CTA_H / 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = inkOn(accent);
  ctx.textBaseline = "middle";
  ctx.fillText(t, centered ? x : left + 30, y + CTA_H / 2 + 1);
  return CTA_H;
}

// ─── templates ──────────────────────────────────────────────────────────────

function drawSpotlight(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages): Rect | null {
  const P = 72;
  const text = s.textColor;
  const muted = withAlpha(text, 0.74);
  const hasShot = !!imgs.shot;
  const colW = hasShot ? 600 : OG_W - 2 * P;
  const head = HEADINGS[s.font];

  // Brand row (top).
  let brandBottom = P;
  if (imgs.logo || s.brand) {
    let x = P;
    if (imgs.logo) {
      circleImage(ctx, imgs.logo, x, P, 52);
      x += 68;
    }
    if (s.brand) {
      ctx.fillStyle = text;
      ctx.font = `600 28px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillText(s.brand, x, P + 27);
    }
    brandBottom = P + 70;
  }

  // Measure the eyebrow + title + subtitle + button block; the title gets
  // whatever height is left, then the block is vertically centered.
  const subLH = 42;
  const barH = 6;
  const eyebrowH = s.eyebrow ? 30 : 0;
  const bandTop = brandBottom;
  const bandBottom = OG_H - P - 30;
  const otherH = barH + 22 + eyebrowH + (s.eyebrow ? 18 : 0) + (s.cta ? 36 + CTA_H : 0);
  const { title, subLines, subH } = fitCopy(ctx, s, colW, bandBottom - bandTop, otherH,
    { maxLines: 4, max: 78, min: 40, family: head.family, weight: head.weight },
    { px: 30, lh: subLH, gap: 22, cap: 3 });
  const blockH = otherH + subH + title.lines.length * title.lineHeight;
  let y = bandTop + Math.max(0, (bandBottom - bandTop - blockH) / 2);

  // Accent bar.
  ctx.fillStyle = s.accent;
  ctx.beginPath();
  roundRect(ctx, P, y, 56, barH, barH / 2);
  ctx.fill();
  y += barH + 22;

  // Eyebrow.
  if (s.eyebrow) {
    ctx.fillStyle = s.accent;
    ctx.font = `600 22px ${FONT}`;
    ctx.textBaseline = "top";
    setSpacing(ctx, 2);
    ctx.fillText(s.eyebrow.toUpperCase(), P, y);
    setSpacing(ctx, 0);
    y += eyebrowH + 18;
  }

  // Title.
  ctx.fillStyle = text;
  ctx.font = `${head.weight} ${title.size}px ${head.family}`;
  ctx.textBaseline = "top";
  for (const ln of title.lines) {
    ctx.fillText(ln, P, y);
    y += title.lineHeight;
  }

  // Subtitle.
  if (subLines.length) {
    y += 22;
    ctx.fillStyle = muted;
    ctx.font = `400 30px ${FONT}`;
    for (const ln of subLines) {
      ctx.fillText(ln, P, y);
      y += subLH;
    }
  }

  if (s.cta) drawCta(ctx, s.cta, s.accent, P, y + 36);

  // Handle (bottom).
  if (s.handle) {
    ctx.fillStyle = muted;
    ctx.font = `600 26px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle, P, OG_H - 48);
  }

  // Screenshot (right).
  if (hasShot && imgs.shot) {
    return drawShot(ctx, imgs.shot, { x: 700, y: 115, w: OG_W - 700 - 56, h: OG_H - 230 }, s);
  }
  return null;
}

function drawCentered(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  const cx = OG_W / 2;
  const maxW = OG_W - 220;
  const text = s.textColor;
  const muted = withAlpha(text, 0.74);
  const head = HEADINGS[s.font];

  const subLH = 42;
  const logoH = imgs.logo ? 80 + 28 : 0;
  const eyebrowH = s.eyebrow ? 44 + 24 : 0;
  const otherH = logoH + eyebrowH + (s.cta ? 36 + CTA_H : 0);
  // Keep clear of the handle line at the bottom (baseline OG_H - 54).
  const availH = OG_H - 50 - 100;
  const { title, subLines, subH } = fitCopy(ctx, s, maxW, availH, otherH,
    { maxLines: 3, max: 82, min: 44, family: head.family, weight: head.weight },
    { px: 30, lh: subLH, gap: 24, cap: 2, maxW: maxW - 120 });
  const blockH = otherH + subH + title.lines.length * title.lineHeight;

  let y = Math.max(50, (OG_H - 50 - blockH) / 2);
  ctx.textAlign = "center";

  if (imgs.logo) {
    circleImage(ctx, imgs.logo, cx - 40, y, 80);
    y += 80 + 28;
  }

  if (s.eyebrow) {
    ctx.font = `600 22px ${FONT}`;
    setSpacing(ctx, 2);
    const tw = ctx.measureText(s.eyebrow.toUpperCase()).width;
    const pw = tw + 44;
    const ph = 44;
    ctx.beginPath();
    roundRect(ctx, cx - pw / 2, y, pw, ph, ph / 2);
    ctx.fillStyle = withAlpha(s.accent, 0.18);
    ctx.fill();
    ctx.fillStyle = s.accent;
    ctx.textBaseline = "middle";
    ctx.fillText(s.eyebrow.toUpperCase(), cx, y + ph / 2 + 1);
    setSpacing(ctx, 0);
    y += ph + 24;
  }

  ctx.fillStyle = text;
  ctx.font = `${head.weight} ${title.size}px ${head.family}`;
  ctx.textBaseline = "top";
  for (const ln of title.lines) {
    ctx.fillText(ln, cx, y);
    y += title.lineHeight;
  }

  if (subLines.length) {
    y += 24;
    ctx.fillStyle = muted;
    ctx.font = `400 30px ${FONT}`;
    for (const ln of subLines) {
      ctx.fillText(ln, cx, y);
      y += subLH;
    }
  }

  if (s.cta) drawCta(ctx, s.cta, s.accent, cx, y + 36);

  if (s.handle || s.brand) {
    ctx.fillStyle = muted;
    ctx.font = `600 26px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle || s.brand, cx, OG_H - 54);
  }

  ctx.textAlign = "left";
}

function drawShowcase(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages): Rect | null {
  const P = 72;
  const text = s.textColor;
  const muted = withAlpha(text, 0.74);
  const colW = 520 - P;

  // Right: screenshot dominates (or a soft panel if none yet).
  const panelX = 560;
  const base: Rect = { x: panelX, y: 80, w: OG_W - panelX - 60, h: OG_H - 160 };
  let shotRect: Rect | null = null;
  if (imgs.shot) {
    shotRect = drawShot(ctx, imgs.shot, base, s);
  } else {
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, base.x, base.y, base.w, base.h, 18);
    ctx.fillStyle = withAlpha(text, 0.08);
    ctx.fill();
    ctx.restore();
  }

  // Left column.
  let y = P;
  if (imgs.logo || s.brand) {
    let x = P;
    if (imgs.logo) {
      circleImage(ctx, imgs.logo, x, P, 48);
      x += 62;
    }
    if (s.brand) {
      ctx.fillStyle = text;
      ctx.font = `600 26px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillText(s.brand, x, P + 25);
    }
  }

  const head = HEADINGS[s.font];
  const subLH = 38;
  const top = P + 70;
  const bottom = OG_H - P - 30;
  const otherH = (s.eyebrow ? PILL_H + 20 : 6 + 20) + (s.cta ? 30 + CTA_H : 0);
  const { title, subLines, subH } = fitCopy(ctx, s, colW, bottom - top, otherH,
    { maxLines: 5, max: 60, min: 34, family: head.family, weight: head.weight },
    { px: 26, lh: subLH, gap: 20, cap: 3 });
  const blockH = otherH + subH + title.lines.length * title.lineHeight;
  y = top + Math.max(0, (bottom - top - blockH) / 2);

  // Eyebrow pill replaces the accent bar when set.
  if (s.eyebrow) {
    y += drawEyebrowPill(ctx, s.eyebrow, s.accent, P, y) + 20;
  } else {
    ctx.fillStyle = s.accent;
    ctx.beginPath();
    roundRect(ctx, P, y, 48, 6, 3);
    ctx.fill();
    y += 26;
  }

  ctx.fillStyle = text;
  ctx.font = `${head.weight} ${title.size}px ${head.family}`;
  ctx.textBaseline = "top";
  for (const ln of title.lines) {
    ctx.fillText(ln, P, y);
    y += title.lineHeight;
  }

  if (subLines.length) {
    y += 20;
    ctx.fillStyle = muted;
    ctx.font = `400 26px ${FONT}`;
    for (const ln of subLines) {
      ctx.fillText(ln, P, y);
      y += subLH;
    }
  }

  if (s.cta) drawCta(ctx, s.cta, s.accent, P, y + 30);

  if (s.handle) {
    ctx.fillStyle = muted;
    ctx.font = `600 24px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle, P, OG_H - 48);
  }
  return shotRect;
}

/** Solid text panel left; the background shows on the right with the image as a matted card on it. */
function drawSplit(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages): Rect | null {
  const P = 72;
  const SPLIT = 600;
  const ink = inkOn(s.panelColor);
  const muted = withAlpha(ink, 0.68);
  const colW = SPLIT - 2 * P;
  const head = HEADINGS[s.font];

  ctx.fillStyle = s.panelColor;
  ctx.fillRect(0, 0, SPLIT, OG_H);

  // Right: image card (or a soft placeholder until one is added).
  const base: Rect = { x: SPLIT + 70, y: 90, w: OG_W - SPLIT - 140, h: OG_H - 180 };
  let shotRect: Rect | null = null;
  if (imgs.shot) {
    shotRect = drawShot(ctx, imgs.shot, base, s, 14);
  } else {
    ctx.beginPath();
    roundRect(ctx, base.x, base.y, base.w, base.h, 32);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();
  }

  // Brand row.
  if (imgs.logo || s.brand) {
    let x = P;
    if (imgs.logo) {
      circleImage(ctx, imgs.logo, x, P, 48);
      x += 62;
    }
    if (s.brand) {
      ctx.fillStyle = ink;
      ctx.font = `600 26px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillText(s.brand, x, P + 25);
    }
  }

  const subLH = 38;
  const top = P + 70;
  const bottom = OG_H - P - 30;
  const otherH = (s.eyebrow ? PILL_H + 22 : 0) + (s.cta ? 32 + CTA_H : 0);
  const { title, subLines, subH } = fitCopy(ctx, s, colW, bottom - top, otherH,
    { maxLines: 4, max: 66, min: 36, family: head.family, weight: head.weight },
    { px: 26, lh: subLH, gap: 20, cap: 3 });
  const blockH = otherH + subH + title.lines.length * title.lineHeight;
  let y = top + Math.max(0, (bottom - top - blockH) / 2);

  if (s.eyebrow) y += drawEyebrowPill(ctx, s.eyebrow, s.accent, P, y) + 22;

  ctx.fillStyle = ink;
  ctx.font = `${head.weight} ${title.size}px ${head.family}`;
  ctx.textBaseline = "top";
  for (const ln of title.lines) {
    ctx.fillText(ln, P, y);
    y += title.lineHeight;
  }

  if (subLines.length) {
    y += 20;
    ctx.fillStyle = muted;
    ctx.font = `400 26px ${FONT}`;
    for (const ln of subLines) {
      ctx.fillText(ln, P, y);
      y += subLH;
    }
  }

  if (s.cta) drawCta(ctx, s.cta, s.accent, P, y + 32);

  if (s.handle) {
    ctx.fillStyle = muted;
    ctx.font = `600 24px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle, P, OG_H - 48);
  }
  return shotRect;
}

/** Set canvas letter-spacing where supported (recent browsers); no-op otherwise. */
function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* unsupported — ignore */
  }
}

/** Draws the card and returns the screenshot's rect (OG coords) for hit-testing, or null. */
export function drawOg(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages): { shotRect: Rect | null } {
  drawBackground(ctx, s, imgs);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let shotRect: Rect | null = null;
  if (s.template === "centered") drawCentered(ctx, s, imgs);
  else if (s.template === "showcase") shotRect = drawShowcase(ctx, s, imgs);
  else if (s.template === "split") shotRect = drawSplit(ctx, s, imgs);
  else shotRect = drawSpotlight(ctx, s, imgs);
  // Reset shared state so the next frame starts clean.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  setSpacing(ctx, 0);
  return { shotRect };
}
