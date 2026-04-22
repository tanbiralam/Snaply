import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { StyleSettings } from "@/types";
import { ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  drawDeviceFrame,
  getDeviceColors,
  getDeviceLayout,
} from "@/lib/deviceMockups";

interface CanvasRendererProps {
  image: string | null;
  settings: StyleSettings;
}

export interface CanvasRendererRef {
  exportImage: (
    format?: "png" | "jpeg" | "webp",
    quality?: number
  ) => string | null;
}

/**
 * Returns the top-left position to center a box on the canvas,
 * compensating for shadow offset so the visual center stays true.
 * Snaps to full pixels to avoid sub-pixel blur.
 */
const getCenteredPosition = (
  canvasWidth: number,
  canvasHeight: number,
  boxWidth: number,
  boxHeight: number,
  shadowOffsetX: number,
  shadowOffsetY: number
) => {
  const x = Math.round((canvasWidth - boxWidth) / 2 - shadowOffsetX / 2);
  const y = Math.round((canvasHeight - boxHeight) / 2 - shadowOffsetY / 2);
  return { x, y };
};

/**
 * Given an aspect ratio setting and the content bounding box size + padding,
 * returns the canvas dimensions that satisfy the ratio constraint while never
 * cropping the content.
 */
const getAspectRatioDimensions = (
  aspectRatio: StyleSettings["aspectRatio"],
  boxWidth: number,
  boxHeight: number,
  padding: number
) => {
  const contentWidth = boxWidth + padding * 2;
  const contentHeight = boxHeight + padding * 2;

  switch (aspectRatio) {
    case "1:1": {
      const size = Math.max(contentWidth, contentHeight);
      return { width: size, height: size };
    }
    case "16:9": {
      const width = Math.max(contentWidth, (contentHeight * 16) / 9);
      const height = Math.max(contentHeight, (contentWidth * 9) / 16);
      return { width, height };
    }
    case "4:5": {
      const width = Math.max(contentWidth, (contentHeight * 4) / 5);
      const height = Math.max(contentHeight, (contentWidth * 5) / 4);
      return { width, height };
    }
    case "9:16": {
      const width = Math.max(contentWidth, (contentHeight * 9) / 16);
      const height = Math.max(contentHeight, (contentWidth * 16) / 9);
      return { width, height };
    }
    default:
      return { width: contentWidth, height: contentHeight };
  }
};

/**
 * Draws a premium film-grain noise overlay on the background only.
 *
 * The grain is composited over the full background with "overlay" blending
 * which interacts with the existing colours for an analogue, filmic look.
 * The screenshot content rectangle is excluded using a clipping region built
 * with the even-odd fill rule, so the actual screenshot pixel data is never
 * touched.
 *
 * @param ctx       Destination context.
 * @param w         Canvas logical width.
 * @param h         Canvas logical height.
 * @param intensity 0–100 — maps to a max per-pixel noise alpha of 0–55%.
 * @param contentX  Screenshot rect left edge (grain-free zone).
 * @param contentY  Screenshot rect top edge.
 * @param contentW  Screenshot rect width.
 * @param contentH  Screenshot rect height.
 * @param contentR  Screenshot rect corner radius.
 */
function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  contentR: number
) {
  if (intensity <= 0) return;

  // --- Generate noise on a small off-screen canvas -------------------------
  // Downscale 2× for a slightly coarser, more filmic texture and better perf.
  const scale = 2;
  const nw = Math.ceil(w / scale);
  const nh = Math.ceil(h / scale);

  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = nw;
  noiseCanvas.height = nh;
  const nc = noiseCanvas.getContext("2d");
  if (!nc) return;

  const imageData = nc.createImageData(nw, nh);
  const data = imageData.data;
  // Map 0–100 → max per-pixel alpha 0–0.55 so grain is never overpowering.
  const maxAlpha = (intensity / 100) * 0.55;

  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.random() * 255;
    // Subtle warm/cool channel variation for organic feel.
    data[i]     = Math.max(0, Math.min(255, luma + (Math.random() - 0.5) * 14));
    data[i + 1] = luma;
    data[i + 2] = Math.max(0, Math.min(255, luma + (Math.random() - 0.5) * 14));
    // Randomise per-pixel alpha so the texture is non-uniform.
    data[i + 3] = Math.random() * maxAlpha * 255;
  }
  nc.putImageData(imageData, 0, 0);

  // --- Apply grain, clipping OUT the screenshot area -----------------------
  ctx.save();

  // Build a clip path: outer rect (full canvas) minus the inner screenshot rect.
  // Using the even-odd rule, overlapping regions cancel out → the screenshot
  // rect is excluded from the clip, so nothing we draw will touch it.
  ctx.beginPath();
  // Outer rectangle (full canvas).
  ctx.rect(0, 0, w, h);
  // Inner rectangle (screenshot area) — drawn in the same path so even-odd
  // rule makes the intersection empty.
  const r = Math.min(contentR, contentW / 2, contentH / 2);
  ctx.moveTo(contentX + r, contentY);
  ctx.lineTo(contentX + contentW - r, contentY);
  ctx.quadraticCurveTo(contentX + contentW, contentY, contentX + contentW, contentY + r);
  ctx.lineTo(contentX + contentW, contentY + contentH - r);
  ctx.quadraticCurveTo(contentX + contentW, contentY + contentH, contentX + contentW - r, contentY + contentH);
  ctx.lineTo(contentX + r, contentY + contentH);
  ctx.quadraticCurveTo(contentX, contentY + contentH, contentX, contentY + contentH - r);
  ctx.lineTo(contentX, contentY + r);
  ctx.quadraticCurveTo(contentX, contentY, contentX + r, contentY);
  ctx.closePath();
  ctx.clip("evenodd");

  // "overlay" blend: bright noise → lighter, dark noise → darker, exactly
  // like analogue film grain interacting with the scene.
  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(noiseCanvas, 0, 0, w, h);

  ctx.restore();
}

/**
 * Draws a rounded rectangle path on the given context.
 * Radius is clamped to half the shortest side so it never exceeds the box.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
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

export const CanvasRenderer = forwardRef<
  CanvasRendererRef,
  CanvasRendererProps
>(({ image, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [containerWidth, setContainerWidth] = useState(700);
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Load image from data URL whenever the image prop changes.
  useEffect(() => {
    if (image) {
      setIsLoading(true);
      const img = new Image();
      img.onload = () => {
        setLoadedImage(img);
        setTimeout(() => setIsLoading(false), 200);
      };
      img.onerror = () => {
        setIsLoading(false);
        setLoadedImage(null);
      };
      img.src = image;
    } else {
      setLoadedImage(null);
      setIsLoading(false);
    }
  }, [image]);

  // Keep track of the container's rendered width so we can scale the preview.
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Recompute canvas dimensions when image, aspect ratio, padding, or mockup changes.
  // We base dimensions on the device frame bounding box (not raw image) so the
  // frame chrome is always fully visible.
  useEffect(() => {
    if (!loadedImage) return;
    const layout = getDeviceLayout(
      settings.deviceMockup,
      loadedImage.width,
      loadedImage.height,
      settings.borderRadius
    );
    const { width, height } = getAspectRatioDimensions(
      settings.aspectRatio,
      layout.frameWidth,
      layout.frameHeight,
      settings.padding
    );
    setCanvasSize({ width, height });
  }, [
    loadedImage,
    settings.aspectRatio,
    settings.padding,
    settings.deviceMockup,
    settings.borderRadius,
  ]);

  /**
   * Core draw routine shared by the live preview and the 2x export path.
   *
   * Drawing order:
   *   1. Background (gradient or solid colour)
   *   2. Blurred backdrop (optional glassmorphism effect)
   *   3. Drop shadow (emitted from a filled frame-shape rect)
   *   4. Device frame chrome (bezels, title bar, traffic lights, notch …)
   *   5. Screenshot clipped inside the content area
   *
   * canvasW / canvasH are the *logical* pixel dimensions of the destination
   * canvas. When exporting at 2x the context has already been scaled, so we
   * still pass the logical size here and let the scale transform handle the
   * physical pixel count.
   */
  const drawToContext = (
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number
  ) => {
    ctx.clearRect(0, 0, canvasW, canvasH);

    // --- 1. Background ---
    if (settings.useGradient) {
      const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      gradient.addColorStop(0, settings.gradientStart);
      gradient.addColorStop(1, settings.gradientEnd);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = settings.backgroundColor;
    }
    ctx.fillRect(0, 0, canvasW, canvasH);

    if (!loadedImage) return;

    const layout = getDeviceLayout(
      settings.deviceMockup,
      loadedImage.width,
      loadedImage.height,
      settings.borderRadius
    );

    // Shadow offset — only vertical so the shadow falls naturally below.
    const shadowOffsetX = 0;
    const shadowOffsetY =
      settings.shadowIntensity > 0 ? settings.shadowIntensity / 2 : 0;

    // Top-left corner of the entire device frame bounding box on the canvas.
    const { x: frameX, y: frameY } = getCenteredPosition(
      canvasW,
      canvasH,
      layout.frameWidth,
      layout.frameHeight,
      shadowOffsetX,
      shadowOffsetY
    );

    // --- 2. Blurred backdrop ---
    if (settings.blurBackground) {
      ctx.save();
      ctx.filter = "blur(40px) saturate(1.2)";
      ctx.globalAlpha = 0.7;
      ctx.drawImage(loadedImage, -80, -80, canvasW + 160, canvasH + 160);
      ctx.restore();

      // Re-apply gradient overlay with reduced opacity so the blur still shows.
      if (settings.useGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
        gradient.addColorStop(0, settings.gradientStart + "90");
        gradient.addColorStop(1, settings.gradientEnd + "90");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasW, canvasH);
      }
    }

    // Outer corner radius for the frame shadow shape.
    // When a device is active we use a fixed 14 px so the shadow follows the
    // device bezel shape; otherwise we respect the user's borderRadius slider.
    const frameOuterRadius =
      settings.deviceMockup === "none" ? settings.borderRadius : 14;

    // --- 2b. Grain overlay (background only, screenshot area excluded) ---
    if (settings.grainIntensity > 0 && loadedImage) {
      const contentX = frameX + layout.contentX;
      const contentY = frameY + layout.contentY;
      drawGrain(
        ctx,
        canvasW,
        canvasH,
        settings.grainIntensity,
        contentX,
        contentY,
        layout.contentWidth,
        layout.contentHeight,
        layout.contentRadius
      );
    }

    // --- 3. Drop shadow ---
    // We draw a filled rect with canvas shadow APIs. The rect itself is
    // immediately painted over by the frame / screenshot layers above it.
    if (settings.shadowIntensity > 0) {
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowIntensity / 100})`;
      ctx.shadowBlur = settings.shadowIntensity * 1.5;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;

      ctx.beginPath();
      roundRect(
        ctx,
        frameX,
        frameY,
        layout.frameWidth,
        layout.frameHeight,
        frameOuterRadius
      );
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.restore();
    }

    // --- 4. Device frame chrome ---
    if (settings.deviceMockup !== "none") {
      const colors = getDeviceColors(isDark);
      drawDeviceFrame(
        ctx,
        settings.deviceMockup,
        frameX,
        frameY,
        layout,
        colors,
        frameOuterRadius
      );
    }

    // --- 5. Screenshot (clipped to content area) ---
    const contentX = frameX + layout.contentX;
    const contentY = frameY + layout.contentY;

    ctx.save();
    ctx.beginPath();
    roundRect(
      ctx,
      contentX,
      contentY,
      layout.contentWidth,
      layout.contentHeight,
      layout.contentRadius
    );
    ctx.clip();
    ctx.drawImage(
      loadedImage,
      contentX,
      contentY,
      layout.contentWidth,
      layout.contentHeight
    );
    ctx.restore();
  };

  // Trigger a preview redraw whenever any relevant state changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawToContext(ctx, canvas.width, canvas.height);
    // drawToContext is reconstructed on every render; listing its captured
    // dependencies directly is more reliable than listing the function itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedImage, settings, canvasSize, isDark]);

  // Expose exportImage to parent via ref.
  useImperativeHandle(ref, () => ({
    exportImage: (
      format: "png" | "jpeg" | "webp" = "png",
      quality: number = 0.95
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || !loadedImage) return null;

      // Create a 2x resolution off-screen canvas for crisp retina exports.
      const exportCanvas = document.createElement("canvas");
      const scale = 2;
      exportCanvas.width = canvas.width * scale;
      exportCanvas.height = canvas.height * scale;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return null;

      // Scale the context so drawToContext can use logical pixel coordinates
      // unchanged — the transform handles the physical 2x pixel count.
      ctx.scale(scale, scale);
      drawToContext(ctx, canvas.width, canvas.height);

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "jpeg"
            ? "image/jpeg"
            : "image/webp";
      return exportCanvas.toDataURL(mimeType, quality);
    },
  }));

  // Scale the preview canvas to fit inside the panel without overflow.
  const maxWidth = containerWidth - 48;
  const previewScale = Math.min(1, maxWidth / canvasSize.width);
  const displayWidth = Math.round(canvasSize.width * previewScale);
  const displayHeight = Math.round(canvasSize.height * previewScale);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full min-h-[360px] p-5 bg-gradient-to-br from-background to-accent/10 rounded-xl border border-border/60"
    >
      <div
        className="relative rounded-lg overflow-hidden bg-card/80"
        style={{
          width: displayWidth,
          height: displayHeight,
          boxShadow: image
            ? "0 12px 40px -22px rgba(0, 0, 0, 0.45)"
            : "0 0 0 1px hsl(var(--border) / 0.7)",
          opacity: isLoading ? 0.85 : 1,
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ width: displayWidth, height: displayHeight }}
          className="block"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">
                Processing...
              </p>
            </div>
          </div>
        )}

        {!image && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/90 backdrop-blur-sm border-2 border-dashed border-border/50 rounded-xl">
            <div className="p-4 rounded-full bg-muted/50">
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="text-center px-6">
              <p className="text-muted-foreground font-medium">Preview Area</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Upload a screenshot to see the magic
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CanvasRenderer.displayName = "CanvasRenderer";
