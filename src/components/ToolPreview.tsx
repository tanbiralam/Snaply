import Image from "next/image";
import photo from "../../public/landing/hero.jpg";
import tiny from "../../public/landing/hero-tiny.png";
import { cn } from "@/lib/utils";

/*
  Card thumbnails: the hero photo with each tool's effect applied in CSS, so
  every card shows what the tool does instead of a promo still. One shared
  asset, no per-tool images. Unknown slugs fall back to the plain photo.
*/

function Photo({ pos = "50% 50%", className, sizes = "320px" }: { pos?: string; className?: string; sizes?: string }) {
  return (
    <Image
      src={photo}
      alt=""
      fill
      sizes={sizes}
      className={cn("object-cover dark:brightness-[0.75] dark:saturate-[0.6]", className)}
      style={{ objectPosition: pos }}
    />
  );
}

/** A 24px copy of the photo scaled up: real pixelation, no canvas. */
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

const Bar = ({ w, className }: { w: string; className?: string }) => (
  <span className={cn("block h-1.5 rounded-full", className)} style={{ width: w }} />
);

const previews: Record<string, () => React.ReactNode> = {
  screenshot: () => (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.35),hsl(var(--primary)/0.08)_60%,hsl(var(--muted)))]" />
      <div className="absolute inset-[14%_12%] overflow-hidden rounded-md bg-card shadow-xl ring-1 ring-black/5">
        <div className="flex h-3 items-center gap-1 bg-card px-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          ))}
        </div>
        <div className="relative h-full">
          <Photo pos="50% 45%" />
        </div>
      </div>
    </>
  ),
  "og-image": () => (
    <>
      <Photo pos="60% 40%" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background)/0.95)_0%,hsl(var(--background)/0.6)_55%,transparent)]" />
      <div className="absolute left-[8%] top-1/2 -translate-y-1/2 space-y-1.5">
        <span className="block font-bold leading-tight tracking-tight text-foreground">
          Notes from
          <br />
          the hills
        </span>
        <Bar w="56px" className="bg-primary" />
      </div>
      <Pill className="bottom-2 right-2">1200 × 630</Pill>
    </>
  ),
  "code-snippet": () => (
    <>
      <Photo pos="50% 60%" className="scale-110 blur-md" />
      <div className="absolute inset-[16%_14%] space-y-1.5 rounded-md bg-[#0e1311]/90 p-3 shadow-xl">
        <div className="mb-2 flex gap-1">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex gap-1.5"><Bar w="18%" className="bg-[#c792ea]" /><Bar w="30%" className="bg-[#82aaff]" /></div>
        <div className="flex gap-1.5 pl-3"><Bar w="22%" className="bg-[#3ddc97]" /><Bar w="38%" className="bg-[#edf4f0]/50" /></div>
        <div className="flex gap-1.5 pl-3"><Bar w="14%" className="bg-[#ffcb6b]" /><Bar w="26%" className="bg-[#edf4f0]/50" /></div>
        <div className="flex gap-1.5"><Bar w="10%" className="bg-[#c792ea]" /></div>
      </div>
    </>
  ),
  favicon: () => (
    <div className="absolute inset-0 flex items-end justify-center gap-3 bg-muted pb-[18%]">
      {[56, 40, 26, 16].map((s) => (
        <span key={s} className="relative overflow-hidden rounded-[22%] shadow-md ring-1 ring-black/5" style={{ width: s, height: s }}>
          <Photo pos="45% 50%" sizes="64px" />
        </span>
      ))}
    </div>
  ),
  quote: () => (
    <>
      <Photo pos="50% 30%" className="scale-110 blur-sm" />
      <div className="absolute inset-[18%_16%] rounded-md bg-card/95 p-3 shadow-xl">
        <span className="block font-serif text-2xl leading-none text-primary">&ldquo;</span>
        <div className="mt-1 space-y-1.5">
          <Bar w="92%" className="bg-foreground/70" />
          <Bar w="70%" className="bg-foreground/70" />
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-primary/40" />
          <Bar w="30%" className="bg-muted-foreground/40" />
        </div>
      </div>
    </>
  ),
  "qr-code": () => (
    <>
      <Photo pos="50% 70%" className="scale-110 blur-md" />
      <div className="absolute left-1/2 top-1/2 h-[64%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md shadow-xl" style={{ aspectRatio: "1" }}>
        <QrGlyph />
      </div>
    </>
  ),
  gradient: () => (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 80% at 20% 30%, #3ddc97 0%, transparent 60%), radial-gradient(50% 70% at 80% 20%, #f3e3c3 0%, transparent 60%), radial-gradient(70% 90% at 70% 90%, #3f6f8f 0%, transparent 65%), #0e1311",
      }}
    />
  ),
  resize: () => (
    <>
      <Photo pos="50% 50%" />
      <div className="absolute inset-y-[10%] left-[30%] right-[30%] shadow-[0_0_0_999px_rgb(0_0_0/0.45)] ring-1 ring-white">
        {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((p) => (
          <span key={p} className={cn("absolute h-2 w-2 bg-white", p)} />
        ))}
        <span className="absolute inset-x-0 top-1/3 border-t border-white/40" />
        <span className="absolute inset-x-0 top-2/3 border-t border-white/40" />
      </div>
      <Pill className="bottom-2 right-2">1080 × 1080</Pill>
    </>
  ),
  metadata: () => (
    <>
      <Photo pos="30% 50%" />
      <div className="absolute bottom-[10%] right-[6%] space-y-0.5 rounded-md bg-background/90 px-2.5 py-2 font-mono text-2xs leading-4 text-foreground shadow-lg backdrop-blur">
        <p>ISO 200 · f/8 · 1/250</p>
        <p className="text-muted-foreground">Camera: X-T5</p>
        <p className="text-destructive line-through">GPS 46.95, 7.44</p>
      </div>
    </>
  ),
  redact: () => (
    <>
      <Photo pos="50% 45%" />
      <div className="absolute inset-y-[22%] left-[38%] right-[18%] overflow-hidden rounded-sm ring-1 ring-white/70">
        <div className="absolute inset-0 backdrop-blur-md" />
      </div>
    </>
  ),
  "remove-background": () => (
    <>
      <div className="absolute inset-0" style={checker} />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_42%_60%_at_50%_55%,#000_60%,transparent_62%)]">
        <Photo pos="50% 55%" />
      </div>
    </>
  ),
  watermark: () => (
    <>
      <Photo pos="70% 50%" />
      <div className="absolute inset-0 grid -rotate-12 scale-125 grid-cols-3 place-items-center font-mono text-2xs font-semibold uppercase tracking-widest text-white/45">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i}>© Snaply</span>
        ))}
      </div>
    </>
  ),
  compress: () => (
    <>
      <Photo pos="50% 50%" />
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l-2 border-white">
        <div className="absolute inset-y-0 right-0 w-[200%]">
          <Pixelated />
        </div>
      </div>
      <Pill className="bottom-2 left-1/2 -translate-x-1/2">2.4 MB → 310 KB</Pill>
    </>
  ),
  "svg-optimizer": () => (
    <div className="absolute inset-0 bg-muted">
      <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax slice">
        <path d="M0 70 Q40 40 80 62 T160 52 V90 H0Z" className="fill-primary/25" />
        <path d="M0 78 Q50 56 100 74 T160 70 V90 H0Z" className="fill-primary/50" />
        <circle cx="122" cy="26" r="9" className="fill-primary/40" />
      </svg>
      <Pill className="right-2 top-2">−62%</Pill>
      <span className="absolute bottom-2 left-2 font-mono text-2xs text-muted-foreground">&lt;path d=&quot;M0 70Q40…&quot;/&gt;</span>
    </div>
  ),
  blurhash: () => (
    <>
      <div className="absolute inset-0 scale-125 blur-xl">
        <Pixelated />
      </div>
      <Pill className="bottom-2 left-2">LKO2?U%2Tw=w]~RBVZRi</Pill>
    </>
  ),
};

export function ToolPreview({ slug, className }: { slug: string; className?: string }) {
  const render = previews[slug] ?? (() => <Photo />);
  return (
    <div aria-hidden="true" className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}>
      {render()}
    </div>
  );
}
