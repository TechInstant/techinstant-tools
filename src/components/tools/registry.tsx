import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Resolves a tool slug to its interactive component.
 *
 * This used to be a literal map of 50 `dynamic(() => import("./implementations/x"))`
 * entries. That reads well but costs every visitor dearly: because the module
 * statically named all 50 implementations, the bundler put their shared
 * dependencies into a chunk the page loaded eagerly — so opening the Word
 * Counter downloaded ~97kB of pdf-lib it never uses.
 *
 * A single template-literal import instead creates one lazy context. Each
 * implementation is still its own chunk, but nothing is named until a slug asks
 * for it, so a page only ever fetches the tool it is actually showing.
 */
const loading = () => (
  <div className="h-40 animate-pulse rounded-xl border border-border bg-muted" />
);

/**
 * Slugs with an implementation file, so an unknown slug can be rejected without
 * attempting an import that would throw at runtime.
 *
 * Adding a tool = one entry in `lib/tools.ts`, one file in `implementations/`,
 * and one line here.
 */
const IMPLEMENTED = new Set([
  /* PDF */
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-image",
  "images-to-pdf",
  /* Image */
  "image-compressor",
  "image-resizer",
  "image-converter",
  "image-cropper",
  "image-metadata",
  /* Developer */
  "json-formatter",
  "json-minifier",
  "base64",
  "uuid-generator",
  "timestamp",
  /* QR, web and everyday */
  "qr-generator",
  "meta-tag-generator",
  "password-generator",
  "word-counter",
  "percentage-calculator",
  "age-calculator",
  /* Health */
  "period-calculator",
  "due-date-calculator",
  "bmi-calculator",
  "ovulation-calculator",
  "water-intake-calculator",
  "calorie-calculator",
  "postpartum-guide",
  "pregnancy-shopping-list",
  /* Student */
  "gpa-calculator",
  "citation-generator",
  "grade-calculator",
  "text-case-converter",
  "readability-checker",
  "hidden-text-scanner",
  "study-timer",
  "random-picker",
  /* Business */
  "invoice-generator",
  "receipt-generator",
  "business-card-maker",
  "certificate-generator",
  /* Web batch */
  "ip-location-checker",
  "slug-generator",
  "color-contrast-checker",
  "favicon-generator",
  "lorem-ipsum-generator",
  "url-encoder",
  "robots-txt-generator",
  /* AI */
  "prompt-generator",
  "prompt-library",
]);

/* `dynamic()` returns a new component each call, which would remount the tool
   on every render, so each slug's wrapper is created once and reused. */
const cache = new Map<string, ComponentType>();

export function getToolComponent(slug: string): ComponentType | null {
  if (!IMPLEMENTED.has(slug)) return null;

  const cached = cache.get(slug);
  if (cached) return cached;

  const component = dynamic(() => import(`./implementations/${slug}`), {
    loading,
  }) as ComponentType;
  cache.set(slug, component);
  return component;
}

/** Placeholder shown for catalogue entries that have no component yet (§35). */
export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <p className="text-base font-semibold text-foreground">
        {name} is coming soon
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        This tool is on the build list and will work here shortly. Nothing on
        this page is a placeholder that pretends to work — when it is ready, it
        will do the job for real.
      </p>
    </div>
  );
}
