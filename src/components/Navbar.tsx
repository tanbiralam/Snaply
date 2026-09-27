import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPaletteButton } from "@/components/CommandPalette";
import { BrandMark } from "@/components/BrandMark";

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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
