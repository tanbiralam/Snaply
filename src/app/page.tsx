import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import heroPhoto from "../../public/landing/hero.jpg";
import { site } from "@/lib/site";
import { getFeaturedTools, getLiveTools } from "@/lib/registry/tools";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedToolCard } from "@/components/FeaturedToolCard";
import { HeroDropzone } from "@/components/landing/HeroDropzone";
import { PrivacyComparison } from "@/components/landing/PrivacyComparison";
import { JsonLd } from "@/components/JsonLd";
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
      className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-elev-1 transition-[transform,box-shadow] duration-160 ease-out hover:shadow-elev-2 motion-safe:hover:-translate-y-1 motion-safe:active:scale-[0.98] active:duration-75"
    >
      <div className="flex aspect-video w-full items-center justify-center bg-muted shadow-elev-inset">
        <span className="text-5xl font-semibold tracking-tight text-muted-foreground transition-colors duration-160 group-hover:text-foreground">
          +{count}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-5">
        <h3 className="text-lg font-medium text-card-foreground">More tools</h3>
        <p className="text-sm text-muted-foreground">
          Browse the full directory, or search with ⌘K.
        </p>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          description: site.description,
        }}
      />

      <main>
        {/* Hero: misty landscape photo, copy left, dropzone right */}
        <section id="start" className="relative isolate overflow-hidden">
          <Image
            src={heroPhoto}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="-z-20 object-cover object-[50%_40%] dark:brightness-[0.5]"
          />
          {/* Dark theme: recolor the (cool blue / cream) photo to the page's own
              green-graphite hue, keeping only its light and shadow. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-[15] hidden bg-background mix-blend-color dark:block"
          />
          {/* Mist: page color washes in from the left (copy side) and the
              bottom (into the next section), so text stays readable on both themes. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--background)/0.92)_0%,hsl(var(--background)/0.7)_40%,hsl(var(--background)/0.05)_75%),linear-gradient(0deg,hsl(var(--background))_0%,transparent_28%)]"
          />
          <Navbar overlay />

          <div className="mx-auto grid max-w-content items-center gap-12 px-4 pb-24 pt-32 md:px-6 lg:min-h-[760px] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-28">
            <div>
              <h1 className="text-[clamp(2.75rem,5.6vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground">
                Image tools that stay on your device.
              </h1>
              <p className="mt-6 max-w-[460px] text-lg text-foreground/75">
                Compress, resize, remove backgrounds, blur, watermark and make
                favicons or social cards. Everything runs in your browser.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/tools"
                  className="inline-flex h-11 items-center rounded-full bg-card/85 px-5 text-sm font-medium text-foreground shadow-elev-1 backdrop-blur transition-[box-shadow,transform] duration-160 ease-out hover:shadow-elev-2 motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.97] active:duration-75"
                >
                  Browse all {getLiveTools().length} tools
                </Link>
                <span className="hidden text-sm text-foreground/60 sm:inline">
                  Free, no sign-up, open source.
                </span>
              </div>
            </div>

            <HeroDropzone />
          </div>

          <a
            href="https://unsplash.com/photos/silhouette-of-mountains-during-daytime-dTSaC-S-7fs?utm_source=snaply&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-4 font-mono text-2xs text-foreground/45 transition-colors duration-120 hover:text-foreground md:right-6"
          >
            Photo: Ricardo Gomez Angel / Unsplash
          </a>
        </section>

        {/* Curated grid — the rest live on /tools, not duplicated here */}
        <section
          id="tools"
          className="mx-auto max-w-content scroll-mt-14 px-4 py-20 md:px-6"
        >
          <h2 className="text-3xl font-bold tracking-tight">Popular tools</h2>

          {/* Fixed 1/2/4 columns for exactly 8 cards (7 featured + More), so
              no row is ever left with an orphan. */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <FinalCta toolCount={getLiveTools().length} />
      </main>

      <Footer />
    </div>
  );
}
