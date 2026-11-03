import qrcode from "qrcode-generator";

export type QrEcc = "L" | "M" | "Q" | "H";

export interface QrSettings {
  text: string;
  ecc: QrEcc;
  /** Export width/height in px. */
  size: number;
  /** Quiet-zone width in modules (spec recommends 4). */
  margin: number;
  fg: string;
  bg: string;
}

export const QR_SIZES = [256, 512, 1024, 2048] as const;
export const QR_MARGIN = [0, 8] as const;

export const defaultQr: QrSettings = {
  text: "https://snaply.live",
  ecc: "M",
  size: 1024,
  margin: 4,
  fg: "#000000",
  bg: "#ffffff",
};

const HEX = /^#[0-9a-f]{6}$/i;

/** Validates persisted settings field by field, falling back to defaults. */
export function parseQr(raw: unknown): QrSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = defaultQr;
  return {
    text: typeof r.text === "string" ? r.text.slice(0, 4000) : d.text,
    ecc: r.ecc === "L" || r.ecc === "M" || r.ecc === "Q" || r.ecc === "H" ? r.ecc : d.ecc,
    size: (QR_SIZES as readonly unknown[]).includes(r.size) ? (r.size as number) : d.size,
    margin:
      typeof r.margin === "number" && Number.isInteger(r.margin)
        ? Math.min(QR_MARGIN[1], Math.max(QR_MARGIN[0], r.margin))
        : d.margin,
    fg: typeof r.fg === "string" && HEX.test(r.fg) ? r.fg : d.fg,
    bg: typeof r.bg === "string" && HEX.test(r.bg) ? r.bg : d.bg,
  };
}

/**
 * Module matrix (true = dark), or null when the text is empty or too long for
 * a version-40 code at this error-correction level.
 */
export function qrMatrix(text: string, ecc: QrEcc): boolean[][] | null {
  if (!text) return null;
  // The library's default byte mode keeps only the low byte of each UTF-16
  // unit, so hand it UTF-8 as a binary string instead.
  const bin = Array.from(new TextEncoder().encode(text), (b) => String.fromCharCode(b)).join("");
  const qr = qrcode(0, ecc);
  qr.addData(bin, "Byte");
  try {
    qr.make();
  } catch {
    return null;
  }
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** Center logo. `scale` is the logo's share of the code's width (excluding quiet zone). */
export interface QrLogo {
  /** Data URL — also embedded as-is in SVG output. */
  src: string;
  width: number;
  height: number;
  scale: number;
}

/** Logo share of code width. Above ~25% even level H stops recovering reliably. */
export const QR_LOGO_SCALE = [0.1, 0.25] as const;

/**
 * Logo box in module units: a background-colored pad (1 module of breathing
 * room around the logo) and the logo itself, aspect-fit inside it.
 */
export function logoBox(n: number, margin: number, logo: QrLogo) {
  const side = n * logo.scale;
  const fit = Math.min(side / logo.width, side / logo.height);
  const w = logo.width * fit;
  const h = logo.height * fit;
  const c = margin + n / 2;
  return {
    pad: { x: c - w / 2 - 1, y: c - h / 2 - 1, w: w + 2, h: h + 2 },
    img: { x: c - w / 2, y: c - h / 2, w, h },
  };
}

/** Draws at canvas size with integer module edges, so there are no anti-aliased seams. */
export function drawQr(
  ctx: CanvasRenderingContext2D,
  m: boolean[][],
  s: QrSettings,
  logo?: { img: CanvasImageSource; meta: QrLogo }
) {
  const { width } = ctx.canvas;
  const cell = width / (m.length + 2 * s.margin);
  const edge = (i: number) => Math.round((i + s.margin) * cell);
  ctx.fillStyle = s.bg;
  ctx.fillRect(0, 0, width, width);
  ctx.fillStyle = s.fg;
  m.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) ctx.fillRect(edge(c), edge(r), edge(c + 1) - edge(c), edge(r + 1) - edge(r));
    })
  );
  if (!logo) return;
  const { pad, img } = logoBox(m.length, s.margin, logo.meta);
  ctx.fillStyle = s.bg;
  ctx.beginPath();
  ctx.roundRect(pad.x * cell, pad.y * cell, pad.w * cell, pad.h * cell, cell);
  ctx.fill();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(logo.img, img.x * cell, img.y * cell, img.w * cell, img.h * cell);
}

export function qrSvg(m: boolean[][], s: QrSettings, logo?: QrLogo): string {
  const n = m.length + 2 * s.margin;
  let d = "";
  m.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) d += `M${c + s.margin} ${r + s.margin}h1v1h-1z`;
    })
  );
  let overlay = "";
  if (logo) {
    const { pad, img } = logoBox(m.length, s.margin, logo);
    overlay =
      `<rect x="${pad.x}" y="${pad.y}" width="${pad.w}" height="${pad.h}" rx="1" fill="${s.bg}" shape-rendering="auto"/>` +
      `<image href="${logo.src}" x="${img.x}" y="${img.y}" width="${img.w}" height="${img.h}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${s.size}" height="${s.size}" shape-rendering="crispEdges">` +
    `<rect width="${n}" height="${n}" fill="${s.bg}"/><path fill="${s.fg}" d="${d}"/>${overlay}</svg>`
  );
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** A scannability warning for the color pair, or null if it's fine. */
export function qrColorWarning(fg: string, bg: string): string | null {
  const lf = luminance(fg);
  const lb = luminance(bg);
  if (lf > lb) return "Light code on a dark background — many scanners can't read inverted codes.";
  if ((lb + 0.05) / (lf + 0.05) < 4) return "Low contrast — some scanners may fail to read this.";
  return null;
}
