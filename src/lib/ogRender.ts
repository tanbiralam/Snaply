// Open Graph card renderer. Draws a 1200×630 social card onto a 2D context.
// Reuses the shared canvas helpers (gradient math, rounded rects) per the
// architecture invariant — no pixel math is reinvented here.

import { angleToGradientPoints, drawImageCover, roundRect } from "@/lib/canvasHelpers";

export const OG_W = 1200;
export const OG_H = 630;

// System stack — reliable on canvas (next/font's generated family name isn't
// referenceable here, and a missing family would silently fall back anyway).
const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export type OgTemplate = "spotlight" | "centered" | "showcase";
export type OgBg = "gradient" | "solid" | "image";

export interface OgSettings {
  template: OgTemplate;
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
  overlay: number; // dark overlay over a background image, 0–1
  accent: string;
  textColor: string;
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
  overlay: 0.35,
  accent: "#818cf8",
  textColor: "#ffffff",
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
  min: number
): Fitted {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `700 ${size}px ${FONT}`;
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines) return { size, lines, lineHeight: Math.round(size * 1.12) };
  }
  ctx.font = `700 ${min}px ${FONT}`;
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

function screenshotPanel(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
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
  coverRect(ctx, img, x, y, w, h);
  ctx.restore();
}

// ─── background ───────────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  ctx.clearRect(0, 0, OG_W, OG_H);
  if (s.bgType === "image" && imgs.bg) {
    drawImageCover(ctx, imgs.bg, OG_W, OG_H);
    if (s.overlay > 0) {
      ctx.fillStyle = `rgba(0,0,0,${s.overlay})`;
      ctx.fillRect(0, 0, OG_W, OG_H);
    }
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
}

// ─── templates ──────────────────────────────────────────────────────────────

function drawSpotlight(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  const P = 72;
  const text = s.textColor;
  const muted = withAlpha(text, 0.74);
  const hasShot = !!imgs.shot;
  const colW = hasShot ? 600 : OG_W - 2 * P;

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
  const title = fitTitle(ctx, s.title, colW, 4, 78, 40);
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
    ctx.font = `700 22px ${FONT}`;
    ctx.textBaseline = "top";
    setSpacing(ctx, 2);
    ctx.fillText(s.eyebrow.toUpperCase(), P, y);
    setSpacing(ctx, 0);
    y += eyebrowH + 18;
  }

  // Title.
  ctx.fillStyle = text;
  ctx.font = `700 ${title.size}px ${FONT}`;
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
    ctx.font = `500 26px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle, P, OG_H - 48);
  }

  // Screenshot (right).
  if (hasShot && imgs.shot) {
    screenshotPanel(ctx, imgs.shot, 700, 115, OG_W - 700 - 56, OG_H - 230);
  }
}

function drawCentered(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  const cx = OG_W / 2;
  const maxW = OG_W - 220;
  const text = s.textColor;
  const muted = withAlpha(text, 0.74);

  const title = fitTitle(ctx, s.title, maxW, 3, 82, 44);
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
    ctx.font = `700 22px ${FONT}`;
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
  ctx.font = `700 ${title.size}px ${FONT}`;
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
    ctx.font = `500 26px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle || s.brand, cx, OG_H - 54);
  }

  ctx.textAlign = "left";
}

function drawShowcase(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  const P = 72;
  const text = s.textColor;
  const muted = withAlpha(text, 0.74);
  const colW = 520 - P;

  // Right: screenshot dominates (or a soft panel if none yet).
  const panelX = 560;
  if (imgs.shot) {
    screenshotPanel(ctx, imgs.shot, panelX, 80, OG_W - panelX - 60, OG_H - 160);
  } else {
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, panelX, 80, OG_W - panelX - 60, OG_H - 160, 18);
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

  const title = fitTitle(ctx, s.title, colW, 5, 60, 34);
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
  ctx.font = `700 ${title.size}px ${FONT}`;
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
    ctx.font = `500 24px ${FONT}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s.handle, P, OG_H - 48);
  }
}

/** Set canvas letter-spacing where supported (recent browsers); no-op otherwise. */
function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* unsupported — ignore */
  }
}

export function drawOg(ctx: CanvasRenderingContext2D, s: OgSettings, imgs: OgImages) {
  drawBackground(ctx, s, imgs);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (s.template === "centered") drawCentered(ctx, s, imgs);
  else if (s.template === "showcase") drawShowcase(ctx, s, imgs);
  else drawSpotlight(ctx, s, imgs);
  // Reset shared state so the next frame starts clean.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  setSpacing(ctx, 0);
}
