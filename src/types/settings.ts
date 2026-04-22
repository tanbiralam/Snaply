import { DeviceMockup } from "./devices";

export type AspectRatio = "free" | "16:9" | "4:3" | "1:1" | "9:16";

export interface StyleSettings {
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  useGradient: boolean;
  blurBackground: boolean;
  aspectRatio: AspectRatio;
  deviceMockup: DeviceMockup;
  /** Film-grain intensity applied ONLY to the background layer (0 = off, 100 = max). */
  grainIntensity: number;
}

export const defaultSettings: StyleSettings = {
  padding: 40,
  borderRadius: 12,
  shadowIntensity: 40,
  backgroundColor: "#1a1a2e",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  useGradient: true,
  blurBackground: false,
  aspectRatio: "free",
  deviceMockup: "none",
  grainIntensity: 0,
};
