import { Github, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t hairline">
      <div className="container py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-6 h-6 rounded-md bg-foreground text-background font-semibold text-xs">S</span>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Snaply</span>
        </div>
        {/* Placeholder links — non-navigating until real destinations are wired up. */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="cursor-default select-none" aria-disabled="true">Privacy</span>
          <span className="cursor-default select-none" aria-disabled="true">Changelog</span>
          <span className="cursor-default select-none" aria-label="GitHub" role="img"><Github className="w-4 h-4" /></span>
          <span className="cursor-default select-none" aria-label="Twitter" role="img"><Twitter className="w-4 h-4" /></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
