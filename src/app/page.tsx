import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Infinity as InfinityIcon, UserX } from "lucide-react";
import { site } from "@/lib/site";
import { getFeaturedTools, getTool, toolPath, tools } from "@/lib/registry/tools";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { ToolPill } from "@/components/ToolPill";

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
};

const valueProps = [
  {
    icon: ShieldCheck,
    title: "Nothing ever uploads",
    body: "Every tool processes your images locally on your device. There is no server to send them to.",
  },
  {
    icon: InfinityIcon,
    title: "Free forever",
    body: "No usage limits, no paywalls, no ads. Every tool is fully available to everyone.",
  },
  {
    icon: UserX,
    title: "No account needed",
    body: "Open a tool and start working. No signup, no login, no email.",
  },
];

export default function LandingPage() {
  const featured = getFeaturedTools();
  const remaining = tools.filter((tool) => !tool.featured);
  const screenshotTool = getTool("create", "screenshot");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* Hero */}
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
        </section>

        {/* Featured tools */}
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
          <div className="mt-6 flex flex-wrap gap-2">
            {remaining.map((tool) => (
              <ToolPill key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* Privacy / free-forever */}
        <section className="mx-auto max-w-content px-4 py-20 md:px-6">
          <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Privacy
          </p>
          <h2 className="mt-4 text-3xl font-bold">
            Private by architecture, not by policy
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {valueProps.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-lg border bg-card p-5"
              >
                <Icon
                  className="h-5 w-5 text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
