"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { dataUrlToBlob } from "@/lib/utils";
import { readMetadata, stripMetadata, type MetadataResult } from "@/lib/exif";
import { toast } from "sonner";
import { Download, ImageIcon, MapPin, ShieldCheck, ShieldOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MetadataEditor() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<MetadataResult | null>(null);
  const [mime, setMime] = useState<string>("image/jpeg");
  const bytesRef = useRef<Uint8Array | null>(null);

  const handleUpload = useCallback(async (url: string) => {
    setDataUrl(url);
    setMeta(null);
    const blob = dataUrlToBlob(url);
    setMime(blob.type);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    bytesRef.current = bytes;
    setMeta(readMetadata(bytes));
  }, []);

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
            const url = ev.target?.result as string;
            if (url) {
              handleUpload(url);
              toast.success("Image pasted!");
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
  }, [handleUpload]);

  const downloadClean = useCallback(() => {
    if (!bytesRef.current) return;
    const stripped = stripMetadata(bytesRef.current);
    const blob = new Blob([stripped], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.name.toLowerCase()}-clean-${Date.now()}.${mime === "image/png" ? "png" : "jpg"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Metadata removed", { description: "Downloaded a clean copy" });
  }, [mime]);

  const reset = useCallback(() => {
    bytesRef.current = null;
    setDataUrl(null);
    setMeta(null);
  }, []);

  const hasFindings = !!meta && (meta.groups.length > 0 || meta.gps !== null);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b hairline px-5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt={`${site.name} logo`}
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
            priority
          />
          <span className="font-semibold tracking-tight text-[15px]">{site.name}</span>
        </Link>
        <span className="text-sm text-muted-foreground">Metadata Viewer</span>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/60 p-4 md:p-6 lg:p-8">
        {!dataUrl ? (
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4">
            <ImageUpload onImageUpload={handleUpload} hasImage={false} />
            <p className="text-center text-xs text-muted-foreground">
              JPEG and PNG are supported. Processed entirely in your browser — nothing is uploaded.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 md:flex-row md:items-start">
            <div className="flex flex-col items-center gap-3 md:sticky md:top-0 md:w-1/2">
              <div className="w-full overflow-hidden rounded-xl border hairline bg-card shadow-modal">
                <img src={dataUrl} alt="Uploaded" className="block max-h-[60vh] w-full object-contain" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={downloadClean}
                  disabled={!meta || meta.format === "unsupported"}
                  className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download clean copy
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 md:w-1/2">
              {!meta ? null : meta.format === "unsupported" ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border hairline bg-card p-8 text-center">
                  <ShieldOff className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Format not supported yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Metadata inspection currently supports JPEG and PNG.
                    </p>
                  </div>
                </div>
              ) : !hasFindings ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border hairline bg-card p-8 text-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No metadata found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This file is already clean.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {meta.gps && (
                    <div className="rounded-xl border hairline bg-card p-4">
                      <p className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        Location
                      </p>
                      <p className="font-mono text-sm text-foreground">
                        {meta.gps.lat.toFixed(5)}, {meta.gps.lon.toFixed(5)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${meta.gps.lat},${meta.gps.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-primary hover:underline"
                      >
                        View on map ↗
                      </a>
                    </div>
                  )}

                  {meta.groups.map((group) => (
                    <div key={group.label} className="rounded-xl border hairline bg-card p-4">
                      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </p>
                      <dl className="space-y-2">
                        {group.tags.map((tag) => (
                          <div key={tag.label} className="flex items-start justify-between gap-4 text-sm">
                            <dt className="shrink-0 text-muted-foreground">{tag.label}</dt>
                            <dd className="truncate text-right font-medium text-foreground" title={tag.value}>
                              {tag.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
