import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-mark";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";

const COMPANY = [
  { label: "TechInstant", href: `${SITE.parentUrl}`, external: true },
  { label: "About", href: "/about" },
  { label: "Products", href: `${SITE.parentUrl}/products`, external: true },
  { label: "Solutions", href: `${SITE.parentUrl}/solutions`, external: true },
  { label: "Contact", href: `${SITE.parentUrl}/contact`, external: true },
];

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-background-subtle">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <BrandLockup />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Free tools for everyday work.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {SITE.name} is a product by{" "}
              <a
                href={SITE.parentUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand hover:underline"
              >
                {SITE.parent}
              </a>
              .
            </p>
            <a
              href={SITE.parentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              Explore TechInstant
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-foreground">Tools</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="transition-colors hover:text-brand"
                  >
                    {c.name.replace(" Tools", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-foreground">Company</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {COMPANY.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-brand"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-brand"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-foreground">Legal</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {LEGAL.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE.parent}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
