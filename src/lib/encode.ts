// Encoders for formats canvas.toBlob() can't produce natively.
//
// `encodeBmp` is pure (ImageData → bytes) and unit-tested in Node. `encodeIco`
// needs a real canvas (it embeds a PNG), so it lives here with the DOM glue.

/**
 * 24-bit BGR Windows BMP. Bottom-up rows, 4-byte row padding. BMP has no alpha,
 * so transparency is flattened onto white (same choice as JPEG output).
 */
export function encodeBmp(width: number, height: number, rgba: Uint8ClampedArray): Uint8Array {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buf = new Uint8Array(fileSize);
  const dv = new DataView(buf.buffer);

  // BITMAPFILEHEADER (14 bytes)
  buf[0] = 0x42; // 'B'
  buf[1] = 0x4d; // 'M'
  dv.setUint32(2, fileSize, true);
  dv.setUint32(10, 54, true); // offset to pixel data

  // BITMAPINFOHEADER (40 bytes)
  dv.setUint32(14, 40, true);
  dv.setInt32(18, width, true);
  dv.setInt32(22, height, true); // positive height ⇒ bottom-up
  dv.setUint16(26, 1, true); // planes
  dv.setUint16(28, 24, true); // bits per pixel
  dv.setUint32(34, pixelArraySize, true);
  dv.setInt32(38, 2835, true); // ~72 DPI (pixels/metre)
  dv.setInt32(42, 2835, true);

  let p = 54;
  for (let fileRow = 0; fileRow < height; fileRow++) {
    const y = height - 1 - fileRow; // first file row = bottom image row
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const a = rgba[si + 3] / 255;
      buf[p++] = Math.round(rgba[si + 2] * a + 255 * (1 - a)); // B
      buf[p++] = Math.round(rgba[si + 1] * a + 255 * (1 - a)); // G
      buf[p++] = Math.round(rgba[si] * a + 255 * (1 - a)); // R
    }
    for (let pad = width * 3; pad < rowSize; pad++) buf[p++] = 0;
  }
  return buf;
}

/**
 * ICO containing one PNG image per canvas (multi-resolution icons — e.g. a
 * favicon.ico bundling 16/32/48px — are just several directory entries in one
 * file). Each entry caps at 256px per side; oversized canvases are downscaled.
 */
/** Dimensions an ICO entry ends up with: unchanged up to 256px, otherwise fit within 256×256. */
export function icoSize(w: number, h: number): { w: number; h: number } {
  const MAX = 256;
  if (w <= MAX && h <= MAX) return { w, h };
  const s = Math.min(MAX / w, MAX / h);
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

export async function encodeIco(canvases: HTMLCanvasElement[]): Promise<Blob> {
  const images = await Promise.all(
    canvases.map(async (canvas) => {
      let src = canvas;
      const size = icoSize(canvas.width, canvas.height);
      if (size.w !== canvas.width || size.h !== canvas.height) {
        const c = document.createElement("canvas");
        c.width = size.w;
        c.height = size.h;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, c.width, c.height);
        src = c;
      }
      const pngBlob = await new Promise<Blob | null>((res) => src.toBlob(res, "image/png"));
      if (!pngBlob) throw new Error("PNG encode failed");
      return { width: src.width, height: src.height, png: new Uint8Array(await pngBlob.arrayBuffer()) };
    })
  );

  const dirSize = 6 + 16 * images.length;
  const head = new Uint8Array(dirSize);
  const dv = new DataView(head.buffer);
  dv.setUint16(0, 0, true); // reserved
  dv.setUint16(2, 1, true); // type: 1 = icon
  dv.setUint16(4, images.length, true);

  let offset = dirSize;
  const parts: Uint8Array[] = [head];
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    head[e] = img.width >= 256 ? 0 : img.width; // 0 means 256
    head[e + 1] = img.height >= 256 ? 0 : img.height;
    head[e + 2] = 0; // palette count
    head[e + 3] = 0; // reserved
    dv.setUint16(e + 4, 1, true); // colour planes
    dv.setUint16(e + 6, 32, true); // bits per pixel
    dv.setUint32(e + 8, img.png.length, true); // image data size
    dv.setUint32(e + 12, offset, true); // offset to image data
    offset += img.png.length;
    parts.push(img.png);
  });

  return new Blob(parts, { type: "image/x-icon" });
}
