import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Maps a tool slug to its interactive component.
 *
 * Every entry is a `dynamic()` import, which is what keeps §28 honest: a tool's
 * code (and any heavy library it pulls in, like pdf-lib or qrcode) is only
 * fetched when someone opens that tool — never on the homepage.
 *
 * Adding a tool = one entry in `lib/tools.ts` + one entry here.
 */
const loading = () => (
  <div className="h-40 animate-pulse rounded-xl border border-border bg-muted" />
);

export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "json-formatter": dynamic(() => import("./implementations/json-formatter"), {
    loading,
  }),
  "json-minifier": dynamic(() => import("./implementations/json-minifier"), {
    loading,
  }),
  base64: dynamic(() => import("./implementations/base64"), { loading }),
  "uuid-generator": dynamic(() => import("./implementations/uuid-generator"), {
    loading,
  }),
  timestamp: dynamic(() => import("./implementations/timestamp"), { loading }),
  "password-generator": dynamic(
    () => import("./implementations/password-generator"),
    { loading }
  ),
  "word-counter": dynamic(() => import("./implementations/word-counter"), {
    loading,
  }),
  "percentage-calculator": dynamic(
    () => import("./implementations/percentage-calculator"),
    { loading }
  ),
  "age-calculator": dynamic(() => import("./implementations/age-calculator"), {
    loading,
  }),
  "qr-generator": dynamic(() => import("./implementations/qr-generator"), {
    loading,
  }),

  /* PDF tools — pdf-lib and pdf.js load only when one of these is opened. */
  "merge-pdf": dynamic(() => import("./implementations/merge-pdf"), { loading }),
  "split-pdf": dynamic(() => import("./implementations/split-pdf"), { loading }),
  "compress-pdf": dynamic(() => import("./implementations/compress-pdf"), {
    loading,
  }),
  "pdf-to-image": dynamic(() => import("./implementations/pdf-to-image"), {
    loading,
  }),
  "images-to-pdf": dynamic(() => import("./implementations/images-to-pdf"), {
    loading,
  }),

  /* Image tools — canvas based; exifr loads only inside the metadata viewer. */
  "image-compressor": dynamic(() => import("./implementations/image-compressor"), {
    loading,
  }),
  "image-resizer": dynamic(() => import("./implementations/image-resizer"), {
    loading,
  }),
  "image-converter": dynamic(() => import("./implementations/image-converter"), {
    loading,
  }),
  "image-cropper": dynamic(() => import("./implementations/image-cropper"), {
    loading,
  }),
  "image-metadata": dynamic(() => import("./implementations/image-metadata"), {
    loading,
  }),

  /* Health, student and web tools. */
  "period-calculator": dynamic(() => import("./implementations/period-calculator"), {
    loading,
  }),
  "due-date-calculator": dynamic(
    () => import("./implementations/due-date-calculator"),
    { loading }
  ),
  "bmi-calculator": dynamic(() => import("./implementations/bmi-calculator"), {
    loading,
  }),
  "gpa-calculator": dynamic(() => import("./implementations/gpa-calculator"), {
    loading,
  }),
  "meta-tag-generator": dynamic(
    () => import("./implementations/meta-tag-generator"),
    { loading }
  ),

  /* Student batch. */
  "citation-generator": dynamic(
    () => import("./implementations/citation-generator"),
    { loading }
  ),
  "grade-calculator": dynamic(() => import("./implementations/grade-calculator"), {
    loading,
  }),
  "text-case-converter": dynamic(
    () => import("./implementations/text-case-converter"),
    { loading }
  ),
  "readability-checker": dynamic(
    () => import("./implementations/readability-checker"),
    { loading }
  ),
  "hidden-text-scanner": dynamic(
    () => import("./implementations/hidden-text-scanner"),
    { loading }
  ),

  /* Women's health guides. */
  "postpartum-guide": dynamic(() => import("./implementations/postpartum-guide"), {
    loading,
  }),
  "pregnancy-shopping-list": dynamic(
    () => import("./implementations/pregnancy-shopping-list"),
    { loading }
  ),

  /* Business documents — invoice and receipt share one engine. */
  "invoice-generator": dynamic(() => import("./implementations/invoice-generator"), {
    loading,
  }),
  "receipt-generator": dynamic(() => import("./implementations/receipt-generator"), {
    loading,
  }),
  "business-card-maker": dynamic(
    () => import("./implementations/business-card-maker"),
    { loading }
  ),
  "certificate-generator": dynamic(
    () => import("./implementations/certificate-generator"),
    { loading }
  ),

  /* The one tool that needs the network — see its in-page notice. */
  "ip-location-checker": dynamic(
    () => import("./implementations/ip-location-checker"),
    { loading }
  ),
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_COMPONENTS[slug] ?? null;
}

/** Placeholder shown for registry entries that have no component yet (§35). */
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
