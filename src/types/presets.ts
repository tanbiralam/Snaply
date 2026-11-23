import { StyleSettings } from "./settings";

export interface Preset {
  id: string;
  name: string;
  settings: Partial<StyleSettings>;
  /** Small swatch image; falls back to the full background image. */
  thumb?: string;
}

export interface PresetCategory {
  id: string;
  label: string;
  presets: Preset[];
}

// ─── Preset categories ──────────────────────────────────────────────────────

export const presetCategories: PresetCategory[] = [
  {
    id: "image-backgrounds",
    label: "Image Backgrounds",
    presets: [
      {
        id: "img-pastel-mesh",
        name: "Pastel Dream",
        settings: {
          padding: 60,
          borderRadius: 24,
          shadowIntensity: 35,
          useGradient: false,
          backgroundImage: "/backgrounds/pastel-mesh.jpg",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-dark-marble",
        name: "Dark Marble",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 55,
          useGradient: false,
          backgroundImage: "/backgrounds/dark-marble.jpg",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-aurora",
        name: "Aurora",
        settings: {
          padding: 68,
          borderRadius: 22,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/aurora.jpg",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-neon-grid",
        name: "Neon Grid",
        settings: {
          padding: 64,
          borderRadius: 18,
          shadowIntensity: 60,
          useGradient: false,
          backgroundImage: "/backgrounds/neon-grid.jpg",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-light-concrete",
        name: "Concrete",
        settings: {
          padding: 52,
          borderRadius: 14,
          shadowIntensity: 30,
          useGradient: false,
          backgroundImage: "/backgrounds/light-concrete.jpg",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-windows-ghibli",
        name: "Windows Ghibli",
        settings: {
          padding: 52,
          borderRadius: 14,
          shadowIntensity: 30,
          useGradient: false,
          backgroundImage: "/backgrounds/windows-ghibli.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-vice-silhouettes",
        name: "Vice Silhouettes",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 50,
          useGradient: false,
          backgroundImage: "/backgrounds/vice-silhouettes.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-vice-palms",
        name: "Vice Palms",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 50,
          useGradient: false,
          backgroundImage: "/backgrounds/vice-palms.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-halftone-citrus",
        name: "Halftone Citrus",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/halftone-citrus.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-halftone-lagoon",
        name: "Halftone Lagoon",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/halftone-lagoon.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-halftone-ember",
        name: "Halftone Ember",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/halftone-ember.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "img-halftone-peach",
        name: "Halftone Peach",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/halftone-peach.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
    ],
  },

  // Pre-rendered from the Gradient Generator's looks (src/lib/gradient.ts,
  // GRADIENT_LOOKS) at 2400×1500; Haze with grain capped at 0.15 for size.
  {
    id: "gradients",
    label: "Gradients",
    presets: [
      {
        id: "gen-silk",
        thumb: "/backgrounds/thumbs/gen-silk.webp",
        name: "Silk",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-silk.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-haze",
        thumb: "/backgrounds/thumbs/gen-haze.webp",
        name: "Haze",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-haze.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-mesh",
        thumb: "/backgrounds/thumbs/gen-mesh.webp",
        name: "Mesh",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-mesh.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-aurora",
        thumb: "/backgrounds/thumbs/gen-aurora.webp",
        name: "Borealis",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-aurora.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-dunes",
        thumb: "/backgrounds/thumbs/gen-dunes.webp",
        name: "Dunes",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-dunes.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-rays",
        thumb: "/backgrounds/thumbs/gen-rays.webp",
        name: "Rays",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-rays.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-reeded",
        thumb: "/backgrounds/thumbs/gen-reeded.webp",
        name: "Reeded",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-reeded.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gen-contour",
        thumb: "/backgrounds/thumbs/gen-contour.webp",
        name: "Contour",
        settings: {
          padding: 64,
          borderRadius: 16,
          shadowIntensity: 45,
          useGradient: false,
          backgroundImage: "/backgrounds/gen-contour.webp",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
    ],
  },

  {
    id: "minimal",
    label: "Minimal",
    presets: [
      {
        id: "minimal-light",
        name: "White",
        settings: {
          padding: 40,
          borderRadius: 12,
          shadowIntensity: 20,
          backgroundColor: "#ffffff",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "pearl-light",
        name: "Pearl",
        settings: {
          padding: 44,
          borderRadius: 16,
          shadowIntensity: 18,
          backgroundColor: "#f7f7f9",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "minimal-dark",
        name: "Dark",
        settings: {
          padding: 40,
          borderRadius: 12,
          shadowIntensity: 25,
          backgroundColor: "#1a1a2e",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "graphite",
        name: "Graphite",
        settings: {
          padding: 48,
          borderRadius: 14,
          shadowIntensity: 35,
          backgroundColor: "#2a2a2a",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "heavy-shadow",
        name: "Heavy Shadow",
        settings: {
          padding: 72,
          borderRadius: 16,
          shadowIntensity: 60,
          backgroundColor: "#f8f9fa",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "rounded-card",
        name: "Rounded Card",
        settings: {
          padding: 48,
          borderRadius: 32,
          shadowIntensity: 30,
          backgroundColor: "#ffffff",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 0,
        },
      },
    ],
  },

  {
    id: "glass",
    label: "Glass & Blur",
    presets: [
      {
        id: "glassmorphism",
        name: "Glassmorphism",
        settings: {
          padding: 64,
          borderRadius: 24,
          shadowIntensity: 40,
          blurBackground: true,
          useGradient: true,
          gradientStart: "#a8edea",
          gradientEnd: "#fed6e3",
          grainIntensity: 0,
        },
      },
      {
        id: "glass-indigo",
        name: "Glass Indigo",
        settings: {
          padding: 60,
          borderRadius: 22,
          shadowIntensity: 45,
          blurBackground: true,
          useGradient: true,
          gradientStart: "#6a3de8",
          gradientEnd: "#9b59b6",
          grainIntensity: 0,
        },
      },
      {
        id: "glass-midnight",
        name: "Glass Midnight",
        settings: {
          padding: 60,
          borderRadius: 22,
          shadowIntensity: 50,
          blurBackground: true,
          useGradient: true,
          gradientStart: "#0f0c29",
          gradientEnd: "#302b63",
          grainIntensity: 0,
        },
      },
    ],
  },

  {
    id: "grainy",
    label: "Grainy & Textured",
    presets: [
      {
        id: "grain-warm",
        name: "Warm Film",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 35,
          useGradient: true,
          gradientStart: "#c8974a",
          gradientEnd: "#e8c37a",
          blurBackground: false,
          grainIntensity: 55,
        },
      },
      {
        id: "grain-cool",
        name: "Matte Cool",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 30,
          useGradient: true,
          gradientStart: "#2d3a5e",
          gradientEnd: "#4a6070",
          blurBackground: false,
          grainIntensity: 60,
        },
      },
      {
        id: "grain-charcoal",
        name: "Charcoal",
        settings: {
          padding: 52,
          borderRadius: 14,
          shadowIntensity: 40,
          backgroundColor: "#1c1c1e",
          useGradient: false,
          blurBackground: false,
          grainIntensity: 70,
        },
      },
      {
        id: "grain-rose",
        name: "Dusty Rose",
        settings: {
          padding: 60,
          borderRadius: 20,
          shadowIntensity: 28,
          useGradient: true,
          gradientStart: "#b5788c",
          gradientEnd: "#d4a0b0",
          blurBackground: false,
          grainIntensity: 50,
        },
      },
      {
        id: "grain-forest",
        name: "Forest",
        settings: {
          padding: 56,
          borderRadius: 16,
          shadowIntensity: 32,
          useGradient: true,
          gradientStart: "#1f3a24",
          gradientEnd: "#3a6b45",
          blurBackground: false,
          grainIntensity: 60,
        },
      },
      {
        id: "grain-noir",
        name: "Noir",
        settings: {
          padding: 52,
          borderRadius: 12,
          shadowIntensity: 50,
          useGradient: true,
          gradientStart: "#1a1a1a",
          gradientEnd: "#3a3a3a",
          blurBackground: false,
          grainIntensity: 80,
        },
      },
    ],
  },
];

// ─── Flat list for backwards compatibility ───────────────────────────────────

export const presets: Preset[] = presetCategories.flatMap((c) => c.presets);
