import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name} is built by ${SITE.parent} as part of its mission to create useful technology products and digital solutions.`,
  alternates: { canonical: "/about" },
};

const PARENT_BUILDS = [
  "SaaS products",
  "AI solutions",
  "Custom software",
  "Digital products",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Simple tools. Real usefulness.
      </h1>

      <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          {SITE.name} is a growing collection of {TOOLS.length} fast, useful
          tools for students, developers, creators, businesses and everyday
          tasks. No accounts, no email verification, no hoops — open a tool and
          get the job done.
        </p>
        <p>
          Wherever it is technically possible, the work happens inside your own
          browser. Files you choose are read, processed and saved back to your
          device without ever being uploaded. Where a tool genuinely needs a
          server we say so plainly on that tool, rather than making a blanket
          privacy claim the code does not support.
        </p>
        <p>
          {SITE.name} is built by{" "}
          <a
            href={SITE.parentUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand hover:underline"
          >
            {SITE.parent}
          </a>{" "}
          as part of its broader mission to create useful technology products and
          digital solutions.
        </p>
      </div>

      <h2 className="mt-10 text-lg font-bold tracking-tight text-foreground">
        {SITE.parent} also builds
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {PARENT_BUILDS.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/tools" className={buttonVariants()}>
          Explore tools
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={SITE.parentUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          Visit {SITE.parent}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
