import Link from "next/link";
import { tools } from "@/lib/registry/tools";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-content px-4 py-20 text-center md:px-6">
      <h2 className="text-3xl font-bold">
        {tools.length} tools. Nothing ever leaves your browser.
      </h2>
      <div className="mt-8">
        <Link
          href="/tools"
          className="inline-flex h-12 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors duration-120 ease-out hover:bg-primary-hover"
        >
          Browse all tools
        </Link>
      </div>
      <p className="mt-5 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        Free · No uploads · No account
      </p>
    </section>
  );
}
