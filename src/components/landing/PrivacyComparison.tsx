import {
  ArrowRight,
  Download,
  Github,
  Image as ImageIcon,
  Infinity as InfinityIcon,
  Server,
  ShieldCheck,
  Upload,
  UserX,
} from "lucide-react";
import { site } from "@/lib/site";

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
  {
    icon: Github,
    title: "Open source",
    body: "Don't just take our word for it — the code is public on GitHub, so the privacy claims are verifiable.",
  },
];

export function PrivacyComparison() {
  return (
    <section className="mx-auto max-w-content px-4 py-20 md:px-6">
      <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        Privacy
      </p>
      <h2 className="mt-4 text-3xl font-bold">
        Private by architecture, not by policy
      </h2>

      {/* Comparison: them vs. this site */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg border bg-secondary p-5">
          <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Most online tools
          </span>
          <div
            aria-hidden="true"
            className="flex items-center gap-3 text-muted-foreground"
          >
            <Upload className="h-5 w-5" strokeWidth={1.5} />
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            <span className="flex items-center gap-1.5 rounded-md border px-2.5 py-1">
              <Server className="h-4 w-4" strokeWidth={1.5} />
              <span className="font-mono text-2xs uppercase tracking-wider">
                Their server
              </span>
            </span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            <Download className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">
            Your image travels to someone else&apos;s machine before it comes
            back to you.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-primary/50 bg-card p-5">
          <span className="font-mono text-2xs font-medium uppercase tracking-wider text-primary">
            {site.name}
          </span>
          <div aria-hidden="true" className="rounded-md border bg-secondary">
            <div className="flex items-center gap-1.5 border-b px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="grid place-items-center py-4">
              <ImageIcon className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Processing happens in this tab. Close it, and nothing persists
            anywhere.
          </p>
        </div>
      </div>

      {/* Compact value props */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
