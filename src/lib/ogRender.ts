// Open Graph card renderer. Draws a 1200×630 social card onto a 2D context.
// Reuses the shared canvas helpers (gradient math, rounded rects) per the
// architecture invariant — no pixel math is reinvented here.

import { angleToGradientPoints, drawGrain, drawImageCover, roundRect } from "@/lib/canvasHelpers";

export const OG_W = 1200;
export const OG_H = 630;

// Self-hosted fonts (declared in index.css, preloaded by the editor before draw).
// Falls back to the system stack if a face hasn't loaded yet.
const SYSTEM = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const BODY = `"Inter OG", ${SYSTEM}`;
const FONT = BODY; // body text (subtitle, brand, eyebrow, handle)

export type FontChoice = "display" | "grotesk" | "editorial" | "sans";

const HEADINGS: Record<FontChoice, { family: string; weight: number }> = {
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

export type OgTemplate = "spotlight" | "centered" | "showcase";
export type OgBg = "gradient" | "mesh" | "solid" | "image";

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
];

export interface OgSettings {
  template: OgTemplate;
  font: FontChoice;
  eyebrow: string;
  title: string;
  subtitle: string;
  brand: string;
  handle: string;
  bgType: OgBg;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  solidColor: string;
  meshIndex: number;
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
];

export const defaultOg: OgSettings = {
  template: "spotlight",
  font: "display",
  eyebrow: "OPEN GRAPH",
  title: "Build something people love",
  subtitle:
    "A privacy-first toolkit for crafting beautiful share images — right in your browser.",
  brand: "Snaply",
  handle: "snaply.app",
  bgType: "gradient",
  gradientStart: OG_GRADIENTS[0].start,
  gradientEnd: OG_GRADIENTS[0].end,
  gradientAngle: OG_GRADIENTS[0].angle,
  solidColor: "#0f172a",
  meshIndex: 0,
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

function withAlpha(hex: string, a: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
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
  return {
    size: min,
    lines: wrap(ctx, text, maxW).slice(0, maxLines),
    lineHeight: Math.round(min * 1.12),
  };
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

function circleImage(
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
  s: OgSettings
): Rect {
  const w = base.w * s.shotScale;
  const h = base.h * s.shotScale;
  const x = base.x + (base.w - w) / 2 + s.shotX;
  const y = base.y + (base.h - h) / 2 + s.shotY;
  const r = 18;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 22;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  if (s.shotFit === "cover") {
    coverRect(ctx, img, x, y, w, h);
  } else {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  ctx.restore();
  return { x, y, w, h };
}

// ─── background ───────────────────────────────────────────────────────────────

function drawMesh(ctx: CanvasRenderingContext2D, index: number) {
  const mesh = OG_MESH[index] ?? OG_MESH[0];
  ctx.fillStyle = mesh.base;
  ctx.fillRect(0, 0, OG_W, OG_H);
  const maxR = Math.max(OG_W, OG_H);
  for (const b of mesh.blobs) {
    const cx = b.x * OG_W;
    const cy = b.y * OG_H;
    const r = b.r * maxR;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, withAlpha(b.color, 0.85));
    g.addColorStop(1, withAlpha(b.color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, OG_W, OG_H);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  ctx.clearRect(0, 0, OG_W, OG_H);
  if (s.bgType === "image" && imgs.bg) {
    drawImageCover(ctx, imgs.bg, OG_W, OG_H);
    if (s.overlay > 0) {
      ctx.fillStyle = `rgba(0,0,0,${s.overlay})`;
      ctx.fillRect(0, 0, OG_W, OG_H);
    }
  } else if (s.bgType === "mesh") {
    drawMesh(ctx, s.meshIndex);
  } else if (s.bgType === "solid") {
    ctx.fillStyle = s.solidColor;
    ctx.fillRect(0, 0, OG_W, OG_H);
  } else {
    const [x0, y0, x1, y1] = angleToGradientPoints(s.gradientAngle, OG_W, OG_H);
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, s.gradientStart);
    g.addColorStop(1, s.gradientEnd);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, OG_W, OG_H);
  }
  // Film grain over the whole background (content rect collapsed to nothing).
  if (s.grain > 0) drawGrain(ctx, OG_W, OG_H, s.grain, -10, -10, 0, 0, 0);
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

  // Measure the eyebrow + title + subtitle block to vertically center it.
  const title = fitTitle(ctx, s.title, colW, 4, 78, 40, head.family, head.weight);
  ctx.font = `400 30px ${FONT}`;
  const subLines = s.subtitle ? wrap(ctx, s.subtitle, colW) : [];
  const subLH = 42;
  const barH = 6;
  const eyebrowH = s.eyebrow ? 30 : 0;
  const blockH =
    barH + 22 +
    eyebrowH + (s.eyebrow ? 18 : 0) +
    title.lines.length * title.lineHeight +
    (subLines.length ? 22 + subLines.length * subLH : 0);

  const bandTop = brandBottom;
  const bandBottom = OG_H - P - 30;
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

  const title = fitTitle(ctx, s.title, maxW, 3, 82, 44, head.family, head.weight);
  ctx.font = `400 30px ${FONT}`;
  const subLines = s.subtitle ? wrap(ctx, s.subtitle, maxW - 120) : [];
  const subLH = 42;
  const logoH = imgs.logo ? 80 + 28 : 0;
  const eyebrowH = s.eyebrow ? 44 + 24 : 0;
  const blockH =
    logoH +
    eyebrowH +
    title.lines.length * title.lineHeight +
    (subLines.length ? 24 + subLines.length * subLH : 0);

  let y = Math.max(70, (OG_H - blockH) / 2 - 20);
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
  const title = fitTitle(ctx, s.title, colW, 5, 60, 34, head.family, head.weight);
  ctx.font = `400 26px ${FONT}`;
  const subLines = s.subtitle ? wrap(ctx, s.subtitle, colW) : [];
  const subLH = 38;
  const blockH =
    6 + 20 +
    title.lines.length * title.lineHeight +
    (subLines.length ? 20 + subLines.length * subLH : 0);
  y = Math.max(P + 70, (OG_H - blockH) / 2);

  ctx.fillStyle = s.accent;
  ctx.beginPath();
  roundRect(ctx, P, y, 48, 6, 3);
  ctx.fill();
  y += 26;

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
  else shotRect = drawSpotlight(ctx, s, imgs);
  // Reset shared state so the next frame starts clean.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  setSpacing(ctx, 0);
  return { shotRect };
}
