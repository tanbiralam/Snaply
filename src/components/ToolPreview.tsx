"use client";

import { createContext, useContext, useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import photo from "../../public/landing/hero.jpg";
import tiny from "../../public/landing/hero-tiny.png";
import { cn } from "@/lib/utils";

/*
  Tool-card previews you can play with (homepage grid and /tools). Each shows
  what its tool does using the hero photo, and reacts to the pointer: moving
  over a card drives two CSS variables, --px/--py (0–1), so following the
  cursor costs no React re-renders. They're registered with @property in
  index.css, so a card follows with slight smoothing and eases back to rest
  when the pointer leaves. Cards play one short demo sweep when they
  scroll into view: once with a mouse, every time on touch (no hover to
  scrub with). Skipped under prefers-reduced-motion. Unknown slugs fall back to the plain photo.
*/

/** Set by ToolPreview for cards above the fold, so their photo isn't lazy-loaded (LCP). */
const EagerContext = createContext(false);

function Photo({ pos = "50% 50%", className, sizes = "320px" }: { pos?: string; className?: string; sizes?: string }) {
  const eager = useContext(EagerContext);
  return (
    <Image
      loading={eager ? "eager" : undefined}
      src={photo}
      alt=""
      fill
      sizes={sizes}
      className={cn("object-cover dark:brightness-[0.75] dark:saturate-[0.6]", className)}
      style={{ objectPosition: pos }}
    />
  );
}
const Pixelated = () => (
  <Image src={tiny} alt="" fill unoptimized className="object-cover [image-rendering:pixelated] dark:brightness-[0.75] dark:saturate-[0.6]" />
);
const Pill = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      "absolute rounded-full bg-background/85 px-2.5 py-0.5 font-mono text-2xs font-medium text-foreground backdrop-blur",
      className
    )}
  >
    {children}
  </span>
);
const checker = {
  background:
    "repeating-conic-gradient(hsl(var(--muted)) 0 25%, hsl(var(--card)) 0 50%) 0 0 / 14px 14px",
};

// ponytail: decorative pseudo-QR (finder squares + seeded noise), not scannable.
function QrGlyph() {
  const n = 21;
  const cells: [number, number][] = [];
  const finder = (x: number, y: number) => x < 8 && y < 8;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      // Math.imul keeps the hash in 32-bit ints (a plain multiply loses the low bits).
      let h = Math.imul(x * 31 + y * 1009 + 7, 0x9e3779b1);
      h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
      h ^= h >>> 13;
      const inFinder = finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y);
      if (!inFinder && h & 1) cells.push([x, y]);
    }
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <>
      <rect x={x} y={y} width={7} height={7} />
      <rect x={x + 1} y={y + 1} width={5} height={5} className="fill-white" />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="h-full w-full fill-[#15201a]" shapeRendering="crispEdges">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} className="fill-white" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  );
}

type Pt = { x: number; y: number };

function useLive(rest: Pt, sweep: Pt[], onPoint?: (p: Pt) => void) {
  const ref = useRef<HTMLDivElement>(null);
  // Fixed per preview; refs keep the effect from re-subscribing.
  const cfg = useRef({ rest, sweep, onPoint });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { rest, sweep, onPoint } = cfg.current;
    const set = (p: Pt) => {
      el.style.setProperty("--px", String(p.x));
      el.style.setProperty("--py", String(p.y));
      onPoint?.(p);
    };
    let demoRaf = 0;
    const stopDemo = () => cancelAnimationFrame(demoRaf);

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      stopDemo();
      const r = el.getBoundingClientRect();
      el.dataset.active = "";
      set({
        x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
        y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
      });
    };
    const leave = () => {
      delete el.dataset.active;
      set(rest);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);

    // One demo sweep through `sweep` points (eased per segment) on first view.
    const demo = () => {
      stopDemo();
      const pts = [rest, ...sweep, rest];
      const seg = 650;
      const t0 = performance.now();
      el.dataset.active = "";
      const step = (now: number) => {
        // rAF passes the frame's start time, which can precede t0: clamp at 0.
        const t = Math.max(0, now - t0) / seg;
        const i = Math.min(pts.length - 2, Math.floor(t));
        const k = Math.min(1, t - i);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        const a = pts[i];
        const b = pts[i + 1];
        set({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
        if (t < pts.length - 1) demoRaf = requestAnimationFrame(step);
        else delete el.dataset.active;
      };
      demoRaf = requestAnimationFrame(step);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch can't scrub the preview, so replay the sweep each time the card
    // scrolls back in; with a mouse, once is enough.
    const replay = window.matchMedia("(hover: none)").matches;
    const io = reduce
      ? null
      : new IntersectionObserver(
          ([en]) => {
            if (!en.isIntersecting) return;
            if (!replay) io?.disconnect();
            demo();
          },
          { threshold: 0.6 }
        );
    io?.observe(el);

    set(rest);
    return () => {
      stopDemo();
      io?.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return ref;
}

function Frame({
  live,
  rest,
  className,
  children,
}: {
  live: React.RefObject<HTMLDivElement | null>;
  rest: Pt;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={live}
      aria-hidden="true"
      className={cn("live-preview relative aspect-video w-full overflow-hidden bg-muted", className)}
      style={{ "--px": rest.x, "--py": rest.y } as CSSProperties}
    >
      {children}
    </div>
  );
}


const Bar = ({ w, className, style }: { w: string; className?: string; style?: CSSProperties }) => (
  <span className={cn("block h-1.5 rounded-full", className)} style={{ width: w, ...style }} />
);

/** Round handle for split lines. */
const Handle = () => (
  <span className="absolute left-1/2 top-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#15201a] shadow-md">
    <ChevronsLeftRight className="h-3.5 w-3.5" strokeWidth={2.25} />
  </span>
);

/** Vertical split line at --px. `fadeAtZero` hides it while parked at the left edge. */
const SplitLine = ({ fadeAtZero }: { fadeAtZero?: boolean }) => (
  <div
    className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white"
    style={{ left: "calc(var(--px) * 100%)", opacity: fadeAtZero ? "clamp(0, calc(var(--px) * 40), 1)" : undefined }}
  >
    <Handle />
  </div>
);

type PreviewProps = { className?: string };

/** Builds a live preview: rest point, demo sweep, and the layers (which read --px/--py). */
function live(rest: Pt, sweep: Pt[], render: () => React.ReactNode, frameClass?: string) {
  return function Live({ className }: PreviewProps) {
    const ref = useLive(rest, sweep);
    return (
      <Frame live={ref} rest={rest} className={cn(frameClass, className)}>
        {render()}
      </Frame>
    );
  };
}

const at = (x: number, y = 0.5): Pt => ({ x, y });

// ─── Create ───────────────────────────────────────────────────────────────────

/** Framed screenshot that tilts toward the pointer. */
const Screenshot = live(at(0.5), [at(0.15, 0.25), at(0.85, 0.75)], () => (
  <>
    <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.35),hsl(var(--primary)/0.08)_60%,hsl(var(--muted)))]" />
    <div className="absolute inset-0 [perspective:700px]">
      <div
        className="absolute inset-[14%_12%] overflow-hidden rounded-md bg-card ring-1 ring-black/5"
        style={{
          transform: "rotateY(calc((var(--px) - 0.5) * 30deg)) rotateX(calc((0.5 - var(--py)) * 22deg))",
          boxShadow: "calc((0.5 - var(--px)) * 24px) calc(12px + (0.5 - var(--py)) * 18px) 30px -8px rgb(0 0 0 / 0.35)",
        }}
      >
        <div className="flex h-3 items-center gap-1 bg-card px-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          ))}
        </div>
        <div className="relative h-full">
          <Photo pos="50% 45%" />
        </div>
      </div>
    </div>
  </>
));

/** Parallax: the photo drifts against the pointer, the title with it. */
const OgImage = live(at(0.5), [at(0.15, 0.3), at(0.85, 0.7)], () => (
  <>
    <div
      className="absolute -inset-[10%]"
      style={{ transform: "translate(calc((0.5 - var(--px)) * 32px), calc((0.5 - var(--py)) * 16px))" }}
    >
      <Photo pos="60% 40%" />
    </div>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background)/0.95)_0%,hsl(var(--background)/0.6)_55%,transparent)]" />
    <div
      className="absolute left-[8%] top-1/2 space-y-1.5"
      style={{ transform: "translate(calc((var(--px) - 0.5) * 16px), calc(-50% + (var(--py) - 0.5) * 10px))" }}
    >
      <span className="block font-bold leading-tight tracking-tight text-foreground">
        Notes from
        <br />
        the hills
      </span>
      <Bar w="56px" className="bg-primary" />
    </div>
    <Pill className="bottom-2 right-2">1200 × 630</Pill>
  </>
));

const CODE_LINES: { indent: boolean; bars: [string, string][] }[] = [
  { indent: false, bars: [["18%", "#c792ea"], ["30%", "#82aaff"]] },
  { indent: true, bars: [["22%", "#3ddc97"], ["38%", "rgb(237 244 240 / 0.5)"]] },
  { indent: true, bars: [["14%", "#ffcb6b"], ["26%", "rgb(237 244 240 / 0.5)"]] },
  { indent: false, bars: [["10%", "#c792ea"]] },
];

/** Code window; a highlight snaps to the line under the pointer. */
const CodeSnippet = live(at(0.5, 0.45), [at(0.5, 0.2), at(0.5, 0.8)], () => (
  <>
    <Photo pos="50% 60%" className="scale-110 blur-md" />
    <div className="absolute inset-[16%_14%] flex flex-col rounded-md bg-[#0e1311]/90 p-3 shadow-xl">
      <div className="mb-2 flex gap-1">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
        ))}
      </div>
      <div className="relative grid flex-1 grid-rows-4">
        {/* Line index from the pointer's height over the card (code spans ~25–80%). */}
        <span
          className="absolute -inset-x-1.5 h-1/4 rounded-sm bg-white/[0.07] ring-1 ring-white/10 transition-[top] duration-150"
          style={{ top: "calc(clamp(0, round(down, (var(--py) - 0.25) / 0.55 * 4, 1), 3) * 25%)" }}
        />
        {CODE_LINES.map((l, i) => (
          <div key={i} className={cn("relative flex items-center gap-1.5", l.indent && "pl-3")}>
            {l.bars.map(([w, c]) => (
              <Bar key={w + c} w={w} style={{ background: c }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </>
));

const FAVICONS: [number, number][] = [
  // [size px, centre as a fraction of card width]
  [56, 0.31],
  [40, 0.47],
  [26, 0.59],
  [16, 0.67],
];

/** App icons in four sizes; the one under the pointer magnifies, dock-style. */
const Favicon = live(at(0.2), [at(0.75), at(0.25)], () => (
  <div className="absolute inset-0 flex items-end justify-center gap-3 bg-muted pb-[18%]">
    {FAVICONS.map(([s, pos]) => (
      <span
        key={s}
        className="relative origin-bottom overflow-hidden rounded-[22%] shadow-md ring-1 ring-black/5"
        style={{
          width: s,
          height: s,
          // 1 + up to 0.45, falling off with distance from the pointer (abs = max(d, -d)).
          transform: `scale(calc(1 + 0.45 * max(0, 1 - max(var(--px) - ${pos}, ${pos} - var(--px)) * 4)))`,
        }}
      >
        <Photo pos="45% 50%" sizes="64px" />
      </span>
    ))}
  </div>
));

/** Quote card; a highlighter sweeps along the two lines with the pointer. */
const Quote = live(at(0.35), [at(1), at(0)], () => (
  <>
    <Photo pos="50% 30%" className="scale-110 blur-sm" />
    <div className="absolute inset-[18%_16%] rounded-md bg-card/95 p-3 shadow-xl">
      <span className="block font-serif text-2xl leading-none text-primary">&ldquo;</span>
      <div className="mt-1 space-y-1.5">
        {[
          ["92%", "clamp(0, var(--px) * 2, 1)"],
          ["70%", "clamp(0, var(--px) * 2 - 1, 1)"],
        ].map(([w, fill]) => (
          <div key={w} className="relative" style={{ width: w }}>
            <span
              className="absolute -inset-y-1 -left-1 rounded-sm bg-primary/30"
              style={{ width: `calc(${fill} * (100% + 8px))` }}
            />
            <Bar w="100%" className="relative bg-foreground/70" />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-primary/40" />
        <Bar w="30%" className="bg-muted-foreground/40" />
      </div>
    </div>
  </>
));

/** QR code with a scan line at the pointer's height; what's above it reads as scanned. */
const QrCode = live(at(0.5, 0.4), [at(0.5, 0.15), at(0.5, 0.85)], () => (
  <>
    <Photo pos="50% 70%" className="scale-110 blur-md" />
    <div
      className="absolute left-1/2 top-1/2 h-[64%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md shadow-xl"
      style={{ aspectRatio: "1", "--scan": "clamp(0%, calc((var(--py) - 0.18) / 0.64 * 100%), 100%)" } as CSSProperties}
    >
      <QrGlyph />
      <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" style={{ clipPath: "inset(0 0 calc(100% - var(--scan)) 0)" }} />
      <div
        className="absolute inset-x-0 h-0.5 -translate-y-1/2 bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.7)]"
        style={{ top: "var(--scan)" }}
      />
    </div>
  </>
));

const GRADIENT_SIZE = { w: 320, h: 180 };

/**
 * A live Gradient Generator render (the Aurora look): x → warp, y → light,
 * eased toward the pointer on animation frames. A pre-rendered poster of the
 * same settings shows until gradient.ts is loaded (first interaction or demo).
 */
function Gradient({ className }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    mod: null as null | typeof import("@/lib/gradient"),
    loading: false,
    cur: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.5 },
    raf: 0,
  });

  const kick = () => {
    const s = st.current;
    if (s.raf) return;
    const tick = () => {
      s.raf = 0;
      const c = canvasRef.current;
      if (!c) return;
      if (!s.mod) {
        if (!s.loading) {
          s.loading = true;
          import("@/lib/gradient").then((m) => {
            s.mod = m;
            kick();
          });
        }
        return;
      }
      s.cur.x += (s.target.x - s.cur.x) * 0.2;
      s.cur.y += (s.target.y - s.cur.y) * 0.2;
      const look = s.mod.GRADIENT_LOOKS.find((l) => l.name === "Aurora")!.settings;
      const { w, h } = GRADIENT_SIZE;
      const px = s.mod.renderGradient(
        { ...look, width: w, height: h, warp: 0.8 + (s.cur.x - 0.5), light: 0.1 + (0.5 - s.cur.y) * 0.6 },
        w,
        h
      );
      c.getContext("2d")?.putImageData(new ImageData(px, w, h), 0, 0);
      c.style.opacity = "1";
      if (Math.abs(s.target.x - s.cur.x) + Math.abs(s.target.y - s.cur.y) > 0.002) s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  };

  const rest = at(0.5);
  const ref = useLive(rest, [at(0.15, 0.25), at(0.85, 0.75)], (p) => {
    st.current.target = p;
    kick();
  });

  useEffect(() => {
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <Frame live={ref} rest={rest} className={cn("bg-[#020611]", className)}>
      {/* 15 KB poster of the same render; the canvas fades in over it. */}
      <img src="/landing/gradient-card.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <canvas
        ref={canvasRef}
        width={GRADIENT_SIZE.w}
        height={GRADIENT_SIZE.h}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
      />
      <Pill className="bottom-2 left-2">Aurora</Pill>
    </Frame>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

/** A square crop box that follows the pointer, its size label riding along. */
const Resize = live(at(0.5), [at(0.2, 0.4), at(0.8, 0.6)], () => (
  // 16:9 card: a square 80% tall is 45% wide. Inset from the edges so the
  // border and handles stay visible.
  <>
    <Photo />
    <div
      className="absolute h-[80%] w-[45%] shadow-[0_0_0_999px_rgb(0_0_0/0.45)] ring-1 ring-white"
      style={{
        left: "clamp(4%, calc(var(--px) * 100% - 22.5%), 51%)",
        top: "clamp(7%, calc(var(--py) * 100% - 40%), 13%)",
      }}
    >
      {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((p) => (
        <span key={p} className={cn("absolute h-2 w-2 bg-white", p)} />
      ))}
      <span className="absolute inset-x-0 top-1/3 border-t border-white/40" />
      <span className="absolute inset-x-0 top-2/3 border-t border-white/40" />
      <span className="absolute inset-y-0 left-1/3 border-l border-white/40" />
      <span className="absolute inset-y-0 left-2/3 border-l border-white/40" />
      <Pill className="bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">1080 × 1080</Pill>
    </div>
  </>
));

/** EXIF panel; the GPS strike-through draws in as the pointer moves right. */
const Metadata = live(at(0.85), [at(0.15), at(0.85)], () => (
  <>
    <Photo pos="30% 50%" />
    <div className="absolute bottom-[10%] right-[6%] space-y-0.5 rounded-md bg-background/90 px-2.5 py-2 font-mono text-2xs leading-4 text-foreground shadow-lg backdrop-blur">
      <p>ISO 200 · f/8 · 1/250</p>
      <p className="text-muted-foreground">Camera: X-T5</p>
      <p className="relative w-fit text-destructive">
        GPS 46.95, 7.44
        <span
          className="absolute left-0 top-1/2 h-px bg-destructive"
          style={{ width: "calc(clamp(0, (var(--px) - 0.2) / 0.6, 1) * 100%)" }}
        />
      </p>
    </div>
  </>
));

/** A blur box that follows the pointer. */
const Redact = live(at(0.62), [at(0.2, 0.35), at(0.8, 0.65)], () => (
  <>
    <Photo pos="50% 45%" />
    <div
      className="absolute h-[56%] w-[38%] overflow-hidden rounded-sm ring-1 ring-white/70"
      style={{
        left: "clamp(3%, calc(var(--px) * 100% - 19%), 59%)",
        top: "clamp(6%, calc(var(--py) * 100% - 28%), 38%)",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" />
    </div>
  </>
));

/** Cut-out on a checkerboard; the pointer wipes the original back in from the left. */
const RemoveBackground = live(at(0), [at(0.75)], () => (
  <>
    <div className="absolute inset-0" style={checker} />
    <div className="absolute inset-0 [filter:drop-shadow(0_6px_10px_rgb(0_0_0/0.25))]">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_42%_60%_at_50%_55%,#000_57%,transparent_63%)]">
        <Photo pos="50% 55%" />
      </div>
    </div>
    <div className="absolute inset-0" style={{ clipPath: "inset(0 calc((1 - var(--px)) * 100%) 0 0)" }}>
      <Photo pos="50% 55%" />
    </div>
    <SplitLine fadeAtZero />
  </>
));

/** The © mark follows the pointer over a faint tiled pattern. */
const Watermark = live(at(0.78, 0.8), [at(0.2, 0.25), at(0.6, 0.6)], () => (
  <>
    <Photo pos="70% 50%" />
    <div className="absolute inset-0 grid -rotate-12 scale-125 grid-cols-3 place-items-center font-mono text-2xs font-semibold uppercase tracking-widest text-white/20">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i}>© Snaply</span>
      ))}
    </div>
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/25 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
      style={{
        left: "clamp(22%, calc(var(--px) * 100%), 78%)",
        top: "clamp(14%, calc(var(--py) * 100%), 86%)",
      }}
    >
      © Snaply
    </span>
  </>
));

// ─── Optimize ─────────────────────────────────────────────────────────────────

/** Before/after split: sharp left, pixelated right. */
const Compress = live(at(0.5), [at(0.2), at(0.8)], () => (
  <>
    <Photo />
    <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 calc(var(--px) * 100%))" }}>
      <Pixelated />
    </div>
    <SplitLine />
    <Pill className="bottom-2 left-2">2.4 MB</Pill>
    <Pill className="bottom-2 right-2">310 KB</Pill>
  </>
));

const HILLS = ["M0 70 Q40 40 80 62 T160 52 V90 H0Z", "M0 78 Q50 56 100 74 T160 70 V90 H0Z"];
// Editor-export clutter: the extra anchors an unoptimized SVG carries, sampled
// on the two hills (each is Q + reflected T: two quadratic segments).
type P2 = [number, number];
const quad = (a: P2, c: P2, b: P2, n: number): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  });
const hill = (a: P2, c: P2, m: P2, b: P2): P2[] => [
  ...quad(a, c, m, 6),
  ...quad(m, [2 * m[0] - c[0], 2 * m[1] - c[1]], b, 6),
  b,
];
const ANCHORS: P2[] = [...hill([0, 70], [40, 40], [80, 62], [160, 52]), ...hill([0, 78], [50, 56], [100, 74], [160, 70])];

/** Split: bloated export (anchors, handles) left of the pointer, clean shape right. */
const SvgOptimizer = live(at(0.5), [at(0.2), at(0.8)], () => (
  <div className="absolute inset-0 bg-muted">
    <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax slice">
      <path d={HILLS[0]} className="fill-primary/25" />
      <path d={HILLS[1]} className="fill-primary/50" />
      <circle cx="122" cy="26" r="9" className="fill-primary/40" />
    </svg>
    <svg
      viewBox="0 0 160 90"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
      style={{ clipPath: "inset(0 calc((1 - var(--px)) * 100%) 0 0)" }}
    >
      {HILLS.map((d) => (
        <path key={d} d={d} className="fill-none stroke-primary" strokeWidth={0.6} strokeDasharray="2 1.5" />
      ))}
      <circle cx="122" cy="26" r="9" className="fill-none stroke-primary" strokeWidth={0.6} strokeDasharray="2 1.5" />
      {ANCHORS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 1.2} y={y - 1.2} width={2.4} height={2.4} className="fill-background stroke-primary" strokeWidth={0.5} />
      ))}
    </svg>
    <SplitLine />
    <Pill className="right-2 top-2">−62%</Pill>
  </div>
));

/** Blurred placeholder with a sharp lens following the pointer. */
const Blurhash = live(at(0.68, 0.42), [at(0.25, 0.35), at(0.75, 0.65)], () => (
  <>
    <div className="absolute inset-0 scale-125 blur-xl">
      <Pixelated />
    </div>
    <div
      className="absolute inset-0"
      style={{
        maskImage:
          "radial-gradient(ellipse 22% 40% at calc(var(--px) * 100%) calc(var(--py) * 100%), #000 70%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 22% 40% at calc(var(--px) * 100%) calc(var(--py) * 100%), #000 70%, transparent 100%)",
      }}
    >
      <Photo />
    </div>
    <Pill className="bottom-2 left-2">LKO2?U%2Tw=w]~RBVZRi</Pill>
  </>
));

const PREVIEWS: Record<string, (p: PreviewProps) => React.ReactNode> = {
  screenshot: Screenshot,
  "og-image": OgImage,
  "code-snippet": CodeSnippet,
  favicon: Favicon,
  quote: Quote,
  "qr-code": QrCode,
  gradient: Gradient,
  resize: Resize,
  metadata: Metadata,
  redact: Redact,
  "remove-background": RemoveBackground,
  watermark: Watermark,
  compress: Compress,
  "svg-optimizer": SvgOptimizer,
  blurhash: Blurhash,
};

/** `eager`: the card is likely above the fold; load its photo immediately. */
export function ToolPreview({ slug, className, eager = false }: { slug: string; className?: string; eager?: boolean }) {
  const P = PREVIEWS[slug];
  return (
    <EagerContext.Provider value={eager}>
      {P ? (
        <P className={className} />
      ) : (
        <div aria-hidden="true" className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}>
          <Photo />
        </div>
      )}
    </EagerContext.Provider>
  );
}
