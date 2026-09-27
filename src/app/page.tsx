import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { site } from "@/lib/site";
import { getFeaturedTools, getLiveTools } from "@/lib/registry/tools";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedToolCard } from "@/components/FeaturedToolCard";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { PrivacyComparison } from "@/components/landing/PrivacyComparison";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
};

// Local, single-use: same card shape as FeaturedToolCard so it sits flush in
// the same grid, but with no thumbnail to fetch for a tile that isn't a tool.
function MoreToolsCard({ count }: { count: number }) {
  return (
    <Link
      href="/tools"
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-[border-color,transform,box-shadow] duration-120 ease-out hover:border-strong hover:shadow-card motion-safe:hover:-translate-y-0.5"
    >
      <div className="flex aspect-video w-full items-center justify-center bg-muted">
        <span className="font-mono text-4xl font-semibold text-muted-foreground">
          +{count}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <LayoutGrid className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium text-card-foreground">
            More tools
          </h3>
          <p className="text-sm text-muted-foreground">
            Browse the full directory, or search with ⌘K.
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        // ponytail: CSS dot grid, no asset/dep; --border keeps it theme-aware
        backgroundImage:
          "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <Navbar />

      <main>
        {/* Hero + product visual */}
        <section className="mx-auto max-w-content px-4 py-20 md:px-6">
          <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Free · Private · In-browser · Open source
          </p>
          <h1 className="mt-4 max-w-hero text-3xl font-bold sm:text-5xl">
            Create, edit, and optimize images — without uploading a single
            one.
          </h1>
          <p className="mt-5 max-w-hero text-base text-muted-foreground">
            {site.tagline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/tools"
              className="inline-flex h-12 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors duration-120 ease-out hover:bg-primary-hover"
            >
              Browse all tools
            </Link>
            <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              or press ⌘K to jump to any tool
            </span>
          </div>

          <HeroVisual />
        </section>

        {/* Curated grid — the rest live on /tools, not duplicated here */}
        <section
          id="tools"
          className="mx-auto max-w-content scroll-mt-14 px-4 py-20 md:px-6"
        >
          <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Tools
          </p>
          <h2 className="mt-4 text-3xl font-bold">Popular tools</h2>

          <div className="mt-8 grid grid-cols-tools gap-4">
            {getFeaturedTools().map((tool) => (
              <FeaturedToolCard key={tool.slug} tool={tool} />
            ))}
            <MoreToolsCard
              count={getLiveTools().length - getFeaturedTools().length}
            />
          </div>
        </section>

        <PrivacyComparison />

        <Faq />

        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
