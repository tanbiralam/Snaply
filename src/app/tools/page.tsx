import type { Metadata } from "next";
import { tools } from "@/lib/registry/tools";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolDirectory } from "@/components/ToolDirectory";

export const metadata: Metadata = {
  title: "All tools",
  description: `Every free, in-browser image tool in one place — ${tools.map((t) => t.name).join(", ")}.`,
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-content px-4 pb-20 pt-12 md:px-6">
        <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          Directory · {tools.length} tools
        </p>
        <h1 className="mt-4 text-3xl font-bold">All tools</h1>
        <p className="mt-3 max-w-hero text-base text-muted-foreground">
          Everything runs in your browser — nothing is uploaded.
        </p>
        <ToolDirectory />
      </main>
      <Footer />
    </div>
  );
}
