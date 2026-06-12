import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-sm font-semibold text-background"
          >
            {site.name.charAt(0)}
          </span>
          <span className="text-base font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* TODO: point at /tools after unit 4 */}
          <Link
            href="/#tools"
            className="text-sm text-muted-foreground transition-colors duration-120 ease-out hover:text-foreground"
          >
            All tools
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
