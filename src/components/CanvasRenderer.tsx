"use client";

import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { StyleSettings } from "@/types";
import { ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  drawDeviceFrame,
  getDeviceColors,
  getDeviceLayout,
} from "@/lib/deviceMockups";
import {
  getCenteredPosition,
  getAspectRatioDimensions,
  roundRect,
  drawGrain,
  drawImageLetterboxed,
  drawImageCover,
  angleToGradientPoints,
} from "@/lib/canvasHelpers";
import { ZoomBar, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "@/components/ZoomBar";
import { toast } from "sonner";

// ─── Public types ─────────────────────────────────────────────────────────────

interface CanvasRendererProps {
  image: string | null;
  settings: StyleSettings;
}

export interface CanvasRendererRef {
  exportImage: (format?: "png" | "jpeg" | "webp", quality?: number) => string | null;
  getImageAspectRatio: () => number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CanvasRenderer = forwardRef<CanvasRendererRef, CanvasRendererProps>(
  ({ image, settings }, ref) => {
    const canvasRef       = useRef<HTMLCanvasElement>(null);
    const containerRef    = useRef<HTMLDivElement>(null);
    const autoFitScaleRef = useRef(1);

    const [loadedImage,    setLoadedImage]    = useState<HTMLImageElement | null>(null);
    const [loadedBgImage,  setLoadedBgImage]  = useState<HTMLImageElement | null>(null);
    const [canvasSize,     setCanvasSize]     = useState({ width: 800, height: 500 });
    const [containerWidth, setContainerWidth] = useState(700);
    const [containerHeight,setContainerHeight]= useState(500);
    const [isLoading,      setIsLoading]      = useState(false);
    const [zoomLevel,      setZoomLevel]      = useState<number | null>(null);

    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    // ── Load image ──────────────────────────────────────────────────────────
    useEffect(() => {
      if (image) {
        setIsLoading(true);
        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
          setZoomLevel(null);
          setTimeout(() => setIsLoading(false), 200);
        };
        img.onerror = () => {
          setIsLoading(false);
          setLoadedImage(null);
          toast.error("Couldn't load that image", {
            description: "The file may be corrupted or in an unsupported format",
          });
        };
        img.src = image;
      } else {
        setLoadedImage(null);
        setIsLoading(false);
        setZoomLevel(null);
      }
    }, [image]);

    // ── Load background image (for image-based presets) ─────────────────────
    useEffect(() => {
      const src = settings.backgroundImage;
      if (!src) {
        setLoadedBgImage(null);
        return;
      }
      const bg = new Image();
      bg.onload = () => setLoadedBgImage(bg);
      bg.onerror = () => {
        setLoadedBgImage(null);
        toast.error("Couldn't load background image", {
          description: "Falling back to the gradient background",
        });
      };
      bg.src = src;
    }, [settings.backgroundImage]);

    // ── Track container size ────────────────────────────────────────────────
    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.clientWidth);
          setContainerHeight(containerRef.current.clientHeight);
        }
      };
      updateSize();
      const ro = new ResizeObserver(updateSize);
      if (containerRef.current) ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, []);

    // ── Recompute canvas size ───────────────────────────────────────────────
    useEffect(() => {
      if (!loadedImage) return;
      const layout = getDeviceLayout(
        settings.deviceMockup, loadedImage.width, loadedImage.height, settings.borderRadius
      );
      const { width, height } = getAspectRatioDimensions(
        settings.aspectRatio, layout.frameWidth, layout.frameHeight, settings.padding
      );
      setCanvasSize({ width, height });
    }, [loadedImage, settings.aspectRatio, settings.padding, settings.deviceMockup, settings.borderRadius]);

    // ── Ctrl/Cmd + wheel zoom ───────────────────────────────────────────────
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setZoomLevel((prev) => {
          const base = prev ?? autoFitScaleRef.current;
          const next = Math.round((base + delta) * 10) / 10;
          return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
        });
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }, []);

    // ── Core draw routine ───────────────────────────────────────────────────
    const drawToContext = useCallback(
      (ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) => {
        ctx.clearRect(0, 0, canvasW, canvasH);

        // 1. Background
        if (settings.backgroundImage && loadedBgImage) {
          drawImageCover(ctx, loadedBgImage, canvasW, canvasH);
        } else if (settings.useGradient) {
          const [x0, y0, x1, y1] = angleToGradientPoints(settings.gradientAngle ?? 135, canvasW, canvasH);
          const g = ctx.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, settings.gradientStart);
          g.addColorStop(1, settings.gradientEnd);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, canvasW, canvasH);
        } else {
          ctx.fillStyle = settings.backgroundColor;
          ctx.fillRect(0, 0, canvasW, canvasH);
        }
        if (!loadedImage) return;

        const layout = getDeviceLayout(
          settings.deviceMockup, loadedImage.width, loadedImage.height, settings.borderRadius
        );
        const shadowOffsetX = 0;
        const shadowOffsetY = settings.shadowIntensity > 0 ? settings.shadowIntensity / 2 : 0;
        const { x: frameX, y: frameY } = getCenteredPosition(
          canvasW, canvasH, layout.frameWidth, layout.frameHeight, shadowOffsetX, shadowOffsetY
        );

        // 2. Blurred backdrop
        if (settings.blurBackground) {
          ctx.save();
          ctx.filter = "blur(40px) saturate(1.2)";
          ctx.globalAlpha = 0.7;
          ctx.drawImage(loadedImage, -80, -80, canvasW + 160, canvasH + 160);
          ctx.restore();
          if (settings.useGradient) {
            const [x0, y0, x1, y1] = angleToGradientPoints(settings.gradientAngle ?? 135, canvasW, canvasH);
            const g = ctx.createLinearGradient(x0, y0, x1, y1);
            g.addColorStop(0, settings.gradientStart + "90");
            g.addColorStop(1, settings.gradientEnd + "90");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, canvasW, canvasH);
          }
        }

        const frameOuterRadius = settings.deviceMockup === "none" ? settings.borderRadius : 14;

        // 2b. Grain overlay (background only)
        if (settings.grainIntensity > 0) {
          drawGrain(
            ctx, canvasW, canvasH, settings.grainIntensity,
            frameX + layout.contentX, frameY + layout.contentY,
            layout.contentWidth, layout.contentHeight, layout.contentRadius
          );
        }

        // 3. Drop shadow
        if (settings.shadowIntensity > 0) {
          ctx.save();
          ctx.shadowColor   = `rgba(0, 0, 0, ${settings.shadowIntensity / 100})`;
          ctx.shadowBlur    = settings.shadowIntensity * 1.5;
          ctx.shadowOffsetX = shadowOffsetX;
          ctx.shadowOffsetY = shadowOffsetY;
          ctx.beginPath();
          roundRect(ctx, frameX, frameY, layout.frameWidth, layout.frameHeight, frameOuterRadius);
          ctx.fillStyle = "white";
          ctx.fill();
          ctx.restore();
        }

        // 4. Device frame chrome
        if (settings.deviceMockup !== "none") {
          drawDeviceFrame(ctx, settings.deviceMockup, frameX, frameY, layout, getDeviceColors(isDark), frameOuterRadius, settings.browserUrl);
        }

        // 5. Screenshot — letterboxed
        drawImageLetterboxed(
          ctx, loadedImage,
          frameX + layout.contentX, frameY + layout.contentY,
          layout.contentWidth, layout.contentHeight, layout.contentRadius
        );
      },
       
      [loadedImage, loadedBgImage, settings, isDark]
    );

    // ── Redraw on change ────────────────────────────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawToContext(ctx, canvas.width, canvas.height);
    }, [drawToContext, canvasSize]);

    // ── Imperative API ──────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      exportImage: (format: "png" | "jpeg" | "webp" = "png", quality = 0.95) => {
        const canvas = canvasRef.current;
        if (!canvas || !loadedImage) return null;
        const exp = document.createElement("canvas");
        exp.width  = canvas.width  * 2;
        exp.height = canvas.height * 2;
        const ctx = exp.getContext("2d");
        if (!ctx) return null;
        ctx.scale(2, 2);
        drawToContext(ctx, canvas.width, canvas.height);
        const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
        return exp.toDataURL(mime, quality);
      },
      getImageAspectRatio: () => loadedImage ? loadedImage.width / loadedImage.height : null,
    }));

    // ── Zoom / scale calculations ───────────────────────────────────────────
    const availableW = Math.max(120, containerWidth  - 48);
    const availableH = Math.max(120, containerHeight - 96);
    const autoFitScale = Math.min(1, availableW / canvasSize.width, availableH / canvasSize.height);
    autoFitScaleRef.current = autoFitScale;

    const effectiveScale = zoomLevel ?? autoFitScale;
    const displayWidth   = Math.round(canvasSize.width  * effectiveScale);
    const displayHeight  = Math.round(canvasSize.height * effectiveScale);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        className="relative flex w-full flex-1 flex-col items-center justify-center min-h-[360px] bg-gradient-to-br from-background to-accent/10 rounded-xl border border-border/60 overflow-hidden"
      >
        <div
          className="relative rounded-lg overflow-hidden bg-card/80 transition-shadow duration-200"
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
                <p className="text-sm text-muted-foreground font-medium">Processing...</p>
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
                <p className="text-sm text-muted-foreground/70 mt-1">Upload a screenshot to see the magic</p>
              </div>
            </div>
          )}
        </div>

        {image && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <ZoomBar zoom={zoomLevel} autoFitScale={autoFitScale} onZoomChange={setZoomLevel} />
          </div>
        )}
      </div>
    );
  }
);

CanvasRenderer.displayName = "CanvasRenderer";
