export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Target draw size from natural dims + resize options.
 * keepAspect fits the image *within* the given box (contain); off = exact.
 * Empty width/height means "use the natural value for that axis".
 */
export function targetSize(
  w: number,
  h: number,
  rw: number | null,
  rh: number | null,
  keep: boolean
): { w: number; h: number } {
  if (!rw && !rh) return { w, h };
  if (!keep) return { w: rw || w, h: rh || h };
  const r = (n: number) => Math.max(1, Math.round(n));
  if (rw && rh) {
    const s = Math.min(rw / w, rh / h);
    return { w: r(w * s), h: r(h * s) };
  }
  if (rw) return { w: rw, h: r(h * (rw / w)) };
  return { w: r(w * (rh! / h)), h: rh! };
}

/** Parse a resize input → positive integer, or null when empty/invalid. */
export function parseDim(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function normalizeRect(a: Point, b: Point): Box {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

/** Map a pointer position over an element showing a W×H image to clamped image pixels. */
export function clientToImage(
  e: { clientX: number; clientY: number },
  el: Element,
  W: number,
  H: number
): Point {
  const r = el.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(W, ((e.clientX - r.left) / r.width) * W)),
    y: Math.max(0, Math.min(H, ((e.clientY - r.top) / r.height) * H)),
  };
}

/** Shrink w×h (keeping one corner) until it matches aspect (w/h). */
function fitAspect(w: number, h: number, aspect: number) {
  return w / h > aspect ? { w: h * aspect, h } : { w, h: w / aspect };
}

/**
 * Rect spanned from a fixed anchor corner toward p, optionally aspect-locked,
 * never leaving the W×H image. Used for both drawing and corner-resizing.
 */
export function rectFromAnchor(a: Point, p: Point, aspect: number | null, W: number, H: number): Box {
  const sx = p.x >= a.x ? 1 : -1;
  const sy = p.y >= a.y ? 1 : -1;
  let w = Math.min(Math.abs(p.x - a.x), sx > 0 ? W - a.x : a.x);
  let h = Math.min(Math.abs(p.y - a.y), sy > 0 ? H - a.y : a.y);
  if (aspect && w > 0 && h > 0) ({ w, h } = fitAspect(w, h, aspect));
  return { x: sx > 0 ? a.x : a.x - w, y: sy > 0 ? a.y : a.y - h, w, h };
}

/** Largest rect of the given aspect centered in W×H (whole image when aspect is null). */
export function centeredAspectRect(W: number, H: number, aspect: number | null): Box {
  const { w, h } = aspect ? fitAspect(W, H, aspect) : { w: W, h: H };
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

/** Translate a rect by (dx, dy), clamped inside W×H. */
export function moveRect(b: Box, dx: number, dy: number, W: number, H: number): Box {
  return {
    ...b,
    x: Math.max(0, Math.min(W - b.w, b.x + dx)),
    y: Math.max(0, Math.min(H - b.h, b.y + dy)),
  };
}

/** Integer source rect for drawImage, always ≥1px and inside the image. */
export function roundBox(b: Box, W: number, H: number): Box {
  const x = Math.max(0, Math.min(W - 1, Math.round(b.x)));
  const y = Math.max(0, Math.min(H - 1, Math.round(b.y)));
  return {
    x,
    y,
    w: Math.max(1, Math.min(W - x, Math.round(b.w))),
    h: Math.max(1, Math.min(H - y, Math.round(b.h))),
  };
}
