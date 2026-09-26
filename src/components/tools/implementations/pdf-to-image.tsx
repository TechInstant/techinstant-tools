"use client";

import { useState } from "react";
import { Images, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { loadPdfJs, describePdfError } from "@/lib/pdfjs";
import { parseRanges } from "./split-pdf";
import { formatBytes } from "@/lib/utils";

const PDF_ACCEPT = {
  accept: "application/pdf,.pdf",
  extensions: [".pdf"],
  mimePrefixes: ["application/pdf"],
};

interface RenderedPage {
  page: number;
  url: string;
  bytes: number;
  width: number;
  height: number;
}

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState("2");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [pages, setPages] = useState<RenderedPage[]>([]);

  const clearPages = () => {
    /* Object URLs would leak without this. */
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
  };

  const onPick = async (picked: File[]) => {
    clearPages();
    setError("");
    const chosen = picked[0];
    setFile(chosen);

    try {
      const pdfjs = await loadPdfJs();
      const task = pdfjs.getDocument({ data: await chosen.arrayBuffer() });
      const doc = await task.promise;
      setPageCount(doc.numPages);
      setRanges(`1-${doc.numPages}`);
      await task.destroy();
    } catch (err) {
      setError(describePdfError(err));
      setFile(null);
      setPageCount(0);
    }
  };

  const render = async () => {
    if (!file) return;
    const parsed = parseRanges(ranges, pageCount);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setBusy(true);
    setError("");
    clearPages();

    try {
      const pdfjs = await loadPdfJs();
      const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const doc = await task.promise;
      const rendered: RenderedPage[] = [];
      const zoom = Number(scale);

      for (let i = 0; i < parsed.indices.length; i++) {
        const pageNumber = parsed.indices[i] + 1;
        setProgress(`Rendering page ${pageNumber} (${i + 1} of ${parsed.indices.length})…`);

        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: zoom });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas");

        /* JPEG has no alpha, so paint white behind transparent regions. */
        if (format === "jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob(resolve, `image/${format}`, format === "jpeg" ? 0.92 : undefined)
        );
        if (!blob) throw new Error("encode");

        rendered.push({
          page: pageNumber,
          url: URL.createObjectURL(blob),
          bytes: blob.size,
          width: canvas.width,
          height: canvas.height,
        });
      }

      await task.destroy();
      setPages(rendered);
    } catch (err) {
      setError(describePdfError(err));
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const downloadOne = async (p: RenderedPage) => {
    const blob = await fetch(p.url).then((r) => r.blob());
    downloadBlob(blob, `page-${p.page}.${format}`, blob.type);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...PDF_ACCEPT}
          hint="Each selected page is rendered as an image you can download."
          onFiles={onPick}
          onError={setError}
        />
      ) : (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(file.size)} · {pageCount} pages
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearPages();
                setFile(null);
                setPageCount(0);
                setError("");
              }}
            >
              Choose another
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Pages" htmlFor="pi-ranges" hint={`1-${pageCount}`}>
              <Input
                id="pi-ranges"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="1-3, 5"
              />
            </Field>
            <Field label="Format" htmlFor="pi-format">
              <Select
                id="pi-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
              </Select>
            </Field>
            <Field label="Quality" htmlFor="pi-scale">
              <Select
                id="pi-scale"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                <option value="1">Standard (1×)</option>
                <option value="2">High (2×)</option>
                <option value="3">Very high (3×)</option>
              </Select>
            </Field>
          </div>

          <Button onClick={render} disabled={busy || pageCount === 0}>
            {busy ? <Loader2 className="animate-spin" /> : <Images />}
            {busy ? progress || "Rendering…" : "Convert to images"}
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {pages.length > 0 && (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {pages.length} {pages.length === 1 ? "image" : "images"} ready
            </span>
            <Button
              size="sm"
              onClick={() => pages.forEach((p) => void downloadOne(p))}
            >
              <Download />
              Download all
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <figure
                key={p.page}
                className="overflow-hidden rounded-lg border border-border bg-background-subtle"
              >
                {/* Blob URL of a canvas we just drew — next/image can't optimise it */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={`Page ${p.page}`}
                  className="h-40 w-full bg-white object-contain"
                />
                <figcaption className="flex items-center justify-between gap-2 p-2.5">
                  <span className="text-xs text-muted-foreground">
                    Page {p.page} · {formatBytes(p.bytes)}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => downloadOne(p)}>
                    Save
                  </Button>
                </figcaption>
              </figure>
            ))}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
