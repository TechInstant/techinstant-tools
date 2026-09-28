import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";
import { CATEGORIES } from "@/lib/categories";

/**
 * Site-level FAQ. Rendered as real text (not collapsed behind JS) and mirrored
 * into FAQPage structured data, which is what search engines read.
 */
export function FAQ() {
  const toolCount = TOOLS.filter((t) => t.status === "live").length;
  const categoryCount = CATEGORIES.filter((c) =>
    TOOLS.some((t) => t.category === c.id)
  ).length;

  const items: { q: string; a: string }[] = [
    {
      q: `What is ${SITE.name}?`,
      a: `${SITE.name} is a free collection of ${toolCount} online tools across ${categoryCount} categories — PDF and image editing, developer utilities, calculators, and tools for students, businesses and everyday health questions. Almost all of them run entirely inside your browser, so your files and the numbers you type never leave your device. There is no account to create and nothing to install.`,
    },
    {
      q: `Who is behind ${SITE.name}?`,
      a: `${SITE.name} is built and maintained by the ${SITE.parent} team, as part of ${SITE.parent}'s wider work building SaaS products, AI solutions and custom software. The tools exist because these are the small jobs people need doing constantly, and most of the free options online are slow, covered in adverts, or quietly upload your files.`,
    },
    {
      q: "Are the tools really free to use?",
      a: "Yes — genuinely free, with no trial, no watermark on your output, no daily limit and no account. Nothing is held back behind a paid tier. If that ever changes, the tools that are free today will stay free.",
    },
    {
      q: "Can I use the tools for commercial projects?",
      a: "Yes. Compress a PDF for a client, generate QR codes for a product, resize images for a shop — all fine, and whatever you produce is yours. You do not need to credit us or ask permission.",
    },
    {
      q: "Do you store or see my files?",
      a: "No. The browser-based tools read your file, do the work on your device, and hand the result straight back to you. Nothing is uploaded, so there is nothing for us to store, log or look at. Any tool that does need to contact an outside service says so on its own page, before you use it.",
    },
    {
      q: "Do I need to create an account?",
      a: "No, and there isn't one. Open a tool and use it.",
    },
    {
      q: "Which browsers do the tools work in?",
      a: "Any current version of Chrome, Edge, Firefox or Safari, on desktop and mobile. The file-based tools use standard browser APIs, so a phone handles most of them as well as a laptop — very large PDFs are limited by your device's memory rather than the tool.",
    },
    {
      q: "Can I suggest a tool?",
      a: `Yes, please do — email ${SITE.email} and say what you were trying to do rather than which tool you want, because the job often has a simpler answer than the tool you had in mind. The list grows based on what people actually ask for.`,
    },
    {
      q: "How do I report a bug or get in touch?",
      a: `Email ${SITE.email}, or message us on any of the ${SITE.parent} social accounts linked in the footer. For a bug it helps enormously to say which tool, which browser, and what you were doing when it went wrong — and if a file was involved, please describe it rather than attaching it, since we would rather not have your documents.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section className="border-t border-border bg-background-subtle">
      <script
        type="application/ld+json"
        // Serialising our own static content — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-muted-foreground">
          The things people ask most often.
        </p>

        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((item, i) => (
            <details key={item.q} className="group p-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground marker:content-none">
                {item.q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
