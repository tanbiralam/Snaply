"use client";

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { StyleSettings, CodeSettings } from "@/types";
import { Code } from "lucide-react";
import {
  tokenizeCode,
  type TokenizedCode,
} from "@/lib/codeHighlighter";
import { ZoomBar, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "@/components/ZoomBar";
import { angleToGradientPoints, drawImageCover } from "@/lib/canvasHelpers";
import { toast } from "sonner";


const TITLE_BAR_HEIGHT = 40;
const DOT_RADIUS = 6;
const DOT_GAP = 8;
const DOT_LEFT = 16;
const CODE_PAD_X = 20;
const CODE_PAD_Y = 14;
const LINE_NUM_PAD = 12;
const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', 'Consolas', monospace";


interface CodeCanvasRendererProps {
  settings: StyleSettings;
  codeSettings: CodeSettings;
}

export interface CodeCanvasRendererRef {
  exportImage: (format?: "png" | "jpeg" | "webp", quality?: number) => string | null;
}


export const CodeCanvasRenderer = forwardRef<CodeCanvasRendererRef, CodeCanvasRendererProps>(
  ({ settings, codeSettings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoFitScaleRef = useRef(1);
    const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [tokenized, setTokenized] = useState<TokenizedCode | null>(null);
    const [loadedBgImage, setLoadedBgImage] = useState<HTMLImageElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
    const [containerWidth, setContainerWidth] = useState(700);
    const [containerHeight, setContainerHeight] = useState(500);
    const [zoomLevel, setZoomLevel] = useState<number | null>(null);

    const code = codeSettings.codeContent;
    const hasCode = code.trim().length > 0;

    useEffect(() => {
      if (!hasCode) {
        setTokenized(null);
        return;
      }
      let cancelled = false;
      // ponytail: debounce so typing doesn't re-run Shiki on every keystroke.
      const t = setTimeout(() => {
        tokenizeCode(code, codeSettings.codeLanguage, codeSettings.codeTheme)
          .then((result) => {
            if (!cancelled) setTokenized(result);
          })
          .catch(() => {
            // Keep the previous render; just surface that highlighting failed.
            if (!cancelled) {
              toast.error("Couldn't highlight code", {
                description: "Syntax highlighting failed to load",
              });
            }
          });
      }, 150);
      return () => { cancelled = true; clearTimeout(t); };
    }, [code, codeSettings.codeLanguage, codeSettings.codeTheme, hasCode]);

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

    // ponytail: measure every token once here (was measured 3× per redraw —
    // size effect + draw bounds + draw advance). Carries per-token x offsets so
    // the draw loop never calls measureText again.
    const layout = useMemo(() => {
      if (!tokenized) return null;
      const canvas =
        measureCanvasRef.current ??
        (measureCanvasRef.current = document.createElement("canvas"));
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const fontSize = codeSettings.codeFontSize;
      ctx.font = `${fontSize}px ${FONT_FAMILY}`;
      const lineHeight = Math.round(fontSize * 1.7);

      let maxLineWidth = 0;
      const lines = tokenized.lines.map((lineTokens) => {
        let x = 0;
        const tokens = lineTokens.map((token) => {
          const entry = { content: token.content, color: token.color, x };
          x += ctx.measureText(token.content).width;
          return entry;
        });
        maxLineWidth = Math.max(maxLineWidth, x);
        return tokens;
      });

      const lineNumWidth = codeSettings.codeShowLineNumbers
        ? ctx.measureText(String(lines.length)).width + LINE_NUM_PAD * 2
        : 0;

      const blockW = Math.ceil(lineNumWidth + maxLineWidth + CODE_PAD_X * 2);
      const blockH = Math.ceil(lines.length * lineHeight + CODE_PAD_Y * 2 + TITLE_BAR_HEIGHT);

      return { lines, lineHeight, lineNumWidth, blockW, blockH };
    }, [tokenized, codeSettings.codeFontSize, codeSettings.codeShowLineNumbers]);

    useEffect(() => {
      if (!layout || !hasCode) return;
      const w = layout.blockW + settings.padding * 2;
      const h = layout.blockH + settings.padding * 2;
      setCanvasSize({ width: Math.max(400, w), height: Math.max(200, h) });
    }, [layout, settings.padding, hasCode]);

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

    const drawToContext = useCallback(
      (ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) => {
        ctx.clearRect(0, 0, canvasW, canvasH);

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

        if (!tokenized || !layout || !hasCode) return;

        const fontSize = codeSettings.codeFontSize;
        ctx.font = `${fontSize}px ${FONT_FAMILY}`;

        const { lines, lineHeight, lineNumWidth, blockW, blockH } = layout;

        const blockX = Math.round((canvasW - blockW) / 2);
        const blockY = Math.round((canvasH - blockH) / 2);
        const borderRadius = Math.min(settings.borderRadius, blockW / 2, blockH / 2);
        if (settings.shadowIntensity > 0) {
          ctx.save();
          ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowIntensity / 100})`;
          ctx.shadowBlur = settings.shadowIntensity * 1.5;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = settings.shadowIntensity / 2;
          ctx.beginPath();
          ctx.roundRect(blockX, blockY, blockW, blockH, borderRadius);
          ctx.fillStyle = tokenized.bg;
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, borderRadius);
        ctx.clip();
        ctx.fillStyle = tokenized.bg;
        ctx.fillRect(blockX, blockY, blockW, blockH);

        const tbY = blockY;
        ctx.fillStyle = darken(tokenized.bg, 0.08);
        ctx.fillRect(blockX, tbY, blockW, TITLE_BAR_HEIGHT);

        ctx.fillStyle = lighten(tokenized.bg, 0.06);
        ctx.fillRect(blockX, tbY + TITLE_BAR_HEIGHT - 1, blockW, 1);

        const dotY = tbY + TITLE_BAR_HEIGHT / 2;
        const colors = ["#ff5f57", "#febc2e", "#28c840"];
        colors.forEach((c, i) => {
          ctx.beginPath();
          ctx.arc(blockX + DOT_LEFT + i * (DOT_RADIUS * 2 + DOT_GAP) + DOT_RADIUS, dotY, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = c;
          ctx.fill();
        });

        if (codeSettings.codeWindowTitle) {
          ctx.fillStyle = adjustAlpha(tokenized.fg, 0.5);
          ctx.font = `${Math.max(11, fontSize - 2)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(codeSettings.codeWindowTitle, blockX + blockW / 2, dotY + 4);
          ctx.textAlign = "start";
          ctx.font = `${fontSize}px ${FONT_FAMILY}`;
        }

        const codeStartY = tbY + TITLE_BAR_HEIGHT + CODE_PAD_Y + fontSize;
        const codeStartX = blockX + CODE_PAD_X;

        lines.forEach((lineTokens, lineIdx) => {
          const y = codeStartY + lineIdx * lineHeight;

          if (codeSettings.codeShowLineNumbers) {
            ctx.fillStyle = adjustAlpha(tokenized.fg, 0.3);
            ctx.textAlign = "right";
            ctx.fillText(String(lineIdx + 1), codeStartX + lineNumWidth - LINE_NUM_PAD, y);
            ctx.textAlign = "start";
          }

          const lineX = codeStartX + lineNumWidth;
          for (const token of lineTokens) {
            ctx.fillStyle = token.color;
            ctx.fillText(token.content, lineX + token.x, y);
          }
        });

        ctx.restore();
      },
       
      [tokenized, layout, loadedBgImage, settings, codeSettings, hasCode]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawToContext(ctx, canvas.width, canvas.height);
    }, [drawToContext, canvasSize]);

    useImperativeHandle(ref, () => ({
      exportImage: (format: "png" | "jpeg" | "webp" = "png", quality = 0.95) => {
        const canvas = canvasRef.current;
        if (!canvas || !hasCode) return null;
        const exp = document.createElement("canvas");
        exp.width = canvas.width * 2;
        exp.height = canvas.height * 2;
        const ctx = exp.getContext("2d");
        if (!ctx) return null;
        ctx.scale(2, 2);
        drawToContext(ctx, canvas.width, canvas.height);
        const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
        return exp.toDataURL(mime, quality);
      },
    }));

    const availableW = Math.max(120, containerWidth - 48);
    const availableH = Math.max(120, containerHeight - 96);
    const autoFitScale = Math.min(1, availableW / canvasSize.width, availableH / canvasSize.height);
    autoFitScaleRef.current = autoFitScale;

    const effectiveScale = zoomLevel ?? autoFitScale;
    const displayWidth = Math.round(canvasSize.width * effectiveScale);
    const displayHeight = Math.round(canvasSize.height * effectiveScale);

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
            boxShadow: hasCode
              ? "0 12px 40px -22px rgba(0, 0, 0, 0.45)"
              : "0 0 0 1px hsl(var(--border) / 0.7)",
            opacity: 1,
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ width: displayWidth, height: displayHeight }}
            className="block"
          />

          {!hasCode && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/90 backdrop-blur-sm border-2 border-dashed border-border/50 rounded-xl">
              <div className="p-4 rounded-full bg-muted/50">
                <Code className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="text-center px-6">
                <p className="text-muted-foreground font-medium">Code Preview</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Paste a code snippet to see the magic</p>
              </div>
            </div>
          )}
        </div>

        {hasCode && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <ZoomBar zoom={zoomLevel} autoFitScale={autoFitScale} onZoomChange={setZoomLevel} />
          </div>
        )}
      </div>
    );
  }
);

CodeCanvasRenderer.displayName = "CodeCanvasRenderer";

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  return `rgb(${Math.max(0, Math.round(rgb.r * (1 - amount)))}, ${Math.max(0, Math.round(rgb.g * (1 - amount)))}, ${Math.max(0, Math.round(rgb.b * (1 - amount)))})`;
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  return `rgb(${Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount))}, ${Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount))}, ${Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))})`;
}

function adjustAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}
