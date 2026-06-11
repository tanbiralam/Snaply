import { ClipboardPaste, Palette, Smartphone, Download, Sparkles, Layers } from "lucide-react";

const features = [
  {
    icon: ClipboardPaste,
    title: "Paste to start",
    desc: "⌘V drops your screenshot straight onto the canvas. No upload dialog, no drag target.",
    meta: "⌘V",
  },
  {
    icon: Palette,
    title: "Curated gradients",
    desc: "A small library of backgrounds that look intentional — plus full custom control.",
    meta: "32 presets",
  },
  {
    icon: Smartphone,
    title: "Device frames",
    desc: "Browser, iPhone, MacBook, or none. Switch instantly without re-cropping.",
    meta: "4 frames",
  },
  {
    icon: Layers,
    title: "Glass, blur & grain",
    desc: "Real layering controls — backdrop blur, noise, and subtle texture for depth.",
    meta: "Live",
  },
  {
    icon: Sparkles,
    title: "Live preview",
    desc: "Every slider updates the canvas in real time. No render button. No waiting.",
    meta: "0 ms",
  },
  {
    icon: Download,
    title: "Export anywhere",
    desc: "PNG, JPG, or copy to clipboard. Sized for Twitter, Dribbble, or your blog.",
    meta: "PNG · JPG",
  },
];

const Features = () => {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="container py-20 sm:py-28">
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-muted-foreground mb-3">What's inside</p>
          <h2 className="font-serif-display text-4xl sm:text-5xl tracking-tight">
            A real editor. <span className="italic">Not a template.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every control you see in the preview is in the app — and it stays out of your way.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(var(--hairline))] rounded-2xl overflow-hidden border hairline">
          {features.map(({ icon: Icon, title, desc, meta }) => (
            <div key={title} className="bg-background p-6 hover:bg-secondary/40 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <div className="w-9 h-9 grid place-items-center rounded-lg bg-secondary text-foreground">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground border hairline rounded-md px-1.5 py-0.5 font-medium">
                  {meta}
                </span>
              </div>
              <h3 className="font-medium text-[15px] mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
