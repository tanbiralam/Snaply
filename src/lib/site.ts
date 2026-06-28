/**
 * Single source of truth for site branding. The product name must never
 * be hardcoded in JSX or metadata — always read from this object.
 * (Naming is still TBD — Pixltly vs Snaply — and isolated here.)
 */
const name = "Snaply";

export const site = {
  name,
  tagline:
    "Free forever, no limits, no ads — your images never leave your browser.",
  description: `${name} is a free, privacy-first image toolkit. Create, edit, and optimize images entirely in your browser — no uploads, no accounts, no limits.`,
  url: "https://snaply.tanbir.in",
} as const;
