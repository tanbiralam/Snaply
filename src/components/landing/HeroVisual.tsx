import Image from "next/image";
import heroCollageLight from "../../../public/landing/hero-collage-light.webp";
import heroCollageDark from "../../../public/landing/hero-collage-dark.webp";

const ALT =
  "A collage of outputs from the toolkit: a code snippet, a photo being cropped and pixelated, a quote card, a set of app icons, and a social post card.";

/**
 * A collage representing the whole suite (code, crop/redact, quote, favicon
 * set, social card), not one tool's before/after — the hero's job is to say
 * "12 tools", not "screenshot styling". Two renders (not one recolored via
 * CSS) since the illustration's own colors are baked into the raster, same
 * reasoning as BrandMark's light/dark logo files.
 */
export function HeroVisual() {
  return (
    <figure className="relative mt-12 sm:mt-16">
      <Image
        src={heroCollageLight}
        alt={ALT}
        sizes="(max-width: 768px) 100vw, 1100px"
        priority
        className="w-full rounded-xl shadow-modal ring-1 ring-border dark:hidden"
      />
      <Image
        src={heroCollageDark}
        alt={ALT}
        sizes="(max-width: 768px) 100vw, 1100px"
        priority
        className="hidden w-full rounded-xl shadow-modal ring-1 ring-border dark:block"
      />
    </figure>
  );
}
