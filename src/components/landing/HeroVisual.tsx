import Image from "next/image";
import heroCollage from "../../../public/landing/hero-collage.webp";

/**
 * A collage representing the whole suite (code, crop/redact, quote, favicon
 * set, social card), not one tool's before/after — the hero's job is to say
 * "12 tools", not "screenshot styling".
 */
export function HeroVisual() {
  return (
    <figure className="relative mt-12 sm:mt-16">
      <Image
        src={heroCollage}
        alt="A collage of outputs from the toolkit: a code snippet, a photo being cropped and pixelated, a quote card, a set of app icons, and a social post card."
        sizes="(max-width: 768px) 100vw, 1100px"
        priority
        className="w-full rounded-xl shadow-modal ring-1 ring-border"
      />
    </figure>
  );
}
