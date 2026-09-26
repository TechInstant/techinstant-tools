/**
 * Loads pdf.js on demand and points it at its worker.
 *
 * Kept in one place because two tools need it, and because the worker URL is
 * the part that breaks silently if each tool wires it up differently. The
 * `new URL(..., import.meta.url)` form is what the bundler rewrites to the
 * emitted worker asset.
 */
let cached: Promise<typeof import("pdfjs-dist")> | null = null;

export function loadPdfJs() {
  if (!cached) {
    cached = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).href;
      return pdfjs;
    });
  }
  return cached;
}

/** Friendly message for the ways opening a PDF usually fails. */
export function describePdfError(err: unknown): string {
  const name = (err as { name?: string })?.name ?? "";
  if (name === "PasswordException")
    return "That PDF is password-protected, so it can’t be opened here.";
  if (name === "InvalidPDFException")
    return "That file doesn’t look like a valid PDF — it may be damaged.";
  return "That PDF couldn’t be opened. It may be damaged or in an unusual format.";
}
