import { StyleSettings } from "@/types";

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Returns the top-left position to center a box on the canvas,
 * compensating for shadow offset so the visual centre stays true.
 * Snaps to full pixels to avoid sub-pixel blur.
 */
export const getCenteredPosition = (
  canvasWidth: number,
  canvasHeight: number,
  boxWidth: number,
  boxHeight: number,
  shadowOffsetX: number,
  shadowOffsetY: number
) => {
  const x = Math.round((canvasWidth - boxWidth) / 2 - shadowOffsetX / 2);
  const y = Math.round((canvasHeight - boxHeight) / 2 - shadowOffsetY / 2);
  return { x, y };
};

/**
 * Given an aspect-ratio setting and the content bounding-box size + padding,
 * returns the canvas dimensions that satisfy the ratio constraint while never
 * cropping the content.
 */
export const getAspectRatioDimensions = (
  aspectRatio: StyleSettings["aspectRatio"],
  boxWidth: number,
  boxHeight: number,
  padding: number
) => {
  const contentWidth = boxWidth + padding * 2;
  const contentHeight = boxHeight + padding * 2;

  switch (aspectRatio) {
    case "1:1": {
      const size = Math.max(contentWidth, contentHeight);
      return { width: size, height: size };
    }
    case "16:9": {
      const width = Math.max(contentWidth, (contentHeight * 16) / 9);
      const height = Math.max(contentHeight, (contentWidth * 9) / 16);
      return { width, height };
    }
    case "4:3": {
      const width = Math.max(contentWidth, (contentHeight * 4) / 3);
      const height = Math.max(contentHeight, (contentWidth * 3) / 4);
      return { width, height };
    }
    case "4:5": {
      const width = Math.max(contentWidth, (contentHeight * 4) / 5);
      const height = Math.max(contentHeight, (contentWidth * 5) / 4);
      return { width, height };
    }
    case "9:16": {
      const width = Math.max(contentWidth, (contentHeight * 9) / 16);
      const height = Math.max(contentHeight, (contentWidth * 16) / 9);
      return { width, height };
    }
    default:
      return { width: contentWidth, height: contentHeight };
  }
};

// ─── Drawing primitives ───────────────────────────────────────────────────────

/**
 * Converts a CSS-style gradient angle (degrees, 0 = upward) to the four
 * x0,y0 → x1,y1 coordinates expected by CanvasRenderingContext2D.createLinearGradient.
 *
 * The approach uses the same formula as CSS: the gradient line runs through
 * the centre of the rectangle at the given angle, stretching to the corners.
 */
export function angleToGradientPoints(
  angleDeg: number,
  w: number,
  h: number
): [number, number, number, number] {
  // CSS: 0deg = bottom→top. Canvas rotation: 0 = right. Offset by 90° and flip.
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = w / 2;
  const hh = h / 2;
  const len = Math.abs(hw * cos) + Math.abs(hh * sin);
  return [hw - len * cos, hh - len * sin, hw + len * cos, hh + len * sin];
}

/**
 * Draws the image over the full canvas using object-fit: cover semantics
 * (scaled up to fill, centered, overflow cropped).
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(canvasW / iw, canvasH / ih);
  const sw = iw * scale;
  const sh = ih * scale;
  const sx = (canvasW - sw) / 2;
  const sy = (canvasH - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh);
}

/**
 * Draws a rounded-rectangle path on the given context.
 * Radius is clamped to half the shortest side so it never exceeds the box.
 */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws a premium film-grain noise overlay on the background only.
 *
 * The grain is composited with "overlay" blending for an analogue, filmic look.
 * The screenshot content rectangle is excluded via an even-odd clip so the
 * actual screenshot pixel data is never touched.
 */
// ponytail: single-entry cache keyed by size + intensity. Regenerating the
// noise (Math.random 4×/pixel) on every redraw is what made slider drags janky;
// caching means only an actual size/intensity change rebuilds it. Every other
// slider (padding, radius, shadow…) reuses the cached canvas and stays smooth.
// Intensity is baked into per-pixel alpha (not applied via globalAlpha) because
// globalAlpha doesn't compose reliably with the "overlay" blend used below.
// ponytail: dragging the grain slider still regenerates per tick — acceptable
// for one slider; upgrade to an alpha LUT if that ever feels slow.
let grainCache: { key: string; canvas: HTMLCanvasElement } | null = null;

function getNoiseCanvas(nw: number, nh: number, intensity: number): HTMLCanvasElement | null {
  const key = `${nw}x${nh}x${intensity}`;
  if (grainCache && grainCache.key === key) return grainCache.canvas;

  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = nw;
  noiseCanvas.height = nh;
  const nc = noiseCanvas.getContext("2d");
  if (!nc) return null;

  const imageData = nc.createImageData(nw, nh);
  const data = imageData.data;
  // Map 0–100 → max per-pixel alpha 0–0.55 so grain is never overpowering.
  const maxAlpha = (intensity / 100) * 0.55;

  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.random() * 255;
    data[i]     = Math.max(0, Math.min(255, luma + (Math.random() - 0.5) * 14));
    data[i + 1] = luma;
    data[i + 2] = Math.max(0, Math.min(255, luma + (Math.random() - 0.5) * 14));
    data[i + 3] = Math.random() * maxAlpha * 255;
  }
  nc.putImageData(imageData, 0, 0);

  grainCache = { key, canvas: noiseCanvas };
  return noiseCanvas;
}

export function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  contentR: number
) {
  if (intensity <= 0) return;

  // Downscale 2× for a coarser, more filmic texture with better perf.
  const scale = 2;
  const nw = Math.ceil(w / scale);
  const nh = Math.ceil(h / scale);

  const noiseCanvas = getNoiseCanvas(nw, nh, intensity);
  if (!noiseCanvas) return;

  ctx.save();
  // Clip path: full canvas minus the screenshot rect (even-odd rule).
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  const r = Math.min(contentR, contentW / 2, contentH / 2);
  ctx.moveTo(contentX + r, contentY);
  ctx.lineTo(contentX + contentW - r, contentY);
  ctx.quadraticCurveTo(contentX + contentW, contentY, contentX + contentW, contentY + r);
  ctx.lineTo(contentX + contentW, contentY + contentH - r);
  ctx.quadraticCurveTo(contentX + contentW, contentY + contentH, contentX + contentW - r, contentY + contentH);
  ctx.lineTo(contentX + r, contentY + contentH);
  ctx.quadraticCurveTo(contentX, contentY + contentH, contentX, contentY + contentH - r);
  ctx.lineTo(contentX, contentY + r);
  ctx.quadraticCurveTo(contentX, contentY, contentX + r, contentY);
  ctx.closePath();
  ctx.clip("evenodd");

  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(noiseCanvas, 0, 0, w, h);
  ctx.restore();
}

/**
 * Draws the image inside the content area using letterbox / pillarbox
 * (object-fit: contain semantics) so the image is never stretched.
 */
export function drawImageLetterboxed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  contentRadius: number
) {
  const imgRatio  = img.width / img.height;
  const areaRatio = contentW / contentH;

  let drawW: number, drawH: number, drawX: number, drawY: number;

  if (imgRatio > areaRatio) {
    drawW = contentW;
    drawH = contentW / imgRatio;
    drawX = contentX;
    drawY = contentY + (contentH - drawH) / 2;
  } else if (imgRatio < areaRatio) {
    drawH = contentH;
    drawW = contentH * imgRatio;
    drawX = contentX + (contentW - drawW) / 2;
    drawY = contentY;
  } else {
    drawW = contentW; drawH = contentH;
    drawX = contentX; drawY = contentY;
  }

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, contentX, contentY, contentW, contentH, contentRadius);
  ctx.clip();
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(contentX, contentY, contentW, contentH);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}
