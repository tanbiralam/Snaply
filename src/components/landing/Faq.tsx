import { ChevronDown } from "lucide-react";

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
    question: "Can I request a tool?",
    answer:
      "The whole roadmap is live, but if there's something else you need, reach out — it might be next.",
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
    <section className="mx-auto max-w-content px-4 py-20 md:px-6">
      <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        FAQ
      </p>
      <h2 className="mt-4 text-3xl font-bold">Questions, answered</h2>

      <div className="mt-8 flex flex-col gap-2">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-lg border bg-card px-5 py-4 transition-[border-color,box-shadow] duration-120 ease-out hover:border-strong hover:shadow-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-medium [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-120 ease-out group-open:rotate-180"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
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
