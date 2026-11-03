"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import {
  DEFAULT_PRECISION,
  SVG_MAX_BYTES,
  SVG_PRECISION,
  looksLikeSvg,
  optimizeSvg,
} from "@/lib/svg";
import { site } from "@/lib/site";
import { cn, formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import { Copy, Download, FileCode, Loader2, RotateCcw, Upload } from "lucide-react";

const STORAGE_KEY = "svg-optimizer";

// Checkerboard so transparent areas are visible. Content, not UI chrome — kept inline.
const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
  backgroundColor: "#fff",
};

const kicker =
  "mb-2 block font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const ghostBtn =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border hairline text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50";

const bytes = (s: string) => new Blob([s]).size;

/** Blob URL rendered through <img>, so scripts inside the SVG never execute. */
function useSvgUrl(svg: string | null) {
  const url = useMemo(
    () => (svg ? URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })) : null),
    [svg]
  );
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return url;
}

export default function SvgOptimizerEditor() {
  const [source, setSource] = useState<{ name: string; text: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState("");
  const [dragging, setDragging] = useState(false);
  const [precision, setPrecision] = useState(DEFAULT_PRECISION);

  useEffect(() => {
    try {
      const p = Number(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").precision);
      if (Number.isInteger(p) && p >= SVG_PRECISION[0] && p <= SVG_PRECISION[1]) setPrecision(p);
    } catch {
      /* corrupt or blocked storage — keep the default */
    }
  }, []);

  const changePrecision = (p: number) => {
    setPrecision(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ precision: p }));
    } catch {
      /* storage blocked — setting just won't persist */
    }
  };

  // Re-run on new input or precision change. The latest run wins.
  useEffect(() => {
    if (!source) return;
    let alive = true;
    setBusy(true);
    optimizeSvg(source.text, precision)
      .then((out) => alive && setResult(out))
      .catch((e: Error) => {
        if (!alive) return;
        toast.error(e.message);
        setSource(null);
        setResult(null);
      })
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [source, precision]);

  const load = useCallback((name: string, text: string) => {
    if (!looksLikeSvg(text)) return toast.error("That doesn't look like an SVG file.");
    setResult(null);
    setSource({ name: name.replace(/\.svg$/i, ""), text });
  }, []);

  const onFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (file.type !== "image/svg+xml" && !/\.svg$/i.test(file.name))
        return toast.error("Choose an .svg file");
      if (file.size > SVG_MAX_BYTES)
        return toast.error(`SVGs up to ${SVG_MAX_BYTES / 1024 / 1024} MB are supported`);
      load(file.name, await file.text());
    },
    [load]
  );

  // Pasting SVG markup anywhere on the empty state loads it.
  useEffect(() => {
    if (source) return;
    const onPaste = (e: ClipboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      const text = e.clipboardData?.getData("text/plain");
      if (text && looksLikeSvg(text)) {
        e.preventDefault();
        load("pasted", text);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [source, load]);

  const beforeUrl = useSvgUrl(source?.text ?? null);
  const afterUrl = useSvgUrl(result);

  const before = source ? bytes(source.text) : 0;
  const after = result ? bytes(result) : 0;
  const saved = before ? Math.round((1 - after / before) * 100) : 0;

  const download = () => {
    if (!result || !source) return;
    const url = URL.createObjectURL(new Blob([result], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${source.name === "pasted" ? site.name.toLowerCase() : source.name}.min.svg`;
    a.click();
    // Revoking synchronously can cancel the download in Safari.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success("SVG markup copied");
    } catch {
      toast.error("Your browser blocked clipboard access — use Download instead");
    }
  };

  const reset = () => {
    setSource(null);
    setResult(null);
    setPaste("");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <BrandMark />
        <span className="text-sm text-muted-foreground">SVG Optimizer</span>
        <ThemeToggle />
      </header>

      {!source ? (
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-muted/60 p-4 md:p-6">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex w-full max-w-lg cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-background p-10 text-center transition-colors",
              dragging ? "border-primary bg-secondary" : "hairline hover:bg-secondary"
            )}
          >
            <input
              type="file"
              accept=".svg,image/svg+xml"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
              className="sr-only"
            />
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Drop an SVG, or click to choose
            </span>
            <span className="text-xs text-muted-foreground">
              Strips editor metadata, rounds numbers, simplifies paths. Up to{" "}
              {SVG_MAX_BYTES / 1024 / 1024} MB, processed in your browser.
            </span>
          </label>

          <div className="w-full max-w-lg">
            <span className={kicker}>Or paste SVG markup</span>
            <textarea
              rows={5}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" …'
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            />
            <button
              type="button"
              disabled={!paste.trim()}
              onClick={() => load("pasted", paste)}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
            >
              <FileCode className="h-4 w-4" />
              Optimize markup
            </button>
          </div>
        </main>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <main className="grid min-w-0 flex-1 grid-cols-1 gap-4 overflow-auto bg-muted/60 p-4 sm:grid-cols-2 md:p-6 lg:p-8">
            {(
              [
                ["Original", beforeUrl, before],
                ["Optimized", afterUrl, after],
              ] as const
            ).map(([label, url, size]) => (
              <figure key={label} className="flex min-h-0 flex-col gap-2">
                <figcaption className="flex justify-between font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                  {label}
                  <span>{size ? formatBytes(size) : "—"}</span>
                </figcaption>
                <div
                  className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg p-4 shadow-modal"
                  style={CHECKER}
                >
                  {url && (
                    <img src={url} alt={`${label} SVG`} className="max-h-full max-w-full object-contain" />
                  )}
                  {label === "Optimized" && busy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                    </div>
                  )}
                </div>
              </figure>
            ))}
          </main>

          <aside className="shrink-0 overflow-y-auto border-t hairline lg:w-72 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-5 p-4">
              <div>
                <span className={kicker}>Result</span>
                <p className="text-2xl font-semibold text-foreground" aria-live="polite">
                  {result ? (saved > 0 ? `−${saved}%` : "Already optimal") : "…"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result
                    ? `${formatBytes(before)} → ${formatBytes(after)}`
                    : "Optimizing…"}
                </p>
              </div>

              <label className="block">
                <span className={cn(kicker, "flex justify-between")}>
                  Decimal precision
                  <span className="normal-case">{precision}</span>
                </span>
                <input
                  type="range"
                  min={SVG_PRECISION[0]}
                  max={SVG_PRECISION[1]}
                  step={1}
                  value={precision}
                  onChange={(e) => changePrecision(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  Lower is smaller. Compare the previews if you go below 2.
                </span>
              </label>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex gap-2">
                  <button type="button" onClick={reset} className={ghostBtn}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    New SVG
                  </button>
                  <button type="button" onClick={copy} disabled={!result} className={ghostBtn}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
                <button
                  type="button"
                  onClick={download}
                  disabled={!result || busy}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download SVG
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
