const cases = [
  {
    tag: "Developers",
    quote: "Ship a tweet about a UI tweak without it looking like a bug report.",
  },
  {
    tag: "Founders",
    quote: "Product updates that look like product updates — not Slack screenshots.",
  },
  {
    tag: "Designers",
    quote: "Drop work into Figma, Notion, or a deck without re-mocking the frame.",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="border-t hairline bg-secondary/40">
      <div className="container py-20 sm:py-28">
        <div className="max-w-2xl mb-14">
          <p className="text-sm text-muted-foreground mb-3">Who uses Snaply</p>
          <h2 className="font-serif-display text-4xl sm:text-5xl tracking-tight">
            Built for people who <span className="italic">post things.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {cases.map((c) => (
            <article
              key={c.tag}
              className="rounded-2xl border hairline bg-background p-7 hover:shadow-soft transition-shadow"
            >
              <span className="text-[11px] uppercase tracking-wider text-primary font-semibold">{c.tag}</span>
              <p className="mt-4 font-serif-display text-2xl leading-snug tracking-tight">"{c.quote}"</p>
            </article>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col sm:flex-row items-center gap-5 justify-center text-center">
          <div className="flex -space-x-2">
            {[
              "hsl(14 88% 65%)",
              "hsl(220 60% 60%)",
              "hsl(150 45% 50%)",
              "hsl(280 50% 60%)",
              "hsl(35 80% 60%)",
            ].map((bg, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-background shadow-soft grid place-items-center text-xs font-semibold text-background"
                style={{ background: bg }}
              >
                {["A", "M", "K", "J", "S"][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Loved by <span className="text-foreground font-medium">2,400+</span> developers, designers & indie founders.
          </p>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
