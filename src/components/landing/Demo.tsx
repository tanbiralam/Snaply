import { Clipboard, Sparkles } from "lucide-react";
import MockScreenshot from "./MockScreenshot";

const Demo = () => {
  return (
    <section id="demo" className="border-t hairline bg-secondary/40">
      <div className="container py-20 sm:py-28">
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-muted-foreground mb-3">The editor</p>
          <h2 className="font-serif-display text-4xl sm:text-5xl tracking-tight">
            Same product, <span className="italic">just simplified.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            What you see here is what you get when you open Snaply. Hit{" "}
            <kbd className="px-1.5 py-0.5 rounded border hairline bg-background text-xs font-medium">
              ⌘V
            </kbd>{" "}
            — pick a preset — export.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 items-center">
          {/* Faux controls */}
          <div className="rounded-2xl border hairline bg-background p-5 shadow-soft flex flex-col gap-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clipboard className="w-4 h-4 text-primary" />
              Paste screenshot
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                ⌘V
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Background</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  "bg-gradient-canvas",
                  "bg-gradient-canvas-soft",
                  "bg-[hsl(220_70%_55%)]",
                  "bg-[hsl(150_40%_45%)]",
                  "bg-foreground",
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md ${c} ring-1 ring-black/5 ${i === 0 ? "ring-2 ring-foreground" : ""}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Frame</p>
              <div className="space-y-1.5">
                {[
                  ["Browser", true],
                  ["iPhone", false],
                  ["None", false],
                ].map(([label, active]) => (
                  <div
                    key={label as string}
                    className={`text-sm px-3 py-2 rounded-md flex items-center justify-between ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                  >
                    {label}
                    {active && (
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto pt-4 border-t hairline text-xs text-muted-foreground">
              Padding · Shadow · Rounded — all live.
            </div>
          </div>

          <MockScreenshot framed />
        </div>
      </div>
    </section>
  );
};

export default Demo;
