"use client";

import { useState } from "react";
import { Minimize2, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel, Stat, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { loadPdfJs, describePdfError } from "@/lib/pdfjs";
import { formatBytes, cn } from "@/lib/utils";

const PDF_ACCEPT = {
  accept: "application/pdf,.pdf",
  extensions: [".pdf"],
  mimePrefixes: ["application/pdf"],
};

/**
 * Each level is a render scale plus a JPEG quality. Pages are rasterised and
 * re-encoded, which is what actually shrinks scans and image-heavy PDFs in a
 * browser — there is no way to re-compress embedded images in place without a
 * server.
 */
const LEVELS = {
  low: { label: "Low", note: "Best quality, smallest saving", scale: 1.5, quality: 0.82 },
  medium: { label: "Medium", note: "Balanced — good for most files", scale: 1.1, quality: 0.68 },
  high: { label: "High", note: "Smallest file, softer pages", scale: 0.85, quality: 0.52 },
} as const;

type Level = keyof typeof LEVELS;

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("medium");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ bytes: Uint8Array; pages: number } | null>(
    null
  );

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const [pdfjs, { PDFDocument }] = await Promise.all([
        loadPdfJs(),
        import("pdf-lib"),
      ]);
      const { scale, quality } = LEVELS[level];

      const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const source = await task.promise;
      const out = await PDFDocument.create();

      for (let n = 1; n <= source.numPages; n++) {
        setProgress(`Processing page ${n} of ${source.numPages}…`);

        const page = await source.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas");

        /* JPEG has no alpha channel, so flatten onto white first. */
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality)
        );
        if (!blob) throw new Error("encode");

        const embedded = await out.embedJpg(await blob.arrayBuffer());
        /* Keep the original page geometry so the PDF prints at the right size. */
        const original = page.getViewport({ scale: 1 });
        const newPage = out.addPage([original.width, original.height]);
        newPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: original.width,
          height: original.height,
        });
      }

      await task.destroy();
      const bytes = await out.save({ useObjectStreams: true });
      setResult({ bytes, pages: out.getPageCount() });
    } catch (err) {
      setError(describePdfError(err));
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const saved = result && file ? file.size - result.bytes.byteLength : 0;
  const savedPct =
    result && file && file.size > 0 ? Math.round((saved / file.size) * 100) : 0;
  const grew = result != null && saved <= 0;

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...PDF_ACCEPT}
          hint="Works best on scans and image-heavy PDFs."
          onFiles={(picked) => {
            setFile(picked[0]);
            setResult(null);
            setError("");
          }}
          onError={setError}
        />
      ) : (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError("");
              }}
            >
              Choose another
            </Button>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Compression level
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(LEVELS) as Level[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLevel(key);
                    setResult(null);
                  }}
                  aria-pressed={level === key}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    level === key
                      ? "border-brand/40 bg-brand/10"
                      : "border-border bg-background-subtle hover:border-border"
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      level === key ? "text-brand" : "text-foreground"
                    )}
                  >
                    {LEVELS[key].label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {LEVELS[key].note}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <Button onClick={compress} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Minimize2 />}
            {busy ? progress || "Compressing…" : "Compress PDF"}
          </Button>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Pages are re-rendered as images, so the result is not searchable or
            selectable text. That is the trade-off for compressing entirely in
            your browser.
          </p>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Original" value={formatBytes(file!.size)} />
            <Stat label="Compressed" value={formatBytes(result.bytes.byteLength)} />
            <Stat
              label={grew ? "Change" : "Saved"}
              value={grew ? `+${Math.abs(savedPct)}%` : `${savedPct}%`}
            />
          </div>

          {grew && (
            <ErrorNote>
              This PDF came out larger, which happens with text-only documents —
              they are already far smaller as text than as images. Your original
              file is the better one to keep.
            </ErrorNote>
          )}

          <ToolPanel className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                {grew ? "Result ready" : "Compressed PDF ready"}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.pages} {result.pages === 1 ? "page" : "pages"} ·{" "}
                {formatBytes(result.bytes.byteLength)}
              </p>
            </div>
            <Button
              variant={grew ? "outline" : "primary"}
              onClick={() =>
                downloadBlob(
                  result.bytes as unknown as BlobPart,
                  "compressed.pdf",
                  "application/pdf"
                )
              }
            >
              Download PDF
            </Button>
          </ToolPanel>
        </>
      )}
    </div>
  );
}
