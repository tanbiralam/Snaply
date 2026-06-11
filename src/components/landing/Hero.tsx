import {
  ArrowRight,
  Clipboard,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Square,
  Download,
} from "lucide-react";
import Link from "next/link";
import MockScreenshot from "./MockScreenshot";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-paper-glow pointer-events-none" />
      <div className="container relative pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <div className="reveal inline-flex items-center gap-2 text-xs text-muted-foreground border hairline rounded-full px-3 py-1 mb-6 bg-background/70 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              No login. No setup. Just{" "}
              <kbd className="font-medium text-foreground">⌘V</kbd>.
            </div>
            <h1 className="reveal reveal-delay-1 font-serif-display text-5xl sm:text-6xl md:text-[64px] leading-[1.02] tracking-tight">
              Paste a screenshot.
              <br />
              <span className="italic">Get a polished visual</span> instantly.
            </h1>
            <p className="reveal reveal-delay-2 mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Snaply turns flat screenshots into share-ready images — gradients,
              device frames, shadows, and export. All in your browser.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/editor"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-foreground text-background font-medium shadow-soft hover:opacity-90 transition-all"
              >
                Try Snaply
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="https://github.com/tanbiralam/Snaply-Screenshot-Stylizer"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border hairline text-foreground hover:bg-secondary transition-colors"
                target="_blank"
              >
                Github
              </Link>
            </div>
          </div>

          {/* Right: app-like editor preview */}
          <div className="reveal reveal-delay-3 lg:col-span-6">
            <AppPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

/** A miniature, structured replica of the Snaply editor — mirrors the real app layout. */
const AppPreview = () => {
  return (
    <div className="relative rounded-2xl border hairline bg-background shadow-frame overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b hairline bg-secondary/40">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-6 h-6 rounded-md bg-foreground text-background text-[11px] font-semibold">
            S
          </span>
          <span className="text-[13px] font-semibold tracking-tight">
            Snaply
          </span>
          <span className="hidden sm:inline text-[11px] text-muted-foreground ml-1">
            — Screenshot Stylizer
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline text-[11px] px-2 py-1 rounded-md border hairline bg-background text-muted-foreground">
            Copy link
          </span>
          <span className="w-6 h-6 rounded-full bg-secondary border hairline" />
        </div>
      </div>

      {/* Body: 3 panels */}
      <div className="grid grid-cols-[110px_1fr_140px]">
        {/* Left presets */}
        <aside className="border-r hairline p-3 space-y-2 bg-background">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">
            Presets
          </p>
          {["Gradients", "Minimal", "Glass", "Grainy"].map((p, i) => (
            <div
              key={p}
              className={`text-[11px] px-2 py-1.5 rounded-md border hairline ${i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              {p}
            </div>
          ))}
        </aside>

        {/* Canvas */}
        <div className="bg-secondary/30 p-4 sm:p-6 grid place-items-center min-h-[260px]">
          <div className="w-full bg-gradient-canvas rounded-xl p-4 sm:p-6 grid place-items-center shadow-soft">
            <div className="w-full rounded-lg overflow-hidden bg-white border border-black/5 shadow-frame">
              <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-black/5 bg-[hsl(220_20%_97%)]">
                <span className="w-2 h-2 rounded-full bg-[hsl(0_70%_65%)]" />
                <span className="w-2 h-2 rounded-full bg-[hsl(40_85%_60%)]" />
                <span className="w-2 h-2 rounded-full bg-[hsl(140_50%_55%)]" />
              </div>
              <div className="aspect-[16/9]">
                <MockScreenshot />
              </div>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <aside className="border-l hairline p-3 space-y-3 bg-background">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Style
            </p>
            <div className="space-y-2">
              <Slider label="Padding" value={62} />
              <Slider label="Radius" value={30} />
              <Slider label="Shadow" value={48} />
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Frame
            </p>
            <div className="grid grid-cols-3 gap-1">
              {[Monitor, Smartphone, Square].map((Icon, i) => (
                <div
                  key={i}
                  className={`grid place-items-center h-7 rounded-md border hairline ${i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                >
                  <Icon className="w-3 h-3" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t hairline bg-secondary/40">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clipboard className="w-3 h-3" />
          Press{" "}
          <kbd className="px-1 rounded border hairline bg-background text-foreground">
            ⌘V
          </kbd>{" "}
          to paste
        </div>
        <div className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-primary text-primary-foreground text-[11px] font-medium">
          <Download className="w-3 h-3" />
          Download PNG
        </div>
      </div>
    </div>
  );
};

const Slider = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
      <span>{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
    <div className="h-1 rounded-full bg-secondary relative">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-foreground"
        style={{ width: `${value}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-background border hairline shadow-soft"
        style={{ left: `calc(${value}% - 5px)` }}
      />
    </div>
  </div>
);

export default Hero;
