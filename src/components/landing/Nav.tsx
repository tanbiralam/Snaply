import { Github } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const Nav = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b hairline">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-foreground text-background font-semibold text-sm">
            S
          </span>
          <span className="font-semibold tracking-tight text-[15px]">Snaply</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
          <a href="#use-cases" className="hover:text-foreground transition-colors">Use cases</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden sm:grid place-items-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border hairline"
          >
            <Github className="w-4 h-4" />
          </a>
          <Link
            href="/editor"
            className="inline-flex items-center h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try Snaply
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Nav;
