import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getFeaturedTools, getTool, toolPath, tools } from "@/lib/registry/tools";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { ToolPill } from "@/components/ToolPill";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StylizerSpotlight } from "@/components/landing/StylizerSpotlight";
import { PrivacyComparison } from "@/components/landing/PrivacyComparison";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  const featured = getFeaturedTools();
  const remaining = tools.filter((tool) => !tool.featured);
  const screenshotTool = getTool("create", "screenshot");

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
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#tools"
              className="inline-flex h-12 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors duration-120 ease-out hover:bg-primary-hover"
            >
              Browse tools
            </a>
            {screenshotTool && (
              <Link
                href={toolPath(screenshotTool)}
                className="inline-flex h-12 items-center rounded-md px-6 font-medium text-foreground transition-colors duration-120 ease-out hover:bg-accent"
              >
                Try the {screenshotTool.name}
              </Link>
            )}
          </div>

          <HeroVisual />
        </section>

        <HowItWorks />

        {/* Featured tools + pill strip */}
        <section
          id="tools"
          className="mx-auto max-w-content scroll-mt-14 px-4 py-20 md:px-6"
        >
          <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Tools
          </p>
          <h2 className="mt-4 text-3xl font-bold">Featured tools</h2>
          <div className="mt-8 grid grid-cols-tools gap-4">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>

          {/* Pill strip — everything not featured */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {remaining.map((tool) => (
              <ToolPill key={tool.slug} tool={tool} />
            ))}
            <Link
              href="/tools"
              className="text-sm font-medium text-primary transition-colors duration-120 ease-out hover:text-primary-hover"
            >
              View all tools →
            </Link>
          </div>
        </section>

        <StylizerSpotlight />

        <PrivacyComparison />

        <Faq />

        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
