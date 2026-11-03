// BlurHash encoder/decoder (https://blurha.sh, algorithm from woltapp/blurhash).
// Pure functions over RGBA pixels — no DOM — so they run and are tested in Node.

const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

const encode83 = (n: number, length: number) => {
  let s = "";
  for (let i = 1; i <= length; i++) s += CHARS[Math.floor(n / 83 ** (length - i)) % 83];
  return s;
};

const decode83 = (s: string) => {
  let n = 0;
  for (const c of s) {
    const d = CHARS.indexOf(c);
    if (d < 0) throw new Error(`Invalid BlurHash character "${c}"`);
    n = n * 83 + d;
  }
  return n;
};

const toLinear = (v: number) => {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};

const toSRGB = (v: number) => {
  const x = Math.max(0, Math.min(1, v));
  return x <= 0.0031308
    ? Math.trunc(x * 12.92 * 255 + 0.5)
    : Math.trunc((1.055 * x ** (1 / 2.4) - 0.055) * 255 + 0.5);
};

const signPow = (v: number, e: number) => Math.sign(v) * Math.abs(v) ** e;

/** Components per axis: 1–9. More = more detail, longer string. */
export const BLURHASH_COMPONENTS = [1, 9] as const;

export function encodeBlurhash(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number
): string {
  if (cx < 1 || cx > 9 || cy < 1 || cy > 9) throw new Error("Components must be 1–9");
  if (pixels.length !== width * height * 4) throw new Error("Pixel buffer doesn't match size");

  // Linearize once instead of per component.
  const lin = new Float64Array(width * height * 3);
  for (let i = 0, j = 0; i < pixels.length; i += 4, j += 3) {
    lin[j] = toLinear(pixels[i]);
    lin[j + 1] = toLinear(pixels[i + 1]);
    lin[j + 2] = toLinear(pixels[i + 2]);
  }

  const factors: [number, number, number][] = [];
  for (let y = 0; y < cy; y++) {
    for (let x = 0; x < cx; x++) {
      const norm = x === 0 && y === 0 ? 1 : 2;
      let r = 0, g = 0, b = 0;
      for (let py = 0; py < height; py++) {
        const by = Math.cos((Math.PI * y * py) / height);
        for (let px = 0; px < width; px++) {
          const basis = norm * Math.cos((Math.PI * x * px) / width) * by;
          const k = (py * width + px) * 3;
          r += basis * lin[k];
          g += basis * lin[k + 1];
          b += basis * lin[k + 2];
        }
      }
      const scale = 1 / (width * height);
      factors.push([r * scale, g * scale, b * scale]);
    }
  }

  const [dc, ...ac] = factors;
  let hash = encode83(cx - 1 + (cy - 1) * 9, 1);

  let maxValue = 1;
  if (ac.length) {
    const actualMax = Math.max(...ac.flatMap((f) => f.map(Math.abs)));
    const quantMax = Math.floor(Math.max(0, Math.min(82, Math.floor(actualMax * 166 - 0.5))));
    maxValue = (quantMax + 1) / 166;
    hash += encode83(quantMax, 1);
  } else {
    hash += encode83(0, 1);
  }

  hash += encode83((toSRGB(dc[0]) << 16) + (toSRGB(dc[1]) << 8) + toSRGB(dc[2]), 4);
  for (const f of ac) {
    const q = f.map((v) => Math.floor(Math.max(0, Math.min(18, Math.floor(signPow(v / maxValue, 0.5) * 9 + 9.5)))));
    hash += encode83(q[0] * 19 * 19 + q[1] * 19 + q[2], 2);
  }
  return hash;
}

/** Throws a user-facing message if the string isn't a valid BlurHash. */
export function blurhashSize(hash: string): { cx: number; cy: number } {
  if (hash.length < 6) throw new Error("BlurHash must be at least 6 characters");
  for (const c of hash) if (!CHARS.includes(c)) throw new Error(`Invalid BlurHash character "${c}"`);
  const flag = decode83(hash[0]);
  const cy = Math.floor(flag / 9) + 1;
  const cx = (flag % 9) + 1;
  if (hash.length !== 4 + 2 * cx * cy)
    throw new Error(`BlurHash length should be ${4 + 2 * cx * cy}, got ${hash.length}`);
  return { cx, cy };
}

/** RGBA pixels for a width×height render of the hash. */
export function decodeBlurhash(hash: string, width: number, height: number): Uint8ClampedArray {
  const { cx, cy } = blurhashSize(hash);
  const maxValue = (decode83(hash[1]) + 1) / 166;

  const colors: number[][] = [];
  const dc = decode83(hash.slice(2, 6));
  colors.push([toLinear(dc >> 16), toLinear((dc >> 8) & 255), toLinear(dc & 255)]);
  for (let i = 1; i < cx * cy; i++) {
    const v = decode83(hash.slice(4 + i * 2, 6 + i * 2));
    colors.push(
      [Math.floor(v / 361), Math.floor(v / 19) % 19, v % 19].map((q) => signPow((q - 9) / 9, 2) * maxValue)
    );
  }

  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < cy; j++) {
        const by = Math.cos((Math.PI * y * j) / height);
        for (let i = 0; i < cx; i++) {
          const basis = Math.cos((Math.PI * x * i) / width) * by;
          const c = colors[i + j * cx];
          r += c[0] * basis;
          g += c[1] * basis;
          b += c[2] * basis;
        }
      }
      const k = (y * width + x) * 4;
      out[k] = toSRGB(r);
      out[k + 1] = toSRGB(g);
      out[k + 2] = toSRGB(b);
      out[k + 3] = 255;
    }
  }
  return out;
}
