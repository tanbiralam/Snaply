import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORY_LABELS, getToolsByCategory, tools, type ToolCategory } from "@/lib/registry/tools";
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

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ToolCategory[];

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
            Free · Private · In-browser
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
              Browse all {tools.length} tools
            </Link>
            <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              or press ⌘K to jump to any tool
            </span>
          </div>

          <HeroVisual />
        </section>

        {/* Every tool, grouped by category */}
        <section
          id="tools"
          className="mx-auto max-w-content scroll-mt-14 px-4 py-20 md:px-6"
        >
          <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Tools
          </p>
          <h2 className="mt-4 text-3xl font-bold">{tools.length} tools, one toolkit</h2>

          <div className="mt-8 flex flex-col gap-12">
            {CATEGORIES.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-foreground">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="mt-4 grid grid-cols-tools gap-4">
                  {getToolsByCategory(category).map((tool) => (
                    <FeaturedToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/tools"
            className="mt-8 inline-block text-sm font-medium text-primary transition-colors duration-120 ease-out hover:text-primary-hover"
          >
            Search the directory →
          </Link>
        </section>

        <PrivacyComparison />

        <Faq />

        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
