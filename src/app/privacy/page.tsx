import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE.name} handles your files and data. Browser-based tools process files locally and do not upload them.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Privacy
      </h1>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/5 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your files are processed locally in your browser whenever possible.
          Files are not uploaded to our servers for these tools.
        </p>
      </div>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-foreground">
            How browser-based tools work
          </h2>
          <p className="mt-2">
            Most tools here read your file with the browser&apos;s own file APIs,
            do the work in JavaScript on your device, and hand the result
            straight back to you as a download. The file never travels over the
            network, so there is nothing for us to store, log or see.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">
            Where that is not true
          </h2>
          <p className="mt-2">
            A small number of future tools — AI features in particular — cannot
            run entirely on your device and will need to send data to a service
            to work at all. Any such tool will say so clearly on its own page
            before you use it. We will not describe a tool as local unless the
            implementation actually is.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">
            What we do not do
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>We do not collect or keep the files you open in these tools.</li>
            <li>We do not require an account to use a tool.</li>
            <li>We do not store generated passwords.</li>
            <li>We do not sell personal data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Questions</h2>
          <p className="mt-2">
            {SITE.name} is operated by {SITE.parent}. If something here is
            unclear, get in touch through{" "}
            <a
              href={`${SITE.parentUrl}/contact`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand hover:underline"
            >
              the {SITE.parent} contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
