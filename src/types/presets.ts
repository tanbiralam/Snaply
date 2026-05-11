import { StyleSettings } from "./settings";

export interface Preset {
  id: string;
  name: string;
  settings: Partial<StyleSettings>;
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
          backgroundImage: "/backgrounds/windows-ghibli.png",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
    ],
  },

  {
    id: "gradients",
    label: "Gradients",
    presets: [
      {
        id: "gradient-purple",
        name: "Purple Dream",
        settings: {
          padding: 56,
          borderRadius: 20,
          shadowIntensity: 35,
          useGradient: true,
          gradientStart: "#667eea",
          gradientEnd: "#764ba2",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "gradient-sunset",
        name: "Sunset",
        settings: {
          padding: 56,
          borderRadius: 20,
          shadowIntensity: 35,
          useGradient: true,
          gradientStart: "#f093fb",
          gradientEnd: "#f5576c",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "ocean-gradient",
        name: "Ocean",
        settings: {
          padding: 56,
          borderRadius: 20,
          shadowIntensity: 30,
          useGradient: true,
          gradientStart: "#2193b0",
          gradientEnd: "#6dd5ed",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "royal-blue",
        name: "Royal Blue",
        settings: {
          padding: 56,
          borderRadius: 18,
          shadowIntensity: 30,
          useGradient: true,
          gradientStart: "#4facfe",
          gradientEnd: "#00f2fe",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "tropical-burst",
        name: "Tropical",
        settings: {
          padding: 60,
          borderRadius: 20,
          shadowIntensity: 40,
          useGradient: true,
          gradientStart: "#f6d365",
          gradientEnd: "#fda085",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "candy-pop",
        name: "Candy Pop",
        settings: {
          padding: 56,
          borderRadius: 24,
          shadowIntensity: 30,
          useGradient: true,
          gradientStart: "#ff9a9e",
          gradientEnd: "#fecfef",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "neon-cyber",
        name: "Neon Cyber",
        settings: {
          padding: 64,
          borderRadius: 20,
          shadowIntensity: 55,
          useGradient: true,
          gradientStart: "#00f5ff",
          gradientEnd: "#ff00ff",
          blurBackground: false,
          grainIntensity: 0,
        },
      },
      {
        id: "soft-lavender",
        name: "Lavender",
        settings: {
          padding: 52,
          borderRadius: 28,
          shadowIntensity: 25,
          useGradient: true,
          gradientStart: "#e0c3fc",
          gradientEnd: "#f093fb",
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
