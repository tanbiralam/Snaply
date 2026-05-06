/**
 * A faux app screenshot used inside frames for demos.
 * Pure SVG/CSS — no external assets.
 */
const MockScreenshot = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const isDark = variant === "dark";
  return (
    <div className={`w-full h-full ${isDark ? "bg-[hsl(220_15%_10%)] text-[hsl(40_15%_92%)]" : "bg-white text-[hsl(30_12%_12%)]"}`}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`w-[28%] p-3 border-r ${isDark ? "border-white/5" : "border-black/5"}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-gradient-canvas" />
            <div className={`h-2 w-14 rounded ${isDark ? "bg-white/15" : "bg-black/15"}`} />
          </div>
          <div className="space-y-2">
            {[80, 60, 70, 50, 65].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`h-1.5 rounded ${isDark ? "bg-white/10" : "bg-black/8"}`} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-2.5 w-24 rounded ${isDark ? "bg-white/20" : "bg-black/20"}`} />
            <div className="w-6 h-6 rounded-full bg-gradient-canvas-soft" />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`aspect-[5/3] rounded-md ${isDark ? "bg-white/5" : "bg-black/5"} flex items-end p-1.5`}>
                <div className={`h-1 w-1/2 rounded ${isDark ? "bg-white/20" : "bg-black/20"}`} />
              </div>
            ))}
          </div>
          <div className={`rounded-md p-2 ${isDark ? "bg-white/5" : "bg-black/[0.03]"}`}>
            <div className="space-y-1.5">
              {[90, 75, 82, 60].map((w, i) => (
                <div key={i} className={`h-1.5 rounded ${isDark ? "bg-white/15" : "bg-black/10"}`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockScreenshot;
