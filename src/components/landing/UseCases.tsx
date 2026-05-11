"use client";

import Image from "next/image";

const cases = [
  {
    tag: "Developers",
    quote: "Ship a tweet about a UI tweak without it looking like a bug report.",
  },
  {
    tag: "Founders",
    quote:
      "Product updates that look like product updates — not Slack screenshots.",
  },
  {
    tag: "Designers",
    quote:
      "Drop work into Figma, Notion, or a deck without re-mocking the frame.",
  },
];

const testimonials = [
  {
    id: 1,
    image: "/images/d0bfdaae6ctg1.png",
    author: "Alex M.",
    handle: "@alexmdev",
    avatarColor: "hsl(14 88% 65%)",
    avatarLetter: "A",
    caption: "Turned my dashboard screenshot into something I'm proud to share.",
    likes: 247,
    tag: "Dashboard UI",
  },
  {
    id: 2,
    image: "/images/snaply-1778083834855.png",
    author: "Sara K.",
    handle: "@saradesigns",
    avatarColor: "hsl(280 50% 60%)",
    avatarLetter: "S",
    caption: "My SaaS launch post got 3× the engagement thanks to Snaply. Insane!",
    likes: 389,
    tag: "SaaS Launch",
  },
  {
    id: 3,
    image: "/images/54e14c251374b5c959fda473da8d7a67987d2bc6-2822x1458.webp",
    author: "James T.",
    handle: "@jt_builds",
    avatarColor: "hsl(220 60% 60%)",
    avatarLetter: "J",
    caption: "One click to go from ugly browser grab to a polished product shot.",
    likes: 184,
    tag: "Product Shot",
  },
  {
    id: 4,
    image: "/images/86f576610d0cd0d6a2e2b54a08a391238ac75434-1200x630.webp",
    author: "Maya R.",
    handle: "@mayardesign",
    avatarColor: "hsl(150 45% 50%)",
    avatarLetter: "M",
    caption: "Finally an OG image that doesn't look like a prototype.",
    likes: 512,
    tag: "OG / Social",
  },
];


const TestimonialCard = ({ t }: { t: (typeof testimonials)[0] }) => {


  return (
    <div
      className="group rounded-2xl border hairline bg-background overflow-hidden
                 hover:shadow-soft transition-all duration-300 hover:-translate-y-1
                 flex flex-col"
    >
      {/* Screenshot */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        <Image
          src={t.image}
          alt={`Screenshot styled by ${t.author}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Tag badge */}
        <span
          className="absolute top-3 left-3 text-[10px] uppercase tracking-widest
                       font-semibold px-2.5 py-1 rounded-full
                       bg-background/80 backdrop-blur-sm border hairline text-primary"
        >
          {t.tag}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Quote */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          "{t.caption}"
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold text-background shrink-0"
              style={{ background: t.avatarColor }}
            >
              {t.avatarLetter}
            </div>
            <div className="leading-none">
              <p className="text-sm font-medium">{t.author}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t.handle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UseCases = () => {
  return (
    <section id="use-cases">
      <div className="container py-20 sm:py-28">
        {/* ── Who it's for ─────────────────────────────── */}
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
              <span className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                {c.tag}
              </span>
              <p className="mt-4 font-serif-display text-2xl leading-snug tracking-tight">
                "{c.quote}"
              </p>
            </article>
          ))}
        </div>

        {/* ── Community screenshots ─────────────────────── */}
        <div className="mt-24">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Made with Snaply
              </p>
              <h3 className="font-serif-display text-3xl sm:text-4xl tracking-tight">
                From the{" "}
                <span className="italic">community.</span>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs sm:text-right">
              Real screenshots, styled by real users — no mockups, no
              stock&nbsp;photos.
            </p>
          </div>

          {/* Grid of testimonial cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </div>

        {/* ── Social proof strip ────────────────────────── */}
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
            Loved by{" "}
            <span className="text-foreground font-medium">2,400+</span>{" "}
            developers, designers &amp; indie founders.
          </p>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
