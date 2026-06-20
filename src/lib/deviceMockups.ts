import { DeviceMockup } from "@/types";

/**
 * Represents the rectangle inside a device frame where the screenshot
 * should be drawn. Frame dimensions (outer) vs content dimensions (inner).
 */
export interface DeviceFrameLayout {
  /** Total frame outer width */
  frameWidth: number;
  /** Total frame outer height */
  frameHeight: number;
  /** X offset of screenshot content relative to frame top-left */
  contentX: number;
  /** Y offset of screenshot content relative to frame top-left */
  contentY: number;
  /** Screenshot content width inside frame */
  contentWidth: number;
  /** Screenshot content height inside frame */
  contentHeight: number;
  /** Corner radius to clip the screenshot with (matches frame inner radius) */
  contentRadius: number;
}

export interface DeviceThemeColors {
  frameFill: string;
  frameStroke: string;
  chromeFill: string;
  chromeStroke: string;
  urlBarFill: string;
  urlBarText: string;
  accent: string;
}

/**
 * Returns theme-aware colors for device chrome.
 */
export function getDeviceColors(isDark: boolean): DeviceThemeColors {
  if (isDark) {
    return {
      frameFill: "#1c1c1e",
      frameStroke: "#2c2c2e",
      chromeFill: "#2a2a2d",
      chromeStroke: "#3a3a3d",
      urlBarFill: "#3a3a3d",
      urlBarText: "#a1a1aa",
      accent: "#8e8e93",
    };
  }
  return {
    frameFill: "#ffffff",
    frameStroke: "#e5e7eb",
    chromeFill: "#f3f4f6",
    chromeStroke: "#e5e7eb",
    urlBarFill: "#ffffff",
    urlBarText: "#6b7280",
    accent: "#9ca3af",
  };
}

/**
 * Computes the overall frame layout based on the screenshot's natural size.
 * The screenshot is placed inside the frame; frame grows to fit chrome/bezels.
 */
export function getDeviceLayout(
  device: DeviceMockup,
  imageWidth: number,
  imageHeight: number,
  borderRadius: number
): DeviceFrameLayout {
  switch (device) {
    case "browser": {
      // Browser: top chrome bar (traffic lights + URL) above screenshot.
      const chromeHeight = 44;
      const sidePad = 0;
      return {
        frameWidth: imageWidth + sidePad * 2,
        frameHeight: imageHeight + chromeHeight,
        contentX: sidePad,
        contentY: chromeHeight,
        contentWidth: imageWidth,
        contentHeight: imageHeight,
        contentRadius: 0, // Browser keeps screenshot square since frame rounds outside
      };
    }
    case "macos": {
      // macOS window: title bar with traffic lights, no URL bar.
      const titleBarHeight = 32;
      return {
        frameWidth: imageWidth,
        frameHeight: imageHeight + titleBarHeight,
        contentX: 0,
        contentY: titleBarHeight,
        contentWidth: imageWidth,
        contentHeight: imageHeight,
        contentRadius: 0,
      };
    }
    case "iphone": {
      // iPhone: thin bezel all around, notch on top, home indicator bottom.
      const bezel = 14;
      const notchSpace = 22; // area above content reserved for notch
      const homeIndicatorSpace = 22;
      return {
        frameWidth: imageWidth + bezel * 2,
        frameHeight: imageHeight + bezel * 2 + notchSpace + homeIndicatorSpace,
        contentX: bezel,
        contentY: bezel + notchSpace,
        contentWidth: imageWidth,
        contentHeight: imageHeight,
        contentRadius: 28,
      };
    }
    case "android": {
      // Android: thin even bezel with small camera dot.
      const bezel = 10;
      const cameraSpace = 18;
      return {
        frameWidth: imageWidth + bezel * 2,
        frameHeight: imageHeight + bezel * 2 + cameraSpace,
        contentX: bezel,
        contentY: bezel + cameraSpace,
        contentWidth: imageWidth,
        contentHeight: imageHeight,
        contentRadius: 18,
      };
    }
    case "ipad": {
      // iPad landscape-style: bezel + side home button on the right.
      const bezel = 28;
      const homeButtonSpace = 40; // space on the right for home button
      return {
        frameWidth: imageWidth + bezel * 2 + homeButtonSpace,
        frameHeight: imageHeight + bezel * 2,
        contentX: bezel,
        contentY: bezel,
        contentWidth: imageWidth,
        contentHeight: imageHeight,
        contentRadius: 8,
      };
    }
    case "none":
    default: {
      return {
        frameWidth: imageWidth,
        frameHeight: imageHeight,
        contentX: 0,
        contentY: 0,
        contentWidth: imageWidth,
        contentHeight: imageHeight,
        contentRadius: borderRadius,
      };
    }
  }
}

/**
 * Draws a rounded rectangle path (does not fill or stroke).
 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws the device frame BEHIND the screenshot, at position (originX, originY)
 * of its bounding rect. Call this BEFORE drawing the screenshot.
 *
 * The screenshot itself must be drawn at (originX + layout.contentX,
 * originY + layout.contentY) with size (contentWidth, contentHeight).
 */
export function drawDeviceFrame(
  ctx: CanvasRenderingContext2D,
  device: DeviceMockup,
  originX: number,
  originY: number,
  layout: DeviceFrameLayout,
  colors: DeviceThemeColors,
  outerRadius: number,
  browserUrl = "yoursite.com"
) {
  const { frameWidth, frameHeight } = layout;

  switch (device) {
    case "browser": {
      // Draw rounded frame background (chrome + content area together).
      ctx.save();
      roundRectPath(
        ctx,
        originX,
        originY,
        frameWidth,
        frameHeight,
        outerRadius
      );
      ctx.fillStyle = colors.chromeFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.chromeStroke;
      ctx.stroke();
      ctx.restore();

      const chromeHeight = layout.contentY;
      const cy = originY + chromeHeight / 2;

      // Three traffic-light dots on the left.
      const dotRadius = 6;
      const dotSpacing = 20;
      const dotStartX = originX + 18;
      const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
      dotColors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(dotStartX + i * dotSpacing, cy, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // URL bar pill centered in remaining chrome space.
      const urlBarX = originX + 96;
      const urlBarW = frameWidth - 96 - 24;
      const urlBarH = 22;
      const urlBarY = cy - urlBarH / 2;
      roundRectPath(ctx, urlBarX, urlBarY, urlBarW, urlBarH, urlBarH / 2);
      ctx.fillStyle = colors.urlBarFill;
      ctx.fill();
      ctx.strokeStyle = colors.chromeStroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Address-bar text (editable).
      ctx.fillStyle = colors.urlBarText;
      ctx.font = "500 11px -apple-system, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      const urlLabel = browserUrl.trim() ? `🔒  ${browserUrl.trim()}` : "🔒";
      ctx.fillText(urlLabel, urlBarX + 10, cy + 1);
      break;
    }

    case "macos": {
      // Rounded window with title bar.
      ctx.save();
      roundRectPath(
        ctx,
        originX,
        originY,
        frameWidth,
        frameHeight,
        outerRadius
      );
      ctx.fillStyle = colors.chromeFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.chromeStroke;
      ctx.stroke();
      ctx.restore();

      const titleBarH = layout.contentY;
      const cy = originY + titleBarH / 2;

      // Traffic lights.
      const dotRadius = 6;
      const dotSpacing = 18;
      const dotStartX = originX + 14;
      ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(dotStartX + i * dotSpacing, cy, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      break;
    }

    case "iphone": {
      // Outer rounded body.
      ctx.save();
      roundRectPath(ctx, originX, originY, frameWidth, frameHeight, 48);
      ctx.fillStyle = colors.frameFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.frameStroke;
      ctx.stroke();
      ctx.restore();

      // Notch: pill-shaped cutout near the top center.
      const notchW = Math.min(140, frameWidth * 0.35);
      const notchH = 22;
      const notchX = originX + (frameWidth - notchW) / 2;
      const notchY = originY + 10;
      roundRectPath(ctx, notchX, notchY, notchW, notchH, notchH / 2);
      ctx.fillStyle = "#000000";
      ctx.fill();

      // Home indicator: thin pill at the bottom center.
      const homeW = frameWidth * 0.32;
      const homeH = 4;
      const homeX = originX + (frameWidth - homeW) / 2;
      const homeY = originY + frameHeight - 14;
      roundRectPath(ctx, homeX, homeY, homeW, homeH, homeH / 2);
      ctx.fillStyle = colors.accent;
      ctx.fill();
      break;
    }

    case "android": {
      // Thin rounded frame.
      ctx.save();
      roundRectPath(ctx, originX, originY, frameWidth, frameHeight, 28);
      ctx.fillStyle = colors.frameFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.frameStroke;
      ctx.stroke();
      ctx.restore();

      // Small camera dot centered near top edge.
      const camRadius = 4;
      const camX = originX + frameWidth / 2;
      const camY = originY + 10;
      ctx.beginPath();
      ctx.arc(camX, camY, camRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }

    case "ipad": {
      // Outer body (wider rounded rectangle, landscape feel).
      ctx.save();
      roundRectPath(ctx, originX, originY, frameWidth, frameHeight, 28);
      ctx.fillStyle = colors.frameFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.frameStroke;
      ctx.stroke();
      ctx.restore();

      // Home button on the right side (classic iPad style).
      const btnRadius = 12;
      const btnX =
        originX +
        layout.contentX +
        layout.contentWidth +
        (frameWidth -
          (layout.contentX + layout.contentWidth) -
          originX +
          originX) /
          2;
      // Simpler: place home button centered in right bezel region.
      const rightBezelStart = originX + layout.contentX + layout.contentWidth;
      const rightBezelEnd = originX + frameWidth;
      const buttonCx = (rightBezelStart + rightBezelEnd) / 2;
      const buttonCy = originY + frameHeight / 2;
      ctx.beginPath();
      ctx.arc(buttonCx, buttonCy, btnRadius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Inner rounded square for the home icon.
      const innerSize = 10;
      roundRectPath(
        ctx,
        buttonCx - innerSize / 2,
        buttonCy - innerSize / 2,
        innerSize,
        innerSize,
        2
      );
      ctx.stroke();
      // Suppress unused var lint
      void btnX;
      break;
    }

    case "none":
    default:
      break;
  }
}
