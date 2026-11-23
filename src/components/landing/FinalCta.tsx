import Image from "next/image";
import Link from "next/link";
import photo from "../../../public/landing/hero.jpg";

/** Closing panel: the hero photo again, framed instead of full-bleed, so the
 *  page ends where it started. */
export function FinalCta({ toolCount }: { toolCount: number }) {
  return (
    <section className="mx-auto max-w-content px-4 pb-24 pt-8 md:px-6">
      <div className="relative isolate overflow-hidden rounded-[28px] shadow-elev-3">
        <Image
          src={photo}
          alt=""
          fill
          sizes="(min-width: 1200px) 1152px, 100vw"
          className="-z-20 object-cover object-[50%_75%] dark:brightness-[0.5]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-[15] hidden bg-background mix-blend-color dark:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--background)/0.9)_0%,hsl(var(--background)/0.6)_45%,hsl(var(--background)/0)_80%)]"
        />

        <div className="max-w-[560px] px-8 py-16 md:px-14 md:py-20">
          <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            Got an image to fix?
          </h2>
          <p className="mt-4 text-lg text-foreground/75">
            {toolCount} tools, all running in your browser. Nothing to install,
            nothing to sign up for.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#start"
              className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),0_1px_2px_hsl(var(--primary)/0.4),0_6px_16px_-6px_hsl(var(--primary)/0.6)] transition-[background-color,transform] duration-160 ease-out hover:bg-primary-hover motion-safe:hover:-translate-y-px"
            >
              Drop an image
            </a>
            <Link
              href="/tools"
              className="inline-flex h-12 items-center rounded-full bg-card/85 px-6 font-medium text-foreground shadow-elev-1 backdrop-blur transition-[box-shadow,transform] duration-160 ease-out hover:shadow-elev-2 motion-safe:hover:-translate-y-px"
            >
              Browse all tools
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
