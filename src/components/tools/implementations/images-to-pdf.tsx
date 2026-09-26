"use client";

import { useState } from "react";
import { FileOutput, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import {
  FileDrop,
  FileList,
  withIds,
  downloadBlob,
  type PickedFile,
} from "@/components/tools/file-drop";
import { formatBytes } from "@/lib/utils";

const IMAGE_ACCEPT = {
  accept: "image/jpeg,image/png,.jpg,.jpeg,.png",
  extensions: [".jpg", ".jpeg", ".png"],
  mimePrefixes: ["image/jpeg", "image/png"],
};

/** Page sizes in PDF points (72 per inch). */
const PAGE_SIZES = {
  a4: { label: "A4", width: 595.28, height: 841.89 },
  letter: { label: "US Letter", width: 612, height: 792 },
  fit: { label: "Fit to image", width: 0, height: 0 },
} as const;

type SizeKey = keyof typeof PAGE_SIZES;

export default function ImagesToPdf() {
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [size, setSize] = useState<SizeKey>("a4");
  const [landscape, setLandscape] = useState(false);
  const [margin, setMargin] = useState("24");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

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

  const build = async () => {
    if (files.length === 0) {
      setError("Add at least one image.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const pad = Math.max(0, Number(margin) || 0);

      for (const { file } of files) {
        const bytes = await file.arrayBuffer();
        const isPng =
          file.type === "image/png" || file.name.toLowerCase().endsWith(".png");

        const image = isPng
          ? await doc.embedPng(bytes)
          : await doc.embedJpg(bytes);

        if (size === "fit") {
          /* One page exactly the size of the image — no letterboxing. */
          const page = doc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
          continue;
        }

        const spec = PAGE_SIZES[size];
        const pageWidth = landscape ? spec.height : spec.width;
        const pageHeight = landscape ? spec.width : spec.height;
        const page = doc.addPage([pageWidth, pageHeight]);

        /* Scale to fit inside the margins, preserving aspect ratio. */
        const boxWidth = pageWidth - pad * 2;
        const boxHeight = pageHeight - pad * 2;
        const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;

        page.drawImage(image, {
          x: (pageWidth - drawWidth) / 2,
          y: (pageHeight - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      }

      setResult(await doc.save());
    } catch {
      setError(
        "One of those images couldn’t be added. JPG and PNG are supported — other formats, or damaged files, won’t work."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDrop
        {...IMAGE_ACCEPT}
        multiple
        hint="JPG and PNG. Each image becomes one page, in the order below."
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
              {files.length} {files.length === 1 ? "image" : "images"}
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

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Page size" htmlFor="ip-size">
              <Select
                id="ip-size"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value as SizeKey);
                  reset();
                }}
              >
                {(Object.keys(PAGE_SIZES) as SizeKey[]).map((key) => (
                  <option key={key} value={key}>
                    {PAGE_SIZES[key].label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Orientation" htmlFor="ip-orient">
              <Select
                id="ip-orient"
                value={landscape ? "landscape" : "portrait"}
                disabled={size === "fit"}
                onChange={(e) => {
                  setLandscape(e.target.value === "landscape");
                  reset();
                }}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </Field>

            <Field label="Margin (pt)" htmlFor="ip-margin">
              <Select
                id="ip-margin"
                value={margin}
                disabled={size === "fit"}
                onChange={(e) => {
                  setMargin(e.target.value);
                  reset();
                }}
              >
                <option value="0">None</option>
                <option value="24">Small</option>
                <option value="48">Medium</option>
                <option value="72">Large</option>
              </Select>
            </Field>
          </div>

          <Button onClick={build} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <FileOutput />}
            {busy ? "Building…" : "Create PDF"}
          </Button>
        </ToolPanel>
      )}

      {result && (
        <ToolPanel className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">PDF ready</p>
            <p className="text-sm text-muted-foreground">
              {files.length} {files.length === 1 ? "page" : "pages"} ·{" "}
              {formatBytes(result.byteLength)}
            </p>
          </div>
          <Button
            onClick={() =>
              downloadBlob(
                result as unknown as BlobPart,
                "images.pdf",
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
