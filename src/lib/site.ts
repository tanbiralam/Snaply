const name = "Snaply";

export const site = {
  name,
  tagline:
    "Free forever, no limits, no ads — your images never leave your browser.",
  description: `${name} is a free, privacy-first image toolkit. Create, edit, and optimize images entirely in your browser — no uploads, no accounts, no limits.`,
  url: "https://snaply.tanbir.in",
  github: "https://github.com/tanbiralam/Snaply",

  ogImage: {
    path: "/og-image.webp",
    width: 1672,
    height: 941,
  },
  logo: {
    light: "/logo-light.webp",
    dark: "/logo-dark.webp",
    width: 84,
    height: 28,
  },
} as const;
