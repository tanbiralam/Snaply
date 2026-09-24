"use client"

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    if (!mounted) return;
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !document.startViewTransition) {
      setTheme(next);
      return;
    }
    // flushSync forces the DOM mutation to happen inside this callback, synchronously,
    // so the browser's "after" snapshot for the crossfade reflects the new theme.
    document.startViewTransition(() => flushSync(() => setTheme(next)));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-lg border hairline hover:bg-secondary transition-colors"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};
