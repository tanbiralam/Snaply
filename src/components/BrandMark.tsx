import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The full icon+wordmark lockup, swapped per theme (the wordmark ink is
 * baked into the raster, not a CSS token, so light/dark need separate
 * files — see logo-light.webp / logo-dark.webp).
 */
export function BrandMark() {
  const { light, dark, width, height } = site.logo;
  return (
    <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
      <Image
        src={light}
        alt={`${site.name} logo`}
        width={width}
        height={height}
        className="dark:hidden"
        priority
      />
      <Image
        src={dark}
        alt={`${site.name} logo`}
        width={width}
        height={height}
        className="hidden dark:block"
        priority
      />
    </Link>
  );
}
