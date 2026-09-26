"use client";

import { useEffect, useState } from "react";
import { Scissors, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { formatBytes } from "@/lib/utils";

const PDF_ACCEPT = {
  accept: "application/pdf,.pdf",
  extensions: [".pdf"],
  mimePrefixes: ["application/pdf"],
};

/** Discriminated so callers narrow cleanly on `ok`. */
export type RangeResult =
  | { ok: true; indices: number[] }
  | { ok: false; error: string };

/**
 * Parses "1-3, 7, 10-12" into zero-based page indices, rejecting anything out
 * of range so the user gets a clear message instead of a silent empty PDF.
 */
export function parseRanges(input: string, pageCount: number): RangeResult {
  const indices: number[] = [];
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0)
    return { ok: false, error: "Enter the pages you want to keep." };

  for (const part of parts) {
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    const single = part.match(/^(\d+)$/);

    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end < 1 || start > pageCount || end > pageCount)
        return {
          ok: false,
          error: `This PDF has ${pageCount} pages, so “${part}” is out of range.`,
        };
      if (start > end)
        return {
          ok: false,
          error: `“${part}” runs backwards — try ${end}-${start}.`,
        };
      for (let p = start; p <= end; p++) indices.push(p - 1);
    } else if (single) {
      const page = Number(single[1]);
      if (page < 1 || page > pageCount)
        return {
          ok: false,
          error: `This PDF has ${pageCount} pages, so page ${page} doesn’t exist.`,
        };
      indices.push(page - 1);
    } else {
      return {
        ok: false,
        error: `“${part}” isn’t a page or range. Use something like 1-3, 5.`,
      };
    }
  }

  /* De-duplicate but keep the order the user asked for. */
  return { ok: true, indices: [...new Set(indices)] };
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; pages: number } | null>(
    null
  );

  /* Read the page count as soon as a file lands, so the range hint is real. */
  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    (async () => {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(await file.arrayBuffer());
        if (cancelled) return;
        setPageCount(doc.getPageCount());
        setRanges((current) => current || `1-${doc.getPageCount()}`);
      } catch {
        if (cancelled) return;
        setError(
          "That PDF couldn’t be opened. It may be password-protected or damaged."
        );
        setFile(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const split = async () => {
    if (!file) return;
    const parsed = parseRanges(ranges, pageCount);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const source = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const copied = await out.copyPages(source, parsed.indices);
      copied.forEach((page) => out.addPage(page));

      const bytes = await out.save();
      setResult({ bytes, pages: out.getPageCount() });
    } catch {
      setError("Something went wrong while extracting those pages. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...PDF_ACCEPT}
          hint="Choose the PDF you want to take pages from."
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
                {pageCount > 0 && ` · ${pageCount} pages`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null);
                setPageCount(0);
                setRanges("");
                setResult(null);
                setError("");
              }}
            >
              Choose another
            </Button>
          </div>

          <Field
            label="Pages to keep"
            htmlFor="sp-ranges"
            hint={
              pageCount > 0
                ? `Use single pages or ranges, e.g. 1-3, 5, 8-${pageCount}.`
                : "Use single pages or ranges, e.g. 1-3, 5."
            }
          >
            <Input
              id="sp-ranges"
              value={ranges}
              onChange={(e) => {
                setRanges(e.target.value);
                setResult(null);
                setError("");
              }}
              placeholder="1-3, 5"
            />
          </Field>

          <Button onClick={split} disabled={busy || pageCount === 0}>
            {busy ? <Loader2 className="animate-spin" /> : <Scissors />}
            {busy ? "Extracting…" : "Extract pages"}
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && (
        <ToolPanel className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Pages extracted</p>
            <p className="text-sm text-muted-foreground">
              {result.pages} {result.pages === 1 ? "page" : "pages"} ·{" "}
              {formatBytes(result.bytes.byteLength)}
            </p>
          </div>
          <Button
            onClick={() =>
              downloadBlob(
                result.bytes as unknown as BlobPart,
                "extracted-pages.pdf",
                "application/pdf"
              )
            }
          >
            Download PDF
          </Button>
        </ToolPanel>
      )}
    </div>
  );
}
