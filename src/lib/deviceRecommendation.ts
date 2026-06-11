/**
 * Device recommendation logic based on image aspect ratio.
 *
 * Classifies an image into one of four categories:
 *   - "portrait"   → 9:16-ish or taller (phone screens)
 *   - "landscape"  → 16:9-ish or wider (desktop/browser screenshots)
 *   - "tablet"     → 3:4 / 4:3-ish
 *   - "square"     → near 1:1
 */

import { DeviceMockup } from "@/types";

export type ImageClass = "portrait" | "landscape" | "tablet" | "square";

export interface DeviceCompatibility {
  /** Which category this image falls into */
  imageClass: ImageClass;
  /** Human-readable recommendation shown in the banner */
  recommendation: string;
  /** Devices that are a great fit */
  preferredDevices: DeviceMockup[];
  /** Devices that will look awkward / stretched */
  incompatibleDevices: DeviceMockup[];
}

export function classifyImageRatio(ratio: number): DeviceCompatibility {

  // Portrait-ish: ratio ≤ 0.70 (roughly 9:16 = 0.5625 to 3:4 = 0.75)
  if (ratio <= 0.70) {
    return {
      imageClass: "portrait",
      recommendation: "Portrait image — iPhone or Android frames look great",
      preferredDevices: ["iphone", "android", "none"],
      incompatibleDevices: ["browser", "macos", "ipad"],
    };
  }

  // Near-square: 0.85 – 1.20
  if (ratio >= 0.85 && ratio <= 1.20) {
    return {
      imageClass: "square",
      recommendation: "Square-ish image — any frame works, or try None",
      preferredDevices: ["none", "browser", "iphone", "android"],
      incompatibleDevices: [],
    };
  }

  // Tablet-ish: 0.70 – 0.85 (portrait tablet) or 1.20 – 1.45 (landscape tablet)
  if ((ratio > 0.70 && ratio < 0.85) || (ratio > 1.20 && ratio < 1.45)) {
    return {
      imageClass: "tablet",
      recommendation: "Tablet-ratio image — iPad frame is a great fit",
      preferredDevices: ["ipad", "none", "browser"],
      incompatibleDevices: ["iphone", "android"],
    };
  }

  // Landscape / wide: ratio ≥ 1.45
  return {
    imageClass: "landscape",
    recommendation: "Desktop screenshot — Browser or macOS frame recommended",
    preferredDevices: ["browser", "macos", "none"],
    incompatibleDevices: ["iphone", "android", "ipad"],
  };
}

/** Returns true when the given device is NOT a good fit for the image. */
export function isDeviceIncompatible(
  device: DeviceMockup,
  compatibility: DeviceCompatibility | null
): boolean {
  if (!compatibility) return false;
  return compatibility.incompatibleDevices.includes(device);
}
