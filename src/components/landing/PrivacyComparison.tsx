import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";

// What a browser's network tab shows on a tool page: the page's own files load,
// then dropping an image adds nothing. Sizes are illustrative.
const requests = [
  { name: "compress", type: "document", size: "6.2 kB" },
  { name: "main-app.js", type: "script", size: "41.8 kB" },
  { name: "compress-page.js", type: "script", size: "18.3 kB" },
  { name: "layout.css", type: "stylesheet", size: "9.7 kB" },
  { name: "inter-latin.woff2", type: "font", size: "23.1 kB" },
];

function NetworkPanel() {
  return (
    <figure
      aria-label="A browser network panel: after an image is dropped, no new requests are made"
      className="overflow-hidden rounded-2xl bg-card shadow-elev-3"
    >
      <div className="flex items-center gap-4 border-b hairline px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive/60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          Network
        </span>
        <span className="text-muted-foreground">Recording</span>
        <span className="ml-auto text-muted-foreground">All</span>
      </div>

      <table className="w-full text-left font-mono text-[12px]">
        <thead className="text-muted-foreground">
          <tr className="border-b hairline">
            <th className="px-4 py-2 font-normal">Name</th>
            <th className="hidden px-4 py-2 font-normal sm:table-cell">Type</th>
            <th className="px-4 py-2 text-right font-normal">Size</th>
          </tr>
        </thead>
        <tbody className="text-foreground/80">
          {requests.map((r) => (
            <tr key={r.name} className="border-b hairline last:border-0">
              <td className="px-4 py-1.5">{r.name}</td>
              <td className="hidden px-4 py-1.5 text-muted-foreground sm:table-cell">
                {r.type}
              </td>
              <td className="px-4 py-1.5 text-right tabular-nums text-muted-foreground">
                {r.size}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* The moment that matters: a file goes in, nothing goes out. */}
      <div className="flex items-center gap-3 bg-primary/[0.07] px-4 py-2 font-mono text-[12px] text-primary">
        <span className="h-px flex-1 bg-primary/30" />
        photo.jpg dropped · 2.4 MB
        <span className="h-px flex-1 bg-primary/30" />
      </div>
      <div className="grid place-items-center gap-1 px-4 py-9 text-center">
        <p className="text-sm text-muted-foreground">No new requests</p>
        <p className="font-mono text-[12px] text-muted-foreground/70">0 B uploaded</p>
      </div>
    </figure>
  );
}

export function PrivacyComparison() {
  return (
    <section className="mx-auto max-w-content px-4 py-24 md:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            Your images never leave this tab.
          </h2>
          <p className="mt-6 max-w-[480px] text-lg text-muted-foreground">
            Most online image tools upload your file, process it on their server
            and send it back. {site.name} does the work inside your browser, so
            there is nothing to upload and nothing to keep.
          </p>
          <p className="mt-4 max-w-[480px] text-lg text-muted-foreground">
            You don&apos;t have to take our word for it. Open your browser&apos;s
            network tab, drop an image, and watch.
          </p>

          <p className="mt-8 max-w-[480px] text-sm text-foreground/70">
            It&apos;s also free with no limits, needs no account, and the code is
            public under the MIT license.{" "}
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-120 hover:decoration-foreground"
            >
              Read the source
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        </div>

        <NetworkPanel />
      </div>
    </section>
  );
}
