"use client";

// ponytail: the ~40MB model is dynamic-imported on first run only (per architecture
// invariant 4) — never at module top level. The user's image never leaves the browser;
// only the model weights are fetched.

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { toast } from "sonner";
import { Download, ImageIcon, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

type Status = "idle" | "processing" | "done" | "error";

// Checkerboard so transparency is visible. Content, not UI chrome — kept inline.
const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
  backgroundColor: "#fff",
};

export default function RemoveBackgroundEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const resultRef = useRef<string | null>(null);

  const run = useCallback(async (dataUrl: string) => {
    setStatus("processing");
    setProgress(0);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(dataUrl, {
        // ponytail: WebGPU when available (much faster than CPU/WASM); the lib
        // falls back to CPU automatically where WebGPU is unsupported.
        device: "gpu",
        progress: (_key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });
      if (resultRef.current) URL.revokeObjectURL(resultRef.current);
      const url = URL.createObjectURL(blob);
      resultRef.current = url;
      setResult(url);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error("Background removal failed");
    }
  }, []);

  const handleImageUpload = useCallback(
    (dataUrl: string) => {
      setImage(dataUrl);
      setResult(null);
      run(dataUrl);
    },
    [run]
  );

  // Paste-to-upload, matching the other editors.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (dataUrl) {
              handleImageUpload(dataUrl);
              toast.success("Screenshot pasted!");
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleImageUpload]);

  // Revoke the last object URL on unmount.
  useEffect(() => {
    return () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current);
    };
  }, []);

  const download = useCallback(() => {
    if (!resultRef.current) return;
    const a = document.createElement("a");
    a.href = resultRef.current;
    a.download = `${site.name.toLowerCase()}-cutout-${Date.now()}.png`;
    a.click();
  }, []);

  const reset = useCallback(() => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current);
    resultRef.current = null;
    setImage(null);
    setResult(null);
    setStatus("idle");
    setProgress(0);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <BrandMark />
        <span className="text-sm text-muted-foreground">Remove Background</span>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-auto bg-muted/60 p-4 md:p-6 lg:p-8">
        {!image ? (
          <div className="w-full max-w-lg">
            <ImageUpload
              onImageUpload={handleImageUpload}
              hasImage={false}
              label="image"
            />
          </div>
        ) : (
          <>
            <div
              className="relative flex max-h-full min-h-0 items-center justify-center overflow-hidden rounded-lg shadow-modal"
              style={CHECKER}
            >
              <img
                src={result ?? image}
                alt={result ? "Background removed" : "Original"}
                className="block max-h-[60vh] max-w-full object-contain"
                style={{ opacity: status === "processing" ? 0.4 : 1 }}
              />
              {status === "processing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Removing background…
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progress > 0
                        ? `${progress}%`
                        : "Loading model (first run downloads ~40MB)"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Replace
              </button>
              {status === "error" && (
                <button
                  type="button"
                  onClick={() => image && run(image)}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={download}
                disabled={status !== "done"}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
