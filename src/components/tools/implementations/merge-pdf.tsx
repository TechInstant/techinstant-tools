"use client";

import { useState } from "react";
import { Combine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel, ErrorNote } from "@/components/tools/tool-ui";
import {
  FileDrop,
  FileList,
  withIds,
  downloadBlob,
  type PickedFile,
} from "@/components/tools/file-drop";
import { formatBytes } from "@/lib/utils";

const PDF_ACCEPT = {
  accept: "application/pdf,.pdf",
  extensions: [".pdf"],
  mimePrefixes: ["application/pdf"],
};

export default function MergePdf() {
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; pages: number } | null>(
    null
  );

  const reset = () => {
    setResult(null);
    setError("");
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    reset();
  };

  const merge = async () => {
    if (files.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);

    try {
      /* Imported here so pdf-lib only downloads when someone actually merges. */
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();

      for (const { file } of files) {
        const bytes = await file.arrayBuffer();
        let source;
        try {
          source = await PDFDocument.load(bytes, { ignoreEncryption: false });
        } catch {
          throw new Error(
            `“${file.name}” couldn’t be opened. It may be password-protected or damaged.`
          );
        }
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }

      const bytes = await merged.save();
      setResult({ bytes, pages: merged.getPageCount() });
    } catch (err) {
      setError(
        err instanceof Error && err.message.startsWith("“")
          ? err.message
          : "Something went wrong while merging. Please check the files and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDrop
        {...PDF_ACCEPT}
        multiple
        hint="Add two or more PDFs, then drag them into the order you want."
        onFiles={(picked) => {
          setFiles((list) => [...list, ...withIds(picked)]);
          reset();
        }}
        onError={setError}
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {files.length > 0 && (
        <ToolPanel className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {files.length} {files.length === 1 ? "file" : "files"} · merged in
              this order
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiles([]);
                reset();
              }}
            >
              Remove all
            </Button>
          </div>

          <FileList
            files={files}
            reorderable
            onMove={move}
            onRemove={(id) => {
              setFiles((list) => list.filter((f) => f.id !== id));
              reset();
            }}
          />

          <Button onClick={merge} disabled={busy || files.length < 2}>
            {busy ? <Loader2 className="animate-spin" /> : <Combine />}
            {busy ? "Merging…" : "Merge PDFs"}
          </Button>
        </ToolPanel>
      )}

      {result && (
        <ToolPanel className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Merged PDF ready</p>
            <p className="text-sm text-muted-foreground">
              {result.pages} pages · {formatBytes(result.bytes.byteLength)}
            </p>
          </div>
          <Button
            onClick={() =>
              downloadBlob(
                result.bytes as unknown as BlobPart,
                "merged.pdf",
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
