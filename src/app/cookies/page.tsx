import type { Metadata } from "next";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookies",
  description: `${SITE.name} sets no tracking cookies. Here is exactly what is stored in your browser and why.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Cookies
      </h1>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/5 p-4">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          We set no cookies at all — no analytics, no advertising, no tracking.
          That is why there is no cookie banner on this site.
        </p>
      </div>

      <div className="mt-10 space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-foreground">
            What is stored in your browser
          </h2>
          <p className="mt-2">
            One thing, and it never leaves your device:
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-background-subtle">
                <tr>
                  <th className="px-3 py-2 font-semibold text-foreground">Key</th>
                  <th className="px-3 py-2 font-semibold text-foreground">Type</th>
                  <th className="px-3 py-2 font-semibold text-foreground">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-[13px] text-foreground">
                    techinstant-tools-theme
                  </td>
                  <td className="px-3 py-2">localStorage</td>
                  <td className="px-3 py-2">
                    Remembers whether you chose light, dark or system, so the
                    site does not flash the wrong theme next time.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            It is a single word like <code className="font-mono text-foreground">dark</code>.
            It contains nothing about you, it is not sent anywhere, and it is not
            a cookie — localStorage is not transmitted with requests the way
            cookies are.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">What we do not do</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>No analytics or measurement scripts.</li>
            <li>No advertising or remarketing pixels.</li>
            <li>No third-party embeds that could set cookies of their own.</li>
            <li>No profile of you, and nothing sold or shared.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Removing it</h2>
          <p className="mt-2">
            Clearing site data for this domain in your browser settings removes
            it. The site keeps working — it just falls back to following your
            system theme.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">If this changes</h2>
          <p className="mt-2">
            If measurement is ever added, this page will say so before it goes
            live, and it will not be the kind that follows you around the web.
            See the{" "}
            <Link href="/privacy" className="font-medium text-brand hover:underline">
              privacy page
            </Link>{" "}
            for how files are handled.
          </p>
        </section>
      </div>
    </div>
  );
}
