import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTA = () => {
  return (
    <section id="cta" className="border-t hairline">
      <div className="container py-24 sm:py-32">
        <div className="relative overflow-hidden rounded-3xl border hairline bg-foreground text-background p-10 sm:p-16 text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-canvas opacity-30 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <h2 className="font-serif-display text-4xl sm:text-6xl tracking-tight max-w-2xl mx-auto leading-[1.05]">
              Start beautifying your <span className="italic">screenshots.</span>
            </h2>
            <p className="mt-5 text-background/70 max-w-md mx-auto">
              Free. No signup. Open it, paste, share.
            </p>
            <Link
              href="/editor"
              className="mt-9 inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-background text-foreground font-medium hover:opacity-90 transition-opacity group"
            >
              Try Snaply
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
