import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that apply when you use ${SITE.name} — free browser-based tools from ${SITE.parent}.`,
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    heading: "What this is",
    body: [
      `${SITE.name} is a collection of free tools operated by ${SITE.parent}. You can use them for personal or commercial work, without an account and without paying.`,
      "You do not need our permission to use the output. Files you create with these tools are yours.",
    ],
  },
  {
    heading: "No warranty",
    body: [
      "The tools are provided as they are. We work hard to make them correct, but we cannot promise they will always be available, error-free, or right for your particular situation.",
      "Keep your own copy of anything important before you process it. We have no way to recover a file for you, because we never receive one.",
    ],
  },
  {
    heading: "Estimates are estimates",
    body: [
      "Calculators here — including the health, pregnancy, BMI and academic tools — produce estimates from the numbers you enter and from published averages. They are general information, not professional advice.",
      "Nothing on this site is medical, legal, financial or academic advice. For decisions that matter, talk to a qualified professional. Health tools in particular must not be used for diagnosis or as a method of contraception.",
    ],
  },
  {
    heading: "Fair use",
    body: [
      "Please do not use these tools to process material you have no right to, to break the law, or to attack the service or the people using it.",
      "Automated bulk use that degrades the service for others is not permitted.",
    ],
  },
  {
    heading: "Liability",
    body: [
      `To the extent the law allows, ${SITE.parent} is not liable for loss or damage arising from your use of these tools — including lost files, lost profit, or decisions made on the basis of an estimate produced here.`,
      "Nothing here limits liability that cannot be limited by law.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "Tools get added, changed and occasionally retired. These terms may change with them. Continuing to use the site after a change means you accept the current version.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Terms of Use
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Plain-language terms for a free set of browser tools. Last updated{" "}
        {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}.
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {s.heading}
            </h2>
            {s.body.map((p) => (
              <p key={p} className="mt-2 text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Your files and data
          </h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Almost everything here runs in your browser and never reaches a
            server. See the{" "}
            <Link href="/privacy" className="font-medium text-brand hover:underline">
              privacy page
            </Link>{" "}
            for exactly what that means and where the exceptions would be.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Contact</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Questions about these terms go to{" "}
            <a
              href={`${SITE.parentUrl}/contact`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand hover:underline"
            >
              {SITE.parent}
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-12 rounded-xl border border-border bg-background-subtle p-4 text-sm text-muted-foreground">
        This page is written to be readable rather than exhaustive. It is not
        legal advice, and it has not been reviewed by a lawyer — if {SITE.parent}{" "}
        needs terms that stand up in a specific jurisdiction, have a solicitor
        check them.
      </p>
    </div>
  );
}
