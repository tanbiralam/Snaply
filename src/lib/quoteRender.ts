// Quote card renderer. Reuses the OG renderer's backgrounds, fonts, text wrapping
// and avatar clipping — only the two layouts are new.

import { roundRect } from "@/lib/canvasHelpers";
import {
  BODY,
  HEADINGS,
  OG_GRADIENTS,
  circleImage,
  drawBackground,
  ellipsize,
  withAlpha,
  wrap,
  type BgSettings,
  type FontChoice,
} from "@/lib/ogRender";

export type QuoteTemplate = "post" | "quote";
export type QuoteSize = "square" | "landscape" | "portrait";

export const QUOTE_SIZES: Record<QuoteSize, { w: number; h: number; label: string }> = {
  square: { w: 1080, h: 1080, label: "Square" },
  landscape: { w: 1200, h: 675, label: "Landscape" },
  portrait: { w: 1080, h: 1350, label: "Portrait" },
};

export interface QuoteSettings extends BgSettings {
  template: QuoteTemplate;
  size: QuoteSize;
  quote: string;
  name: string;
  handle: string;
  /** Heading font for the big-quote template (the post card always uses Inter). */
  font: FontChoice;
  /** Post: card color. Quote: text color. */
  tone: "light" | "dark";
}

export const defaultQuote: QuoteSettings = {
  template: "post",
  size: "square",
  quote: "Ship the small thing today.\nPolish it tomorrow.",
  name: "Your Name",
  handle: "yourhandle",
  font: "editorial",
  tone: "light",
  bgType: "gradient",
  gradientStart: OG_GRADIENTS[1].start,
  gradientEnd: OG_GRADIENTS[1].end,
  gradientAngle: OG_GRADIENTS[1].angle,
  solidColor: "#0f172a",
  meshIndex: 0,
  grain: 0,
  overlay: 0,
};

interface Fit {
  size: number;
  lines: string[];
  lineH: number;
}

/** Largest font size (max→min) whose wrapped lines fit maxW×maxH; truncates with … at min. */
export function fitBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  max: number,
  min: number,
  family: string,
  weight: number,
  lh: number
): Fit {
  for (let size = max; size > min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrap(ctx, text, maxW);
    if (lines.length * size * lh <= maxH) return { size, lines, lineH: size * lh };
  }
  ctx.font = `${weight} ${min}px ${family}`;
  const lineH = min * lh;
  const all = wrap(ctx, text, maxW);
  const lines = all.slice(0, Math.max(1, Math.floor(maxH / lineH)));
  if (lines.length < all.length) lines[lines.length - 1] = ellipsize(ctx, lines[lines.length - 1], maxW);
  return { size: min, lines, lineH };
}

/** Trim a single line with … until it fits maxW (uses the current ctx.font). */
function clip(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

const at = (h: string) => (h.trim() && !h.trim().startsWith("@") ? `@${h.trim()}` : h.trim());

function avatar(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, d: number, name: string, fg: string) {
  if (img) return circleImage(ctx, img, x, y, d);
  ctx.beginPath();
  ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(fg, 0.12);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = `600 ${d * 0.42}px ${BODY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((Array.from(name.trim())[0] ?? "?").toUpperCase(), x + d / 2, y + d / 2);
  ctx.textAlign = "left";
}

function drawPost(ctx: CanvasRenderingContext2D, s: QuoteSettings, img: HTMLImageElement | null, W: number, H: number, u: number) {
  const dark = s.tone === "dark";
  const fg = dark ? "#e7e9ea" : "#0f1419"; // exported content colors, not UI chrome
  const pad = 90 * u;
  const cp = 56 * u;
  const av = 96 * u;
  const gap = 36 * u;
  const cw = W - 2 * pad;
  const innerW = cw - 2 * cp;

  const t = fitBox(ctx, s.quote, innerW, H - 2 * pad - 2 * cp - av - gap, 60 * u, 26 * u, BODY, 400, 1.35);
  const ch = cp + av + gap + t.lines.length * t.lineH + cp;
  const x = pad;
  const y = (H - ch) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 60 * u;
  ctx.shadowOffsetY = 24 * u;
  ctx.beginPath();
  roundRect(ctx, x, y, cw, ch, 32 * u);
  ctx.fillStyle = dark ? "#15181c" : "#ffffff";
  ctx.fill();
  ctx.restore();

  avatar(ctx, img, x + cp, y + cp, av, s.name, fg);
  const tx = x + cp + av + 24 * u;
  const tw = innerW - av - 24 * u;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = fg;
  ctx.font = `600 ${38 * u}px ${BODY}`;
  ctx.fillText(clip(ctx, s.name.trim(), tw), tx, y + cp + av * 0.45);
  ctx.fillStyle = withAlpha(fg, 0.6);
  ctx.font = `400 ${30 * u}px ${BODY}`;
  ctx.fillText(clip(ctx, at(s.handle), tw), tx, y + cp + av * 0.88);

  ctx.fillStyle = fg;
  ctx.font = `400 ${t.size}px ${BODY}`;
  ctx.textBaseline = "top";
  const ty = y + cp + av + gap;
  t.lines.forEach((l, i) => ctx.fillText(l, x + cp, ty + i * t.lineH + (t.lineH - t.size) / 2));
}

function drawBigQuote(ctx: CanvasRenderingContext2D, s: QuoteSettings, img: HTMLImageElement | null, W: number, H: number, u: number) {
  const fg = s.tone === "dark" ? "#111418" : "#ffffff";
  const head = HEADINGS[s.font];
  const pad = 96 * u;
  const mark = 220 * u;
  const markH = mark * 0.5;
  const hasAttr = !!(s.name.trim() || s.handle.trim());
  const av = img ? 72 * u : 0;
  const attrH = hasAttr ? Math.max(av, 72 * u) : 0;
  const attrGap = hasAttr ? 48 * u : 0;
  const maxW = W - 2 * pad;

  const t = fitBox(ctx, s.quote, maxW, H - 2 * pad - markH - attrGap - attrH, 84 * u, 30 * u, head.family, head.weight, 1.2);
  let y = (H - (markH + t.lines.length * t.lineH + attrGap + attrH)) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = withAlpha(fg, 0.35);
  ctx.font = `${head.weight} ${mark}px ${head.family}`;
  ctx.fillText("“", pad - 6 * u, y - mark * 0.12);
  y += markH;

  ctx.fillStyle = fg;
  ctx.font = `${head.weight} ${t.size}px ${head.family}`;
  t.lines.forEach((l, i) => ctx.fillText(l, pad, y + i * t.lineH));
  y += t.lines.length * t.lineH + attrGap;

  if (!hasAttr) return;
  if (img) circleImage(ctx, img, pad, y, av);
  const tx = pad + (img ? av + 20 * u : 0);
  const tw = maxW - (tx - pad);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = fg;
  ctx.font = `600 ${34 * u}px ${BODY}`;
  ctx.fillText(clip(ctx, s.name.trim() ? `— ${s.name.trim()}` : "", tw), tx, y + 32 * u);
  ctx.fillStyle = withAlpha(fg, 0.7);
  ctx.font = `400 ${28 * u}px ${BODY}`;
  ctx.fillText(clip(ctx, at(s.handle), tw), tx, y + 68 * u);
}

/** Draw the full card onto a context sized to QUOTE_SIZES[s.size]. */
export function drawQuote(ctx: CanvasRenderingContext2D, s: QuoteSettings, img: HTMLImageElement | null) {
  const { w: W, h: H } = QUOTE_SIZES[s.size];
  drawBackground(ctx, s, { bg: null }, W, H);
  const u = Math.min(W, H) / 1080;
  if (s.template === "post") drawPost(ctx, s, img, W, H, u);
  else drawBigQuote(ctx, s, img, W, H, u);
}
