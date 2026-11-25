import Image from "next/image";
import { ArrowUpRight, Plus } from "lucide-react";
import cat from "../../../public/landing/faq-cat.jpg";
import { site } from "@/lib/site";

const faqs = [
  {
    question: "Is it really free?",
    answer:
      "Yes. No tiers, limits, watermarks, or ads. Static hosting costs us almost nothing, so it stays free.",
  },
  {
    question: "Where do my images go?",
    answer:
      "Nowhere. They're processed in your browser's memory and never uploaded. You can verify in DevTools' network tab.",
  },
  {
    question: "Do I need an account?",
    answer: "No. There's nothing to sign up for.",
  },
  {
    question: "What formats are supported?",
    answer:
      "Every tool reads PNG, JPEG, and WebP. Compress & Convert also reads GIF, BMP, ICO, AVIF, and a few less common formats, and exports to PNG, JPEG, WebP, AVIF, BMP, or ICO.",
  },
  {
    question: "Is Snaply open source?",
    answer:
      "Yes — the entire codebase is public on GitHub under the MIT license. Read the code, self-host it, or send a pull request.",
  },
  {
    question: "Can I request a tool?",
    answer:
      "The whole roadmap is live, but if there's something else you need, open an issue on GitHub — it might be next.",
  },
];

/* FAQPage structured data generated from the same array the page renders. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export function Faq() {
  return (
    <section className="mx-auto max-w-content px-4 py-24 md:px-6">
      {/* Mobile order: heading, questions, cat. Desktop: heading + cat on the
          left, questions spanning the right. */}
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:grid-rows-[auto_1fr] lg:gap-x-20">
        <div>
          <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            Questions
          </h2>
          <p className="mt-5 max-w-[360px] text-lg text-muted-foreground">
            The short answers.
          </p>
        </div>


        <div className="flex flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {faqs.map((faq) => (
            // `name` makes the items an exclusive accordion natively: opening
            // one closes the others. Open/close animation: `.faq-item` in index.css.
            <details
              key={faq.question}
              name="faq"
              className="faq-item group relative rounded-2xl transition-[background-color,box-shadow] duration-160 ease-out after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border after:transition-opacity last:after:hidden open:bg-card open:shadow-elev-1 open:after:opacity-0 md:after:inset-x-6 [&:has(+[open])]:after:opacity-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 py-5 text-base font-medium transition-colors duration-120 hover:text-foreground active:bg-secondary/60 md:px-6 md:text-lg [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-160 ease-out group-hover:bg-secondary group-hover:text-foreground group-open:rotate-45 group-open:bg-secondary group-open:text-foreground">
                  <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-[60ch] px-4 pb-6 text-base leading-relaxed text-muted-foreground md:px-6">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

          {/* A tilted print that straightens on hover. */}
          <div className="group w-56 self-start justify-self-center -rotate-3 rounded-2xl bg-card p-2.5 pb-4 shadow-elev-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0 sm:w-64 lg:col-start-1 lg:row-start-2 lg:justify-self-start">
            <Image
              src={cat}
              alt="A cat with a thinking-face hand on its chin, surrounded by question marks"
              sizes="256px"
              placeholder="blur"
              className="aspect-square rounded-xl object-cover"
            />
            <p className="mt-3 px-1 text-base font-medium text-foreground">
              Have another question?
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1 px-1 text-sm text-muted-foreground">
              Ask on
              <a href={`${site.github}/issues`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-120 hover:decoration-foreground">
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              or
              <a href={site.x} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="inline-flex items-center gap-0.5 font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-120 hover:decoration-foreground">
                X
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </p>
          </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
