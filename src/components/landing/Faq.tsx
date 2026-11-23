import { Plus } from "lucide-react";

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

// Dashed guide line along an open item's top/bottom edge, running past the
// card into the gutter. Fades in with the card.
const guide =
  "pointer-events-none absolute -inset-x-16 border-t border-dashed hairline opacity-0 transition-opacity duration-160 ease-out group-open:opacity-100";

export function Faq() {
  return (
    <section className="mx-auto max-w-content overflow-hidden px-4 py-24 md:px-6">
      <div className="text-center">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          Everything you need to know about how Snaply handles your images.
        </p>
      </div>

      <div className="mx-auto mt-16 flex max-w-4xl flex-col gap-1 border-x border-dashed hairline">
        {faqs.map((faq) => (
          // `name` makes the items an exclusive accordion natively: opening
          // one closes the others. Open/close animation: `.faq-item` in index.css.
          <details
            key={faq.question}
            name="faq"
            className="faq-item group relative rounded-lg border border-transparent transition-[background-color,border-color] duration-160 ease-out open:border-dashed open:border-strong open:bg-card"
          >
            <span aria-hidden="true" className={`${guide} -top-px`} />
            <span aria-hidden="true" className={`${guide} -bottom-px`} />
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-base font-medium md:px-6 md:text-lg [&::-webkit-details-marker]:hidden">
              {faq.question}
              <Plus
                className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-160 ease-out group-open:rotate-45"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-2xl px-5 pb-6 text-sm leading-relaxed text-muted-foreground md:px-6 md:text-base">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
