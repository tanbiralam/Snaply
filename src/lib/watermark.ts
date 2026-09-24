import { FONT_CHOICES, HEADINGS, type FontChoice } from "@/lib/ogRender";

export interface WmSettings {
  kind: "text" | "logo";
  text: string;
  font: FontChoice;
  color: string;
  /** Mark width as % of image width. */
  size: number;
  /** 0–100. */
  opacity: number;
  /** Degrees. */
  rotation: number;
  /** 0–8, row-major 3×3 grid (0 = top-left, 8 = bottom-right). */
  position: number;
  /** % of the image's shorter side: edge inset, or extra gap when tiled. */
  margin: number;
  tile: boolean;
}

export const defaultWm: WmSettings = {
  kind: "text",
  text: "© Your Name",
  font: "sans",
  color: "#ffffff",
  size: 25,
  opacity: 60,
  rotation: 0,
  position: 8,
  margin: 4,
  tile: false,
};

export const WM_LIMITS = {
  size: [5, 80],
  opacity: [5, 100],
  rotation: [-90, 90],
  margin: [0, 20],
} as const;

/** Validate a stored/unknown value into settings; every bad field falls back to its default. */
export function parseWm(raw: unknown): WmSettings {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = defaultWm;
  const num = (k: keyof typeof WM_LIMITS) => {
    const v = o[k];
    const [min, max] = WM_LIMITS[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d[k];
  };
  const pos = o.position;
  return {
    kind: o.kind === "logo" ? "logo" : "text",
    text: typeof o.text === "string" ? o.text.slice(0, 200) : d.text,
    font: FONT_CHOICES.some((f) => f.id === o.font) ? (o.font as FontChoice) : d.font,
    color: typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : d.color,
    size: num("size"),
    opacity: num("opacity"),
    rotation: num("rotation"),
    position: Number.isInteger(pos) && (pos as number) >= 0 && (pos as number) <= 8 ? (pos as number) : d.position,
    margin: num("margin"),
    tile: typeof o.tile === "boolean" ? o.tile : d.tile,
  };
}

/** Axis-aligned bounding box of a w×h mark rotated by rad. */
function rotatedBox(w: number, h: number, rad: number) {
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return { bw: w * c + h * s, bh: w * s + h * c };
}

/** Center point for a single mark, keeping its rotated bounds `margin`% inside the image. */
export function placeMark(W: number, H: number, mw: number, mh: number, rad: number, position: number, margin: number): [number, number] {
  const { bw, bh } = rotatedBox(mw, mh, rad);
  const m = (Math.min(W, H) * margin) / 100;
  const axis = (i: number, len: number, b: number) => (i === 0 ? m + b / 2 : i === 1 ? len / 2 : len - m - b / 2);
  return [axis(position % 3, W, bw), axis(Math.floor(position / 3), H, bh)];
}

/** Staggered grid of mark centers covering the whole image (partial marks at the edges). */
export function tileCenters(W: number, H: number, mw: number, mh: number, rad: number, margin: number): [number, number][] {
  const { bw, bh } = rotatedBox(mw, mh, rad);
  const m = (Math.min(W, H) * margin) / 100;
  const sx = Math.max(1, bw * 1.5 + m);
  const sy = Math.max(1, bh * 2 + m);
  const out: [number, number][] = [];
  for (let row = 0, y = sy / 2; y - bh / 2 < H; row++, y += sy) {
    for (let x = (row % 2 ? sx : sx / 2) - sx; x - bw / 2 < W; x += sx) {
      if (x + bw / 2 > 0) out.push([x, y]);
    }
  }
  return out;
}

type Logo = CanvasImageSource & { width: number; height: number };

/** Draw the watermark onto a W×H context that already holds the base image. */
export function drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number, s: WmSettings, logo: Logo | null) {
  const mw = (W * s.size) / 100;
  let mh: number;
  let mark: () => void;

  if (s.kind === "logo") {
    if (!logo || !logo.width || !logo.height) return;
    mh = mw * (logo.height / logo.width);
    mark = () => ctx.drawImage(logo, -mw / 2, -mh / 2, mw, mh);
  } else {
    const text = s.text.trim();
    if (!text) return;
    const f = HEADINGS[s.font];
    // Measure at 100px, then scale so the text spans exactly mw.
    ctx.font = `${f.weight} 100px ${f.family}`;
    const fs = (100 * mw) / Math.max(1, ctx.measureText(text).width);
    ctx.font = `${f.weight} ${fs}px ${f.family}`;
    mh = fs;
    mark = () => {
      ctx.fillStyle = s.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 0);
    };
  }

  const rad = (s.rotation * Math.PI) / 180;
  const centers = s.tile ? tileCenters(W, H, mw, mh, rad, s.margin) : [placeMark(W, H, mw, mh, rad, s.position, s.margin)];
  ctx.save();
  ctx.globalAlpha = s.opacity / 100;
  for (const [x, y] of centers) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rad);
    mark();
    ctx.restore();
  }
  ctx.restore();
}
