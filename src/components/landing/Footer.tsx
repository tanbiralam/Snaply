import { Github, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t hairline">
      <div className="container py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-6 h-6 rounded-md bg-foreground text-background font-semibold text-xs">S</span>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Snaply</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Changelog</a>
          <a href="#" aria-label="GitHub" className="hover:text-foreground transition-colors"><Github className="w-4 h-4" /></a>
          <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
