import { DeviceMockup } from "./devices";

export type AspectRatio = "free" | "16:9" | "4:3" | "1:1" | "9:16" | "4:5";

export interface StyleSettings {
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  useGradient: boolean;
  blurBackground: boolean;
  aspectRatio: AspectRatio;
  deviceMockup: DeviceMockup;
  grainIntensity: number;
  /** Path to a public background image, e.g. "/backgrounds/bokeh-dark.jpg" */
  backgroundImage: string | null;
  /** Address-bar text shown in the browser device frame */
  browserUrl: string;
  /** Screenshot size relative to its fitted size, in percent. Above 100 it
   *  can run past the canvas edge, which crops it. */
  imageScale: number;
  /** Screenshot offset from center, as a fraction of canvas width/height, so
   *  it survives padding and aspect-ratio changes. Set by dragging. */
  imageOffset: { x: number; y: number };
}

export const defaultSettings: StyleSettings = {
  padding: 40,
  borderRadius: 12,
  shadowIntensity: 40,
  backgroundColor: "#1a1a2e",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  gradientAngle: 135,
  useGradient: true,
  blurBackground: false,
  aspectRatio: "free",
  deviceMockup: "none",
  grainIntensity: 0,
  backgroundImage: null,
  browserUrl: "yoursite.com",
  imageScale: 100,
  imageOffset: { x: 0, y: 0 },
};
