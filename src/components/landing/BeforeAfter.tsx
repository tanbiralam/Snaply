import MockScreenshot from "./MockScreenshot";

const BeforeAfter = () => {
  return (
    <section id="demo" className="scroll-mt-20">
      <div className="container py-16 sm:py-20">
        {/* Section header */}
        <div className="max-w-2xl mb-10">
          <p className="text-sm text-muted-foreground mb-3">Before & After</p>
          <h2 className="font-serif-display text-4xl sm:text-5xl tracking-tight">
            See the <span className="italic">difference.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Drag the handle to compare a raw screenshot against the polished result.
          </p>
        </div>

        {/* Fixed-size before/after card */}
        <div className="relative w-full max-w-3xl mx-auto h-[340px] rounded-2xl overflow-hidden shadow-frame border hairline bg-white">
          {/* AFTER (full background) */}
          <div className="absolute inset-0 bg-gradient-canvas p-6 sm:p-8 grid place-items-center">
            <div className="w-full max-w-[75%] h-[82%] rounded-xl overflow-hidden bg-white shadow-frame border border-black/5 grid place-items-center">
              <div className="w-[92%] h-[92%]">
                <MockScreenshot variant="light" framed={false} />
              </div>
            </div>
          </div>

          {/* BEFORE (clipped overlay) — clip boundary animates in sync with the handle */}
          <div
            className="absolute inset-0 overflow-hidden animate-clip-compare"
            style={{ clipPath: "inset(0 0 0 50%)" }}
            id="before-clip"
          >
            <div className="absolute inset-0 bg-[hsl(225_18%_94%)] grid place-items-center">
              <div className="w-full max-w-[75%] h-[82%] rounded-md overflow-hidden border border-black/10 bg-white grid place-items-center">
                <div className="w-[92%] h-[92%]">
                  <MockScreenshot variant="light" framed={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/80 animate-slide-compare pointer-events-none"
            style={{ left: "50%" }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-frame grid place-items-center">
              <div className="flex items-center gap-0.5">
                <span className="block w-1 h-3 bg-foreground/60 rounded-full" />
                <span className="block w-1 h-3 bg-foreground/60 rounded-full" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <span className="absolute top-3 left-3 text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-foreground/80 text-background backdrop-blur">
            After
          </span>
          <span className="absolute top-3 right-3 text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-background/80 text-foreground backdrop-blur border hairline">
            Before
          </span>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;

