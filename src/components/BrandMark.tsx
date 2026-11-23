import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Viewfinder crop corners around a jade dot: snap, screenshot and crop in one
 *  mark. Corners take the text color; the dot is the accent. Keep in sync with
 *  src/app/icon.svg (the favicon). */
export function LogoSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 11V4h7M21 4h7v7M28 21v7h-7M11 28H4v-7"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.08]"
      />
      <circle
        cx="16"
        cy="16"
        r="4.5"
        className="origin-center fill-primary transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-90"
      />
    </svg>
  );
}

/** Symbol + wordmark. `lg` for the landing navbar, `sm` for tool headers. */
export function BrandMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className="group flex items-center gap-2 text-foreground"
    >
      <LogoSymbol className={size === "lg" ? "h-7 w-7" : "h-[22px] w-[22px]"} />
      <span
        className={cn(
          "font-bold leading-none tracking-[-0.045em]",
          size === "lg" ? "text-[26px]" : "text-[20px]"
        )}
      >
        {site.name}
      </span>
    </Link>
  );
}
