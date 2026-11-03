// SVG Optimizer pipeline. SVGO (~600KB) is dynamic-imported on first use only
// (architecture invariant 4), so it never lands in shared or other routes' JS.

export const SVG_MAX_BYTES = 5 * 1024 * 1024;
export const SVG_PRECISION = [0, 6] as const;
export const DEFAULT_PRECISION = 3;

/** Cheap pre-check before handing text to SVGO; SVGO's parser does the real validation. */
export const looksLikeSvg = (text: string) => /<svg[\s>]/i.test(text);

/**
 * Throws a user-facing message on malformed input. SVGO 4's preset-default
 * keeps viewBox and <title>, so output scales and stays accessible.
 */
export async function optimizeSvg(text: string, precision: number): Promise<string> {
  if (!looksLikeSvg(text)) throw new Error("That doesn't look like an SVG file.");
  const { optimize } = await import("svgo/browser");
  let out: string;
  try {
    out = optimize(text, {
      multipass: true,
      floatPrecision: precision,
      plugins: ["preset-default"],
    }).data;
  } catch {
    throw new Error("This SVG couldn't be parsed — it may be malformed.");
  }
  if (!looksLikeSvg(out)) throw new Error("This SVG couldn't be optimized.");
  return out;
}
