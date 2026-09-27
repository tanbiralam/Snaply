import Link from "next/link";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPaletteButton } from "@/components/CommandPalette";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 md:px-6">
        <BrandMark />

        <div className="flex items-center gap-3">
          <CommandPaletteButton />
          <Link
            href="/tools"
            className="text-sm text-muted-foreground transition-colors duration-120 ease-out hover:text-foreground"
          >
            All tools
          </Link>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-lg border hairline hover:bg-secondary transition-colors"
          >
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
