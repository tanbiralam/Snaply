/**
 * A faux app screenshot used inside frames for demos.
 * Pure SVG/CSS — no external assets.
 */
type MockScreenshotProps = {
  variant?: "light" | "dark";
  framed?: boolean;
  title?: string;
};

const MockScreenshot = ({
  variant = "light",
  framed = false,
  title = "How does this look?",
}: MockScreenshotProps) => {
  if (framed) {
    return (
      <div className="rounded-2xl border hairline bg-background p-4 sm:p-5 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <h3 className="font-serif-display text-3xl tracking-tight">
              {title}
            </h3>
          </div>
          <span className="shrink-0 text-[11px] font-medium px-2 py-1 rounded-md bg-secondary text-foreground">
            Auto-styled
          </span>
        </div>

        <div className="rounded-xl bg-gradient-canvas p-4 sm:p-6 grid place-items-center">
          <div className="w-full max-w-[26rem] rounded-xl overflow-hidden bg-white shadow-frame border border-black/5">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5 bg-[hsl(35_20%_97%)]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_65%)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[hsl(40_85%_60%)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[hsl(140_50%_55%)]" />
              </div>
              <div className="flex-1 mx-3 h-5 rounded bg-black/5 text-[10px] text-muted-foreground grid place-items-center">
                snaply.app
              </div>
            </div>
            <div className="aspect-[16/9]">
              <MockScreenshotContent variant={variant} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <MockScreenshotContent variant={variant} />;
};

const MockScreenshotContent = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const isDark = variant === "dark";
  return (
    <div className={`w-full h-full ${isDark ? "bg-[hsl(220_15%_10%)] text-[hsl(40_15%_92%)]" : "bg-white text-[hsl(30_12%_12%)]"}`}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`w-[27%] p-2 sm:p-3 border-r ${isDark ? "border-white/5" : "border-black/5"}`}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-gradient-canvas" />
            <div className={`h-1.5 sm:h-2 w-10 sm:w-14 rounded ${isDark ? "bg-white/15" : "bg-black/15"}`} />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {[80, 60, 70, 50, 65].map((w, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`h-1 sm:h-1.5 rounded ${isDark ? "bg-white/10" : "bg-black/8"}`} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-2.5 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`h-2 sm:h-2.5 w-16 sm:w-24 rounded ${isDark ? "bg-white/20" : "bg-black/20"}`} />
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-canvas-soft" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`aspect-[5/3] rounded-md ${isDark ? "bg-white/5" : "bg-black/5"} flex items-end p-1 sm:p-1.5`}>
                <div className={`h-1 w-1/2 rounded ${isDark ? "bg-white/20" : "bg-black/20"}`} />
              </div>
            ))}
          </div>
          <div className={`rounded-md p-1.5 sm:p-2 ${isDark ? "bg-white/5" : "bg-black/[0.03]"}`}>
            <div className="space-y-1 sm:space-y-1.5">
              {[90, 75, 82, 60].map((w, i) => (
                <div key={i} className={`h-1 sm:h-1.5 rounded ${isDark ? "bg-white/15" : "bg-black/10"}`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockScreenshot;
